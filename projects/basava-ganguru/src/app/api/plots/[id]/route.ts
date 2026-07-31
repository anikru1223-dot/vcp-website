import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with Supabase in production)
let plots: Record<number, any> = {};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const plotNumber = parseInt(params.id);

        if (isNaN(plotNumber)) {
            return NextResponse.json({ error: 'Invalid plot ID' }, { status: 400 });
        }

        // In production: Fetch from Supabase
        const plot = plots[plotNumber];

        if (!plot) {
            return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
        }

        return NextResponse.json(plot);
    } catch (error) {
        console.error('Error fetching plot:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const plotNumber = parseInt(params.id);
        const body = await request.json();

        const { status, facing } = body;

        if (isNaN(plotNumber)) {
            return NextResponse.json({ error: 'Invalid plot ID' }, { status: 400 });
        }

        // Update plot
        if (!plots[plotNumber]) {
            plots[plotNumber] = {};
        }

        if (status) plots[plotNumber].status = status;
        if (facing) plots[plotNumber].facing = facing;

        plots[plotNumber].updated_at = new Date().toISOString();

        // In production: Update in Supabase
        // await supabase.from('plots').update(updates).eq('plot_number', plotNumber);

        return NextResponse.json({
            success: true,
            plot: plots[plotNumber],
        });
    } catch (error) {
        console.error('Error updating plot:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}