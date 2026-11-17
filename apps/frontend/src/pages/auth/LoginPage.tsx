import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../../components/ui/Logo";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Iltimos, barcha maydonlarni to‘ldiring");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === "pending") {
        navigate("/pending");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setLocalError(
        err.message ||
          "Kirishda xatolik yuz berdi. Email yoki parol noto‘g‘ri.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex items-center justify-center p-margin">
      <main className="w-full max-w-md">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden rounded-[24px] bg-surface-container-lowest p-8 sm:p-10 shadow-xl transition-all duration-300">
            {/* Ambient Lavender Background Glows */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary-container/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-surface-container-high/80 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Brand Header */}
              <div className="mb-6">
                <Logo size="lg" />
              </div>

              {/* Welcome Heading */}
              <div className="text-center mb-8">
                <h1 className="font-display-md text-display-md text-on-surface mb-2">
                  Xush kelibsiz!
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  TeamFlow hisobingizga kiring va jamoangiz bilan loyihalarni
                  boshqaring
                </p>
              </div>

              {/* Error Message */}
              {localError && (
                <div
                  role="alert"
                  className="w-full mb-4 p-3 rounded-xl bg-error-container text-error text-label-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    error
                  </span>
                  <span>{localError}</span>
                </div>
              )}

              {/* Login Form */}
              <form className="w-full space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-lg text-label-lg text-on-surface"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none transition-colors">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ism@jamoa.uz"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-lg text-body-lg rounded-[14px] pl-11 pr-4 py-3 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#6945ff] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-lg text-label-lg text-on-surface"
                    htmlFor="password"
                  >
                    Parol
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none transition-colors">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-lg text-body-lg rounded-[14px] pl-11 pr-11 py-3 outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#6945ff] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Parolni ko'rsatish"
                      className="absolute right-3.5 flex items-center justify-center text-outline hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1 pb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-[6px] bg-surface-container-low peer-checked:bg-primary-container flex items-center justify-center transition-all duration-200 group-hover:bg-surface-container-high">
                      <span className="material-symbols-outlined text-white text-[16px] opacity-0 peer-checked:opacity-100 transition-opacity font-bold">
                        check
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                      Meni eslab qol
                    </span>
                  </label>
                  <span className="font-label-lg text-label-lg text-outline cursor-default">
                    Parolni unutdingizmi?
                  </span>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[14px] bg-primary-container text-on-primary font-headline-md text-headline-md py-3.5 px-4 shadow-[0_8px_20px_-4px_rgba(105,69,255,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(105,69,255,0.5)] hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      refresh
                    </span>
                  ) : (
                    <>
                      <span>Kirish</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Micro Team Collaborative Badge */}
              <div className="mt-6 flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-container-low">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[9px] font-bold ring-2 ring-surface-container-lowest">
                    PM
                  </div>
                  <div className="w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[9px] font-bold ring-2 ring-surface-container-lowest">
                    UI
                  </div>
                  <div className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[9px] font-bold ring-2 ring-surface-container-lowest">
                    FE
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  5-10 kishilik tezkor jamoalar uchun
                </span>
              </div>

              {/* Bottom Registration Link */}
              <div className="mt-6 pt-5 w-full text-center bg-surface-container-low/50 rounded-xl py-3">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Hisobingiz yo‘qmi?
                  <Link
                    to="/register"
                    className="font-label-lg text-label-lg text-primary hover:text-secondary ml-1 transition-colors underline-offset-2 hover:underline"
                  >
                    Ro‘yxatdan o‘tish
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
