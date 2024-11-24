"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  const SWITCH = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("light");
        break;
      default:
        break;
    }
  };

  return (
    <Button
      onClick={SWITCH}
      variant="outline"
      size="icon"
      className="size-8 bg-secondary/50 backdrop-blur-sm rounded-full"
    >
      <SunIcon
        size={16}
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <MoonIcon
        size={16}
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
