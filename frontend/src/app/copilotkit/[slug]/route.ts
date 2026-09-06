import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { EventType, type BaseEvent } from "@ag-ui/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const mailCopilotAgent = new BuiltInAgent({
  type: "custom",
  factory: async function* ({ input, abortSignal }) {
    const messageId = crypto.randomUUID();

    const lastMessage = input.messages[input.messages.length - 1];
    const userText =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : Array.isArray(lastMessage.content)
          ? lastMessage.content
              .filter((p: { type: string }) => p.type === "text")
              .map((p: { text: string }) => p.text)
              .join("")
          : "";

    if (!userText.trim()) {
      yield {
        type: EventType.TEXT_MESSAGE_CHUNK,
        role: "assistant",
        messageId,
        delta: "Please tell me what you'd like to do with your emails.",
      } as BaseEvent;
      return;
    }

    const contextFromState = input.state
      ? {
          currentView: (input.state.currentView as string) || "INBOX",
          selectedEmail: input.state.selectedEmail || null,
          activeFilters: input.state.activeFilters || {},
        }
      : { currentView: "INBOX", selectedEmail: null, activeFilters: {} };

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: contextFromState,
        }),
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMsg =
          errorBody?.message || `Backend returned ${response.status}`;
        yield {
          type: EventType.TEXT_MESSAGE_CHUNK,
          role: "assistant",
          messageId,
          delta: `I couldn't process that request. ${errorMsg}`,
        } as BaseEvent;
        return;
      }

      const body = await response.json();
      const action = body?.data?.action;

      if (!action || !action.type) {
        yield {
          type: EventType.TEXT_MESSAGE_CHUNK,
          role: "assistant",
          messageId,
          delta: "I received an unexpected response from the AI backend.",
        } as BaseEvent;
        return;
      }

      const toolCallId = crypto.randomUUID();
      const toolName = action.type.toLowerCase();

      yield {
        type: EventType.TOOL_CALL_START,
        parentMessageId: messageId,
        toolCallId,
        toolCallName: toolName,
      } as BaseEvent;

      yield {
        type: EventType.TOOL_CALL_ARGS,
        toolCallId,
        delta: JSON.stringify(action.payload || {}),
      } as BaseEvent;

      yield {
        type: EventType.TOOL_CALL_END,
        toolCallId,
      } as BaseEvent;

      const description = describeAction(action);

      yield {
        type: EventType.TOOL_CALL_RESULT,
        role: "tool",
        messageId: crypto.randomUUID(),
        toolCallId,
        content: JSON.stringify({ success: true, description }),
      } as BaseEvent;

      yield {
        type: EventType.TEXT_MESSAGE_CHUNK,
        role: "assistant",
        messageId,
        delta: description,
      } as BaseEvent;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      yield {
        type: EventType.TEXT_MESSAGE_CHUNK,
        role: "assistant",
        messageId,
        delta: "I couldn't reach the AI backend. Please check if the backend is running.",
      } as BaseEvent;
    }
  },
});

function describeAction(action: { type: string; payload?: Record<string, unknown> }): string {
  const p = action.payload || {};
  switch (action.type) {
    case "NAVIGATE": {
      const view = String(p.view || "inbox").toLowerCase();
      return `Navigated to your ${view} folder.`;
    }
    case "OPEN_COMPOSE":
      return "Compose window opened. Ready for you to write.";
    case "FILL_COMPOSE": {
      const to = p.to ? `to ${p.to}` : "";
      const subject = p.subject ? `, subject: "${p.subject}"` : "";
      return `Compose window opened${to ? " " + to : ""}${subject}. Review and send when ready.`;
    }
    case "FILTER_EMAILS": {
      const parts: string[] = [];
      if (p.unread === true || p.isUnread === true) parts.push("unread");
      if (p.sender) parts.push(`from "${p.sender}"`);
      if (p.keyword) parts.push(`containing "${p.keyword}"`);
      if (p.dateRange) parts.push(`in range: ${String(p.dateRange).replace(/_/g, " ").toLowerCase()}`);
      return parts.length > 0
        ? `Inbox filtered — showing emails ${parts.join(", ")}.`
        : "Inbox filter applied.";
    }
    case "SEARCH_EMAILS": {
      const q = p.query || p.keyword || "";
      return q ? `Searching for "${q}"…` : "Search applied.";
    }
    case "OPEN_EMAIL":
      return "Opening the email for you.";
    case "PREPARE_REPLY":
      return "Compose window opened with reply context. Complete and send when ready.";
    case "UNKNOWN": {
      const reason = p.reason ? String(p.reason) : "";
      return reason || "I wasn't sure what you meant. Could you rephrase?";
    }
    default:
      return "Action executed.";
  }
}

const runtime = new CopilotRuntime({
  agents: { default: mailCopilotAgent },
});

export const GET = createCopilotRuntimeHandler({
  runtime,
  basePath: "/copilotkit",
});

export const POST = createCopilotRuntimeHandler({
  runtime,
  basePath: "/copilotkit",
});
