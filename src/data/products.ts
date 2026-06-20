export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  whatsappMessage: string;
  useCases: string[];
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: 'gurame-padang',
    name: 'Gurame Padang',
    category: 'Ikan',
    description: 'Gurame Padang fresh untuk makan, budidaya, atau jadi koleksi kolam.',
    useCases: ['Konsumsi', 'Budidaya', 'Koleksi'],
    price: 'DM untuk harga',
    whatsappMessage:
      'Halo Markas Kolam, saya ingin tanya/pesan Gurame Padang untuk konsumsi, budidaya, atau koleksi.',
    featured: true,
  },
];

export const whatsappNumber = '6281234567890';

export const createWhatsAppLink = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
