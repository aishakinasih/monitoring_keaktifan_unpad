"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type CourseData = { id: number; code: string; name: string; class_name: string; score: number; status: string; active_threshold: number; attention_threshold: number; criteria: Array<{ id: number; criterion_key: string; name: string; weight: number; is_active: number; score: number | null }> };
type Payload = { student: { id: number; name: string; email: string }; courses: CourseData[] };

function DashboardMahasiswaContent() {
  const params = useSearchParams();
  const studentId = params.get("id") || "";
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!studentId) { setError("Identitas mahasiswa tidak ditemukan. Silakan login kembali."); setLoading(false); return; }
    fetch(`/api/mahasiswa?student_id=${encodeURIComponent(studentId)}`, { cache: "no-store" })
      .then(async (response) => { const payload = await response.json(); if (!response.ok || !payload.success) throw new Error(payload.message || "Gagal memuat data."); setData(payload.data); })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal mengambil data mahasiswa."))
      .finally(() => setLoading(false));
  }, [studentId]);
  const courses = data?.courses || [];
  const averageScore = courses.length ? courses.reduce((sum, course) => sum + course.score, 0) / courses.length : 0;
  const averageAttendance = useMemo(() => {
    const values = courses.map((course) => course.criteria.find((criterion) => criterion.criterion_key === "presensi")?.score).filter((value): value is number => value !== null && value !== undefined);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }, [courses]);
  const hasAttention = courses.some((course) => course.status !== "Aktif");
  const activeThreshold = courses.length ? Number(courses[0].active_threshold) : null;
  const attentionThreshold = courses.length ? Number(courses[0].attention_threshold) : null;
  const status = courses.length === 0 ? "Belum ada kelas" : averageScore >= Number(activeThreshold) ? "Aktif" : averageScore >= Number(attentionThreshold) ? "Perlu Perhatian" : "Tidak Aktif";

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-stone-900">
      <header className="border-b border-stone-200 bg-white px-5 py-3 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-3"><img src="/logo-unpad.jpg" alt="Logo Unpad" className="h-11 w-11 rounded-lg object-contain" /><div><p className="text-sm font-extrabold tracking-wide">PORTAL MAHASISWA</p><p className="text-xs text-stone-500">Monitoring Keaktifan Belajar</p></div></div><div className="text-right"><p className="text-sm font-bold">{data?.student.name || "Mahasiswa"}</p><a href="/login" className="text-xs font-semibold text-orange-700 hover:underline">Keluar</a></div></div></header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Monitoring Keaktifan</p><h1 className="mt-1 text-2xl font-extrabold">Ringkasan Keaktifan Saya</h1><p className="mt-1 text-sm text-stone-600">Pantau nilai dan keaktifan pada mata kuliah yang terdaftar di database.</p>
        {loading && <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">Memuat data mahasiswa…</section>}
        {error && <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>}
        {!loading && !error && <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3"><section className="rounded-2xl bg-stone-900 p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-stone-300">Skor Keaktifan</p><p className="mt-2 text-4xl font-extrabold">{averageScore.toFixed(2)}%</p><p className="mt-2 text-sm text-stone-300">{status}</p></section><section className="rounded-2xl border border-stone-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Kehadiran rata-rata</p><p className="mt-2 text-4xl font-extrabold text-emerald-700">{averageAttendance.toFixed(2)}%</p><p className="mt-2 text-sm text-stone-500">Berdasarkan kriteria Presensi aktif</p></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Peringatan dini</p><p className="mt-2 text-lg font-extrabold">{hasAttention ? "Perlu perhatian" : "Tidak ada peringatan"}</p><p className="mt-2 text-sm text-amber-900">{hasAttention ? "Periksa kriteria dengan nilai rendah pada mata kuliah Anda." : "Status keaktifan seluruh mata kuliah yang terdaftar dalam kategori Aktif."}</p></section></div>
          <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-100 px-6 py-4"><h2 className="font-bold">Keaktifan per Mata Kuliah</h2><p className="mt-1 text-xs text-stone-500">Nilai dan kriteria ditampilkan sesuai data database.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr><th className="p-4">Mata kuliah</th>{(courses[0]?.criteria || []).filter((criterion) => Number(criterion.is_active) === 1).map((criterion) => <th key={criterion.id} className="p-4">{criterion.name}</th>)}<th className="p-4">Skor</th><th className="p-4">Status</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-t border-stone-100"><td className="p-4 font-semibold">{course.name}<span className="block text-xs font-normal text-stone-500">{course.code} · {course.class_name}</span></td>{course.criteria.filter((criterion) => Number(criterion.is_active) === 1).map((criterion) => <td key={criterion.id} className="p-4">{criterion.score === null ? "—" : `${Number(criterion.score).toFixed(1)}%`}</td>)}<td className="p-4 font-bold">{course.score.toFixed(2)}%</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${course.status === "Aktif" ? "bg-emerald-100 text-emerald-800" : course.status === "Perlu Perhatian" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{course.status}</span></td></tr>)}</tbody></table>{courses.length === 0 && <p className="p-6 text-sm text-stone-500">Belum ada mata kuliah yang terdaftar.</p>}</div></section>
          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Riwayat Presensi Terakhir</h2><p className="mt-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-500">Belum ada catatan presensi per pertemuan pada database. Nilai Presensi yang tersedia saat ini merupakan nilai awal dari dataset Excel.</p></section>
        </>}
      </div>
    </main>
  );
}

export default function DashboardMahasiswa() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Memuat dashboard…</div>}><DashboardMahasiswaContent /></Suspense>;
}
