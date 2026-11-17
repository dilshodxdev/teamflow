import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "../ui/Avatar";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-margin">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors"
        aria-label="Menyu"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md ml-auto">
        {/* User Profile */}
        <div className="flex items-center gap-space-sm">
          <Avatar name={user?.fullName || "Foydalanuvchi"} size="md" />
          <div className="hidden sm:flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface">
              {user?.fullName || "Foydalanuvchi"}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {user?.role === "manager"
                ? "Project Manager"
                : user?.role === "member"
                  ? "Jamoa a'zosi"
                  : "Kutilmoqda"}
            </span>
          </div>
        </div>

        {/* Logout CTA */}
        <button
          onClick={handleLogout}
          type="button"
          aria-label="Chiqish"
          className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all font-body-sm text-body-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </div>
    </header>
  );
};
