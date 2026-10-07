"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDashboard,
  IconCategory,
  IconAddProduct,
  IconProducts,
  IconLogout,
  IconDoor,
  IconClose
} from "./AdminIcons";

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconDashboard />,
      badge: "Overview"
    },
    {
      label: "Create Category",
      href: "/categories/create",
      icon: <IconCategory />,
      badge: "+ New"
    },
    {
      label: "Add Product",
      href: "/admin-products/add",
      icon: <IconAddProduct />,
      badge: "+ Item"
    },
    {
      label: "View Products",
      href: "/admin-products",
      icon: <IconProducts />,
      badge: "Catalog"
    }
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("jj_admin_auth");
      localStorage.removeItem("jj_admin_auth");
    }
    router.push("/login");
  };

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/admin";
    if (href === "/admin-products") return pathname === "/admin-products";
    return pathname === href || (href !== "/admin-products" && pathname.startsWith(href));
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-brand">
        <Link href="/dashboard" className="admin-brand-link" onClick={onClose}>
          <div className="admin-brand-icon">
            <IconDoor size={22} />
          </div>
          <div className="admin-brand-text">
            <h3>JJ DOORS</h3>
            <span>ADMIN STUDIO</span>
          </div>
        </Link>
        <button 
          className="admin-mobile-toggle" 
          onClick={onClose} 
          aria-label="Close Sidebar"
          style={{ padding: '0.4rem', color: '#64748b' }}
        >
          <IconClose size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="admin-sidebar-nav">
        <div className="admin-nav-section-title">Navigation Menu</div>

        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${active ? "active" : ""}`}
              onClick={onClose}
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="admin-nav-item-inner" style={{ whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                {item.icon}
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              </div>
              {item.badge && (
                <span className="admin-nav-badge" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="admin-nav-section-title" style={{ marginTop: "1.2rem" }}>
          Quick Links
        </div>

        <Link
          href="/"
          target="_blank"
          className="admin-nav-item"
        >
          <div className="admin-nav-item-inner">
            <IconDoor size={18} />
            <span>View Public Website</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--admin-primary)", fontWeight: 700 }}>↗</span>
        </Link>

      </div>

      {/* Footer / User Profile & Logout */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-card">
          <div className="admin-user-info">
            <div className="admin-avatar">JD</div>
            <div className="admin-user-text">
              <h4>JJ Administrator</h4>
              <span>Super Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Logout"
            aria-label="Logout"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
