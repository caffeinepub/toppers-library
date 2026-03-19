import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Shield,
  Snowflake,
  Star,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Snowflake,
    title: "Air Conditioned Rooms",
    description:
      "All our study rooms feature powerful AC systems for a cool, comfortable environment — perfect for long study sessions.",
    badge: "Cool & Fresh",
    color: "text-blue-400",
  },
  {
    icon: Star,
    title: "Premium Seating",
    description:
      "Ergonomic chairs and spacious desks designed for maximum comfort during extended study hours.",
    badge: "Ergonomic",
    color: "text-gold-500",
  },
  {
    icon: Shield,
    title: "Best Conditions",
    description:
      "Regularly maintained spaces with excellent lighting, noise insulation, and high-speed internet access.",
    badge: "Top Quality",
    color: "text-green-400",
  },
  {
    icon: Clock,
    title: "Flexible Time Slots",
    description:
      "Book morning, afternoon, or evening sessions. Choose the time that fits your schedule best.",
    badge: "3 Slots Daily",
    color: "text-purple-400",
  },
];

const timeSlots = [
  {
    label: "Morning",
    time: "8:00 AM – 12:00 PM",
    desc: "Fresh start, peak focus",
  },
  {
    label: "Afternoon",
    time: "12:00 PM – 4:00 PM",
    desc: "Post-lunch deep work",
  },
  { label: "Evening", time: "4:00 PM – 8:00 PM", desc: "Late study sessions" },
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
        <div className="absolute inset-0 bg-black/60" />
        <div
          data-ocid="hero.section"
          id="sht420"
          className="relative z-10 container mx-auto px-4 py-28 md:py-40"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <Badge className="mb-5 bg-gold-500/20 text-gold-300 border-gold-500/30 font-medium">
              <Snowflake className="w-3.5 h-3.5 mr-1" /> Premium AC Study Rooms
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Study in <span className="text-gold-500">Comfort</span> at Toppers
              Library
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              Reserve your ideal seat in our air-conditioned study rooms.
              Premium chairs, pristine conditions, and a focused atmosphere
              crafted for serious learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/rooms">
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="bg-gold-500 text-navy-900 font-bold text-base hover:bg-gold-300 shadow-navy-lg px-8"
                >
                  Book a Seat <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/rooms">
                <Button
                  id="8jzcnw"
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
              We've designed every detail for your best study experience
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
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

      {/* Time Slots */}
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
              Flexible Booking Slots
            </h2>
            <p className="text-navy-200 text-lg">
              Three convenient time slots available every day
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {timeSlots.map((slot, i) => (
              <motion.div
                key={slot.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="bg-navy-700 rounded-xl p-6 border border-navy-600 text-center hover:border-gold-500 transition-colors group"
              >
                <div className="text-gold-500 font-display text-2xl font-bold mb-1 group-hover:scale-105 transition-transform">
                  {slot.label}
                </div>
                <div className="text-white font-medium mb-2">{slot.time}</div>
                <div className="text-navy-300 text-sm">{slot.desc}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/rooms">
              <Button
                size="lg"
                className="bg-gold-500 text-navy-900 font-bold hover:bg-gold-300 px-10"
              >
                Reserve Your Spot
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
