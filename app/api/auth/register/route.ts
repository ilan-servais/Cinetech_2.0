// filepath: c:\Users\Slash\Documents\Web\Ciné\Cinetech_2.0\app\api\auth\register\route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerHandler } from "@/lib/api-handlers";

// Next.js API route handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await registerHandler(body);
  return NextResponse.json(result.body, { status: result.status });
}
