import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Features will be limited.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Plot {
    id: string;
    plot_number: number;
    width: number;
    depth: number;
    area_sqft: number;
    facing: 'North' | 'South' | 'East' | 'West' | 'NE' | 'NW' | 'SE' | 'SW';
    status: 'available' | 'sold' | 'reserved';
    price_per_sqft: number;
    total_price: number;
    location_lat: number;
    location_lng: number;
    created_at: string;
    updated_at: string;
}

export interface PlotMedia {
    id: string;
    plot_id: string;
    media_type: 'photo' | 'video';
    file_url: string;
    file_name: string;
    uploaded_at: string;
}

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    is_active: boolean;
    created_at: string;
}

export interface Inquiry {
    id: string;
    plot_id: string;
    full_name: string;
    phone: string;
    email: string;
    message?: string;
    status: 'new' | 'contacted' | 'interested' | 'closed';
    created_at: string;
}

// API functions
export async function fetchPlots() {
    try {
        const { data, error } = await supabase
            .from('plots')
            .select('*')
            .order('plot_number', { ascending: true });

        if (error) throw error;
        return data as Plot[];
    } catch (error) {
        console.error('Error fetching plots:', error);
        return [];
    }
}

export async function fetchPlotById(plotId: string) {
    try {
        const { data, error } = await supabase
            .from('plots')
            .select('*')
            .eq('id', plotId)
            .single();

        if (error) throw error;
        return data as Plot;
    } catch (error) {
        console.error('Error fetching plot:', error);
        return null;
    }
}

export async function fetchPlotMedia(plotId: string) {
    try {
        const { data, error } = await supabase
            .from('plot_media')
            .select('*')
            .eq('plot_id', plotId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        return data as PlotMedia[];
    } catch (error) {
        console.error('Error fetching plot media:', error);
        return [];
    }
}

export async function createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>) {
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .insert([
                {
                    ...inquiry,
                    status: 'new',
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data as Inquiry;
    } catch (error) {
        console.error('Error creating inquiry:', error);
        return null;
    }
}

export async function uploadPlotMedia(
    plotId: string,
    file: File,
    mediaType: 'photo' | 'video'
) {
    try {
        const fileName = `${plotId}-${Date.now()}-${file.name}`;
        const folderPath = `plots/${plotId}/${mediaType}s`;

        const { error: uploadError } = await supabase.storage
            .from('plot-media')
            .upload(`${folderPath}/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
            .from('plot-media')
            .getPublicUrl(`${folderPath}/${fileName}`);

        const { data: mediaData, error: dbError } = await supabase
            .from('plot_media')
            .insert([
                {
                    plot_id: plotId,
                    media_type: mediaType,
                    file_url: publicUrl.publicUrl,
                    file_name: fileName,
                    uploaded_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (dbError) throw dbError;
        return mediaData as PlotMedia;
    } catch (error) {
        console.error('Error uploading media:', error);
        return null;
    }
}

export async function updatePlotStatus(plotId: string, status: 'available' | 'sold' | 'reserved') {
    try {
        const { data, error } = await supabase
            .from('plots')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', plotId)
            .select()
            .single();

        if (error) throw error;
        return data as Plot;
    } catch (error) {
        console.error('Error updating plot status:', error);
        return null;
    }
}

export async function updatePlotFacing(plotId: string, facing: string) {
    try {
        const { data, error } = await supabase
            .from('plots')
            .update({ facing, updated_at: new Date().toISOString() })
            .eq('id', plotId)
            .select()
            .single();

        if (error) throw error;
        return data as Plot;
    } catch (error) {
        console.error('Error updating plot facing:', error);
        return null;
    }
}