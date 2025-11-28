import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

// Layout Components
import Header from "../core/common/header";
import Sidebar from "../core/common/sidebar";
import ThemeSettings from "../core/common/theme-settings";
import HorizontalSidebar from "../core/common/horizontal-sidebar";
import TwoColumnSidebar from "../core/common/two-column";
import StackedSidebar from "../core/common/stacked-sidebar";
import DeleteModal from "../core/modals/deleteModal";

// Bootstrap required for modals
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// --- Type Fix ---

interface FeatureProps {
  children?: ReactNode;
}

const Feature: React.FC<FeatureProps> = ({ children }) => {
  const location = useLocation();

  // Safe Selectors
  const headerCollapse = useSelector((state: any) => state.themeSetting?.headerCollapse ?? false);
  const mobileSidebar = useSelector((state: any) => state.sidebarSlice?.mobileSidebar ?? false);
  const miniSidebar = useSelector((state: any) => state.sidebarSlice?.miniSidebar ?? false);
  const expandMenu = useSelector((state: any) => state.sidebarSlice?.expandMenu ?? false);

  const dataWidth = useSelector((state: any) => state.themeSetting?.dataWidth ?? "fluid");
  const dataLayout = useSelector((state: any) => state.themeSetting?.dataLayout ?? "default");
  const dataTheme = useSelector((state: any) => state.themeSetting?.dataTheme ?? "light");
  const dataSidebarAll = useSelector((state: any) => state.themeSetting?.dataSidebarAll ?? "");
  const dataColorAll = useSelector((state: any) => state.themeSetting?.dataColorAll ?? "");
  const dataTopBarColorAll = useSelector((state: any) => state.themeSetting?.dataTopBarColorAll ?? "");
  const dataTopbarAll = useSelector((state: any) => state.themeSetting?.dataTopbarAll ?? "");
  const dataLoader = useSelector((state: any) => state.themeSetting?.dataLoader ?? "disable");

  const [showLoader, setShowLoader] = React.useState(true);

  // Theme Apply
  React.useEffect(() => {
    if (dataTheme === "dark_data_theme") {
      document.documentElement.setAttribute("data-theme", "darks");
    } else {
      document.documentElement.setAttribute("data-theme", "");
    }
  }, [dataTheme]);

  // Page Loader
  React.useEffect(() => {
    if (dataLoader === "enable") {
      setShowLoader(true);
      const timeout = setTimeout(() => setShowLoader(false), 1200);
      return () => clearTimeout(timeout);
    } else {
      setShowLoader(false);
    }
  }, [location.pathname, dataLoader]);

  const Preloader = () => (
    <div id="global-loader">
      <div className="page-loader"></div>
    </div>
  );

  return (
    <>
      <style>
        {`
          :root {
            --sidebar--rgb-picr: ${dataSidebarAll};
            --topbar--rgb-picr: ${dataTopbarAll};
            --topbarcolor--rgb-picr: ${dataTopBarColorAll};
            --primary-rgb-picr: ${dataColorAll};
          }
        `}
      </style>

      <div
        className={`
          ${dataLayout === "mini" || dataWidth === "box" ? "mini-sidebar" : ""}
          ${
            ["horizontal", "horizontal-single", "horizontal-overlay", "horizontal-box"].includes(
              dataLayout
            )
              ? "menu-horizontal"
              : ""
          }
          ${miniSidebar && dataLayout !== "mini" ? "mini-sidebar" : ""}
          ${dataWidth === "box" ? "layout-box-mode" : ""}
          ${headerCollapse ? "header-collapse" : ""}
          ${(expandMenu && miniSidebar) || (expandMenu && dataLayout === "mini") ? "expand-menu" : ""}
        `}
      >
        {showLoader && <Preloader />}

        <div className={`main-wrapper ${mobileSidebar ? "slide-nav" : ""}`}>
          <Header />
          <Sidebar />
          <HorizontalSidebar />
          <TwoColumnSidebar />
          <StackedSidebar />

          {/* ⭐ children support + Outlet fallback */}
          {children ? children : <Outlet />}

          <DeleteModal />
          {!location.pathname.includes("layout") && <ThemeSettings />}
        </div>

        <div className="sidebar-overlay"></div>
      </div>
    </>
  );
};

export default Feature;
