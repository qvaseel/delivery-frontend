import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({
  label,
  error,
  className,
  type,
  ...props
}: Props) {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      {label ? (
        <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
          {label}
        </div>
      ) : null}

      <div className="relative">
        <input
          className={cn(
            "w-full rounded-2xl border bg-custom-surface px-4 py-2.5 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle",
            isPasswordField && "pr-12",
            error
              ? "border-custom-danger focus-visible:ring-2 focus-visible:ring-custom-danger/25"
              : "border-custom-border focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25",
            className,
          )}
          type={isPasswordField && showPassword ? "text" : type}
          {...props}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-custom-text-subtle transition-colors hover:text-custom-text"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-1.5 text-xs font-medium text-custom-danger">
          {error}
        </div>
      ) : null}
    </label>
  );
}
