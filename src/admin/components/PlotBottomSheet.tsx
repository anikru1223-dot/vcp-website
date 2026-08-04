"use client";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function PlotBottomSheet({
    open,
    onClose,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60">

            <div className="absolute bottom-0 left-0 right-0 rounded-t-[30px] bg-[#17171D] p-6">

                <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-zinc-600" />

                <h2 className="text-2xl font-bold text-white">
                    Plot 12
                </h2>

                <div className="mt-6 space-y-5">

                    <div>

                        <label className="text-sm text-zinc-400">
                            Status
                        </label>

                        <select className="mt-2 w-full rounded-xl bg-[#0B0B0F] p-4 text-white">

                            <option>Available</option>

                            <option>Reserved</option>

                            <option>Sold</option>

                        </select>

                    </div>

                    <div>

                        <label className="text-sm text-zinc-400">
                            Price
                        </label>

                        <input
                            className="mt-2 w-full rounded-xl bg-[#0B0B0F] p-4 text-white"
                            defaultValue="2350000"
                        />

                    </div>

                    <div>

                        <label className="text-sm text-zinc-400">
                            Remarks
                        </label>

                        <textarea
                            rows={4}
                            className="mt-2 w-full rounded-xl bg-[#0B0B0F] p-4 text-white"
                        />

                    </div>

                    <button className="mt-3 w-full rounded-2xl bg-[#D4AF37] p-4 font-bold text-black">

                        Save Changes

                    </button>

                    <button
                        onClick={onClose}
                        className="w-full rounded-2xl border border-zinc-700 p-4 text-white"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>
    );
}