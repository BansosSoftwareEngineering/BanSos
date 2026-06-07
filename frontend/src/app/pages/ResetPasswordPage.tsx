import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

type PageState = 'loading' | 'form' | 'success' | 'invalid';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setPageState('form');
      }
    });

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setPageState('form');
      }
    };

    checkSession();

    const timer = setTimeout(() => {
      setPageState((prev) => (prev === 'loading' ? 'invalid' : prev));
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password wajib diisi.';
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (password && confirmPassword !== password) {
      newErrors.confirmPassword = 'Password tidak cocok.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setPageState('success');
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f6f9ff] px-4 py-6 sm:px-6 lg:px-10">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.55),transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_45%,#ffffff_100%)]" />

        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute right-[-140px] top-24 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-[-160px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-24 right-1/4 h-48 w-48 rounded-full bg-blue-100/80 blur-2xl sm:h-56 sm:w-56" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="relative rounded-[26px] border border-white/70 bg-white/65 p-5 shadow-[0_24px_80px_rgba(37,99,235,0.16)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8 lg:p-10">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <svg width="28" height="26" viewBox="0 0 31.5 30" fill="none" className="shrink-0">
                <path
                  d="M15.75 0L31.5 8.57143V21.4286L15.75 30L0 21.4286V8.57143L15.75 0Z"
                  fill="#2563eb"
                  opacity="0.95"
                />
              </svg>
              <span className="font-black text-white tracking-[1.6px] uppercase text-[28px]">
                BANSOS
              </span>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              {pageState === 'success' ? 'Selesai' : 'Keamanan akun'}
            </p>

            <h2 className="text-slate-900 text-2xl font-bold tracking-tight text-center">
              {pageState === 'success' ? 'Password Berhasil Diubah' : 'Buat Password Baru'}
            </h2>
          </div>

          {pageState === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Memverifikasi link reset password...</p>
            </div>
          )}

          {pageState === 'invalid' && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>

              <div>
                <p className="text-slate-900 font-semibold mb-1">Link Tidak Valid</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Link reset password sudah kadaluarsa atau tidak valid. Silakan minta link baru.
                </p>
              </div>

              <div className="pt-2 w-full">
                <button
                  onClick={() => navigate('/')}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  KEMBALI KE LOGIN
                </button>
              </div>
            </div>
          )}

          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white sm:text-base">
                  Password Baru
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Minimal 8 karakter"
                  className={`w-full rounded-xl bg-white/85 px-4 py-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 sm:py-4 sm:text-base ${
                    errors.password
                      ? 'border-2 border-red-300 focus:ring-4 focus:ring-red-100'
                      : 'border border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                  }`}
                />

                {errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 sm:text-sm">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.password}
                  </p>
                )}

                {password && !errors.password && (
                  <div className="flex gap-1 mt-1 items-center">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 3
                            ? password.length < 8
                              ? 'bg-orange-400'
                              : 'bg-green-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">
                      {password.length < 8 ? 'Lemah' : password.length < 12 ? 'Cukup' : 'Kuat'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white sm:text-base">
                  Konfirmasi Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Ulangi password baru"
                  className={`w-full rounded-xl bg-white/85 px-4 py-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 sm:py-4 sm:text-base ${
                    errors.confirmPassword
                      ? 'border-2 border-red-300 focus:ring-4 focus:ring-red-100'
                      : confirmPassword && confirmPassword === password
                        ? 'border-2 border-green-400 focus:ring-4 focus:ring-green-100'
                        : 'border border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                  }`}
                />

                {errors.confirmPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 sm:text-sm">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}

                {!errors.confirmPassword && confirmPassword && confirmPassword === password && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                      <path
                        d="M2 6l2.5 3L10 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Password cocok
                  </p>
                )}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="text-xs leading-relaxed text-red-600 sm:text-sm">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:py-4"
              >
                {isLoading ? 'Menyimpan...' : 'SIMPAN PASSWORD BARU'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

          {pageState === 'success' && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Password Anda telah berhasil diperbarui. Silakan masuk dengan password baru.
                </p>
              </div>

              <div className="pt-2 w-full">
                <button
                  onClick={() => navigate('/')}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  MASUK SEKARANG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
