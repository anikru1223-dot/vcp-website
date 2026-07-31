import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (replace with Supabase Storage in production)
let mediaStorage: Record<string, any[]> = {};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file') as File;
        const plotId = formData.get('plotId') as string;
        const mediaType = formData.get('mediaType') as string;

        if (!file || !plotId || !mediaType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 50MB limit' },
                { status: 400 }
            );
        }

        // In production: Upload to Supabase Storage
        // const buffer = Buffer.from(await file.arrayBuffer());
        // await supabase.storage
        //   .from('plot-media')
        //   .upload(`plots/${plotId}/${mediaType}s/${file.name}`, buffer);

        // Demo: Create mock media entry
        const media = {
            id: Date.now().toString(),
            plot_id: plotId,
            media_type: mediaType,
            file_url: `/images/placeholder-${mediaType}.jpg`, // Mock URL
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
        };

        if (!mediaStorage[plotId]) {
            mediaStorage[plotId] = [];
        }
        mediaStorage[plotId].push(media);

        return NextResponse.json(
            {
                success: true,
                media,
                message: `${mediaType} uploaded successfully`,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}