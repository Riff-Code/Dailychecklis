import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_OPTIONS = [
  { key: 'ok', label: '✅ OK', short: 'OK' },
  { key: 'not_checked', label: '⭕ Tidak dicek', short: 'Tidak dicek' },
  { key: 'issue', label: '⚠ Gangguan', short: 'Gangguan' }
];

const DAILY_ITEMS = [
  'Login Windows',
  'Network Monitoring Manage engine',
  'VPN Globalprotect',
  'Connection IP Printer',
  'Share Folder',
  'Kapasitas Penyimpanan',
  'Jaringan Wifi IFG, IFG-VIP, VIP dan Guest',
  'Jaringan Telpon PABX dan CUCM',
  'Jaringan Internet',
  'Email bahana In & Out',
  'Device Printer, fingerprint, cctv'
];

const APP_ITEMS = [
  'analytics.ifg.id (public, vpn dan internal)',
  'belajar.ifg.id (public, vpn dan internal)',
  'connect.ifg.id (vpn dan internal)',
  'i-erm.ifg.id (public, vpn dan internal)',
  'i-litigation.ifg.id (vpn dan internal)',
  'i-regulation.ifg.id (public, vpn dan internal)',
  'datahub.ifg.id (public, vpn dan internal)',
  'http://hrms.bahana.co.id (vpn dan internal)',
  'ifg.id (public, vpn dan internal)',
  'kip.ifg.id (public ,vpn dan internal)',
  'ifgprogress.id (public dan internal)',
  'ebs.ifg.id (internal, vpn)',
  'iflow.ifg.id (public, vpn, dan internal)',
  'st-psak74.ifg.id:8343/SASLogon/login (vpn dan internal)',
  'iproc.ifg.id/ (public, vpn, internal)',
  'sip-pmn.ifg.id (internal dan vpn)',
  '10.0.0.252 (DB Sharing)(internal dan vpn)',
  'i-compliance.ifg.id (internal dan vpn)',
  '10.0.0.214/teammate (internal dan vpn)',
  'https://dcm.ifg.id/ui-fo/dashboard/login (internal vpn)',
  'https://developer.ifg.id/manager/ (internal dan vpn)',
  'https://i-riskdatauat.ifg.id/login.html (internal dan vpn)',
  'https://talentdemand.ifg.id/login (internal dan vpn)',
  'https://datahub.ifg.id/login (internal dan vpn)',
  'https://simovent.bahana.co.id/login (internal, vpn dan public)',
  'https://ams.ifg.id/ (internal vpn dan public)',
  'https://oneverse-hub-uat.ifg.id/login-page (internal dan vpn)'
];

const buildInitialItems = () => [
  ...DAILY_ITEMS.map((name, index) => ({
    id: `daily-${index}`,
    category: 'daily',
    name,
    status: 'ok',
    note: ''
  })),
  ...APP_ITEMS.map((name, index) => ({
    id: `app-${index}`,
    category: 'app',
    name,
    status: 'ok',
    note: ''
  }))
];

function App() {
  const now = new Date();
  const [checkDate, setCheckDate] = useState(now.toISOString().slice(0, 10));
  const [checkTime, setCheckTime] = useState(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const [checkedBy, setCheckedBy] = useState('Muhammad Arif Ramadhan');
  const [items, setItems] = useState(buildInitialItems);

  const formattedDay = useMemo(() => {
    if (!checkDate) return '-';
    const date = new Date(`${checkDate}T00:00:00`);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }, [checkDate]);

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleStatusChange = (id, status) => {
    updateItem(id, { status, note: status === 'ok' ? '' : undefined });
  };

  const validateBeforeExport = () => {
    const invalidItems = items.filter(
      (item) => item.status !== 'ok' && (!item.note || !item.note.trim())
    );

    if (invalidItems.length > 0) {
      alert(`Catatan wajib diisi untuk item non-OK.\nContoh: ${invalidItems[0].name}`);
      return false;
    }

    return true;
  };

  const exportToPDF = () => {
    if (!validateBeforeExport()) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Daily Checklist - Local Support', 14, 16);

    doc.setFontSize(11);
    doc.text(`Pengecekan pagi jam ${checkTime} WIB tanggal ${formattedDay}`, 14, 24);
    doc.text(`Pengecekan dilakukan oleh: ${checkedBy || '-'}`, 14, 30);

    const body = items.map((item, index) => {
      const status = STATUS_OPTIONS.find((opt) => opt.key === item.status)?.short || '-';
      return [index + 1, item.category === 'daily' ? 'Daily Checklist' : 'Aplikasi IFG', item.name, status, item.note || '-'];
    });

    autoTable(doc, {
      startY: 36,
      head: [['No', 'Kategori', 'Item', 'Status', 'Catatan']],
      body,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 26 },
        2: { cellWidth: 70 },
        3: { cellWidth: 26 }
      }
    });

    const safeDate = checkDate || 'tanggal';
    doc.save(`daily-checklist-${safeDate}.pdf`);
  };

  return (
    <main className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Daily Checklist - Local Support</h1>
          <p className="mt-2 text-sm text-slate-600">Pengecekan pagi jam {checkTime || '--:--'} WIB tanggal {formattedDay}</p>
          <GeneralInfoForm
            checkDate={checkDate}
            checkTime={checkTime}
            checkedBy={checkedBy}
            onDateChange={setCheckDate}
            onTimeChange={setCheckTime}
            onCheckedByChange={setCheckedBy}
          />
        </section>

        <ChecklistList
          title="Dashboard / Daily Checklist"
          items={items.filter((item) => item.category === 'daily')}
          onStatusChange={handleStatusChange}
          onNoteChange={(id, note) => updateItem(id, { note })}
        />

        <ChecklistList
          title="Aplikasi IFG"
          items={items.filter((item) => item.category === 'app')}
          onStatusChange={handleStatusChange}
          onNoteChange={(id, note) => updateItem(id, { note })}
        />

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Legenda</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>✅ OK – Aplikasi / item berjalan normal</li>
            <li>⭕ Tidak dicek – Item tidak bisa dicek (harus isi catatan alasan)</li>
            <li>⚠ Gangguan – Item bermasalah / tidak berjalan normal (harus isi catatan gangguan)</li>
          </ul>
        </section>

        <ExportPdfButton onExport={exportToPDF} />
      </div>
    </main>
  );
}

function GeneralInfoForm({ checkDate, checkTime, checkedBy, onDateChange, onTimeChange, onCheckedByChange }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col text-sm font-medium text-slate-700">
        Tanggal
        <input
          type="date"
          value={checkDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none ring-slate-300 focus:ring"
        />
      </label>

      <label className="flex flex-col text-sm font-medium text-slate-700">
        Jam
        <input
          type="time"
          value={checkTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none ring-slate-300 focus:ring"
        />
      </label>

      <label className="flex flex-col text-sm font-medium text-slate-700">
        Zona Waktu
        <input
          value="WIB"
          disabled
          className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
        />
      </label>

      <label className="sm:col-span-2 lg:col-span-1 flex flex-col text-sm font-medium text-slate-700">
        Pengecekan dilakukan oleh
        <input
          type="text"
          value={checkedBy}
          onChange={(e) => onCheckedByChange(e.target.value)}
          className="mt-1 rounded-xl border border-slate-200 px-3 py-2 outline-none ring-slate-300 focus:ring"
        />
      </label>
    </div>
  );
}

function ChecklistList({ title, items, onStatusChange, onNoteChange }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onStatusChange={onStatusChange}
            onNoteChange={onNoteChange}
          />
        ))}
      </div>
    </section>
  );
}

function ChecklistItemRow({ item, onStatusChange, onNoteChange }) {
  const showNote = item.status === 'not_checked' || item.status === 'issue';
  const placeholder = item.status === 'not_checked'
    ? 'Tuliskan alasan kenapa tidak dicek...'
    : 'Tuliskan detail gangguan...';

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-800">{item.name}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = item.status === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onStatusChange(item.id, option.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-slate-700 bg-slate-700 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {showNote && (
        <textarea
          value={item.note || ''}
          onChange={(e) => onNoteChange(item.id, e.target.value)}
          placeholder={placeholder}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring"
          rows={2}
          required
        />
      )}
    </article>
  );
}

function ExportPdfButton({ onExport }) {
  return (
    <button
      type="button"
      onClick={onExport}
      className="sticky bottom-4 rounded-2xl bg-slate-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-900"
    >
      Export ke PDF
    </button>
  );
}

export default App;
