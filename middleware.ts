import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },

                set(name, value, options) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },

                remove(name, options) {
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                        maxAge: 0,
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public pages
    const publicRoutes = [
        "/",
        "/login",
        "/layout-map",
    ];

    const isPublic =
        publicRoutes.includes(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/api");

    // Not logged in
    if (!user && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Already logged in
    if (user && pathname === "/login") {
        return NextResponse.redirect(new URL("/projects", request.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};