"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "../public/assets/css/vendor.css";
import "../public/assets/sass/style.scss";
import { ParallaxProvider } from "react-scroll-parallax";
import ScrollTop from "@/components/common/ScrollTop";
import "rc-slider/assets/index.css";
import { Unbounded, Poppins } from "next/font/google";
import ScrollTopBehaviour from "@/components/common/ScrollTopBehavier";
import Context from "@/context/Context";
if (typeof window !== "undefined") {
  import("bootstrap/dist/js/bootstrap.esm").then((module) => {
    // Module is imported, you can access any exported functionality if
  });
}

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--title-font",
});

// Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--body-font",
});

export default function RootLayout({ children }) {
  const path = usePathname();
  let wow = null;
  useEffect(() => {
    const WOW = require("@/utils/wow");
    wow = new WOW.default({
      live: false,
      mobile: false,
    });
    wow.init();
  }, [path]);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/img/logo/favicon.png" type="image/png" />
        {/* Dev only: browser extensions (wallets etc.) inject scripts into every page.
            Their uncaught errors are shown by the Next.js dev overlay as if they were ours.
            Ignore errors that come from chrome-extension:// scripts; our own errors still show. */}
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){
  var fromExtension = function (value) {
    return typeof value === "string" && value.indexOf("chrome-extension://") !== -1;
  };
  window.addEventListener("error", function (event) {
    var stack = event && event.error && event.error.stack;
    if (fromExtension(event && event.filename) || fromExtension(stack)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event && event.reason;
    var stack = reason && (reason.stack || reason.message);
    if (fromExtension(stack) || fromExtension(String(reason))) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
})();`,
            }}
          />
        )}
      </head>
      <body className={`body  ${poppins.variable} ${unbounded.variable}`} suppressHydrationWarning>
        <Context>
          <ParallaxProvider>{children}</ParallaxProvider>
          <ScrollTop />
          <ScrollTopBehaviour />
        </Context>
      </body>
    </html>
  );
}
