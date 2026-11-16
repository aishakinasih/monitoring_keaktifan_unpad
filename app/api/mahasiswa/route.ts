import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface Student extends RowDataPacket { id: number; name: string; email: string; }
interface Course extends RowDataPacket { id: number; code: string; name: string; class_name: string; calculation_method: "weighted" | "average"; active_threshold: number; attention_threshold: number; }
interface Criterion extends RowDataPacket { id: number; criterion_key: string; name: string; weight: number; is_active: number; }
interface Score extends RowDataPacket { criterion_key: string; score: number | null; }
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = Number(searchParams.get("student_id"));
    if (!Number.isInteger(studentId) || studentId <= 0) return NextResponse.json({ success: false, message: "ID mahasiswa tidak valid." }, { status: 400 });
    const [studentRows] = await db.execute<Student[]>("SELECT id,name,email FROM users WHERE id=? AND role='Mahasiswa'", [studentId]);
    const student = studentRows[0];
    if (!student) return NextResponse.json({ success: false, message: "Mahasiswa tidak ditemukan." }, { status: 404 });
    const [courses] = await db.execute<Course[]>(`
      SELECT c.id,c.code,c.name,c.class_name,cs.calculation_method calculation_method,
             cs.active_threshold active_threshold,cs.attention_threshold attention_threshold
      FROM enrollments e JOIN courses c ON c.id=e.course_id LEFT JOIN course_settings cs ON cs.course_id=c.id
      WHERE e.student_id=? ORDER BY c.id`, [studentId]);
    const result = [];
    for (const course of courses) {
      const [criteria] = await db.execute<Criterion[]>("SELECT id,criterion_key,name,weight,is_active FROM scoring_criteria WHERE course_id=? ORDER BY sort_order,id", [course.id]);
      const [scores] = await db.execute<Score[]>("SELECT sc.criterion_key,ss.score FROM student_scores ss JOIN scoring_criteria sc ON sc.id=ss.criterion_id WHERE ss.course_id=? AND ss.student_id=?", [course.id,studentId]);
      const scoreMap = Object.fromEntries(scores.map((item) => [item.criterion_key,item.score === null ? null : Number(item.score)]));
      const active = criteria.filter((item) => Number(item.is_active) === 1 && scoreMap[item.criterion_key] !== null && scoreMap[item.criterion_key] !== undefined);
      const totalWeight = active.reduce((sum,item) => sum + Number(item.weight),0);
      const score = !active.length ? 0 : course.calculation_method === "average"
        ? active.reduce((sum,item) => sum + Number(scoreMap[item.criterion_key]),0) / active.length
        : totalWeight > 0 ? active.reduce((sum,item) => sum + Number(scoreMap[item.criterion_key]) * Number(item.weight),0) / totalWeight : 0;
      const status = score >= Number(course.active_threshold) ? "Aktif" : score >= Number(course.attention_threshold) ? "Perlu Perhatian" : "Tidak Aktif";
      result.push({ ...course, criteria: criteria.map((item) => ({ ...item, weight: Number(item.weight), score: scoreMap[item.criterion_key] ?? null })), score: Number(score.toFixed(2)), status });
    }
    return NextResponse.json({ success: true, data: { student, courses: result } });
  } catch (error) {
    console.error("Student dashboard database error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data mahasiswa." }, { status: 500 });
  }
}
