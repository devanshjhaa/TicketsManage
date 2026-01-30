"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Ticket, 
  Users, 
  BarChart3, 
  Shield, 
  ArrowRight,
  ArrowDown,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Ticket, label: "TICKETS" },
  { icon: Users, label: "COLLABORATION" },
  { icon: BarChart3, label: "ANALYTICS" },
  { icon: Shield, label: "SECURE" },
];

const marqueeItems = ["EFFICIENT", "SCALABLE", "INTUITIVE", "RELIABLE", "FAST", "MODERN"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100">
              <Ticket className="h-5 w-5 text-zinc-100 dark:text-zinc-900" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TICKETS</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              FEATURES
            </Link>
            <Link href="#about" className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              ABOUT
            </Link>
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-6 border-zinc-300 dark:border-zinc-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Large Typography */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-sm font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
                  SUPPORT TICKETING SYSTEM
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="mt-6 text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]"
              >
                TICKETS
              </motion.h1>
              
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-zinc-400 dark:text-zinc-600"
              >
                MANAGE
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="mt-8 text-lg text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed"
              >
                A modern support ticketing platform for teams — create, track, and resolve issues with seamless collaboration.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="mt-10 flex items-center gap-4"
              >
                <Link href="/login">
                  <Button size="lg" className="rounded-full h-14 px-8 text-base gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-zinc-300 dark:border-zinc-700">
                    Create Account
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-default"
                >
                  <feature.icon className="h-8 w-8 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                  <p className="mt-4 text-sm font-medium tracking-wide text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    {feature.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium tracking-widest text-zinc-400">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowDown className="h-4 w-4 text-zinc-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 border-y border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex shrink-0"
          >
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={index}
                className="mx-8 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-300 dark:text-zinc-700"
              >
                {item}
              </span>
            ))}
          </motion.div>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex shrink-0"
          >
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span
                key={index}
                className="mx-8 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-300 dark:text-zinc-700"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-medium tracking-widest text-zinc-500"
              >
                ABOUT
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight"
              >
                Built for modern teams
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                TicketsManage is a comprehensive support ticketing system designed to help teams 
                collaborate effectively. From issue creation to resolution, every step is streamlined 
                for maximum efficiency.
              </p>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                With role-based access control, real-time updates, and powerful analytics, 
                you have everything you need to deliver exceptional support experiences.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium tracking-widest text-zinc-500"
          >
            FEATURES
          </motion.span>
          
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden">
            {[
              {
                title: "Ticket Management",
                description: "Create, update, and track support tickets with rich descriptions and file attachments.",
              },
              {
                title: "Team Assignment",
                description: "Assign tickets to agents, balance workloads, and ensure accountability.",
              },
              {
                title: "Real-time Updates",
                description: "Get instant notifications on ticket status changes and new comments.",
              },
              {
                title: "Analytics Dashboard",
                description: "Monitor ticket trends, resolution times, and team performance metrics.",
              },
              {
                title: "Role-Based Access",
                description: "Control permissions with User, Agent, and Admin roles.",
              },
              {
                title: "Activity History",
                description: "Complete audit trail of all actions taken on every ticket.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-zinc-50 dark:bg-zinc-950 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-zinc-400" />
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Ready to get started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
            >
              Join teams who have transformed their support workflow with TicketsManage.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-10"
            >
              <Link href="/register">
                <Button size="lg" className="rounded-full h-14 px-10 text-base gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100">
                <Ticket className="h-5 w-5 text-zinc-100 dark:text-zinc-900" />
              </div>
              <span className="text-lg font-semibold tracking-tight">TICKETS MANAGE</span>
            </div>
            
            <div className="flex items-center gap-8">
              <Link href="/login" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Register
              </Link>
              <a href="mailto:support@ticketsmanage.com" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} TicketsManage. All rights reserved.
            </p>
            <p className="text-xs text-zinc-400 tracking-widest">
              CRAFTING DIGITAL SOLUTIONS — Y:{new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
