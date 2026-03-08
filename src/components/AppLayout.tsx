import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-[250px] transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
}
