import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "../../contexts/AuthContext";

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { error } = useAuth();

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex min-w-0 flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="min-w-0 flex-1 pt-16 bg-surface px-margin py-margin">
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-error-container p-4 text-error"
            >
              {error}
            </p>
          )}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
