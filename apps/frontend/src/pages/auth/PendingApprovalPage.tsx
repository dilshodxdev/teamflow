import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../../components/ui/Logo";

export const PendingApprovalPage: React.FC = () => {
  const { user, logout, refreshUser, error } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      /* AuthContext retains the account and exposes the error below. */
    }
  };

  const handleCheckStatus = async () => {
    await refreshUser();
    if (user && user.role !== "pending") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex items-center justify-center p-margin">
      <main className="w-full max-w-md">
        <div className="relative bg-surface-container-lowest rounded-[24px] shadow-xl p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="mb-6">
            <Logo size="lg" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
            <span className="material-symbols-outlined text-[36px]">
              hourglass_empty
            </span>
          </div>

          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3">
            Tasdiqlash kutilmoqda
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            Hisobingiz yaratildi. Jamoa rahbari sizga ruxsat berishini kuting.
          </p>

          <div className="w-full p-4 rounded-xl bg-surface-container-low mb-6 text-left flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Foydalanuvchi:
            </span>
            <span className="font-headline-md text-headline-md text-on-surface font-semibold">
              {user?.fullName}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {user?.email}
            </span>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-label-sm text-label-sm w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Holat: Kutilmoqda (pending)
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-error-container p-3 text-error"
            >
              {error}
            </p>
          )}
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={handleCheckStatus}
              className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary font-headline-md text-headline-md shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              <span>Holatni tekshirish</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
