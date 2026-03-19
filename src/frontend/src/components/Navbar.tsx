import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", ocid: "nav.home_link" },
    { to: "/rooms", label: "Rooms", ocid: "nav.rooms_link" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-800 shadow-navy-md border-b border-navy-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-navy-900" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Toppers <span className="text-gold-500">Library</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.ocid}
              to={link.to}
              data-ocid={link.ocid}
              className="px-4 py-2 text-sm font-medium text-navy-100 rounded-md hover:text-white hover:bg-navy-700 transition-colors"
              activeProps={{
                className:
                  "px-4 py-2 text-sm font-medium text-gold-500 rounded-md bg-navy-700",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/student-login" data-ocid="nav.student_login_link">
            <Button
              variant="outline"
              size="sm"
              className="border-navy-400 text-navy-100 hover:bg-navy-700 hover:text-white flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" /> Student Login
            </Button>
          </Link>
          <Link to="/admin-login" data-ocid="nav.admin_login_link">
            <Button
              size="sm"
              className="bg-gold-500 text-navy-900 font-semibold hover:bg-gold-300 border-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Login
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.ocid}
              to={link.to}
              data-ocid={link.ocid}
              className="px-3 py-2 text-sm font-medium text-navy-100 rounded-md hover:bg-navy-700"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-navy-700 flex flex-col gap-2">
            <Link to="/student-login" onClick={() => setMobileOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-navy-400 text-navy-100 hover:bg-navy-700 flex items-center gap-1.5 justify-center"
              >
                <GraduationCap className="w-4 h-4" /> Student Login
              </Button>
            </Link>
            <Link to="/admin-login" onClick={() => setMobileOpen(false)}>
              <Button
                size="sm"
                className="w-full bg-gold-500 text-navy-900 font-semibold flex items-center gap-1.5 justify-center"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
