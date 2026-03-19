import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, MapPin, Phone } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-card border-t border-border text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-md shadow-primary/30">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-foreground text-lg">
                Toppers <span className="text-accent">Library</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Premium AC study halls in Lucknow. Book your seat for focused,
              comfortable studying.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>Neelmatha, Vijay Nagar, GNET, Lucknow</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>6388259986</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent shrink-0" />
                <span>6:00 AM – 10:00 PM (All Days)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link
                to="/rooms"
                className="hover:text-foreground transition-colors"
              >
                View Rooms
              </Link>
              <Link
                to="/student-login"
                className="hover:text-foreground transition-colors"
              >
                Student Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} Toppers Library. All rights reserved.</span>
          <a
            href={caffeineLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
