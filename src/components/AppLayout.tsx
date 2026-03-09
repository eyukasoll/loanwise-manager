import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AISupportChat from "./AISupportChat";
import { Menu, X } from "lucide-react";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Main content */}
      <div className="lg:ml-[250px] transition-all duration-300 pt-14 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}
