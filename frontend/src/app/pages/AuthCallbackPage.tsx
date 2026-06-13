import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    const getDestination = async (): Promise<string> => {
      const { data } = await supabase.auth.getUser();
      const complete = data.user?.user_metadata?.onboarding_complete;
      return complete ? '/dashboard' : '/onboarding';
    };

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
        if (error) {
          setStatus('error');
          setErrorMessage('Link verifikasi tidak valid atau sudah kadaluarsa. Silakan minta link baru.');
        } else {
          setStatus('success');
          const dest = await getDestination();
          setTimeout(() => navigate(dest, { replace: true }), 1500);
        }
      });
    } else {
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session) {
          setStatus('success');
          const dest = await getDestination();
          setTimeout(() => navigate(dest, { replace: true }), 1500);
        } else {
          setStatus('error');
          setErrorMessage('Verifikasi gagal. Link tidak valid atau sudah kadaluarsa.');
        }
      });
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#f6f9ff]">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(191,219,254,0.55),transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_45%,#ffffff_100%)]" />
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />
        <div className="absolute right-[-140px] top-24 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] rounded-[32px] p-8 text-center border border-white/70 bg-white/65 shadow-[0_24px_80px_rgba(37,99,235,0.16)] backdrop-blur-2xl">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-5">
              <Loader2 className="text-blue-500 animate-spin" size={48} />
            </div>
            <h1 className="text-slate-900 text-xl font-bold mb-2">Memverifikasi akun...</h1>
            <p className="text-slate-500 text-sm">Mohon tunggu sebentar.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-100 border border-green-300/50 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={36} />
              </div>
            </div>
            <h1 className="text-slate-900 text-xl font-bold mb-2">Email Terverifikasi!</h1>
            <p className="text-slate-500 text-sm">Akun Anda berhasil diverifikasi. Mengalihkan ke dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300/50 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={36} />
              </div>
            </div>
            <h1 className="text-slate-900 text-xl font-bold mb-2">Verifikasi Gagal</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors mb-3"
            >
              Daftar ulang
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl border border-blue-100 bg-white/70 hover:bg-white text-slate-700 text-sm font-semibold transition-colors"
            >
              Kembali ke login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
