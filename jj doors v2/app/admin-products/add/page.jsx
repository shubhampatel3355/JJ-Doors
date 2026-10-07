"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  IconAddProduct,
  IconUpload,
  IconCheck,
  IconTrash,
  IconProducts
} from "@/components/admin/AdminIcons";
import { getCategories, createProduct, uploadCatalogImage } from "@/lib/adminApi";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // Form State - only Name, Category, Status, Description, Image
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    categoryName: "",
    description: "",
    status: "Published" // "Published" | "Draft"
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Load categories from Supabase
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await getCategories();
        if (!alive) return;
        setCategories(cats);
        setFormData((prev) =>
          prev.categoryId
            ? prev
            : { ...prev, categoryId: cats[0]?.id || "", categoryName: cats[0]?.name || "" }
        );
      } catch (err) {
        console.error(err);
        if (alive) showToast(err.message || "Could not load categories.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      categoryName: catObj ? catObj.name : ""
    }));
  };

  // Image upload handling
  const handleImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.categoryId) newErrors.category = "Please select a category.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadCatalogImage(imageFile, "products");
      }

      await createProduct({
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        description: formData.description,
        status: formData.status,
        image: imageUrl
      });

      showToast(`Product "${formData.name}" published successfully!`);
      setTimeout(() => router.push("/admin-products"), 900);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save product.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      categoryName: categories[0]?.name || "",
      description: "",
      status: "Published"
    });
    handleRemoveImage();
    setErrors({});
    showToast("Form fields reset.");
  };

  return (
    <AdminLayout
      breadcrumb="Admin / Products / Add"
      title="Add New Door Product"
      subtitle="Fill in details and upload an image to register a door model to the catalog."
      actions={
        <Link href="/admin-products" className="admin-btn admin-btn-secondary admin-btn-sm">
          <IconProducts size={16} />
          View All Products
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

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "2rem",
            alignItems: "start"
          }}
        >
          {/* LEFT COLUMN: Main Form Inputs */}
          <div className="admin-card" style={{ padding: "2rem" }}>
            <div className="admin-card-header" style={{ marginBottom: "1.75rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 className="admin-card-title">Door Model Details</h3>
                <div className="admin-card-subtitle">Essential identification and classification</div>
              </div>
            </div>

            {/* Product Name */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                Door Model Name / Number <span style={{ color: "var(--admin-danger)" }}>*</span>
              </label>
              <input
                type="text"
                className={`admin-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Royal Heritage Teak Main Entrance Door"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="admin-form-error">{errors.name}</span>}
            </div>

            {/* Category and Status Selection (2 columns) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Category */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Category <span style={{ color: "var(--admin-danger)" }}>*</span>
                </label>
                <select
                  className={`admin-select ${errors.category ? "error" : ""}`}
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  style={{
                    height: "48px",
                    lineHeight: "48px",
                    padding: "0 2.5rem 0 1rem",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    fontSize: "0.92rem"
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="admin-form-error">{errors.category}</span>}
              </div>

              {/* Status */}
              <div className="admin-form-group">
                <label className="admin-form-label">Publish Status</label>
                <select
                  className="admin-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    height: "48px",
                    lineHeight: "48px",
                    padding: "0 2.5rem 0 1rem",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    fontSize: "0.92rem"
                  }}
                >
                  <option value="Published">Published (Live)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Product Description */}
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">
                Description / Specifications <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                className="admin-textarea"
                rows={5}
                placeholder="Enter door details, wood species, finish texture, recommended usage or customization options..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Image Upload & Action Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Image Upload Card */}
            <div className="admin-card" style={{ padding: "1.75rem" }}>
              <div className="admin-card-header" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <h3 className="admin-card-title">Door Showcase Image</h3>
                  <div className="admin-card-subtitle">Upload high-res photo or 3D render</div>
                </div>
              </div>

              {imagePreview ? (
                <div style={{ position: "relative", borderRadius: "var(--admin-radius-md)", overflow: "hidden", border: "1px solid var(--admin-card-border)", backgroundColor: "#f8fafc" }}>
                  <img
                    src={imagePreview}
                    alt="Door Preview"
                    style={{ width: "100%", height: 260, objectFit: "contain", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "0.75rem 1rem",
                      background: "linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span style={{ color: "#ffffff", fontSize: "0.78rem", fontWeight: 600 }}>
                      {imageFile ? imageFile.name : "Door Image"}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      <IconTrash size={13} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`admin-file-upload-area ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    padding: "2.5rem 1.5rem",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "var(--admin-radius-md)",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragging ? "#fffbeb" : "#fafafa",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div style={{ color: "var(--admin-primary)", marginBottom: "0.75rem" }}>
                    <IconUpload size={38} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.3rem" }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>
                    PNG, JPG, WEBP up to 10MB (recommended 800x1200)
                  </div>
                </div>
              )}
            </div>

            {/* Form Submission Actions Card */}
            <div className="admin-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSubmitting}
                  style={{ width: "100%", padding: "0.85rem 1.25rem", fontSize: "0.95rem", justifyContent: "center" }}
                >
                  {isSubmitting ? (
                    <span>Publishing Door Model...</span>
                  ) : (
                    <>
                      <IconAddProduct size={18} />
                      Publish Door Product
                    </>
                  )}
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="admin-btn admin-btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Reset Form
                  </button>
                  <Link
                    href="/admin-products"
                    className="admin-btn admin-btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
