import { Minus, Plus } from "lucide-react";
import { Button } from "./Button";

type Props = {
  value: number;
  onDec: (e: React.MouseEvent) => void;
  onInc: (e: React.MouseEvent) => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
};

export function InlineQty({
  value,
  onDec,
  onInc,
  decDisabled,
  incDisabled,
}: Props) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-custom-border bg-custom-surface-soft p-1">
      <Button
        variant="ghost"
        className="h-9 w-9 rounded-xl px-0"
        onClick={onDec}
        disabled={decDisabled}
        type="button"
      >
        <Minus size={16} />
      </Button>

      <div className="min-w-10 select-none text-center text-sm font-semibold text-custom-text">
        {value}
      </div>

      <Button
        variant="ghost"
        className="h-9 w-9 rounded-xl px-0"
        onClick={onInc}
        disabled={incDisabled}
        type="button"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}