"use client";
import SideMenu from "./component/SideMenu";
import MobileNav from "./component/MobileNav";
import MobileMenuSocials from "./component/MobileMenuSocials";
import Nav from "./component/Nav";
import { headerMenuItems } from "@/data/header";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header3({
  glassEffect = false,
  transparent = false,
  showSearch = false,
  onLight = false, // page behind the header is light, so use dark text and logo
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Centre of the hamburger button; the glass menu's circle reveal grows from here
  const [menuOrigin, setMenuOrigin] = useState(null);

  const isGlass = glassEffect || transparent;
  const navColor = onLight ? "#151515" : "#ffffff";

  // Opens the Frisk search overlay (<SearchPopup />), as Header1 does
  const toggleSearch = () =>
    document.getElementsByClassName("popup-search-box")[0]?.classList.toggle("show");

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const menuWrapper = document.querySelector(".mobile-menu-wrapper");
      const menuContainer = document.querySelector(".mobile-menu-area");

      if (
        menuWrapper &&
        menuContainer &&
        !menuContainer.contains(event.target) &&
        menuWrapper.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <SideMenu isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-wrapper ${mobileMenuOpen ? "body-visible" : ""
          } ${isGlass ? "mobile-menu-glass" : ""}`}
        style={
          isGlass && menuOrigin
            ? { "--menu-x": `${menuOrigin.x}px`, "--menu-y": `${menuOrigin.y}px` }
            : undefined
        }
      >
        <div className="mobile-menu-area">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="mobile-logo">
            <Link scroll={false} href="/">
              <Image
                width={250}
                height={100}
                style={{ width: "auto", height: "45px", objectFit: "contain" }}
                src="/assets/img/logo/logo.png"
                alt="JJ Doors"
              />
            </Link>
          </div>
          <div className="mobile-menu">
            <ul>
              <MobileNav menu={headerMenuItems} />
            </ul>
          </div>
          <div className="social-btn style3">
            <MobileMenuSocials />
          </div>
        </div>
      </div>

      {/* Header Area */}
      <header
        className={`nav-header header-layout3 ${isGlass ? "header-glass-mode" : ""}`}
        style={
          isGlass
            ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 999,
              // Fully transparent at the top of the page; fades to a readable
              // background once scrolled. Blur and border animate too, so the
              // whole bar appears as one smooth transition.
              backgroundColor: isScrolled
                ? onLight
                  ? "rgba(255, 255, 255, 0.88)"
                  : "rgba(0, 0, 0, 0.72)"
                : onLight
                  ? "rgba(255, 255, 255, 0)"
                  : "rgba(0, 0, 0, 0)",
              backdropFilter: isScrolled ? "blur(14px)" : "blur(0px)",
              WebkitBackdropFilter: isScrolled ? "blur(14px)" : "blur(0px)",
              // Border stays 1px at all times (transparent when at the top) so
              // the header never shifts by a pixel when it changes.
              borderBottom: `1px solid ${isScrolled
                ? onLight
                  ? "rgba(0, 0, 0, 0.08)"
                  : "rgba(255, 255, 255, 0.15)"
                : "rgba(255, 255, 255, 0)"
                }`,
              boxShadow: isScrolled
                ? onLight
                  ? "0 4px 24px rgba(0, 0, 0, 0.08)"
                  : "0 4px 24px rgba(0, 0, 0, 0.18)"
                : "none",
              transition:
                "background-color 0.4s ease, backdrop-filter 0.4s ease, -webkit-backdrop-filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
            }
            : undefined
        }
      >
        <div className={`sticky-wrapper ${isScrolled && !isGlass ? "header-sticky" : ""} `}>
          <div className="menu-area">
            <div className="container-fluid">
              {/* Logo + menu sit together in the middle on desktop; on mobile
                  the logo stays left and the menu button right */}
              <div className="row align-items-center justify-content-between justify-content-lg-center position-relative">
                <div className="col-auto">
                  <div className="header-logo">
                    <Link scroll={false} href="/">
                      <Image
                        width={250}
                        height={100}
                        src="/assets/img/logo/logo.png"
                        alt="JJ Doors"
                        style={{ height: "65px", width: "auto", objectFit: "contain" }}
                      />
                    </Link>
                  </div>
                </div>
                <div className="col-auto ms-auto ms-lg-0 header-menu-gap">
                  <nav className="main-menu d-none d-lg-inline-block">
                    <ul style={isGlass ? { color: navColor } : undefined}>
                      <Nav menu={headerMenuItems} />
                    </ul>
                  </nav>
                  <div className="navbar-right d-inline-flex d-lg-none align-items-center">
                    {showSearch && (
                      <button
                        type="button"
                        className="search-btn searchBoxToggler"
                        onClick={toggleSearch}
                        aria-label="Search doors"
                        style={{ marginRight: "20px" }}
                      >
                        <Image
                          width={24}
                          height={24}
                          src="/assets/img/icon/search.svg"
                          alt="icon"
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuOrigin({
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        });
                        setMobileMenuOpen(true);
                      }}
                      className="menu-toggle sidebar-btn"
                      style={isGlass ? { color: navColor } : undefined}
                    >
                      <span className="line" style={isGlass ? { backgroundColor: navColor } : undefined}></span>
                      <span className="line" style={isGlass ? { backgroundColor: navColor } : undefined}></span>
                      <span className="line" style={isGlass ? { backgroundColor: navColor } : undefined}></span>
                    </button>
                  </div>
                </div>
                {/* Taken out of the flow so it doesn't push the centred group off-centre */}
                {showSearch && (
                  <div
                    className="col-auto d-none d-lg-block"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <div
                      className="header-button"
                      style={{ display: "flex", alignItems: "center", gap: "36px" }}
                    >
                      <button
                        type="button"
                        className="search-btn searchBoxToggler"
                        onClick={toggleSearch}
                      >
                        <Image
                          width={24}
                          height={24}
                          src="/assets/img/icon/search.svg"
                          alt="icon"
                        />
                        <span className="link-effect">
                          <span className="effect-1">SEARCH</span>
                          <span className="effect-1">SEARCH</span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global style override for glass header nav items */}
        {isGlass && (
          <style jsx global>{`
            .header-glass-mode .main-menu > ul > li > a {
              color: ${navColor} !important;
            }
            /* The template draws this marker in white, for a dark hero */
            .header-glass-mode .main-menu > ul > li > a:before {
              border-color: ${navColor};
            }
            .header-glass-mode .main-menu > ul > li > a:hover:before {
              background: ${navColor};
            }
            .header-glass-mode .main-menu > ul > li > a:hover {
              color: #00B04A !important;
            }
            .header-glass-mode .main-menu > ul > li > a.active {
              color: #00B04A !important;
            }
            .header-glass-mode .header-button .btn {
              background-color: ${onLight ? "#151515" : "rgba(255, 255, 255, 0.9)"} !important;
              color: ${onLight ? "#ffffff" : "#111111"} !important;
              border: 1px solid ${onLight ? "#151515" : "rgba(255, 255, 255, 0.4)"} !important;
            }
            .header-glass-mode .header-button .btn:hover {
              background-color: ${onLight ? "#00B04A" : "#ffffff"} !important;
              color: ${onLight ? "#ffffff" : "#000000"} !important;
              border-color: ${onLight ? "#00B04A" : "rgba(255, 255, 255, 0.4)"} !important;
            }

            /* Burger: translucent disc so it stays readable over the hero */
            .header-glass-mode .sidebar-btn {
              background: ${onLight ? "rgba(255, 255, 255, 0.55)" : "rgba(0, 0, 0, 0.45)"};
              backdrop-filter: blur(6px);
              -webkit-backdrop-filter: blur(6px);
            }
            .header-glass-mode .sidebar-btn:hover {
              background: ${onLight ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.65)"};
            }

            /* Search button (Frisk Header1 style), matching the nav colour */
            .header-glass-mode .search-btn {
              background: transparent;
              border: 0;
              padding: 0;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 600;
              font-family: var(--title-font);
              color: ${navColor};
              cursor: pointer;
            }
            /* The icon file is dark, so only invert it on a dark header */
            .header-glass-mode .search-btn img {
              filter: ${onLight ? "none" : "brightness(0) invert(1)"};
            }
            .header-glass-mode .search-btn:hover {
              color: #00B04A;
            }

            /* Mobile menu panel matches the glass sticky-wrapper */
            .mobile-menu-glass {
              backdrop-filter: blur(100px);
              -webkit-backdrop-filter: blur(100px);
            }
            .mobile-menu-glass .mobile-menu-area {
              background-color: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(100px);
              -webkit-backdrop-filter: blur(100px);
              width: 100vw;
              max-width: 100vw !important;
            }
            .mobile-menu-glass .mobile-logo {
              background-color: transparent;
            }

            /* Full-screen layout: logo top, links fill the middle, CTA + socials at the bottom */
            .mobile-menu-glass .mobile-menu-area {
              display: flex;
              flex-direction: column;
              padding: calc(28px + env(safe-area-inset-top, 0px)) 32px
                calc(32px + env(safe-area-inset-bottom, 0px));
              overflow-y: auto;
            }
            .mobile-menu-glass .menu-toggle {
              top: calc(28px + env(safe-area-inset-top, 0px));
              right: 32px;
            }
            .mobile-menu-glass .mobile-logo {
              display: flex;
              align-items: center;
              min-height: 50px;
              padding: 0;
              margin-bottom: 32px;
            }
            .mobile-menu-glass .mobile-menu {
              flex: 1 0 auto;
              display: flex;
              flex-direction: column;
              max-height: none;
              overflow: visible;
              margin-bottom: 32px;
              padding-bottom: 32px;
            }
            .mobile-menu-glass .mobile-menu > ul {
              margin: auto 0;
            }
            .mobile-menu-glass .mobile-menu > ul > li > a {
              font-size: clamp(28px, 8vw, 40px);
              padding: 12px 0;
            }
            .mobile-menu-glass .mobile-menu-btn {
              margin: 0 0 28px !important;
            }
            .mobile-menu-glass .mobile-menu-btn .btn {
              padding-top: 20px;
              padding-bottom: 20px;
            }
            .mobile-menu-glass .social-btn {
              gap: 32px;
            }
            .mobile-menu-glass .social-btn a {
              font-size: 22px;
            }

            /* Open animation: circle reveal from the hamburger, then staggered content */
            .mobile-menu-wrapper.mobile-menu-glass {
              opacity: 1;
              clip-path: circle(0px at var(--menu-x, calc(100% - 48px)) var(--menu-y, 48px));
              transition: clip-path 0.5s cubic-bezier(0.65, 0, 0.35, 1),
                visibility 0s linear 0.5s;
            }
            .mobile-menu-wrapper.mobile-menu-glass.body-visible {
              clip-path: circle(150vmax at var(--menu-x, calc(100% - 48px)) var(--menu-y, 48px));
              transition: clip-path 0.7s cubic-bezier(0.65, 0, 0.35, 1),
                visibility 0s linear 0s;
            }
            .mobile-menu-glass .mobile-menu-area {
              transform: none !important;
              opacity: 1 !important;
              visibility: inherit !important;
              transition: none !important;
            }
            .mobile-menu-glass .mobile-logo,
            .mobile-menu-glass .mobile-menu > ul > li,
            .mobile-menu-glass .mobile-menu-btn,
            .mobile-menu-glass .social-btn {
              opacity: 0;
              transform: translateY(24px);
              transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .mobile-menu-glass .menu-toggle {
              opacity: 0;
              transform: rotate(-90deg) scale(0.6);
              transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .mobile-menu-glass.body-visible .mobile-logo,
            .mobile-menu-glass.body-visible .mobile-menu > ul > li,
            .mobile-menu-glass.body-visible .mobile-menu-btn,
            .mobile-menu-glass.body-visible .social-btn,
            .mobile-menu-glass.body-visible .menu-toggle {
              opacity: 1;
              transform: none;
              transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .mobile-menu-glass.body-visible .mobile-logo,
            .mobile-menu-glass.body-visible .menu-toggle {
              transition-delay: 0.3s;
            }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(1) { transition-delay: 0.35s; }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(2) { transition-delay: 0.42s; }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(3) { transition-delay: 0.49s; }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(4) { transition-delay: 0.56s; }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(5) { transition-delay: 0.63s; }
            .mobile-menu-glass.body-visible .mobile-menu > ul > li:nth-child(6) { transition-delay: 0.7s; }
            .mobile-menu-glass.body-visible .mobile-menu-btn {
              transition-delay: 0.62s;
            }
            .mobile-menu-glass.body-visible .social-btn {
              transition-delay: 0.7s;
            }
            .mobile-menu-glass.body-visible .menu-toggle:hover {
              transform: rotate(90deg);
              transition-delay: 0s;
            }

            @media (prefers-reduced-motion: reduce) {
              .mobile-menu-wrapper.mobile-menu-glass {
                clip-path: none;
                opacity: 0;
                transition: opacity 0.3s ease, visibility 0s linear 0.3s;
              }
              .mobile-menu-wrapper.mobile-menu-glass.body-visible {
                clip-path: none;
                opacity: 1;
                transition: opacity 0.3s ease, visibility 0s linear 0s;
              }
              .mobile-menu-glass .mobile-logo,
              .mobile-menu-glass .mobile-menu > ul > li,
              .mobile-menu-glass .mobile-menu-btn,
              .mobile-menu-glass .social-btn,
              .mobile-menu-glass .menu-toggle {
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
              }
            }
            .mobile-menu-glass .menu-toggle {
              border-color: #ffffff;
              color: #ffffff;
            }
            .mobile-menu-glass .mobile-menu {
              border-bottom-color: rgba(255, 255, 255, 0.15);
            }
            .mobile-menu-glass .mobile-menu ul li a,
            .mobile-menu-glass .mobile-menu .mean-expand-class {
              color: #ffffff;
            }
            .mobile-menu-glass .mobile-menu ul li a:hover,
            .mobile-menu-glass .mobile-menu ul li a.activeMenu,
            .mobile-menu-glass .mobile-menu ul li a.activeMenu2 {
              color: #00B04A !important;
            }
            .mobile-menu-glass .mobile-menu-btn .btn {
              background-color: rgba(255, 255, 255, 0.9) !important;
              color: #111111 !important;
              border: 1px solid rgba(255, 255, 255, 0.4) !important;
            }
            .mobile-menu-glass .social-btn a {
              color: #ffffff;
            }
            .mobile-menu-glass .social-btn a:hover {
              color: #00B04A;
            }
          `}</style>
        )}
      </header>
    </>
  );
}
