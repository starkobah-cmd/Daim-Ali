export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'logo' | 'banner' | 'blog' | 'avatar' | 'icon' | 'other';
  sizeFormatted: string;
  dimensions?: string;
  uploadedAt: string;
  altText?: string;
  fileSize?: number;
}

export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    title: 'Web Design & Engineering Showcase',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    type: 'blog',
    sizeFormatted: '420 KB',
    dimensions: '1200 x 800 px',
    uploadedAt: '2026-08-01',
    altText: 'Web Design Analytics Dashboard on Laptop'
  },
  {
    id: 'media-2',
    title: 'SEO Analytics & Ranking Audit',
    url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1200&q=80',
    type: 'blog',
    sizeFormatted: '380 KB',
    dimensions: '1200 x 800 px',
    uploadedAt: '2026-08-01',
    altText: 'SEO Growth Metrics and Charting'
  },
  {
    id: 'media-3',
    title: 'Video Production & Reel Studio',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    type: 'blog',
    sizeFormatted: '510 KB',
    dimensions: '1200 x 800 px',
    uploadedAt: '2026-08-02',
    altText: 'Professional Video Editing Suite'
  },
  {
    id: 'media-4',
    title: 'Brand Identity & Guidelines',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    type: 'banner',
    sizeFormatted: '490 KB',
    dimensions: '1200 x 800 px',
    uploadedAt: '2026-08-02',
    altText: 'Color Swatches and Modern Logo Mockup'
  },
  {
    id: 'media-5',
    title: 'Web UX Engineering',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    type: 'blog',
    sizeFormatted: '440 KB',
    dimensions: '1200 x 800 px',
    uploadedAt: '2026-08-03',
    altText: 'iOS and Android Smartphone Wireframe UI'
  },
  {
    id: 'media-6',
    title: 'Netronomic Agency Glowing Orb Logo',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    type: 'logo',
    sizeFormatted: '180 KB',
    dimensions: '600 x 600 px',
    uploadedAt: '2026-08-01',
    altText: 'Abstract Glowing Cyan Orb Emblem'
  },
  {
    id: 'media-7',
    title: 'Editorial Team Author Avatar 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    type: 'avatar',
    sizeFormatted: '95 KB',
    dimensions: '300 x 300 px',
    uploadedAt: '2026-08-01',
    altText: 'Content Strategist Headshot'
  },
  {
    id: 'media-8',
    title: 'Lead Architect Author Avatar 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    type: 'avatar',
    sizeFormatted: '110 KB',
    dimensions: '300 x 300 px',
    uploadedAt: '2026-08-01',
    altText: 'Engineering Lead Headshot'
  },
  {
    id: 'media-9',
    title: 'OpenGraph Social Share Banner',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    type: 'banner',
    sizeFormatted: '530 KB',
    dimensions: '1200 x 630 px',
    uploadedAt: '2026-08-02',
    altText: 'SaaS Analytics Dashboard Hero Graphic'
  }
];

export const MEDIA_STORAGE_KEY = 'netronomic_media_library_v2';

export function getStoredMediaLibrary(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA_ITEMS));
      return DEFAULT_MEDIA_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_MEDIA_ITEMS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load media library:', err);
    return DEFAULT_MEDIA_ITEMS;
  }
}

export function saveMediaLibrary(items: MediaItem[]): void {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save media library:', err);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function processFileToMediaItem(file: File, category: MediaItem['type'] = 'image'): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Compress image to avoid QuotaExceeded
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = category === 'logo' || category === 'icon' || category === 'avatar' ? 400 : 1200;
        const MAX_HEIGHT = category === 'logo' || category === 'icon' || category === 'avatar' ? 400 : 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
          
          const newItem: MediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: compressedDataUrl,
            type: category,
            sizeFormatted: formatFileSize(Math.round(compressedDataUrl.length * 0.75)),
            fileSize: Math.round(compressedDataUrl.length * 0.75),
            dimensions: `${Math.round(width)} x ${Math.round(height)} px`,
            uploadedAt: new Date().toISOString().split('T')[0],
            altText: file.name.replace(/\.[^/.]+$/, '')
          };
          resolve(newItem);
        } else {
          resolve({
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: file.name,
            url: dataUrl,
            type: category,
            sizeFormatted: formatFileSize(file.size),
            fileSize: file.size,
            dimensions: 'Unknown',
            uploadedAt: new Date().toISOString().split('T')[0]
          });
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
