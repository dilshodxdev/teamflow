import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../../components/ui/Logo";

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError("Iltimos, barcha maydonlarni to‘ldiring");
      return;
    }

    if (password.length < 8) {
      setLocalError("Parol kamida 8 ta belgidan iborat bo‘lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Parollar bir-biriga mos kelmadi");
      return;
    }

    if (!termsAgreed) {
      setLocalError("Foydalanish shartlariga rozilik bildirish talab qilinadi");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        fullName,
        email,
        password,
      });

      if (user.role === "pending") {
        navigate("/pending");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setLocalError(err.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex items-center justify-center p-margin">
      <main className="w-full max-w-md">
        <div className="flex flex-col w-full items-center justify-center py-6 px-4">
          <div className="relative w-full max-w-[440px]">
            {/* Subtle ambient decorative glow spheres */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-fixed blur-3xl opacity-60 pointer-events-none rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-surface-dim blur-2xl opacity-50 pointer-events-none rounded-full" />

            {/* Centered Card Surface */}
            <div className="relative bg-surface-container-lowest rounded-[24px] shadow-xl p-8 sm:p-9 transition-all">
              {/* Brand Header */}
              <div className="flex flex-col items-center text-center mb-7">
                <div className="mb-5">
                  <Logo size="lg" />
                </div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2 tracking-tight">
                  Yangi hisob yaratish
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] leading-relaxed">
                  Jamoangiz uchun TeamFlow boshqaruv panelini sozlang
                </p>
              </div>

              {/* Error Alert */}
              {localError && (
                <div className="w-full mb-4 p-3 rounded-xl bg-error-container text-error text-label-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    error
                  </span>
                  <span>{localError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fullName"
                    className="font-label-md text-label-md text-on-surface font-semibold tracking-wide"
                  >
                    Ism va familiya
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      person
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masalan: Zilola Rahimova"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md pl-11 pr-4 py-3 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="font-label-md text-label-md text-on-surface font-semibold tracking-wide"
                  >
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ism@jamoa.uz"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md pl-11 pr-4 py-3 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="font-label-md text-label-md text-on-surface font-semibold tracking-wide"
                  >
                    Parol
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md pl-11 pr-11 py-3 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Parolni ko'rsatish"
                      className="absolute right-3 text-outline hover:text-on-surface flex items-center p-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="font-label-md text-label-md text-on-surface font-semibold tracking-wide"
                  >
                    Parolni tasdiqlash
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      verified_user
                    </span>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md pl-11 pr-11 py-3 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label="Tasdiqlash parolini ko'rsatish"
                      className="absolute right-3 text-outline hover:text-on-surface flex items-center p-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        {showConfirmPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-1 pb-1">
                  <label className="group flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 mt-0.5 rounded-lg bg-surface-container-low peer-checked:bg-primary flex items-center justify-center transition-colors shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-on-primary text-[15px] scale-0 peer-checked:scale-100 transition-transform font-bold">
                        check
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface leading-tight transition-colors">
                      Men{" "}
                      <span className="text-primary font-semibold hover:underline">
                        Foydalanish shartlariga
                      </span>{" "}
                      roziman
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-5 bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-label-lg text-label-lg font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      refresh
                    </span>
                  ) : (
                    <>
                      <span>Ro‘yxatdan o‘tish</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Nav to Login */}
              <div className="mt-7 pt-5 text-center bg-surface-container-low/60 rounded-xl py-3 px-4">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Allaqachon hisobingiz bormi?
                  <Link
                    to="/login"
                    className="font-semibold text-primary hover:text-primary-container ml-1.5 transition-colors underline-offset-2 hover:underline"
                  >
                    Kirish
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
