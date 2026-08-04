type Status = "available" | "reserved" | "sold";

export default function StatusBadge({
    status,
}: {
    status: Status;
}) {
    const styles = {
        available:
            "bg-green-500/10 text-green-400 border-green-500/20",
        reserved:
            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        sold:
            "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
        >
            {status}
        </span>
    );
}