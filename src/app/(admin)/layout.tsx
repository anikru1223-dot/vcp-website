import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    console.log("🔥 ADMIN LAYOUT EXECUTED");

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log("USER:", user);

    if (!user) {
        console.log("REDIRECTING TO LOGIN");
        redirect("/login");
    }

    return <>{children}</>;
}