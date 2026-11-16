import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const allowedRoles = ["Dosen Pengampu", "Mahasiswa", "Admin Pusat"] as const;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "") as typeof allowedRoles[number];
    if (!name || !email || password.length < 8 || !allowedRoles.includes(role)) return NextResponse.json({ success: false, message: "Lengkapi data. Password minimal 8 karakter." }, { status: 400 });
    if (!email.endsWith("@mail.unpad.ac.id")) return NextResponse.json({ success: false, message: "Gunakan email resmi @mail.unpad.ac.id." }, { status: 400 });
    await db.execute("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)", [name, email, hashPassword(password), role]);
    return NextResponse.json({ success: true, message: "Registrasi berhasil. Silakan login." }, { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "ER_DUP_ENTRY") return NextResponse.json({ success: false, message: "Email sudah terdaftar." }, { status: 409 });
    console.error("Register database error:", error);
    return NextResponse.json({ success: false, message: "Registrasi gagal karena masalah database." }, { status: 500 });
  }
}
