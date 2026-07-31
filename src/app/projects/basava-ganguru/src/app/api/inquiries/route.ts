import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with Supabase in production)
let inquiries: any[] = [];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { plot_id, full_name, phone, email, message } = body;

        // Validate input
        if (!plot_id || !full_name || !phone || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create inquiry
        const inquiry = {
            id: Date.now().toString(),
            plot_id,
            full_name,
            phone,
            email,
            message: message || '',
            status: 'new',
            created_at: new Date().toISOString(),
        };

        inquiries.push(inquiry);

        // In production: Send to Supabase
        // await supabase.from('inquiries').insert([inquiry]);

        // In production: Send email notification
        // await sendEmailNotification(inquiry);

        return NextResponse.json(
            {
                success: true,
                inquiry,
                message: 'Inquiry submitted successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating inquiry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication (in production, validate JWT token)
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            // Public endpoint can return limited data
            return NextResponse.json(inquiries.slice(-10));
        }

        // Authenticated admin can see all inquiries
        return NextResponse.json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}