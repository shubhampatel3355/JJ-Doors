"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "@/public/assets/css/admin.css";

export default function AdminLayout({ children, title, subtitle, breadcrumb, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-app">
      <div className="admin-wrapper">
        {/* Backdrop for mobile view */}
        <div
          className={`admin-backdrop ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="admin-main">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="admin-content">
            {/* Top Page Header / Title / Action bar */}
            {(title || actions || breadcrumb) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "1.75rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--admin-card-border)"
                }}
              >
                <div>
                  {breadcrumb && (
                    <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginBottom: "0.3rem", fontWeight: 500 }}>
                      {breadcrumb}
                    </div>
                  )}
                  {title && (
                    <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", fontFamily: "'Unbounded', sans-serif" }}>
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p style={{ fontSize: "0.86rem", color: "var(--admin-text-muted)", margin: "0.3rem 0 0 0" }}>
                      {subtitle}
                    </p>
                  )}
                </div>

                {actions && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {actions}
                  </div>
                )}
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
