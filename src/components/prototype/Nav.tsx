import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, Activity, Coins, LogIn, LogOut, Zap } from "lucide-react";
import { useAuth, useCredits, useFreeRuns } from "@/lib/hooks";

const navItems = [
  { to: "/home", label: "Browse", icon: Search },
  { to: "/activity", label: "Activity", icon: Activity },
];

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();
  const { balance, formatted } = useCredits();
  const { remaining } = useFreeRuns();

  async function handleSignOut() {
    await signOut();
    navigate("/home");
  }

  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex border-b border-border px-6 py-4 items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-50">
        <Link to="/" className="font-display text-2xl text-terra">
          AgentRabbit
        </Link>

        <div className="flex items-center gap-6">
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

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Free runs badge */}
              {remaining > 0 && (
                <span className="flex items-center gap-1 text-xs text-honey bg-honey/10 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  {remaining} free
                </span>
              )}

              {/* Credit balance */}
              <span className="flex items-center gap-1 text-sm text-warm-gray">
                <Coins className="w-4 h-4 text-terra" />
                {formatted}
              </span>

              {/* User + sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-warm-lighter hover:text-terra transition-colors"
                title={user?.email ?? "Sign out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="flex items-center gap-1.5 text-sm text-terra hover:text-terra-dark transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}
        </div>
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

          {/* Auth button in mobile nav */}
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-warm-light"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          ) : (
            <Link
              to="/sign-in"
              className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-terra"
            >
              <LogIn className="w-5 h-5" />
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile credit bar */}
        {isAuthenticated && (
          <div className="flex justify-center gap-4 pb-2 text-xs text-warm-lighter">
            {remaining > 0 && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-honey" />
                {remaining} free today
              </span>
            )}
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-terra" />
              {formatted}
            </span>
          </div>
        )}
      </nav>
    </>
  );
}
