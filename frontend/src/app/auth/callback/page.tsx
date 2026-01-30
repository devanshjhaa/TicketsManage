"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            localStorage.setItem("accessToken", token);
            document.cookie = `accessToken=${token}; path=/; max-age=${15 * 60}; SameSite=Lax`;
            router.replace("/dashboard");
        } else {
            router.replace("/login");
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">Completing sign-in...</p>
            </div>
        </div>
    );
}
