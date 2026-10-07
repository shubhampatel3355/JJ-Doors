"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconClose, IconCheck, IconTrash, IconEdit, IconCategory, IconAddProduct, IconProducts, IconUpload } from "./AdminIcons";

// 1. Product View Modal
export function ProductViewModal({ product, onClose, onEdit }) {
  if (!product) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="admin-badge admin-badge-gold">{product.sku || product.id}</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Product Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="admin-icon-btn"
            style={{ width: 32, height: 32 }}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Main Product Image & Title Header */}
          <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "var(--admin-radius-md)",
                overflow: "hidden",
                border: "1px solid var(--admin-card-border)",
                backgroundColor: "#f1f5f9",
                position: "relative",
                flexShrink: 0
              }}
            >
              <img
                src={product.image || "/assets/img/about/1.png"}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span className="admin-badge admin-badge-blue">{product.categoryName || "Door Collection"}</span>
                <span className={`admin-badge ${product.status === "Published" ? "admin-badge-success" : "admin-badge-warning"}`}>
                  {product.status || "Published"}
                </span>
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.4rem 0", lineHeight: 1.25 }}>
                {product.name}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--admin-primary)", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                {product.tagline || product.badge}
              </p>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                ₹{product.price ? product.price.toLocaleString("en-IN") : "Custom Quote"}
                <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontWeight: 400, marginLeft: "0.3rem" }}>
                  / standard door unit
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.4rem" }}>
              Overview & Specifications
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--admin-text-muted)", lineHeight: 1.6, background: "#f8fafc", padding: "1rem", borderRadius: "var(--admin-radius-sm)", border: "1px solid var(--admin-card-border)" }}>
              {product.description || "Premium quality door manufactured by JJ Doors using sustainably sourced timber and multi-point moisture shielding."}
            </p>
          </div>

          {/* Key Features Chips */}
          {product.features && product.features.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.6rem" }}>
                Engineered Highlights
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {product.features.map((feat, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "#f1f5f9",
                      border: "1px solid var(--admin-card-border)",
                      borderRadius: "999px",
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.78rem",
                      color: "#1e293b",
                      fontWeight: 500
                    }}
                  >
                    <IconCheck size={12} className="text-warning" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button onClick={onClose} className="admin-btn admin-btn-secondary admin-btn-sm">
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="admin-btn admin-btn-primary admin-btn-sm"
            >
              <IconEdit size={14} />
              Edit Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Delete Confirmation Modal
export function DeleteConfirmModal({ title, itemName, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div
        className="admin-modal"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-body" style={{ textAlign: "center", paddingTop: "2rem" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: "var(--admin-danger-bg)",
              color: "var(--admin-danger)",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem"
            }}
          >
            <IconTrash size={28} />
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            {title || "Confirm Deletion"}
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--admin-text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            Are you sure you want to remove <strong style={{ color: "#0f172a" }}>"{itemName}"</strong>? This will remove the item from the live admin catalog.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button onClick={onCancel} className="admin-btn admin-btn-secondary admin-btn-sm" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="admin-btn admin-btn-danger admin-btn-sm"
              style={{ flex: 1 }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Edit Door Product Modal (Edits door name, img, category, status, description, price, etc.)
export function ProductEditModal({ product, categories = [], isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    categoryName: "",
    price: "",
    badge: "",
    status: "Published",
    description: "",
    image: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = React.useRef(null);

  // Sync form state when editing product opens
  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        categoryId: product.categoryId || (categories[0]?.id || ""),
        categoryName: product.categoryName || (categories[0]?.name || ""),
        price: product.price || "",
        badge: product.badge || "",
        status: product.status || "Published",
        description: product.description || "",
        image: product.image || "/assets/img/about/1.png"
      });
      setImagePreview(product.image || "/assets/img/about/1.png");
    }
  }, [product, categories]);

  if (!isOpen || !product) return null;

  const handleImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (val) => {
    const matched = (categories || []).find((c) => c.id === val || c.name === val);
    setFormData((prev) => ({
      ...prev,
      categoryId: matched ? matched.id : val,
      categoryName: matched ? matched.name : val
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...product,
      ...formData,
      image: imagePreview || formData.image,
      price: Number(formData.price) || product.price
    });
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 580, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="admin-badge admin-badge-gold">{formData.sku || product.sku || product.id}</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Edit Door Product
            </h3>
          </div>
          <button type="button" onClick={onClose} className="admin-icon-btn" style={{ width: 32, height: 32 }}>
            <IconClose size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="admin-modal-body" style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
            {/* 1. Door Name */}
            <div className="admin-form-group">
              <label className="admin-form-label">Door Name *</label>
              <input
                type="text"
                className="admin-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Heritage Teak Main Entrance Door"
                required
              />
            </div>

            {/* 2. Door Image (img) */}
            <div className="admin-form-group">
              <label className="admin-form-label">Door Image</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", backgroundColor: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}>
                <img
                  src={imagePreview || "/assets/img/about/1.png"}
                  alt="Door preview"
                  style={{ width: 68, height: 68, borderRadius: "8px", objectFit: "cover", border: "1px solid var(--admin-card-border)", backgroundColor: "#ffffff" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
                    >
                      <IconUpload size={14} /> Upload New Photo
                    </button>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    style={{ fontSize: "0.8rem", height: "32px", backgroundColor: "#ffffff" }}
                    placeholder="Or enter image URL (/assets/img/...)"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                  />
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
                </div>
              </div>
            </div>

            {/* 3. Category & Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Category *</label>
                <select
                  className="admin-select"
                  value={formData.categoryId || formData.categoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {(categories || []).map((c) => (
                    <option key={c.id || c.name} value={c.id || c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Publish Status</label>
                <select
                  className="admin-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* 4. Description */}
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Door specifications, timber species, architectural carving, acoustic insulation and finish options..."
              />
            </div>

            {/* 5. SKU & Price */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: 0 }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">SKU Code</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. JJD-TEAK-001"
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Price (₹)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 48500"
                />
              </div>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ borderTop: "1px solid var(--admin-card-border)" }}>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary admin-btn-sm">
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
              <IconCheck size={14} /> Save Product Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Category Edit Modal (Only category details are edited; changes reflect in corresponding products)
export function CategoryEditModal({ category, isOpen, onClose, onSave }) {
  if (!isOpen || !category) return null;

  const [formData, setFormData] = useState({
    name: category.name || "",
    smallDesc: category.smallDesc || category.smallDescription || "",
    description: category.description || "",
    status: category.status || "Active",
    video: category.video || category.image || "",
    image: category.image || category.video || ""
  });
  const [videoPreview, setVideoPreview] = useState(category.video || category.image || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(url) || String(url).startsWith("data:video/") || String(url).startsWith("blob:");
  };

  const handleVideoFile = async (file) => {
    if (file && (file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.name))) {
      const localUrl = URL.createObjectURL(file);
      setVideoPreview(localUrl);
      try {
        setUploading(true);
        const { uploadCatalogMedia } = await import("@/lib/adminApi");
        const publicUrl = await uploadCatalogMedia(file, "categories");
        setFormData((prev) => ({ ...prev, video: publicUrl, image: publicUrl }));
        setVideoPreview(publicUrl);
      } catch (err) {
        console.error("Failed to upload video:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const updatedCategory = {
      ...category,
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      smallDesc: formData.smallDesc.trim(),
      smallDescription: formData.smallDesc.trim(),
      description: formData.description.trim(),
      status: formData.status,
      video: formData.video || formData.image,
      image: formData.image || formData.video
    };

    onSave(updatedCategory);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 540, display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <IconCategory size={20} className="text-warning" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Edit Category: {category.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="admin-icon-btn" style={{ width: 32, height: 32 }}>
            <IconClose size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div className="admin-modal-body" style={{ padding: "1.5rem" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Category Name *</label>
              <input
                type="text"
                className="admin-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category Name"
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Showcase Video <span className="optional">(Optional)</span></span>
              </label>
              {videoPreview && isVideo(videoPreview) ? (
                <div style={{ position: "relative", marginBottom: "0.5rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--admin-card-border)", backgroundColor: "#000" }}>
                  <video src={videoPreview} controls autoPlay muted loop style={{ width: "100%", maxHeight: "180px", objectFit: "contain" }} />
                </div>
              ) : videoPreview ? (
                <div style={{ position: "relative", marginBottom: "0.5rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--admin-card-border)" }}>
                  <img src={videoPreview} alt="Preview" style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }} />
                </div>
              ) : null}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  disabled={uploading}
                >
                  <IconUpload size={14} /> {uploading ? "Uploading Video…" : "Upload New Video"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Small Desc <span className="optional">(Optional)</span></span>
              </label>
              <input
                type="text"
                className="admin-input"
                value={formData.smallDesc}
                onChange={(e) => setFormData({ ...formData, smallDesc: e.target.value })}
                placeholder="Brief one-line summary or tagline"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Description <span className="optional">(Optional)</span></span>
              </label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Full category description"
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Publish Status</label>
              <select
                className="admin-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active (Visible in catalog)</option>
                <option value="Hidden">Hidden (Draft / Unpublished)</option>
              </select>
            </div>
          </div>

          <div className="admin-modal-footer" style={{ borderTop: "1px solid var(--admin-card-border)" }}>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary admin-btn-sm">
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm" disabled={uploading}>
              <IconCheck size={14} /> Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
