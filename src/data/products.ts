export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  whatsappMessage: string;
  useCases: string[];
  featured: boolean;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: string | null;
  use_cases: string[] | null;
  whatsapp_message: string | null;
  featured: boolean | null;
  created_at?: string;
};

export const whatsappNumber = '6281234567890';

export const createWhatsAppLink = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

export const mapProductRow = (product: ProductRow): Product => ({
  id: product.id,
  name: product.name,
  category: product.category,
  description: product.description ?? '',
  price: product.price ?? '',
  whatsappMessage: product.whatsapp_message ?? '',
  useCases: product.use_cases ?? [],
  featured: Boolean(product.featured),
});
