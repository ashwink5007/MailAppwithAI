import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "CopilotKit runtime is not configured. Use the AI Copilot panel instead." },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "CopilotKit runtime is not configured. Use the AI Copilot panel instead." },
    { status: 501 }
  );
}
