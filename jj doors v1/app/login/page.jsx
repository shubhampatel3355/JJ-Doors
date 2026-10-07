"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconDoor, IconEye, IconEyeOff, IconCheck } from "@/components/admin/AdminIcons";
import "@/public/assets/css/admin.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@jjdoors.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email/username and password.");
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay for smooth experience
    setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("jj_admin_auth", "true");
        if (rememberMe) {
          localStorage.setItem("jj_admin_auth", "true");
        }
      }
      setIsLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  const handleFillDemo = () => {
    setEmail("admin@jjdoors.com");
    setPassword("JJDoors2026!Master");
    setErrorMessage("");
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotModal(false);
        setForgotSent(false);
        setForgotEmail("");
      }, 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        backgroundImage: `
          radial-gradient(circle at 15% 25%, rgba(217, 119, 6, 0.06) 0%, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
          linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background ambient glow shapes */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: 420,
          height: 420,
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#ffffff",
          border: "1px solid var(--admin-card-border)",
          borderRadius: "var(--admin-radius-xl)",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
          padding: "2.5rem 2.2rem",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 20px rgba(217, 119, 6, 0.25)",
              marginBottom: "1rem"
            }}
          >
            <IconDoor size={32} />
          </div>

          <h2
            style={{
              fontSize: "1.55rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 0.35rem 0",
              fontFamily: "'Unbounded', sans-serif",
              letterSpacing: "-0.5px"
            }}
          >
            JJ DOORS
          </h2>
          <div
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              color: "var(--admin-primary)",
              fontWeight: 700,
              marginBottom: "0.5rem"
            }}
          >
            Admin Management Portal
          </div>
          <p style={{ fontSize: "0.86rem", color: "var(--admin-text-muted)", margin: 0 }}>
            Sign in to manage catalog, categories & inquiries
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: "var(--admin-danger-bg)",
              border: "1px solid #fecaca",
              color: "var(--admin-danger)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--admin-radius-sm)",
              fontSize: "0.84rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email / Username */}
          <div className="admin-form-group">
            <label className="admin-form-label">Email or Username</label>
            <input
              type="text"
              className="admin-input"
              placeholder="admin@jjdoors.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password with Show/Hide toggle */}
          <div className="admin-form-group">
            <div className="admin-form-label">
              <span>Password</span>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--admin-primary)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 600
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="admin-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="admin-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="admin-input-suffix-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Quick Demo fill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              marginTop: "-0.25rem"
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.82rem",
                color: "var(--admin-text-muted)",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "var(--admin-primary)", width: 16, height: 16 }}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                background: "#f1f5f9",
                border: "1px solid var(--admin-card-border)",
                color: "var(--admin-text-muted)",
                fontSize: "0.75rem",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--admin-radius-sm)",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Autofill Demo
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: "100%", padding: "0.9rem", fontSize: "0.98rem" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Verifying Credentials...
              </span>
            ) : (
              "Sign In to Dashboard →"
            )}
          </button>
        </form>

        {/* Public site link */}
        <div style={{ marginTop: "1.75rem", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
          <Link href="/" style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: 500 }}>
            <span>← Back to JJ Doors Website</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="admin-modal-overlay" onClick={() => setForgotModal(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Reset Admin Password
              </h3>
              <button
                onClick={() => setForgotModal(false)}
                className="admin-icon-btn"
                style={{ width: 30, height: 30 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotSubmit}>
              <div className="admin-modal-body">
                {forgotSent ? (
                  <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <div style={{ color: "var(--admin-success)", fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                    <h4 style={{ color: "#0f172a", margin: "0 0 0.4rem 0" }}>Reset Link Dispatched</h4>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", margin: 0 }}>
                      Check your email instructions to reset your master credentials.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", marginTop: 0, marginBottom: "1.2rem" }}>
                      Enter your authorized administrator email address to receive password recovery instructions.
                    </p>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Registered Email</label>
                      <input
                        type="email"
                        className="admin-input"
                        placeholder="admin@jjdoors.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {!forgotSent && (
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    Send Recovery Email
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
