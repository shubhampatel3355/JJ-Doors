"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  IconCategory,
  IconUpload,
  IconCheck,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconArrowUp,
  IconArrowDown,
  IconProducts,
  IconEdit
} from "@/components/admin/AdminIcons";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  uploadCatalogMedia
} from "@/lib/adminApi";
import { CategoryEditModal } from "@/components/admin/AdminModals";

const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(url) || String(url).startsWith("data:video/") || String(url).startsWith("blob:");
};

export default function CreateCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State - Name, Small Desc, Description, Status, Video
  const [formData, setFormData] = useState({
    name: "",
    smallDesc: "",
    description: "",
    status: "Active" // "Active" | "Hidden"
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [deletingCategory, setDeletingCategory] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const refreshCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
    return cats;
  };

  // Load categories from Supabase on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await getCategories();
        if (alive) setCategories(cats);
      } catch (e) {
        console.error(e);
        if (alive) showToast(e.message || "Could not load categories.");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Video upload handling
  const handleVideoFile = (file) => {
    if (file && (file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.name))) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    } else {
      showToast("Please select a valid video file (MP4, WebM, MOV, MKV).");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveVideo = () => {
    setVideoPreview(null);
    setVideoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const name = formData.name.trim();
    const payload = {
      name,
      smallDesc: formData.smallDesc,
      description:
        formData.description.trim() || "Custom door collection engineered by JJ Doors.",
      status: formData.status,
      badgeColor: "gold"
    };
    const fileToUpload = videoFile;
    const localPreview = videoPreview;

    // Optimistic: show the category and clear the form immediately.
    const tempId = `temp-${Date.now()}`;
    setCategories((prev) => [
      ...prev,
      {
        id: tempId,
        ...payload,
        smallDescription: payload.smallDesc,
        video: localPreview || null,
        image: localPreview || "/assets/img/about/1.png",
        productCount: 0,
        sortOrder: Math.floor(Date.now() / 1000),
        createdAt: new Date().toISOString().split("T")[0],
        _pending: true
      }
    ]);
    showToast(`Category "${name}" created.`);
    setFormData({ name: "", smallDesc: "", description: "", status: "Active" });
    handleRemoveVideo();

    // Persist in the background — upload video directly to Supabase storage.
    try {
      let videoUrl = null;
      if (fileToUpload) {
        videoUrl = await uploadCatalogMedia(fileToUpload, "categories");
      }
      const created = await createCategory({
        ...payload,
        video: videoUrl,
        image: videoUrl || "/assets/img/about/1.png"
      });
      setCategories((prev) => prev.map((c) => (c.id === tempId ? created : c)));
    } catch (err) {
      console.error(err);
      setCategories((prev) => prev.filter((c) => c.id !== tempId));
      showToast(err.message || "Couldn't save category — please try again.");
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      smallDesc: "",
      description: "",
      status: "Active"
    });
    handleRemoveVideo();
    setErrors({});
    showToast("Form fields reset.");
  };

  // Reordering functions — swap locally, then persist sort_order to Supabase
  const persistOrder = async (updated, movedName, dir) => {
    setCategories(updated);
    try {
      await reorderCategories(updated);
      showToast(`Moved "${movedName}" ${dir}.`);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to save new order.");
      refreshCategories().catch(() => {});
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...categories];
    const item = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = item;
    persistOrder(updated, item.name, "up");
  };

  const handleMoveDown = (index) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    const item = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = item;
    persistOrder(updated, item.name, "down");
  };

  // Toggle Hide / Unhide
  const handleToggleHide = async (categoryId) => {
    const current = categories.find((c) => c.id === categoryId);
    if (!current) return;
    if (String(categoryId).startsWith("temp-")) {
      showToast("Category is still saving — try again in a moment.");
      return;
    }
    const newStatus = current.status === "Active" ? "Hidden" : "Active";
    try {
      await updateCategory(categoryId, { status: newStatus });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, status: newStatus } : c))
      );
      showToast(`Category "${current.name}" is now ${newStatus}.`);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to update category.");
    }
  };

  // Delete Category
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    const target = deletingCategory;
    setDeletingCategory(null);
    if (String(target.id).startsWith("temp-")) {
      setCategories((prev) => prev.filter((c) => c.id !== target.id));
      return;
    }
    try {
      await deleteCategory(target.id);
      setCategories((prev) => prev.filter((c) => c.id !== target.id));
      showToast(`Category "${target.name}" removed from catalog.`);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to delete category.");
    }
  };

  // Save changes from CategoryEditModal
  const handleSaveCategory = async (updatedCategory) => {
    if (String(updatedCategory.id).startsWith("temp-")) {
      showToast("Category is still saving — try again in a moment.");
      setEditingCategory(null);
      return;
    }
    try {
      const saved = await updateCategory(updatedCategory.id, {
        name: updatedCategory.name,
        smallDesc: updatedCategory.smallDesc ?? updatedCategory.smallDescription,
        description: updatedCategory.description,
        status: updatedCategory.status,
        video: updatedCategory.video || updatedCategory.image,
        image: updatedCategory.image || updatedCategory.video
      });
      setCategories((prev) => prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));
      showToast(`Category "${saved.name}" updated! Changes reflected in corresponding products.`);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to update category.");
    }
    setEditingCategory(null);
  };

  return (
    <AdminLayout
      breadcrumb="Admin / Categories / Create"
      title="Create Category"
      subtitle="Define primary door classifications with cinematic showcase video and customer navigation."
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
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>Category Update</div>
              <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}
      >
        {/* LEFT COLUMN: Create Category Form */}
        <div className="admin-card" style={{ padding: "2rem" }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <IconCategory size={20} className="text-warning" />
                Category Details
              </h3>
              <div className="admin-card-subtitle">Fill in information and upload showcase video for this category</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. Category Name */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Name *</span>
                {errors.name && <span style={{ color: "var(--admin-danger)", fontSize: "0.76rem" }}>{errors.name}</span>}
              </label>
              <input
                type="text"
                className={`admin-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Teak Wood Main Doors, Veneer Doors, WPC Doors..."
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
            </div>

            {/* 2. Category Small Desc */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Small Desc <span className="optional">(Optional)</span></span>
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Handcrafted solid teak wood doors for luxury entrances..."
                value={formData.smallDesc}
                onChange={(e) => setFormData({ ...formData, smallDesc: e.target.value })}
              />
            </div>

            {/* 3. Category Description */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Description <span className="optional">(Optional)</span></span>
              </label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Describe timber species, durability specs, architectural grain, and finish options..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* 4. Publish Status */}
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
                <option value="Active">Active (Visible in catalog)</option>
                <option value="Hidden">Hidden (Draft / Unpublished)</option>
              </select>
            </div>

            {/* 5. Video Upload */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                <span>Category Showcase Video <span className="optional">(Optional)</span></span>
              </label>

              {videoPreview ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "var(--admin-radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--admin-card-border)",
                    backgroundColor: "#000000",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <video
                    src={videoPreview}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      maxHeight: "260px",
                      objectFit: "contain",
                      backgroundColor: "#000000"
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      backgroundColor: "#0f172a",
                      color: "#ffffff"
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} />
                      Video ready to upload
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{ fontSize: "0.76rem", padding: "0.3rem 0.65rem", background: "rgba(255,255,255,0.15)", color: "#fff", border: "none" }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        Change Video
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        style={{ fontSize: "0.76rem", padding: "0.3rem 0.65rem" }}
                        onClick={handleRemoveVideo}
                      >
                        <IconTrash size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`admin-dropzone ${isDragging ? "dragging" : ""}`}
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
                    background: isDragging ? "#f0fdf4" : "#f8fafc",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      backgroundColor: "#e0f2fe",
                      color: "var(--admin-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.85rem"
                    }}
                  >
                    <IconUpload size={26} />
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.98rem", marginBottom: "0.3rem" }}>
                    Click to upload or drag & drop video
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", maxWidth: 360, margin: "0 auto" }}>
                    Supports MP4, WebM, MOV up to 50MB (Cinematic background video for category showcase)
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
                className="admin-hidden-file-input"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleVideoFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Form Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--admin-card-border)"
              }}
            >
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleReset}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Existing Categories List with Order Up/Down, Hide/Unhide, Delete */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Existing Categories ({categories.length})</h3>
                <div className="admin-card-subtitle">Change display order, edit, hide or delete categories</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 620, overflowY: "auto", paddingRight: "0.25rem" }}>
              {isLoading && (
                <div style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", padding: "0.5rem 0" }}>
                  Loading categories from Supabase…
                </div>
              )}
              {!isLoading && categories.length === 0 && (
                <div style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", padding: "0.5rem 0" }}>
                  No categories yet. Create your first one on the left.
                </div>
              )}
              {categories.map((c, index) => {
                const isHidden = c.status === "Hidden";
                const hasVideo = isVideoUrl(c.video || c.image);

                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--admin-radius-md)",
                      border: "1px solid var(--admin-card-border)",
                      backgroundColor: isHidden ? "#f8fafc" : "#ffffff",
                      opacity: isHidden ? 0.75 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {/* Category Thumbnail (Video or Image) & Details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid var(--admin-card-border)",
                          backgroundColor: "#000",
                          position: "relative"
                        }}
                      >
                        {hasVideo ? (
                          <video
                            src={c.video || c.image}
                            muted
                            autoPlay
                            loop
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <img
                            src={c.image || "/assets/img/about/1.png"}
                            alt={c.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                        {hasVideo && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 2,
                              right: 2,
                              backgroundColor: "rgba(0,0,0,0.75)",
                              color: "#fff",
                              fontSize: "8px",
                              padding: "1px 3px",
                              borderRadius: "3px",
                              fontWeight: 700
                            }}
                          >
                            VIDEO
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </div>
                        {(c.smallDesc || c.smallDescription) && (
                          <div style={{ fontSize: "0.76rem", color: "var(--admin-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.1rem" }}>
                            {c.smallDesc || c.smallDescription}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            {c.productCount} models
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "0.1rem 0.45rem",
                              borderRadius: "4px",
                              backgroundColor: isHidden ? "#fef3c7" : "#d1fae5",
                              color: isHidden ? "#92400e" : "#065f46"
                            }}
                          >
                            {c.status || "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Order Up, Order Down, Edit, Hide/Unhide, Delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, marginLeft: "0.5rem" }}>
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move Up"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          border: "1px solid var(--admin-card-border)",
                          backgroundColor: "#ffffff",
                          color: index === 0 ? "#cbd5e1" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: index === 0 ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconArrowUp size={14} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                        title="Move Down"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          border: "1px solid var(--admin-card-border)",
                          backgroundColor: "#ffffff",
                          color: index === categories.length - 1 ? "#cbd5e1" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: index === categories.length - 1 ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconArrowDown size={14} />
                      </button>

                      {/* Edit Category */}
                      <button
                        type="button"
                        onClick={() => setEditingCategory(c)}
                        title="Edit Category"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          border: "1px solid var(--admin-card-border)",
                          backgroundColor: "#f8fafc",
                          color: "var(--admin-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconEdit size={14} />
                      </button>

                      {/* Hide / Unhide Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(c.id)}
                        title={isHidden ? "Unhide Category" : "Hide Category"}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          border: "1px solid var(--admin-card-border)",
                          backgroundColor: isHidden ? "#fffbeb" : "#ffffff",
                          color: isHidden ? "var(--admin-warning)" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {isHidden ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(c)}
                        title="Delete Category"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "6px",
                          border: "1px solid #fca5a5",
                          backgroundColor: "#fef2f2",
                          color: "var(--admin-danger)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="admin-modal-overlay" onClick={() => setDeletingCategory(null)}>
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
                Delete Category
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--admin-text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                Are you sure you want to delete <strong style={{ color: "#0f172a" }}>"{deletingCategory.name}"</strong>?
              </p>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  style={{ flex: 1 }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          isOpen={Boolean(editingCategory)}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveCategory}
        />
      )}
    </AdminLayout>
  );
}
