import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // -------------------------
    // STATIC PUBLIC FILES (images, etc. in /public)
    // Anything with a file extension (.png, .jpg, .svg, .ico, .css, .js...) is a
    // static asset and must NEVER be gated behind login — otherwise images break.
    // -------------------------
    const isStaticFile = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|txt|xml|woff2?|ttf|otf|mp4|webm)$/i.test(pathname);

    // -------------------------
    // PUBLIC ROUTES
    // -------------------------
    const isPublic =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/layout-map" ||
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

    // Static files are always public — skip auth entirely (also avoids a needless
    // Supabase call on every image request).
    if (isStaticFile || isPublic) {
        // Still allow logged-in users to be bounced away from /login below,
        // so only short-circuit for the truly public, non-/login cases.
        if (pathname !== "/login") {
            return NextResponse.next({ request });
        }
    }

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

    // -------------------------
    // NOT LOGGED IN → protected route → send to login
    // -------------------------
    if (!user && !isPublic && !isStaticFile) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // -------------------------
    // ALREADY LOGGED IN → visiting /login → send to projects
    // -------------------------
    if (user && pathname === "/login") {
        return NextResponse.redirect(new URL("/projects", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};