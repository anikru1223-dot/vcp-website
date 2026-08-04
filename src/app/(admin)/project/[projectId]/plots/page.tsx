"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import SearchBar from "./components/SearchBar";
import FilterTabs from "./components/FilterTabs";
import PlotCard from "./components/PlotCard";

const plots: Array<{
    id: number;
    status: "available" | "sold" | "reserved";
    owner?: string;
}> = [
        { id: 1, status: "available" },
        { id: 2, status: "sold", owner: "Darshan" },
        { id: 3, status: "reserved", owner: "Ramesh" },
        { id: 4, status: "available" },
        { id: 5, status: "available" },
        { id: 6, status: "sold", owner: "Rahul" },
    ];

export default function PlotsPage() {
    const router = useRouter();
    const params = useParams();

    const projectId = params.projectId as string;

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-zinc-800 bg-[#111116] px-5 py-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() =>
                            router.push(`/project/${projectId}/dashboard`)
                        }
                        className="rounded-xl bg-[#1A1A22] p-3 transition hover:bg-[#23232d]"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold">
                            Basava Ganguru
                        </h1>

                        <p className="text-sm text-zinc-400">
                            Residential Layout
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h2 className="text-4xl font-bold">
                    Plot Management
                </h2>

                <p className="mt-2 text-zinc-400">
                    Manage all residential plots
                </p>

                <div className="mt-6">
                    <SearchBar />
                </div>

                <FilterTabs />

                <div className="mt-6 space-y-4">
                    {plots.map((plot) => (
                        <PlotCard
                            key={plot.id}
                            id={plot.id}
                            status={plot.status}
                            owner={plot.owner}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}