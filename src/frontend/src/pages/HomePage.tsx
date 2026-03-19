import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Layers,
  Shield,
  Snowflake,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Snowflake,
    title: "Air Conditioned Rooms",
    description:
      "Powerful AC systems maintain a cool, comfortable environment — perfect for long study sessions even in peak summer.",
    badge: "Cool & Fresh",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Star,
    title: "Premium Seating",
    description:
      "Ergonomic chairs and spacious desks designed for maximum comfort during extended study hours.",
    badge: "Ergonomic",
    color: "text-gold-500",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Best Conditions",
    description:
      "Regularly maintained spaces with excellent lighting, noise insulation, and a calm focused atmosphere.",
    badge: "Top Quality",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: BookOpen,
    title: "Monthly Plans",
    description:
      "Flexible monthly plans at unbeatable rates — Half Day at ₹600 or Full Day at ₹1,200 per month.",
    badge: "Great Value",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

const stats = [
  { value: "80", label: "Premium Seats", sub: "Across 2 AC rooms" },
  { value: "100%", label: "AC Rooms", sub: "Year-round cooling" },
  { value: "₹600", label: "Starting Price", sub: "Per month, half day" },
  { value: "30", label: "Day Plans", sub: "Flexible monthly access" },
];

const steps = [
  {
    step: "01",
    title: "Choose Your Room",
    desc: "Browse Hall A (60 seats) or Hall B (20 seats) — both fully air-conditioned.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Select a Seat & Plan",
    desc: "Pick your preferred seat and choose Half Day or Full Day monthly plan.",
    icon: CheckCircle,
  },
  {
    step: "03",
    title: "Pay via UPI",
    desc: "Scan the QR code or use the UPI ID to complete your payment instantly.",
    icon: CreditCard,
  },
];

const monthlyPlans = [
  {
    name: "Half Day",
    price: "₹600",
    period: "/month",
    description: "Perfect for focused morning or evening study sessions.",
    features: [
      "Your preferred shift schedule",
      "Fixed seat for 30 days",
      "AC room access",
      "Premium seating",
    ],
    highlight: false,
  },
  {
    name: "Full Day",
    price: "₹1,200",
    period: "/month",
    description: "Unlimited access from opening to closing, every day.",
    features: [
      "6:00 AM – 10:00 PM access",
      "Fixed seat for 30 days",
      "Priority seat selection",
      "AC room access",
    ],
    highlight: true,
  },
];

export function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/uploads/Untitled-design-1--1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-navy-900/65" />
        <div
          data-ocid="hero.section"
          className="relative z-10 container mx-auto px-4 py-32 md:py-44"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <Badge className="mb-5 bg-gold-500/20 text-gold-300 border-gold-500/30 font-medium">
              <Snowflake className="w-3.5 h-3.5 mr-1" /> Premium AC Study Rooms
              — Prayagraj
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Study in <span className="text-gold-500">Comfort</span> at Toppers
              Library
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              Reserve your dedicated seat in premium air-conditioned study
              rooms. Ergonomic chairs, pristine conditions, and a focused
              atmosphere built for serious learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/rooms">
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="bg-gold-500 text-navy-900 font-bold text-base hover:bg-gold-300 shadow-navy-lg px-8"
                >
                  Reserve Your Seat <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/rooms">
                <Button
                  data-ocid="hero.secondary_button"
                  size="lg"
                  className="bg-black text-white border-black hover:bg-black/80 text-base px-8"
                >
                  <BookOpen className="w-5 h-5 mr-2" /> View Rooms
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-navy-800 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-gold-500 mb-1">
                  {s.value}
                </p>
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-navy-300 text-xs mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Why Choose Toppers Library?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every detail is designed for your best study experience
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-xl p-6 border border-border shadow-navy-sm hover:shadow-navy-md transition-shadow group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <Badge variant="secondary" className="mb-3 text-xs">
                  {f.badge}
                </Badge>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Plans */}
      <section className="py-20 bg-navy-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Simple Monthly Plans
            </h2>
            <p className="text-navy-200 text-lg max-w-xl mx-auto">
              No hidden fees. Reserve your seat for 30 days with full
              flexibility.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {monthlyPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? "bg-gold-500 border-gold-300 shadow-navy-lg"
                    : "bg-navy-700 border-navy-600 hover:border-gold-500"
                } transition-all`}
              >
                {plan.highlight && (
                  <Badge className="mb-3 bg-navy-900 text-gold-500 border-navy-700 text-xs font-bold">
                    Most Popular
                  </Badge>
                )}
                <h3
                  className={`font-display text-2xl font-bold mb-1 ${
                    plan.highlight ? "text-navy-900" : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className={`font-display text-4xl font-bold ${
                      plan.highlight ? "text-navy-900" : "text-gold-500"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.highlight ? "text-navy-700" : "text-navy-300"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm mb-6 ${
                    plan.highlight ? "text-navy-800" : "text-navy-300"
                  }`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          plan.highlight ? "text-navy-800" : "text-gold-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlight ? "text-navy-800" : "text-navy-200"
                        }`}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/rooms">
                  <Button
                    data-ocid="hero.primary_button"
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? "bg-navy-900 text-white hover:bg-navy-700"
                        : "bg-gold-500 text-navy-900 hover:bg-gold-300"
                    }`}
                  >
                    Reserve Your Spot <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Book your seat in three simple steps
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-800 mb-5">
                  <s.icon className="w-7 h-7 text-gold-500" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500 text-navy-900 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/rooms">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/80 px-10 font-semibold"
                data-ocid="hero.secondary_button"
              >
                <Users className="w-5 h-5 mr-2" /> Explore Rooms
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
