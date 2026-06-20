import React from 'react';
import ReactDOM from 'react-dom/client';
import { createWhatsAppLink, products } from './data/products';
import './styles.css';

const featuredProduct = products.find((product) => product.featured) ?? products[0];
const perks = ['Fresh', 'Quality check', 'Makan / budidaya / koleksi'];

const paths = {
  home: '/',
  catalog: '/ekatalog/index.html',
};

function Navbar() {
  return (
    <header className="site-header">
      <a className="brand" href={paths.home} aria-label="Markas Kolam beranda">
        Markas Kolam
      </a>
      <nav className="nav-links" aria-label="Navigasi utama">
        <a href={paths.home}>Home</a>
        <a href={paths.catalog}>E-Katalog</a>
        <a href="/#perks">Keunggulan</a>
        <a href="/#contact">WA</a>
      </nav>
    </header>
  );
}

const ProductCard: React.FC<{ product: (typeof products)[number] }> = ({ product }) => {
  return (
    <article className="product-card">
      <span>{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-use-cases">
        {product.useCases.map((useCase) => (
          <span key={useCase}>{useCase}</span>
        ))}
      </div>
      <strong>{product.price}</strong>
      <a
        className="button button-primary"
        href={createWhatsAppLink(product.whatsappMessage)}
        target="_blank"
        rel="noreferrer"
      >
        Pesan via WA
      </a>
    </article>
  );
};

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero" id="hero">
          <div className="hero-content">
            <p className="eyebrow">Fresh fish drop</p>
            <h1>Ikan fresh buat makan, ternak, atau koleksi.</h1>
            <div className="hero-actions">
              <a className="button button-primary" href={paths.catalog}>
                Buka E-Katalog
              </a>
              <a
                className="button button-secondary"
                href={createWhatsAppLink('Halo Markas Kolam, saya mau tanya stok ikan hari ini.')}
                target="_blank"
                rel="noreferrer"
              >
                Chat WA
              </a>
            </div>
          </div>

          <article className="hero-card" aria-label="Produk unggulan Markas Kolam">
            <span>Featured</span>
            <strong>{featuredProduct.name}</strong>
            <p>{featuredProduct.description}</p>
            <div className="use-case-list" aria-label="Kegunaan produk unggulan">
              {featuredProduct.useCases.map((useCase) => (
                <span key={useCase}>{useCase}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="section intro" aria-label="Tentang Markas Kolam">
          <p>Markas Kolam jual ikan sehat untuk dapur, kolam budidaya, dan koleksi.</p>
        </section>

        <section className="section perks" id="perks" aria-labelledby="perks-title">
          <div className="section-heading compact-heading">
            <p className="section-label">Why us</p>
            <h2 id="perks-title">Singkat aja: ikan bagus, proses gampang.</h2>
          </div>
          <div className="perk-strip">
            {perks.map((perk) => (
              <span key={perk}>{perk}</span>
            ))}
          </div>
        </section>

        <section className="section contact" id="contact">
          <p className="section-label">Order</p>
          <h2>Mau stok hari ini?</h2>
          <a
            className="button button-light"
            href={createWhatsAppLink(
              'Halo Markas Kolam, saya mau tanya stok Gurame Padang hari ini.',
            )}
            target="_blank"
            rel="noreferrer"
          >
            Chat WhatsApp
          </a>
        </section>
      </main>
    </>
  );
}

function CatalogPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section catalog-page" aria-labelledby="catalog-title">
          <div className="section-heading compact-heading">
            <p className="section-label">E-Katalog</p>
            <h1 id="catalog-title">Ready list</h1>
            <p className="catalog-note">Pilih ikan, klik WA, selesai.</p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  const isCatalogPage = window.location.pathname.startsWith(paths.catalog);

  return isCatalogPage ? <CatalogPage /> : <HomePage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
