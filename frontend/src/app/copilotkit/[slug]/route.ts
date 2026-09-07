import { NextRequest } from "next/server";
import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

/**
 * CopilotKit runtime endpoint for Next.js App Router.
 *
 * Provides the server-side context that CopilotKit's client protocol needs
 * for `useFrontendTool` and agentic tool registration. The actual AI
 * processing (Gemini) is handled by the Spring Boot backend through
 * AICopilotContext — this runtime only serves the CopilotKit client handshake.
 */
const runtime = new CopilotRuntime();

const endpoint = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  endpoint: "/copilotkit/api",
});

export async function POST(request: NextRequest) {
  return endpoint.handleRequest(request);
}

export async function GET() {
  return Response.json({ status: "ok" });
}
