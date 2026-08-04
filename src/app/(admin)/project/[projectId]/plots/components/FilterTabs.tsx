"use client";

export default function FilterTabs() {
    return (
        <div className="mt-5 flex gap-3 overflow-auto">
            {["All", "Available", "Reserved", "Sold"].map((item) => (
                <button
                    key={item}
                    className="rounded-full border border-zinc-700 bg-[#17171D] px-5 py-2 whitespace-nowrap"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}