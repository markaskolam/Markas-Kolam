import React from 'react';
import ReactDOM from 'react-dom/client';
import { createWhatsAppLink, products } from './data/products';
import './styles.css';

const featuredProduct = products.find((product) => product.featured) ?? products[0];

function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#hero" aria-label="Markas Kolam beranda">
          Markas Kolam
        </a>
        <nav className="nav-links" aria-label="Navigasi utama">
          <a href="#about">Tentang</a>
          <a href="#catalog">E-Catalog</a>
          <a href="#contact">Kontak</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-content">
            <p className="eyebrow">Ikan konsumsi segar & siap pesan</p>
            <h1>Markas Kolam menyediakan ikan pilihan untuk meja makan terbaik Anda.</h1>
            <p>
              Dapatkan ikan konsumsi berkualitas dengan kesegaran terjaga, cocok untuk kebutuhan
              keluarga, usaha kuliner, hingga rumah makan.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#catalog">
                Lihat Katalog
              </a>
              <a
                className="button button-secondary"
                href={createWhatsAppLink('Halo Markas Kolam, saya ingin tanya katalog ikan.')}
                target="_blank"
                rel="noreferrer"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>
          <div className="hero-card" aria-label="Produk unggulan Markas Kolam">
            <span>Produk Unggulan</span>
            <strong>{featuredProduct.name}</strong>
            <p>{featuredProduct.description}</p>
          </div>
        </section>

        <section className="section about" id="about">
          <div>
            <p className="section-label">Tentang Bisnis</p>
            <h2>Penjual ikan konsumsi yang mengutamakan kesegaran.</h2>
          </div>
          <p>
            Markas Kolam adalah penyedia ikan konsumsi untuk pelanggan rumahan dan pelaku usaha
            kuliner. Kami membantu pelanggan mendapatkan ikan yang segar, bersih, dan siap diolah
            menjadi berbagai menu favorit.
          </p>
        </section>

        <section className="section featured" aria-labelledby="featured-title">
          <div className="section-heading">
            <p className="section-label">Produk Unggulan</p>
            <h2 id="featured-title">{featuredProduct.name}</h2>
            <p>{featuredProduct.description}</p>
          </div>
          <a
            className="button button-primary"
            href={createWhatsAppLink(featuredProduct.whatsappMessage)}
            target="_blank"
            rel="noreferrer"
          >
            Pesan Produk Unggulan
          </a>
        </section>

        <section className="section advantages" aria-labelledby="advantages-title">
          <div className="section-heading">
            <p className="section-label">Keunggulan</p>
            <h2 id="advantages-title">Alasan memilih Markas Kolam</h2>
          </div>
          <div className="advantage-grid">
            <article>
              <h3>Segar</h3>
              <p>Ikan ditangani dengan baik agar tetap segar saat sampai ke pelanggan.</p>
            </article>
            <article>
              <h3>Kualitas Terjaga</h3>
              <p>Produk dipilih untuk menjaga mutu, rasa, dan kepuasan pelanggan.</p>
            </article>
            <article>
              <h3>Cocok untuk Konsumsi</h3>
              <p>Ideal untuk menu keluarga, katering, warung makan, hingga rumah makan.</p>
            </article>
          </div>
        </section>

        <section className="section catalog" id="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <p className="section-label">E-Catalog</p>
            <h2 id="catalog-title">Katalog produk Markas Kolam</h2>
            <p>Pilih produk dan hubungi kami melalui WhatsApp untuk informasi stok dan harga.</p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <strong>{product.price}</strong>
                <a
                  className="button button-primary"
                  href={createWhatsAppLink(product.whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pesan via WhatsApp
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section contact" id="contact">
          <p className="section-label">Kontak</p>
          <h2>Siap pesan ikan segar hari ini?</h2>
          <p>Hubungi Markas Kolam melalui WhatsApp untuk pemesanan, stok, dan harga terbaru.</p>
          <a
            className="button button-light"
            href={createWhatsAppLink('Halo Markas Kolam, saya ingin pesan ikan konsumsi.')}
            target="_blank"
            rel="noreferrer"
          >
            Hubungi WhatsApp
          </a>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
