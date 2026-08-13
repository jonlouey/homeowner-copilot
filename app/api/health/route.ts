import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    return Response.json(
      { status: "error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
