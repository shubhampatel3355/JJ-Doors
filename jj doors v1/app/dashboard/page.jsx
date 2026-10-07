"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  IconDashboard,
  IconProducts,
  IconCategory,
  IconAddProduct,
  IconEye,
  IconEdit,
  IconTrash,
  IconTrendingUp,
  IconExternalLink,
  IconCheck
} from "@/components/admin/AdminIcons";
import { ADMIN_STATS, RECENT_ACTIVITIES } from "@/components/admin/adminData";
import { getDashboardData, updateProduct, deleteProduct } from "@/lib/adminApi";
import { ProductViewModal, ProductEditModal, DeleteConfirmModal } from "@/components/admin/AdminModals";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Load live catalog from Supabase
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getDashboardData();
        if (!alive) return;
        setProducts(data.products);
        setCategories(data.categories);
      } catch (e) {
        console.error(e);
        if (alive) setLoadError(e.message || "Could not load dashboard data.");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    setDeletingProduct(null);
    try {
      await deleteProduct(target.id);
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
      showToast(`Product "${target.name}" removed successfully.`);
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

  return (
    <AdminLayout
      breadcrumb="Admin / Overview"
      title="Dashboard Overview"
      subtitle="Real-time catalog performance, category distribution & quick management actions."
      actions={
        <>
          <Link href="/admin-products/add" className="admin-btn admin-btn-primary admin-btn-sm">
            <IconAddProduct size={16} />
            Add Product
          </Link>
          <Link href="/categories/create" className="admin-btn admin-btn-secondary admin-btn-sm">
            <IconCategory size={16} />
            New Category
          </Link>
        </>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className="admin-toast success">
            <IconCheck size={18} className="text-success" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>Action Completed</div>
              <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="admin-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem", color: "var(--admin-text-muted)", fontSize: "0.88rem" }}>
          Loading live catalog from Supabase…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="admin-card" style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem", border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: "0.85rem" }}>
          {loadError}
        </div>
      )}

      {/* 1. TOP METRIC / STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem"
        }}
      >
        {/* Total Products Card */}
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-label">Total Products</div>
            <div className="admin-stat-value">{products.length}</div>
            <div className="admin-stat-trend admin-trend-up">
              <IconTrendingUp size={14} />
              <span>{ADMIN_STATS.productsGrowth} from last month</span>
            </div>
          </div>
          <div className="admin-stat-icon-wrap admin-stat-icon-gold">
            <IconProducts size={26} />
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-label">Total Categories</div>
            <div className="admin-stat-value">{categories.length}</div>
            <div className="admin-stat-trend admin-trend-up">
              <IconTrendingUp size={14} />
              <span>{ADMIN_STATS.categoriesGrowth} added recently</span>
            </div>
          </div>
          <div className="admin-stat-icon-wrap admin-stat-icon-blue">
            <IconCategory size={26} />
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS & CATEGORY DISTRIBUTION ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}
      >
        {/* Category Breakdown & Statistics Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Category Distribution</h3>
              <div className="admin-card-subtitle">Active inventory distribution across materials</div>
            </div>
            <Link href="/categories/create" style={{ fontSize: "0.78rem", color: "var(--admin-primary)", fontWeight: 700 }}>
              + Manage
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.slice(0, 4).map((cat, idx) => {
              const percentage = Math.round((cat.productCount / 90) * 100) || 20;
              const barColors = ["#d97706", "#2563eb", "#059669", "#9333ea"];
              const color = barColors[idx % barColors.length];

              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "0.35rem" }}>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ color: "var(--admin-text-muted)" }}>{cat.productCount} models ({percentage}%)</span>
                  </div>
                  <div style={{ width: "100%", height: 7, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percentage * 2}%`,
                        maxWidth: "100%",
                        height: "100%",
                        backgroundColor: color,
                        borderRadius: 999,
                        transition: "width 0.6s ease"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Shortcuts Panel */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Quick Actions</h3>
              <div className="admin-card-subtitle">Common operations and shortcuts</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            <Link
              href="/admin-products/add"
              style={{
                padding: "1rem",
                borderRadius: "var(--admin-radius-md)",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ color: "var(--admin-primary)" }}>
                <IconAddProduct size={22} />
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Add New Door</div>
              <div style={{ fontSize: "0.74rem", color: "var(--admin-text-muted)" }}>Publish product model</div>
            </Link>

            <Link
              href="/categories/create"
              style={{
                padding: "1rem",
                borderRadius: "var(--admin-radius-md)",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ color: "var(--admin-accent)" }}>
                <IconCategory size={22} />
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Create Category</div>
              <div style={{ fontSize: "0.74rem", color: "var(--admin-text-muted)" }}>Define door classification</div>
            </Link>

            <Link
              href="/admin-products"
              style={{
                padding: "1rem",
                borderRadius: "var(--admin-radius-md)",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ color: "var(--admin-success)" }}>
                <IconProducts size={22} />
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Catalog Manager</div>
              <div style={{ fontSize: "0.74rem", color: "var(--admin-text-muted)" }}>Filter & edit all items</div>
            </Link>

            <Link
              href="/"
              target="_blank"
              style={{
                padding: "1rem",
                borderRadius: "var(--admin-radius-md)",
                background: "#f8fafc",
                border: "1px solid var(--admin-card-border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ color: "var(--admin-text-muted)" }}>
                <IconExternalLink size={22} />
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>Preview Website</div>
              <div style={{ fontSize: "0.74rem", color: "var(--admin-text-muted)" }}>Open customer portal</div>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. RECENTLY ADDED PRODUCTS TABLE */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Recently Added Products</h3>
            <div className="admin-card-subtitle">Latest door entries registered in the inventory</div>
          </div>
          <Link href="/admin-products" className="admin-btn admin-btn-secondary admin-btn-sm">
            View All ({products.length}) →
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <img
                        src={prod.image || "/assets/img/about/1.png"}
                        alt={prod.name}
                        className="admin-product-thumb"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{prod.name}</div>
                        <div style={{ fontSize: "0.74rem", color: "var(--admin-text-dim)" }}>{prod.createdAt}</div>
                      </div>
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
                        title="Quick Edit"
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
      </div>

      {/* 4. RECENT CATEGORIES & RECENT LOGS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}
      >
        {/* Recent Categories List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Categories</h3>
              <div className="admin-card-subtitle">Active classification groups</div>
            </div>
            <Link href="/categories/create" style={{ fontSize: "0.78rem", color: "var(--admin-primary)", fontWeight: 700 }}>
              + Add Category
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  borderRadius: "var(--admin-radius-md)",
                  background: "#f8fafc",
                  border: "1px solid var(--admin-card-border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      background: "#fffbeb",
                      color: "var(--admin-primary)",
                      border: "1px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <IconCategory size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a" }}>{cat.name}</div>
                    <div style={{ fontSize: "0.74rem", color: "var(--admin-text-dim)" }}>ID: {cat.id}</div>
                  </div>
                </div>
                <span className="admin-badge admin-badge-gold">{cat.productCount} Items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit & Activity Logs */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Audit Log</h3>
              <div className="admin-card-subtitle">System actions & updates trace</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {RECENT_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.65rem 0",
                  borderBottom: "1px solid #f1f5f9"
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "var(--admin-primary)",
                    marginTop: "0.45rem",
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.84rem", color: "#1e293b" }}>
                    <strong>{act.action}</strong>: {act.item}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginTop: "0.15rem" }}>
                    By {act.user} • {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals for View, Edit, and Delete */}
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
          title="Delete Product from Inventory"
          itemName={deletingProduct.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </AdminLayout>
  );
}
