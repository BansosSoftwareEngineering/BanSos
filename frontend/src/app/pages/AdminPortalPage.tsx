import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Radio,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { BroadcastAlert } from './AdminBroadcastAlert';
import { VerifyReports } from './AdminVerifyReports';
import { AdminOverview, CommunityReport, fetchAdminOverview, fetchReports } from '../services/api';
import { supabase } from '../services/supabaseClient';

const severityColor: Record<string, string> = {
  KRITIS:
    'bg-red-200/40 text-red-500 border border-red-100 dark:bg-[#93000a] dark:text-[#ffdad6] dark:border-[rgba(255,218,214,0.2)]',

  SEDANG:
    'bg-amber-200/40 text-amber-600 border border-amber-100 dark:bg-[#5c3c00] dark:text-[#ffb786] dark:border-[rgba(255,183,134,0.2)]',

  RENDAH:
    'bg-emerald-200/40 text-emerald-600 border border-emerald-100 dark:bg-[#002105] dark:text-[#7dd878] dark:border-[rgba(125,216,120,0.2)]',

  PERINGATAN:
    'bg-amber-200/40 text-amber-600 border border-amber-100 dark:bg-[#5c3c00] dark:text-[#ffb786] dark:border-[rgba(255,183,134,0.2)]',
};

function Overview() {
  const [summary, setSummary] = useState<AdminOverview | null>(null);
  const [recent, setRecent] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResult, reportsResult] = await Promise.all([
        fetchAdminOverview(),
        fetchReports(),
      ]);
      setSummary(overviewResult.data);
      setRecent((reportsResult.data || []).slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil overview dari Supabase. Cek backend dan environment variable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: 'Laporan Pending', value: summary?.pending_reports ?? 0, icon: <Clock size={16} />, color: '#ffb786' },
    { label: 'Terverifikasi', value: summary?.approved_reports ?? 0, icon: <CheckCircle2 size={16} />, color: '#22c55e' },
    { label: 'Ditolak', value: summary?.rejected_reports ?? 0, icon: <AlertTriangle size={16} />, color: '#ef4444' },
    { label: 'Broadcast Alert', value: summary?.broadcast_alerts ?? 0, icon: <Radio size={16} />, color: '#adc6ff' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <div>
          <p className="text-[#e1e2ec] font-semibold">Admin Overview</p>
          <p className="text-[#8c909f] text-sm">Ringkasan data real dari Supabase.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1d2027] border border-[rgba(255,255,255,0.08)] text-[#adc6ff] text-sm hover:bg-[rgba(173,198,255,0.08)]"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-xl p-4 text-[#ffb4ab] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
          <div key={s.label} className="bg-[#1d2027] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#8c909f] text-[10px] uppercase tracking-widest">{s.label}</p>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className="text-[#e1e2ec] text-3xl font-bold" style={{ color: s.color }}>
              {loading ? '...' : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#1d2027] border border-[rgba(255,255,255,0.06)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-[#adc6ff]" />
          <h3 className="text-[#e1e2ec] font-semibold">Laporan Terbaru</h3>
        </div>

        {loading ? (
          <p className="text-[#8c909f] text-sm">Mengambil laporan...</p>
        ) : recent.length === 0 ? (
          <p className="text-[#8c909f] text-sm">Belum ada laporan.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.04)] gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${severityColor[inc.severity] || severityColor.SEDANG}`}>
                    {inc.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#e1e2ec] text-sm font-medium truncate">{inc.title}</p>
                    <p className="text-[#8c909f] text-xs truncate">{inc.location_name || '-'}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(173,198,255,0.1)] text-[#adc6ff] shrink-0">
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1d2027] border border-[rgba(255,183,134,0.18)] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#ffb786] mt-0.5" />
          <div>
            <p className="text-[#e1e2ec] font-semibold">Catatan Data Freshness</p>
            <p className="text-[#8c909f] text-sm mt-1">
              Untuk prediksi banjir, admin tetap perlu cek freshness BMKG dan Posko Banjir. Jika data sensor terlalu lama, confidence prediksi harus diturunkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = 'overview' | 'verify' | 'broadcast';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
  { id: 'verify', label: 'Verify Reports', icon: <ClipboardList size={15} /> },
  { id: 'broadcast', label: 'Broadcast Alert', icon: <Radio size={15} /> },
];

export function AdminPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="min-h-screen text-[#e1e2ec]" style={{ background: 'linear-gradient(160deg, #0b0e15 0%, #10131a 100%)' }}>
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#10131a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(173,198,255,0.12)] border border-[rgba(173,198,255,0.2)] flex items-center justify-center">
            <Shield size={15} className="text-[#adc6ff]" />
          </div>
          <div>
            <p className="text-[#e1e2ec] text-sm font-bold leading-tight">Admin Portal</p>
            <p className="text-[#8c909f] text-[10px]">BanSos Control Center</p>
          </div>
        </div>
        <button
          onClick={async () => {
            sessionStorage.removeItem('admin_auth');
            const prevSessionStr = sessionStorage.getItem('prev_user_session');
            if (prevSessionStr) {
              sessionStorage.removeItem('prev_user_session');
              try {
                const { access_token, refresh_token } = JSON.parse(prevSessionStr) as { access_token: string; refresh_token: string };
                await supabase.auth.setSession({ access_token, refresh_token });
              } catch { /* session expired, fall through to login */ }
            }
            window.dispatchEvent(new Event('bansos-profile-updated'));
            navigate('/dashboard');
          }}
          className="flex items-center gap-1.5 text-[#8c909f] hover:text-[#e1e2ec] text-xs transition-colors"
        >
          <LogOut size={13} /> Keluar
        </button>
      </header>

      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#10131a] px-4 lg:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-[#adc6ff] text-[#adc6ff]'
                  : 'border-transparent text-[#8c909f] hover:text-[#e1e2ec]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 lg:p-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'verify' && <VerifyReports />}
        {activeTab === 'broadcast' && <BroadcastAlert />}
      </main>
    </div>
  );
}
