import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

interface UserRow extends RowDataPacket {
  id: number; name: string; email: string; password_hash: string;
  role: "Dosen Pengampu" | "Mahasiswa" | "Admin Pusat"; fakultas: string | null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ success: false, message: "Email dan password wajib diisi." }, { status: 400 });
    if (!email.endsWith("@mail.unpad.ac.id")) return NextResponse.json({ success: false, message: "Gunakan email resmi berdomain @mail.unpad.ac.id!" }, { status: 400 });

    const [rows] = await db.execute<UserRow[]>("SELECT id,name,email,password_hash,role,fakultas FROM users WHERE LOWER(email)=? LIMIT 1", [email]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) return NextResponse.json({ success: false, message: "Email atau password salah." }, { status: 401 });
    return NextResponse.json({ success: true, message: "Login berhasil!", user: { id: user.id, name: user.name, email: user.email, role: user.role, fakultas: user.fakultas } });
  } catch (error) {
    console.error("Login database error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server database." }, { status: 500 });
  }
}
