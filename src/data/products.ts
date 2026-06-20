export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  whatsappMessage: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: 'gurame-padang',
    name: 'Gurame Padang',
    category: 'Ikan',
    description:
      'Ikan gurame konsumsi pilihan dengan daging tebal, rasa lezat, dan kualitas yang cocok untuk hidangan keluarga maupun kebutuhan rumah makan.',
    price: 'Hubungi kami untuk harga terbaru',
    whatsappMessage: 'Halo Markas Kolam, saya ingin pesan Gurame Padang.',
    featured: true,
  },
];

export const whatsappNumber = '6281234567890';

export const createWhatsAppLink = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
