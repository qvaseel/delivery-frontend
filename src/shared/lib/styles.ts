import type { ClassNamesConfig, GroupBase } from "react-select";
import { cn } from "./cn";

export type SelectOption = {
  label: string;
  value: string | number;
  [key: string]: unknown;
};

export const classNamesSelect: ClassNamesConfig<
  SelectOption,
  false,
  GroupBase<SelectOption>
> = {
  control: (state) =>
    cn(
      "w-full rounded-2xl border bg-custom-surface px-4 py-2.5 text-sm text-custom-text outline-none border-custom-border",
      state.isFocused &&
        "border-custom-border-strong ring-2 ring-custom-ring/25",
    ),
  placeholder: () => "text-custom-text-subtle",
  menu: () =>
    "p-1 z-30 overflow-hidden rounded-[18px] border-custom-border bg-custom-surface-elevated shadow-md",
  option: (state) =>
    cn(
      "rounded-xl px-3 py-2.5 text-custom-text cursor-pointer transition-all bg-transparent active:bg-custom-primary active:text-custom-primary-foreground",
      state.isFocused && "bg-custom-surface-soft",
      state.isSelected && "bg-custom-primary text-custom-primary-foreground",
    ),
};
