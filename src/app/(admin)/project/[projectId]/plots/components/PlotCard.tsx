"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface PlotCardProps {
    id: number;
    status: "available" | "reserved" | "sold";
    owner?: string;
}

export default function PlotCard({
    id,
    status,
    owner,
}: PlotCardProps) {
    const router = useRouter();
    const { projectId } = useParams<{ projectId: string }>();

    return (
        <div className="rounded-3xl border border-zinc-800 bg-[#17171D] p-5">
            {/* Top */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">
                        Plot {id}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        {owner ?? "No Owner Assigned"}
                    </p>
                </div>

                <StatusBadge status={status} />
            </div>

            {/* Info */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">

                <div className="rounded-xl bg-[#0F0F13] p-3">
                    <p className="text-zinc-500">Size</p>
                    <p className="mt-1 font-semibold">
                        30 × 40
                    </p>
                </div>

                <div className="rounded-xl bg-[#0F0F13] p-3">
                    <p className="text-zinc-500">Facing</p>
                    <p className="mt-1 font-semibold">
                        East
                    </p>
                </div>

            </div>

            {/* Button */}
            <button
                onClick={() =>
                    router.push(`/project/${projectId}/plots/${id}`)
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-4 font-semibold text-black transition hover:scale-[1.02]"
            >
                Edit Plot
                <ArrowRight size={20} />
            </button>
        </div>
    );
}