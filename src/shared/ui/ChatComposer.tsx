import { useState } from "react";
import { Button } from "./Button";

type ChatComposerProps = {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Введите сообщение...",
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    await onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        className="w-full resize-none rounded-3xl border border-custom-border bg-custom-surface px-4 py-3 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || message.trim().length === 0}>
          Отправить
        </Button>
      </div>
    </form>
  );
}
