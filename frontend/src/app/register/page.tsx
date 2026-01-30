"use client";

import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Users, Shield, Zap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        secretCode: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Zod Schema for strong password
    const registerSchema = z.object({
        password: z.string().min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        if (API_URL) window.location.href = `${API_URL}/oauth2/authorization/google`;
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

        // Validate Zod
        const result = registerSchema.safeParse({ password: formData.password });
        if (!result.success) {
            setErrors({ password: result.error.issues[0].message });
            return;
        }
        setErrors({});

        try {
            setLoading(true);
            // Split name into firstName and lastName
            const nameParts = formData.name.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            await api.post("/api/auth/register", {
                firstName,
                lastName,
                email: formData.email,
                password: formData.password,
                secretCode: formData.secretCode || null
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
        <div className="flex min-h-screen">
            {/* Left Panel - Register Form */}
            <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">TicketsManage</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Create your account
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="relative w-full h-11 justify-center gap-3 border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                            onClick={handleGoogleLogin}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-4 text-muted-foreground">
                                Or with email and password
                            </span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                className="h-11"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="h-11"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a strong password"
                                className="h-11"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                className="h-11"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="secretCode" className="text-sm font-medium text-foreground">
                                Secret Code <span className="text-muted-foreground font-normal">(optional)</span>
                            </label>
                            <Input
                                id="secretCode"
                                name="secretCode"
                                type="text"
                                placeholder="For Admin/Agent registration"
                                className="h-11"
                                value={formData.secretCode}
                                onChange={handleChange}
                            />
                        </div>

                        <Button 
                            className="w-full h-11 mt-6" 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Panel - Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-12 text-white">
                <div className="flex flex-col justify-center max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Join Our Platform
                        </h2>
                        <p className="text-lg opacity-90 mb-12">
                            Create an account to start managing your support tickets efficiently. 
                            Get instant access to all our powerful features.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-6">
                            {[
                                {
                                    icon: Ticket,
                                    title: "Submit Tickets Instantly",
                                    description: "Create and track your support requests",
                                },
                                {
                                    icon: Users,
                                    title: "Collaborate with Agents",
                                    description: "Get help from dedicated support team",
                                },
                                {
                                    icon: Shield,
                                    title: "Secure & Private",
                                    description: "Your data is protected with enterprise security",
                                },
                                {
                                    icon: Zap,
                                    title: "Fast Resolution",
                                    description: "Get your issues resolved quickly",
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{feature.title}</h3>
                                        <p className="text-sm opacity-80">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
