import { BookOpen } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-navy-900 border-t border-navy-700 text-navy-200">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-navy-900" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Toppers <span className="text-gold-500">Library</span>
            </span>
          </div>
          <div className="text-sm text-center">
            <p className="font-medium text-white">
              Premium AC Study Rooms — Best Conditions Guaranteed
            </p>
            <p className="text-navy-300 mt-1">
              Comfortable seating, cool environment, focused learning
            </p>
          </div>
          <p className="text-sm text-navy-400">
            © {year}.{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:text-gold-300 transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
