import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Sparkles,
  Star,
} from "lucide-react";

const PLANS = [
  {
    name: "Half Day",
    price: "₹600",
    period: "per month",
    desc: "One shift per day. Best for part-time study sessions.",
    features: [
      "Morning OR Evening shift",
      "AC hall access",
      "Comfortable seating",
      "1 month validity",
    ],
    highlight: false,
  },
  {
    name: "Full Day",
    price: "₹1,200",
    period: "per month",
    desc: "All shifts per day. Unlimited daily access.",
    features: [
      "Morning AND Evening shifts",
      "AC hall access",
      "Priority seating",
      "1 month validity",
    ],
    highlight: true,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Choose Room",
    desc: "Browse Hall A (60 seats) or Hall B (20 seats) and check live availability.",
  },
  {
    step: "02",
    title: "Pick Your Seat",
    desc: "Select your preferred seat from the interactive seat map.",
  },
  {
    step: "03",
    title: "Pay via UPI",
    desc: "Scan QR code or use UPI ID to complete payment. Save your transaction ID.",
  },
  {
    step: "04",
    title: "Admin Confirms",
    desc: "Admin verifies payment and activates your booking. You receive login credentials.",
  },
];

export function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[90vh] flex items-center text-white"
        style={{
          backgroundImage: "url('/assets/uploads/Untitled-design-1--1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/60 to-transparent" />
        <div className="relative z-10 px-6 md:px-16 max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">
              Premium AC Study Halls — Lucknow
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Study in <span className="text-amber-400">Comfort</span>
            <br />
            at Toppers Library
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl leading-relaxed">
            Reserve your dedicated seat in premium air-conditioned study rooms.
            Ergonomic chairs, pristine conditions, and a focused atmosphere
            built for serious learners.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-zinc-900 font-semibold rounded-md hover:bg-amber-300 transition-colors text-base shadow-lg shadow-amber-400/20"
              data-ocid="hero.reserve_seat.button"
            >
              Reserve Your Seat
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-md hover:bg-white/20 transition-colors text-base border border-white/20"
              data-ocid="hero.view_rooms.button"
            >
              <BookOpen className="w-5 h-5" />
              View Rooms
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap gap-6">
            {[
              { icon: Star, text: "100+ Happy Students" },
              { icon: BookOpen, text: "80 Premium Seats" },
              { icon: Sparkles, text: "Air Conditioned Halls" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-white/70 text-sm"
              >
                <item.icon className="w-4 h-4 text-amber-400" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "80", label: "Total Seats" },
            { val: "2", label: "AC Rooms" },
            { val: "₹600", label: "Half Day / Month" },
            { val: "₹1,200", label: "Full Day / Month" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl font-display font-bold text-accent">
                {item.val}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              Monthly Plans
            </h2>
            <p className="text-muted-foreground">
              Choose a plan that fits your study schedule
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-8 transition-transform hover:-translate-y-1 ${
                  plan.highlight
                    ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <h3
                  className={`font-display text-xl font-semibold mb-2 ${
                    plan.highlight ? "text-accent" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="text-sm mb-6 text-muted-foreground">
                  {plan.desc}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          plan.highlight ? "text-accent" : "text-emerald-400"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/rooms"
                  className={`mt-8 block text-center px-6 py-3 rounded-md font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-primary text-white hover:bg-primary/80 shadow-md shadow-primary/30"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  }`}
                  data-ocid={`plans.${plan.name.toLowerCase().replace(" ", "_")}.button`}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
              Process
            </p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              4 simple steps to book your seat
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center group">
                <div className="w-14 h-14 bg-primary text-accent font-display font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                  {s.step}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-20 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/assets/uploads/Untitled-design-1--1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-transparent" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to Start <span className="text-amber-400">Studying?</span>
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Book your seat today and join hundreds of successful students
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-zinc-900 font-semibold rounded-md hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
            data-ocid="cta.view_rooms.button"
          >
            View Available Rooms
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
