"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative">
            <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                size={18}
            />

            <input
                placeholder="Search Plot..."
                className="w-full rounded-2xl border border-zinc-800 bg-[#17171D] py-4 pl-12 pr-4 text-white outline-none"
            />
        </div>
    );
}