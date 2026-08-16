import { StoreTemplateInfo, StoreTemplateType } from '../../types';

export class StoreTemplateRegistry {
  public static availableStoreTemplates: StoreTemplateInfo[] = [
    {
      id: 'default-store',
      name: 'Default Storefront',
      description: 'Balanced modern storefront layout suitable for general retail & multi-category merchants.',
      category: 'General',
      defaultColors: { primary: '#059669', secondary: '#10b981' },
      previewImage: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'grocery',
      name: 'Fresh Grocery Supermarket',
      description: 'Aisle-based category layout, weight/unit badges, and fresh produce highlights.',
      category: 'Grocery & Fresh',
      defaultColors: { primary: '#16a34a', secondary: '#22c55e' },
      previewImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'fashion',
      name: 'Boutique & Fashion Lookbook',
      description: 'Visual fashion grid with hero banner, high-resolution photo focus, and style variants.',
      category: 'Apparel & Style',
      defaultColors: { primary: '#7c3aed', secondary: '#a855f7' },
      previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'restaurant',
      name: 'Gourmet Food & Restaurant Menu',
      description: 'Menu category navigation, dietary badges (Veg/Non-veg), and preparation time estimates.',
      category: 'Food & Dining',
      defaultColors: { primary: '#ea580c', secondary: '#f97316' },
      previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'minimalist',
      name: 'Minimalist Artisan Store',
      description: 'Clean single-column layout with high contrast typography and minimalist spacing.',
      category: 'Artisan & Specialty',
      defaultColors: { primary: '#0f172a', secondary: '#334155' },
      previewImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    },
  ];

  public static getTemplateInfo(templateId: StoreTemplateType): StoreTemplateInfo {
    return (
      this.availableStoreTemplates.find((t) => t.id === templateId) ||
      this.availableStoreTemplates[0]
    );
  }
}
