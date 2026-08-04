"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    async function login(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setLoading(false);
            setError(error.message);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("admin_profiles")
            .select("*")
            .eq("id", data.user.id);

        console.log("Logged User ID:", data.user.id);
        console.log("Profile:", profile);
        console.log("Profile Error:", profileError);

        if (!profile) {
            await supabase.auth.signOut();

            setLoading(false);
            setError("You are not an administrator.");

            return;
        }

        router.replace("/projects");
        router.refresh();
    }

    return (
        <main className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6">

            <div className="w-full max-w-md rounded-3xl bg-[#17171D] border border-zinc-800 p-8">

                <div className="flex justify-center mb-8">

                    <div className="h-20 w-20 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center">

                        <Building2
                            className="text-[#D4AF37]"
                            size={40}
                        />

                    </div>

                </div>

                <h1 className="text-3xl font-bold text-white text-center">
                    Admin Login
                </h1>

                <p className="text-zinc-400 text-center mt-2">
                    Vijayalaxmi Developers
                </p>

                <form
                    onSubmit={login}
                    className="space-y-5 mt-8"
                >

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#0F0F13] border border-zinc-700 px-4 py-4 text-white outline-none focus:border-[#D4AF37]"
                    />

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-xl bg-[#0F0F13] border border-zinc-700 px-4 py-4 pr-12 text-white outline-none focus:border-[#D4AF37]"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-zinc-400"
                        >
                            {showPassword ? (
                                <EyeOff size={22} />
                            ) : (
                                <Eye size={22} />
                            )}
                        </button>

                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 p-4 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-[#D4AF37] py-4 font-semibold text-black hover:scale-[1.02] transition"
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>

                </form>

            </div>

        </main>
    );
}