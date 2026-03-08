import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type ColorTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const colorThemes: { value: ColorTheme; label: string; swatch: string }[] = [
  { value: "green", label: "Emerald", swatch: "bg-[hsl(160,84%,39%)]" },
  { value: "blue", label: "Ocean", swatch: "bg-[hsl(217,91%,60%)]" },
  { value: "purple", label: "Violet", swatch: "bg-[hsl(270,70%,55%)]" },
];

export default function ThemeToggle() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme settings" className="relative">
          <Palette className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleTheme} className="gap-2 cursor-pointer">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Color</DropdownMenuLabel>
        {colorThemes.map((ct) => (
          <DropdownMenuItem
            key={ct.value}
            onClick={() => setColorTheme(ct.value)}
            className="gap-2 cursor-pointer"
          >
            <span className={`w-3 h-3 rounded-full ${ct.swatch} shrink-0`} />
            {ct.label}
            {colorTheme === ct.value && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
