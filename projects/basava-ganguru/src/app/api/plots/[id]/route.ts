import { NextRequest, NextResponse } from "next/server";

// In-memory storage (replace with Supabase in production)
const plots: Record<number, any> = {};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const plotNumber = parseInt(id);

        if (isNaN(plotNumber)) {
            return NextResponse.json(
                { error: "Invalid plot ID" },
                { status: 400 }
            );
        }

        const plot = plots[plotNumber];

        if (!plot) {
            return NextResponse.json(
                { error: "Plot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(plot);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const plotNumber = parseInt(id);

        const body = await request.json();
        const { status, facing } = body;

        if (isNaN(plotNumber)) {
            return NextResponse.json(
                { error: "Invalid plot ID" },
                { status: 400 }
            );
        }

        if (!plots[plotNumber]) {
            plots[plotNumber] = {};
        }

        if (status) plots[plotNumber].status = status;
        if (facing) plots[plotNumber].facing = facing;

        plots[plotNumber].updated_at = new Date().toISOString();

        return NextResponse.json({
            success: true,
            plot: plots[plotNumber],
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}