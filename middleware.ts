import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // -------------------------
    // STATIC PUBLIC FILES
    // -------------------------
    const isStaticFile =
        /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|txt|xml|woff2?|ttf|otf|mp4|webm)$/i.test(
            pathname
        );

    // -------------------------
    // PUBLIC ROUTES
    // -------------------------
    const isPublic =
        pathname === "/" ||
        pathname === "/login" ||

        // Existing Koushik Enclave map
        pathname === "/layout-map" ||

        // NEW: Basava Ganguru map
        pathname === "/basava-ganguru-map" ||

        // Projects
        pathname === "/projects" ||
        pathname.startsWith("/projects/") ||

        // Basava Ganguru Public Website
        pathname === "/project/basava-ganguru" ||
        pathname.startsWith("/project/basava-ganguru/") ||

        // Next.js assets
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/fonts");

    // -------------------------
    // STATIC FILES / PUBLIC ROUTES
    // -------------------------
    if (isStaticFile || isPublic) {
        // Keep /login going through auth so logged-in users
        // can still be redirected to /projects.
        if (pathname !== "/login") {
            return NextResponse.next({
                request,
            });
        }
    }

    // -------------------------
    // SUPABASE SERVER CLIENT
    // -------------------------
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

    // -------------------------
    // GET CURRENT USER
    // -------------------------
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // -------------------------
    // NOT LOGGED IN
    // → protected route → login
    // -------------------------
    if (!user && !isPublic && !isStaticFile) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // -------------------------
    // ALREADY LOGGED IN
    // → /login → projects
    // -------------------------
    if (user && pathname === "/login") {
        return NextResponse.redirect(new URL("/projects", request.url));
    }

    return response;
}

// -------------------------
// MIDDLEWARE MATCHER
// -------------------------
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};