/**
 * Utility functions for image viewer
 */

export interface Point {
    x: number;
    y: number;
}

export interface Annotation {
    id: string;
    type: 'arrow' | 'rect' | 'text';
    points?: number[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    color: string;
}

export interface ImageAdjustments {
    brightness: number;  // -100 to 100
    contrast: number;    // -100 to 100
    scale: number;       // zoom level
    position: Point;     // pan position
}

/**
 * Calculate zoom factor from wheel delta
 */
export function calculateZoom(currentScale: number, delta: number): number {
    const scaleBy = 1.1;
    const newScale = delta > 0 ? currentScale * scaleBy : currentScale / scaleBy;

    // Limit zoom between 0.5x and 5x
    return Math.max(0.5, Math.min(5, newScale));
}

/**
 * Apply brightness and contrast to image data
 */
export function applyImageAdjustments(
    imageData: ImageData,
    brightness: number,
    contrast: number
): ImageData {
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        // Apply contrast
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;

        // Apply brightness
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;

        // Clamp values
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }

    return imageData;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between three points (in degrees)
 */
export function calculateAngle(p1: Point, vertex: Point, p2: Point): number {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = (angle2 - angle1) * (180 / Math.PI);

    if (angle < 0) {
        angle += 360;
    }

    return angle;
}

/**
 * Generate unique ID for annotations
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert canvas to blob for download
 */
export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to convert canvas to blob'));
            }
        }, 'image/png');
    });
}

/**
 * Download image with annotations
 */
export async function downloadAnnotatedImage(
    canvas: HTMLCanvasElement,
    filename: string
): Promise<void> {
    try {
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download image:', error);
        throw error;
    }
}
