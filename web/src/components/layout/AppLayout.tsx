import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";
import { Header } from "./Header";

const SIDEBAR_STORAGE_KEY = "controle-sst-sidebar";

function readSidebarCollapsed(): boolean {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMobileOpen((current) => !current);
      return;
    }

    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div className="min-h-screen lg:grid lg:transition-[grid-template-columns] lg:duration-200" style={{ gridTemplateColumns: collapsed ? "0 minmax(0,1fr)" : "260px minmax(0,1fr)" }}>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        onNavigate={() => setMobileOpen(false)}
        className={`fixed inset-y-0 left-0 z-40 w-[260px] -translate-x-full transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 lg:transition-[width,opacity,padding] ${
          mobileOpen ? "translate-x-0" : ""
        } ${collapsed ? "lg:w-0 lg:overflow-hidden lg:p-0 lg:opacity-0" : ""}`}
      />

      <main className="min-w-0 p-6 max-[760px]:p-4">
        <Header onToggleSidebar={toggleSidebar} />
        <Outlet />
      </main>
    </div>
  );
}
