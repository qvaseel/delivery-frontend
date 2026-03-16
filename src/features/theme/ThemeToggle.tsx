import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { themeActions } from "./themeSlice";
import { Button } from "../../shared/ui/Button";

export function ThemeToggle() {
  const theme = useAppSelector((s) => s.theme.theme);
  const dispatch = useAppDispatch();

  return (
    <Button
      variant="ghost"
      onClick={() => dispatch(themeActions.toggle())}
      aria-label="Toggle theme"
      className="px-3"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}