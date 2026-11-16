import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface SummaryRow extends RowDataPacket { total_users: number; total_mahasiswa: number; total_dosen: number; total_admin: number; }
interface ThresholdRow extends RowDataPacket { active_threshold: number; attention_threshold: number; }
export async function GET() {
  try {
    const [rows] = await db.execute<SummaryRow[]>(`SELECT COUNT(*) AS total_users, SUM(role='Mahasiswa') AS total_mahasiswa, SUM(role='Dosen Pengampu') AS total_dosen, SUM(role='Admin Pusat') AS total_admin FROM users`);
    const [thresholds] = await db.execute<ThresholdRow[]>("SELECT active_threshold,attention_threshold FROM course_settings ORDER BY course_id");
    return NextResponse.json({ success: true, data: { ...rows[0], active_threshold: thresholds.length ? Number(thresholds[0].active_threshold) : null, attention_threshold: thresholds.length ? Number(thresholds[0].attention_threshold) : null } });
  } catch (error) {
    console.error("Gagal memuat ringkasan admin:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil ringkasan database." }, { status: 500 });
  }
}
