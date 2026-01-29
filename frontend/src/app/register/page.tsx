"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords mismatch",
                description: "Please ensure both passwords are the same.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await api.post("/api/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            toast({
                title: "Account created",
                description: "You can now sign in with your credentials.",
            });
            router.push("/login");
        } catch {
            toast({
                title: "Registration failed",
                description: "Could not create account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
                <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>

            <AnimatedCard className="z-10 w-full max-w-md border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/80">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" x2="20" y1="8" y2="14" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
                        </motion.div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create an account</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Enter your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="name"
                                placeholder="Full Name"
                                className="bg-transparent"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="bg-transparent"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="bg-transparent"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                className="bg-transparent"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </AnimatedCard>
        </div>
    );
}
