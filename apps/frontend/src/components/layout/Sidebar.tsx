import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "grid_view" },
  { to: "/projects", label: "Loyihalar", icon: "folder" },
  { to: "/tasks", label: "Vazifalar", icon: "check_box" },
  { to: "/calendar", label: "Kalendar", icon: "calendar_today" },
  { to: "/team", label: "Jamoa", icon: "group" },
  { to: "/risks", label: "Risklar", icon: "warning" },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const userInitial = user?.role === "manager" ? "PM" : "TM";
  const roleTitle =
    user?.role === "manager" ? "Project Manager" : "Jamoa a'zosi";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] z-50 flex flex-col justify-between p-space-md transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-space-lg">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-space-sm py-space-xs">
            <Logo size="md" />
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-space-xs">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all ${
                    isActive
                      ? "bg-surface-container text-primary font-headline-md shadow-sm"
                      : "font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Profile */}
        <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-sm overflow-hidden">
            <Avatar name={user?.fullName || userInitial} size="md" />
            <div className="flex flex-col min-w-0">
              <span className="font-label-lg text-label-lg text-on-surface truncate">
                {user?.fullName || "Foydalanuvchi"}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {roleTitle}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
            unfold_more
          </span>
        </div>
      </aside>
    </>
  );
};
