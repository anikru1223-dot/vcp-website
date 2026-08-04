"use client";

import { ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
    ArrowLeft,
    LayoutDashboard,
    Map,
    Users,
    Mail,
} from "lucide-react";

export default function ProjectLayout({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const projectId = params.projectId as string;

    const navigation = [
        {
            name: "Dashboard",
            href: `/project/${projectId}/dashboard`,
            icon: LayoutDashboard,
        },
        {
            name: "Plots",
            href: `/project/${projectId}/plots`,
            icon: Map,
        },
        {
            name: "Customers",
            href: `/project/${projectId}/customers`,
            icon: Users,
        },
        {
            name: "Enquiries",
            href: `/project/${projectId}/enquiries`,
            icon: Mail,
        },
    ];

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white">

            {/* Header */}

            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#111114]/95 backdrop-blur">
                <div className="flex items-center gap-4 px-5 py-4">

                    <button
                        onClick={() => router.push("/projects")}
                        className="rounded-xl bg-[#1A1A22] p-2"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-lg font-bold">
                            Basava Ganguru
                        </h1>

                        <p className="text-xs text-zinc-400">
                            Residential Layout
                        </p>
                    </div>

                </div>
            </header>

            {/* Content */}

            <section className="pb-24">
                {children}
            </section>

            {/* Bottom Navigation */}

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-[#111114]">

                <div className="grid grid-cols-4">

                    {navigation.map((item) => {
                        const Active = pathname === item.href;

                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                className={`flex flex-col items-center gap-1 py-3 transition ${Active
                                    ? "text-[#D4AF37]"
                                    : "text-zinc-500"
                                    }`}
                            >
                                <item.icon size={22} />

                                <span className="text-[11px]">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </nav>

        </main>
    );
}