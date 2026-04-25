import { useEffect, useMemo, useRef } from "react";
import { getRoleLabel } from "../lib/roles";
import { Card } from "./Card";

type ChatMessage = {
  id: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAtUtc: string;
};

type ChatMessageListProps<T extends ChatMessage> = {
  messages: T[];
  currentUserId?: number | null;
  emptyTitle: string;
  emptyDescription: string;
};

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function ChatMessageList<T extends ChatMessage>({
  messages,
  currentUserId,
  emptyTitle,
  emptyDescription,
}: ChatMessageListProps<T>) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime(),
      ),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  if (sortedMessages.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-sm font-semibold text-custom-text">{emptyTitle}</div>
        <div className="mt-1 text-sm text-custom-text-muted">
          {emptyDescription}
        </div>
      </Card>
    );
  }

  return (
    <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-3xl border border-custom-border bg-custom-surface-soft/60 p-4">
      {sortedMessages.map((message) => {
        const isOwnMessage =
          typeof currentUserId === "number" && currentUserId === message.senderUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                isOwnMessage
                  ? "bg-custom-primary text-custom-primary-foreground"
                  : "border border-custom-border bg-custom-surface text-custom-text"
              }`}
            >
              <div
                className={`text-xs ${
                  isOwnMessage
                    ? "text-custom-primary-foreground/80"
                    : "text-custom-text-muted"
                }`}
              >
                {message.senderName} · {getRoleLabel(message.senderRole)}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-sm leading-6">
                {message.message}
              </div>
              <div
                className={`mt-2 text-[11px] ${
                  isOwnMessage
                    ? "text-custom-primary-foreground/80"
                    : "text-custom-text-subtle"
                }`}
              >
                {formatMessageTime(message.createdAtUtc)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
