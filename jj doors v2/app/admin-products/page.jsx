"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  IconProducts,
  IconAddProduct,
  IconSearch,
  IconFilter,
  IconGrid,
  IconList,
  IconEye,
  IconEdit,
  IconTrash,
  IconCheck,
  IconRefresh
} from "@/components/admin/AdminIcons";
import { getProducts, getCategories, updateProduct, deleteProduct } from "@/lib/adminApi";
import { ProductViewModal, ProductEditModal, DeleteConfirmModal } from "@/components/admin/AdminModals";

const PAGE_SIZES = [12, 24, 48, 96];

// Page numbers to show: always the first and last page plus the current page
// and one on each side, with "…" for the gaps. Always 7 slots once there are
// more than 7 pages, so the bar keeps a constant width, e.g. 1 … 11 12 13 … 32
function getPageItems(current, total) {
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (total <= 7) return range(1, total);
  if (current <= 4) return [...range(1, 5), "ellipsis-end", total];
  if (current >= total - 3) return [1, "ellipsis-start", ...range(total - 4, total)];
  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Load catalog from Supabase
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        if (!alive) return;
        setProducts(prods);
        setCategories(cats);
      } catch (e) {
        console.error(e);
        if (alive) setLoadError(e.message || "Could not load products.");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Filters and Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZES[0]);
  const listTopRef = useRef(null);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          prod.name.toLowerCase().includes(q) ||
          prod.sku.toLowerCase().includes(q) ||
          (prod.tagline && prod.tagline.toLowerCase().includes(q)) ||
          (prod.badge && prod.badge.toLowerCase().includes(q));

        // Category filter
        const matchesCat =
          selectedCategory === "ALL" || prod.categoryId === selectedCategory;

        // Status filter
        const matchesStatus =
          selectedStatus === "ALL" || prod.status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Deleting the last item on the last page (or narrowing the filters) can
  // leave currentPage past the end; step back instead of showing an empty page.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageItems = getPageItems(currentPage, totalPages);
  const firstShown = filteredProducts.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const lastShown = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  const goToPage = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    if (next === currentPage) return;
    setCurrentPage(next);
    // The pager sits below the list, so bring the top of the new page into view
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    setDeletingProduct(null);
    try {
      await deleteProduct(target.id);
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
      showToast(`Product "${target.name}" removed from catalog.`);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to delete product.");
    }
  };

  const handleSaveProduct = async (updated) => {
    try {
      const saved = await updateProduct(updated.id, updated);
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      showToast(`Product "${saved.name}" updated successfully.`);
      setEditingProduct(null);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to update product.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <AdminLayout
      breadcrumb="Admin / Products / Master Catalog"
      title="View All Products"
      subtitle={`Manage, filter, inspect and organize the ${products.length} registered door models.`}
      actions={
        <Link href="/admin-products/add" className="admin-btn admin-btn-primary admin-btn-sm">
          <IconAddProduct size={16} />
          + Add New Product
        </Link>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className="admin-toast success">
            <IconCheck size={18} className="text-success" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>Catalog Notification</div>
              <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Load state banners */}
      {isLoading && (
        <div className="admin-card" style={{ marginBottom: "1.75rem", padding: "1rem 1.5rem", color: "var(--admin-text-muted)", fontSize: "0.88rem" }}>
          Loading products from Supabase…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="admin-card" style={{ marginBottom: "1.75rem", padding: "1rem 1.5rem", border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: "0.85rem" }}>
          {loadError}
        </div>
      )}

      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="admin-card" style={{ marginBottom: "1.75rem", padding: "1.25rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          {/* Search Input Box */}
          <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
            <IconSearch className="admin-search-icon" size={16} />
            <input
              type="text"
              className="admin-input admin-input-with-icon"
              placeholder="Search by door name, SKU code, badge..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Dropdown Filter */}
          <div style={{ minWidth: 180 }}>
            <select
              className="admin-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "48px",
                lineHeight: "48px",
                padding: "0 2.5rem 0 1rem",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                fontSize: "0.92rem"
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: 140 }}>
            <select
              className="admin-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "48px",
                lineHeight: "48px",
                padding: "0 2.5rem 0 1rem",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                fontSize: "0.92rem"
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div style={{ minWidth: 160 }}>
            <select
              className="admin-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: "48px",
                lineHeight: "48px",
                padding: "0 2.5rem 0 1rem",
                color: "#0f172a",
                backgroundColor: "#ffffff",
                fontSize: "0.92rem"
              }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {/* View Mode Switch (Table vs Grid) */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "var(--admin-radius-sm)",
              padding: "2px",
              border: "1px solid var(--admin-card-border)"
            }}
          >
            <button
              onClick={() => setViewMode("table")}
              style={{
                background: viewMode === "table" ? "var(--admin-primary)" : "transparent",
                color: viewMode === "table" ? "#ffffff" : "var(--admin-text-muted)",
                border: "none",
                borderRadius: "6px",
                padding: "0.45rem 0.65rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Table View"
            >
              <IconList size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                background: viewMode === "grid" ? "var(--admin-primary)" : "transparent",
                color: viewMode === "grid" ? "#ffffff" : "var(--admin-text-muted)",
                border: "none",
                borderRadius: "6px",
                padding: "0.45rem 0.65rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
              title="Grid Cards View"
            >
              <IconGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll target for page changes */}
      <div ref={listTopRef} style={{ scrollMarginTop: "96px" }} />

      {/* PRODUCTS DISPLAY (TABLE OR GRID) */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="admin-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
              color: "var(--admin-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem"
            }}
          >
            <IconProducts size={32} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem" }}>
            No Matching Products Found
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--admin-text-muted)", maxWidth: 420, margin: "0 auto 1.5rem" }}>
            We couldn't find any products matching your search term "{searchQuery}" or active category filters.
          </p>
          <button onClick={handleResetFilters} className="admin-btn admin-btn-secondary admin-btn-sm">
            <IconRefresh size={14} /> Reset All Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Table View - Door Model, Description, Category, Status, Actions */
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "26%" }}>Product Door Model</th>
                <th style={{ width: "32%" }}>Description</th>
                <th style={{ width: "18%" }}>Category</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <img
                        src={prod.image || "/assets/img/about/1.png"}
                        alt={prod.name}
                        className="admin-product-thumb"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--admin-text-dim)" }}>
                          Added {prod.createdAt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--admin-text-muted)",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 320
                      }}
                      title={prod.description || "No description provided"}
                    >
                      {prod.description || (
                        <span style={{ color: "var(--admin-text-dim)", fontStyle: "italic" }}>
                          No description provided
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--admin-text-muted)" }}>{prod.categoryName}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${prod.status === "Published" ? "admin-badge-success" : "admin-badge-warning"}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-btn-group" style={{ justifyContent: "flex-end" }}>
                      <button
                        className="admin-table-action-btn view"
                        title="View Details"
                        onClick={() => setSelectedProduct(prod)}
                      >
                        <IconEye size={15} />
                      </button>
                      <button
                        className="admin-table-action-btn edit"
                        title="Edit Product"
                        onClick={() => setEditingProduct(prod)}
                      >
                        <IconEdit size={15} />
                      </button>
                      <button
                        className="admin-table-action-btn delete"
                        title="Delete Product"
                        onClick={() => setDeletingProduct(prod)}
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {paginatedProducts.map((prod) => (
            <div
              key={prod.id}
              className="admin-card"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: 0
              }}
            >
              {/* Product Image Banner */}
              <div style={{ height: 190, position: "relative", backgroundColor: "#f1f5f9" }}>
                <img
                  src={prod.image || "/assets/img/about/1.png"}
                  alt={prod.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  className="admin-badge admin-badge-gold"
                  style={{ position: "absolute", top: 12, left: 12 }}
                >
                  {prod.badge}
                </span>
                <span
                  className={`admin-badge ${prod.status === "Published" ? "admin-badge-success" : "admin-badge-warning"}`}
                  style={{ position: "absolute", top: 12, right: 12 }}
                >
                  {prod.status}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.3rem", fontWeight: 600 }}>
                  {prod.categoryName}
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.4rem 0", lineHeight: 1.3 }}>
                  {prod.name}
                </h4>
                <div style={{ fontSize: "0.78rem", color: "var(--admin-primary)", marginBottom: "0.8rem", fontWeight: 600 }}>
                  SKU: {prod.sku}
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.85rem", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    ₹{prod.price ? prod.price.toLocaleString("en-IN") : "Custom"}
                  </div>
                  <div className="admin-action-btn-group">
                    <button
                      className="admin-table-action-btn view"
                      title="View Details"
                      onClick={() => setSelectedProduct(prod)}
                    >
                      <IconEye size={14} />
                    </button>
                    <button
                      className="admin-table-action-btn edit"
                      title="Edit Product"
                      onClick={() => setEditingProduct(prod)}
                    >
                      <IconEdit size={14} />
                    </button>
                    <button
                      className="admin-table-action-btn delete"
                      title="Delete Product"
                      onClick={() => setDeletingProduct(prod)}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION BAR */}
      {filteredProducts.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "2rem",
            padding: "1rem 1.5rem",
            background: "var(--admin-card-bg)",
            borderRadius: "var(--admin-radius-md)",
            border: "1px solid var(--admin-card-border)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.84rem", color: "var(--admin-text-muted)" }}>
              Showing <strong>{firstShown}</strong>–<strong>{lastShown}</strong> of{" "}
              <strong>{filteredProducts.length}</strong> products
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: 0,
                fontSize: "0.84rem",
                color: "var(--admin-text-muted)",
                whiteSpace: "nowrap"
              }}
            >
              Rows per page
              <select
                className="admin-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  width: "auto",
                  height: "34px",
                  lineHeight: "34px",
                  padding: "0 2rem 0 0.75rem",
                  color: "#0f172a",
                  backgroundColor: "#ffffff",
                  fontSize: "0.84rem"
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Product list pages"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}
            >
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                style={{ whiteSpace: "nowrap" }}
              >
                ← Previous
              </button>

              {pageItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    type="button"
                    key={item}
                    onClick={() => goToPage(item)}
                    aria-label={`Page ${item}`}
                    aria-current={currentPage === item ? "page" : undefined}
                    style={{
                      minWidth: 36,
                      height: 36,
                      padding: "0 0.5rem",
                      borderRadius: "var(--admin-radius-sm)",
                      border: "1px solid",
                      borderColor: currentPage === item ? "var(--admin-primary)" : "var(--admin-card-border)",
                      backgroundColor: currentPage === item ? "var(--admin-primary)" : "#ffffff",
                      color: currentPage === item ? "#ffffff" : "var(--admin-text-main)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    aria-hidden="true"
                    style={{
                      minWidth: 24,
                      textAlign: "center",
                      color: "var(--admin-text-muted)",
                      fontWeight: 600,
                      userSelect: "none"
                    }}
                  >
                    …
                  </span>
                )
              )}

              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                style={{ whiteSpace: "nowrap" }}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      )}

      {/* Modals for Product View, Quick Edit, and Deletion */}
      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={(prod) => setEditingProduct(prod)}
      />

      <ProductEditModal
        product={editingProduct}
        categories={categories}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProduct}
      />

      {deletingProduct && (
        <DeleteConfirmModal
          title="Delete Door Product"
          itemName={deletingProduct.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </AdminLayout>
  );
}
