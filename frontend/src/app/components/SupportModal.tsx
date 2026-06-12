import {
  ChevronRight,
  Flame,
  HeartPulse,
  LifeBuoy,
  Phone,
  Shield,
  X,
  Zap,
} from 'lucide-react';

type SupportPanelProps = {
  open: boolean;
  onClose: () => void;
};

const emergencyContacts = [
  {
    title: 'Polisi',
    desc: 'Darurat kepolisian nasional',
    number: '110',
    icon: Shield,
    tone: 'blue',
  },
  {
    title: 'Ambulans',
    desc: 'Layanan darurat medis',
    number: '118',
    icon: HeartPulse,
    tone: 'red',
  },
  {
    title: 'Pemadam Kebakaran',
    desc: 'Dinas pemadam kebakaran',
    number: '113',
    icon: Flame,
    tone: 'orange',
  },
  {
    title: 'SAR Nasional',
    desc: 'Pencarian & penyelamatan',
    number: '115',
    icon: LifeBuoy,
    tone: 'green',
  },
  {
    title: 'BPBD Jakarta',
    desc: 'Badan Penanggulangan Bencana',
    number: '021-3458-5555',
    icon: Shield,
    tone: 'purple',
  },
  {
    title: 'PLN (Listrik)',
    desc: 'Gangguan listrik & kedaruratan',
    number: '123',
    icon: Zap,
    tone: 'yellow',
  },
];

function toneClass(tone: string) {
  const map: Record<string, string> = {
    blue:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300',
    red:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300',
    orange:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300',
    green:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-400/25 dark:bg-green-400/10 dark:text-green-300',
    purple:
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/25 dark:bg-purple-400/10 dark:text-purple-300',
    yellow:
      'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-400/25 dark:bg-yellow-400/10 dark:text-yellow-300',
  };

  return map[tone] ?? map.blue;
}

export function SupportPanel({ open, onClose }: SupportPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/45">
      <div className="support-panel h-full w-full max-w-[430px] overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-main)]">
            <Phone size={18} />
            Kontak Darurat
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-main)]"
            aria-label="Tutup pusat bantuan"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div
            className="rounded-xl px-4 py-3 text-sm font-semibold leading-relaxed"
            style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #ffb4b4',
              color: '#ff6b6b',
            }}
          >
            Gunakan nomor darurat ini hanya pada kondisi yang mengancam jiwa atau keselamatan.
            Hubungi sesuai situasi yang tepat.
          </div>

          {emergencyContacts.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.title}
                href={`tel:${item.number}`}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-transform hover:scale-[1.01] ${toneClass(
                  item.tone,
                )}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-white/40 dark:bg-current/10">
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[var(--text-main)]">
                    {item.title}
                  </p>
                  <p className="text-xs leading-snug text-[var(--text-muted)]">
                    {item.desc}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-sm font-bold sm:text-base">
                  {item.number}
                  <ChevronRight size={16} />
                </div>
              </a>
            );
          })}

          <p className="pt-2 text-center text-xs text-[var(--text-muted)]">
            Ketuk kartu untuk menghubungi langsung.
          </p>
        </div>
      </div>
    </div>
  );
}

export const SupportModal = SupportPanel;