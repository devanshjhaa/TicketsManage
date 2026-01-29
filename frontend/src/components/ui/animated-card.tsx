"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    delay?: number;
}

export function AnimatedCard({ className, delay = 0, children, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
