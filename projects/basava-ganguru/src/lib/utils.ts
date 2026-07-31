// Price calculation utilities
export const PRICE_PER_SQFT = 2300;

export function calculatePlotPrice(areaSqft: number): number {
    return Math.round(areaSqft * PRICE_PER_SQFT);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatArea(areaSqft: number): string {
    const areaSqm = (areaSqft * 0.092903).toFixed(2);
    return `${areaSqft} sq.ft (${areaSqm} sq.m)`;
}

export function calculatePlotDimensions(width: number, depth: number) {
    const areaSqft = Math.round(width * depth * 10.764); // Convert m² to sq.ft
    const areaSqm = (width * depth).toFixed(2);
    const price = calculatePlotPrice(areaSqft);

    return {
        width,
        depth,
        areaSqft,
        areaSqm: parseFloat(areaSqm),
        price,
        priceFormatted: formatPrice(price),
    };
}

export function getPlotCoordinates(plotNumber: number, centerLat: number, centerLng: number) {
    // Create slight offset for each plot (visual representation on map)
    const offsetAmount = 0.0002; // Small offset for visual separation
    const row = Math.floor((plotNumber - 1) / 8);
    const col = (plotNumber - 1) % 8;

    return {
        lat: centerLat + (row * offsetAmount),
        lng: centerLng + (col * offsetAmount),
    };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(getFileExtension(fileName));
}

export function isVideoFile(fileName: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'webm', 'mkv'];
    return videoExtensions.includes(getFileExtension(fileName));
}

export function sortPlotsByNumber(plots: any[]) {
    return [...plots].sort((a, b) => a.plot_number - b.plot_number);
}

export function filterPlotsByFacing(plots: any[], facing: string) {
    return plots.filter((plot) => plot.facing === facing);
}

export function filterPlotsByStatus(plots: any[], status: string) {
    return plots.filter((plot) => plot.status === status);
}

export function filterPlotsByPriceRange(plots: any[], minPrice: number, maxPrice: number) {
    return plots.filter((plot) => plot.total_price >= minPrice && plot.total_price <= maxPrice);
}

export function getPlotStats(plots: any[]) {
    const total = plots.length;
    const available = plots.filter((p) => p.status === 'available').length;
    const sold = plots.filter((p) => p.status === 'sold').length;
    const reserved = plots.filter((p) => p.status === 'reserved').length;
    const avgPrice = Math.round(plots.reduce((sum, p) => sum + p.total_price, 0) / total);
    const minPrice = Math.min(...plots.map((p) => p.total_price));
    const maxPrice = Math.max(...plots.map((p) => p.total_price));

    return {
        total,
        available,
        sold,
        reserved,
        avgPrice,
        minPrice,
        maxPrice,
    };
}