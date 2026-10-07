"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconMenu,
  IconBell,
  IconAddProduct,
  IconCategory,
  IconLogout
} from "./AdminIcons";

export default function AdminHeader({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("jj_admin_auth");
      localStorage.removeItem("jj_admin_auth");
    }
    router.push("/login");
  };

  const notifications = [
    { id: 1, title: "New catalog inquiry received", desc: "Customer requested pricing for Teak Wood Main Door #JJD-TEAK-001", time: "5 mins ago", unread: true },
    { id: 2, title: "Stock update alert", desc: "Italian Smoked Oak Veneer Door is low on stock (9 units remaining)", time: "1 hour ago", unread: true },
    { id: 3, title: "Category added successfully", desc: "WPC 100% Waterproof Doors was published to live catalog", time: "3 hours ago", unread: false }
  ];

  return (
    <header className="admin-header">
      {/* Left side: Hamburger Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <button
          className="admin-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar Menu"
        >
          <IconMenu size={22} />
        </button>
      </div>

      {/* Right side: Quick Add Actions, Notifications, User Menu */}
      <div className="admin-header-actions">
        {/* Quick Add Product Button */}
        <Link href="/admin-products/add" className="admin-header-pill-btn d-none d-md-inline-flex">
          <IconAddProduct size={16} />
          <span>+ Add Product</span>
        </Link>

        {/* Notifications Popover */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            className="admin-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
          >
            <IconBell size={18} />
            <span className="admin-badge-indicator"></span>
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 330,
                backgroundColor: "#ffffff",
                border: "1px solid var(--admin-card-border)",
                borderRadius: "var(--admin-radius-lg)",
                boxShadow: "var(--admin-shadow-lg)",
                zIndex: 1100,
                overflow: "hidden",
                animation: "adminSlideUp 0.2s ease forwards"
              }}
            >
              <div
                style={{
                  padding: "1rem 1.2rem",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fafafa"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                  Notifications (2 new)
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--admin-primary)",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  onClick={() => setShowNotifications(false)}
                >
                  Mark all read
                </span>
              </div>

              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "0.85rem 1.2rem",
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: n.unread ? "#fffbeb" : "#ffffff",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.84rem", fontWeight: 600, color: n.unread ? "#92400e" : "var(--admin-text-main)" }}>
                        {n.title}
                      </span>
                      {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--admin-primary)" }}></span>}
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "var(--admin-text-muted)", margin: 0, lineHeight: 1.35 }}>
                      {n.desc}
                    </p>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.3rem", display: "block" }}>
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "0.75rem",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderTop: "1px solid #f1f5f9"
                }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: "0.78rem", color: "var(--admin-primary)", fontWeight: 700 }}
                >
                  View Activity Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }} ref={userRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.35rem 0.65rem",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid var(--admin-card-border)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
            }}
          >
            <div className="admin-avatar" style={{ width: 32, height: 32, fontSize: "0.8rem" }}>
              JD
            </div>
            <div className="d-none d-sm-block" style={{ textAlign: "left", lineHeight: 1.15 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>Admin</div>
              <div style={{ fontSize: "0.68rem", color: "var(--admin-primary)", fontWeight: 600 }}>Superuser</div>
            </div>
          </div>

          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 210,
                backgroundColor: "#ffffff",
                border: "1px solid var(--admin-card-border)",
                borderRadius: "var(--admin-radius-md)",
                boxShadow: "var(--admin-shadow-lg)",
                zIndex: 1100,
                padding: "0.5rem",
                animation: "adminSlideUp 0.2s ease forwards"
              }}
            >
              <div style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid #f1f5f9", marginBottom: "0.4rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Harshil / JJ Doors</div>
                <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>admin@jjdoors.com</div>
              </div>

              <Link
                href="/categories/create"
                onClick={() => setShowUserMenu(false)}
                className="admin-nav-item"
                style={{ padding: "0.55rem 0.75rem", fontSize: "0.82rem" }}
              >
                <div className="admin-nav-item-inner">
                  <IconCategory size={16} />
                  <span>Create Category</span>
                </div>
              </Link>

              <Link
                href="/admin-products/add"
                onClick={() => setShowUserMenu(false)}
                className="admin-nav-item"
                style={{ padding: "0.55rem 0.75rem", fontSize: "0.82rem" }}
              >
                <div className="admin-nav-item-inner">
                  <IconAddProduct size={16} />
                  <span>Add Product</span>
                </div>
              </Link>

              <div style={{ height: 1, background: "#f1f5f9", margin: "0.4rem 0" }} />

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.55rem 0.75rem",
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--admin-radius-sm)",
                  color: "var(--admin-danger)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <IconLogout size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
