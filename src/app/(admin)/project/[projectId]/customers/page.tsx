"use client";

import { Plus, Phone, Search, User2 } from "lucide-react";

const customers = [
    {
        id: 1,
        name: "Darshan M",
        phone: "+91 9876543210",
        plot: "12",
        status: "Interested",
    },
    {
        id: 2,
        name: "Ramesh",
        phone: "+91 9988776655",
        plot: "18",
        status: "Site Visit",
    },
];

export default function CustomersPage() {
    return (
        <div className="min-h-screen bg-[#0B0B0F] pb-24">

            <div className="p-5">

                <h1 className="text-3xl font-bold text-white">
                    Customers
                </h1>

                <p className="mt-1 text-zinc-400">
                    Manage all customer enquiries
                </p>

            </div>

            {/* Search */}

            <div className="px-5">

                <div className="flex items-center rounded-2xl bg-[#17171D] px-4">

                    <Search className="text-zinc-500" size={20} />

                    <input
                        placeholder="Search customer..."
                        className="w-full bg-transparent p-4 text-white outline-none"
                    />

                </div>

            </div>

            {/* Customer List */}

            <div className="mt-6 space-y-4 px-5">

                {customers.map((customer) => (

                    <div
                        key={customer.id}
                        className="rounded-3xl border border-zinc-800 bg-[#17171D] p-5"
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/20">

                                    <User2 className="text-[#D4AF37]" />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-white">
                                        {customer.name}
                                    </h2>

                                    <p className="text-sm text-zinc-500">
                                        Plot {customer.plot}
                                    </p>

                                </div>

                            </div>

                            <button className="rounded-xl bg-green-600 p-3">

                                <Phone size={18} color="white" />

                            </button>

                        </div>

                        <div className="mt-5 flex items-center justify-between">

                            <span className="rounded-full bg-blue-500/20 px-4 py-1 text-sm text-blue-400">

                                {customer.status}

                            </span>

                            <p className="text-sm text-zinc-400">

                                {customer.phone}

                            </p>

                        </div>

                    </div>

                ))}

            </div>

            {/* FAB */}

            <button className="fixed bottom-24 right-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]">

                <Plus color="black" size={30} />

            </button>

        </div>
    );
}