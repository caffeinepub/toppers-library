import { Link } from "@tanstack/react-router";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-md shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Toppers <span className="text-accent">Library</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.home.link"
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.rooms.link"
            >
              Rooms
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/student-login"
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary/80 transition-colors shadow-md shadow-primary/30"
              data-ocid="nav.student_login.button"
            >
              Student Login
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary/80 transition-colors shadow-md shadow-primary/30"
              data-ocid="nav.admin_login.button"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-4 flex flex-col gap-3 bg-background">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
              onClick={() => setOpen(false)}
            >
              Rooms
            </Link>
            <Link
              to="/student-login"
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md text-center"
              onClick={() => setOpen(false)}
            >
              Student Login
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md text-center"
              onClick={() => setOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
