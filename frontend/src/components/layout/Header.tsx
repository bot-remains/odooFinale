import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">QuickCourt</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>Home</NavLink>
          <NavLink to="/venues" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>Venues</NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>Profile</NavLink>
          <NavLink to="/bookings" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>My Bookings</NavLink>
          <NavLink to="/owner/dashboard" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>Owner</NavLink>
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}>Admin</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild variant="hero">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
