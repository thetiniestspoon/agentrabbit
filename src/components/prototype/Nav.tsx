import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, Activity, PieChart } from "lucide-react";

const navItems = [
  { to: "/home", label: "Browse", icon: Search },
  { to: "/activity", label: "Activity", icon: Activity, disabled: true },
  { to: "/dashboard", label: "Spending", icon: PieChart, disabled: true },
];

export default function Nav() {
  const location = useLocation();

  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex border-b border-border px-6 py-4 items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-50">
        <Link to="/" className="font-display text-2xl text-terra">
          AgentRabbit
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.disabled ? "#" : item.to}
              className={cn(
                "transition-colors",
                location.pathname === item.to
                  ? "text-terra"
                  : item.disabled
                  ? "text-warm-lighter cursor-not-allowed"
                  : "text-warm-gray hover:text-terra"
              )}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.disabled ? "#" : item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
                  active
                    ? "text-terra"
                    : item.disabled
                    ? "text-warm-lighter"
                    : "text-warm-light"
                )}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
