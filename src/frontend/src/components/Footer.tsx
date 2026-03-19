import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-navy-900 text-navy-200">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-navy-900" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Toppers <span className="text-gold-500">Library</span>
              </span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed">
              Premium AC study rooms designed for serious learners. Focused
              environment, ergonomic seating, and the best conditions for
              academic excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-navy-300 hover:text-gold-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms"
                  className="text-navy-300 hover:text-gold-500 transition-colors"
                >
                  Study Rooms
                </Link>
              </li>
              <li>
                <Link
                  to="/student-login"
                  className="text-navy-300 hover:text-gold-500 transition-colors"
                >
                  Student Login
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-login"
                  className="text-navy-300 hover:text-gold-500 transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Plans */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Monthly Plans
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-navy-300">Half Day Plan</span>
                <span className="text-gold-500 font-semibold">₹600/mo</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-navy-300">Full Day Plan</span>
                <span className="text-gold-500 font-semibold">₹1,200/mo</span>
              </li>
              <li className="text-navy-400 text-xs mt-2">
                Valid for 30 days from booking date.
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact & Hours
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-navy-300">+91 63882 59986</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-navy-300">
                  Toppers Library, Study Hub, Your City
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-navy-300">
                  Mon–Sun: 6:00 AM – 10:00 PM
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-navy-300">topperslibrary@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-700">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-400">
          <p>© {year} Toppers Library. All rights reserved.</p>
          <p>
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
