import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-4 md:p-8 w-full h-full text-gray-800">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
