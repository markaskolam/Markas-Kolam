import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createWhatsAppLink, mapProductRow, type Product, type ProductRow } from './data/products';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './styles.css';

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

type QueryHistoryItem = {
  query: string;
  createdAt: string;
};

type QueryRow = Record<string, unknown>;

type SiteContent = {
  headline: string;
  description: string;
  ctaLabel: string;
  ctaWhatsAppMessage: string;
  whatsappContactMessage: string;
};

type ProductFormState = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  useCases: string;
  whatsappMessage: string;
  featured: boolean;
};

const defaultSiteContent: SiteContent = {
  headline: 'Ikan fresh buat makan, ternak, atau koleksi.',
  description: 'Markas Kolam jual ikan sehat untuk dapur, kolam budidaya, dan koleksi.',
  ctaLabel: 'Buka E-Katalog',
  ctaWhatsAppMessage: 'Halo Markas Kolam, saya mau tanya stok ikan hari ini.',
  whatsappContactMessage: 'Halo Markas Kolam, saya mau tanya stok Gurame Padang hari ini.',
};

const defaultProduct: Product = {
  id: 'preview-product',
  name: 'Produk belum tersedia',
  category: 'Ikan',
  description: 'Produk akan tampil setelah data Supabase ditambahkan.',
  price: 'Hubungi admin',
  whatsappMessage: defaultSiteContent.whatsappContactMessage,
  useCases: ['Konsumsi', 'Budidaya', 'Koleksi'],
  featured: true,
};

const emptyForm: ProductFormState = {
  name: '',
  category: '',
  description: '',
  price: '',
  useCases: '',
  whatsappMessage: '',
  featured: false,
};

const perks = ['Fresh', 'Quality check', 'Makan / budidaya / koleksi'];

const paths = {
  home: '/',
  catalog: '/ekatalog/index.html',
  admin: '/admin',
};

const toProductPayload = (form: ProductFormState) => ({
  name: form.name.trim(),
  category: form.category.trim(),
  description: form.description.trim() || null,
  price: form.price.trim() || null,
  use_cases: form.useCases
    .split(',')
    .map((useCase) => useCase.trim())
    .filter(Boolean),
  whatsapp_message: form.whatsappMessage.trim() || null,
  featured: form.featured,
});

const toProductForm = (product: Product): ProductFormState => ({
  id: product.id,
  name: product.name,
  category: product.category,
  description: product.description,
  price: product.price,
  useCases: product.useCases.join(', '),
  whatsappMessage: product.whatsappMessage,
  featured: product.featured,
});

async function fetchProducts() {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');

  const { data, error } = (await supabase
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })) as { data: ProductRow[] | null; error: Error | null };

  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

async function fetchSiteContent() {
  if (!isSupabaseConfigured) return defaultSiteContent;

  const { data, error } = (await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'landing_page')
    .maybeSingle()) as { data: { value: Partial<SiteContent> } | null; error: Error | null };

  if (error) throw error;
  return { ...defaultSiteContent, ...((data?.value as Partial<SiteContent> | null) ?? {}) };
}

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
        <a href={paths.admin}>Admin</a>
      </nav>
    </header>
  );
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
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

function usePublicData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSiteContent()])
      .then(([productData, contentData]) => {
        setProducts(productData);
        setSiteContent(contentData);
      })
      .catch((fetchError: Error) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, []);

  return { products, siteContent, loading, error };
}

function HomePage() {
  const { products, siteContent, loading, error } = usePublicData();
  const featuredProduct = products.find((product) => product.featured) ?? products[0] ?? defaultProduct;

  return (
    <>
      <Navbar />
      <main>
        {(loading || error || !isSupabaseConfigured) && (
          <div className="status-bar">
            {loading && 'Memuat data katalog...'}
            {error && `Gagal memuat data: ${error}`}
            {!isSupabaseConfigured && 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'}
          </div>
        )}
        <section className="hero" id="hero">
          <div className="hero-content">
            <p className="eyebrow">Fresh fish drop</p>
            <h1>{siteContent.headline}</h1>
            <div className="hero-actions">
              <a className="button button-primary" href={paths.catalog}>
                {siteContent.ctaLabel}
              </a>
              <a
                className="button button-secondary"
                href={createWhatsAppLink(siteContent.ctaWhatsAppMessage)}
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
          <p>{siteContent.description}</p>
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
            href={createWhatsAppLink(siteContent.whatsappContactMessage)}
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
  const { products, loading, error } = usePublicData();

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
          {loading && <p className="admin-message">Memuat produk...</p>}
          {error && <p className="admin-message error">Gagal memuat produk: {error}</p>}
          {!loading && products.length === 0 && <p className="admin-message">Belum ada produk.</p>}
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

async function fetchAdminProducts() {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');

  const { data, error } = (await supabase.rpc('admin_list_products')) as { data: ProductRow[] | null; error: Error | null };
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

function SqlEditor() {
  const [query, setQuery] = useState('select id, name, category, featured, created_at from products order by created_at desc');
  const [rows, setRows] = useState<QueryRow[]>([]);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const columns = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row)))), [rows]);

  const handleRun = async () => {
    setRunning(true);
    setError('');
    setRows([]);
    const { data, error: invokeError } = await supabase.functions.invoke('admin-sql-editor', { body: { query } });
    setRunning(false);

    if (invokeError || data?.error) {
      setError(invokeError?.message ?? data.error);
      return;
    }

    const resultRows = Array.isArray(data?.rows) ? (data.rows as QueryRow[]) : [];
    setRows(resultRows);
    setHistory((items) => [{ query, createdAt: new Date().toISOString() }, ...items].slice(0, 8));
  };

  return (
    <section className="admin-panel sql-editor">
      <div>
        <p className="section-label">SQL Editor</p>
        <h2>Query read-only admin</h2>
        <p>Query dikirim ke Supabase Edge Function, service role key tetap di server, dan hanya SELECT tunggal yang dijalankan.</p>
      </div>
      <textarea value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} />
      <button className="button button-primary" type="button" onClick={handleRun} disabled={running || !query.trim()}>
        {running ? 'Menjalankan...' : 'Run query'}
      </button>
      {error && <pre className="sql-error">{error}</pre>}
      {rows.length > 0 && (
        <div className="sql-result-wrap">
          <table className="sql-result">
            <thead>
              <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="query-history">
        <h3>Riwayat query</h3>
        {history.length === 0 && <p>Belum ada query pada sesi ini.</p>}
        {history.map((item) => (
          <button key={`${item.createdAt}-${item.query}`} type="button" onClick={() => setQuery(item.query)}>
            <code>{item.query}</code>
            <span>{new Date(item.createdAt).toLocaleString('id-ID')}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productData, contentData] = await Promise.all([fetchAdminProducts(), fetchSiteContent()]);
      setProducts(productData);
      setSiteContent(contentData);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.');
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!session) {
        setIsAdmin(false);
        setAdminChecked(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setAdminChecked(false);
      const { data, error: adminError } = await supabase.rpc('is_admin');
      const allowed = !adminError && data === true;
      setIsAdmin(allowed);
      setAdminChecked(true);
      if (allowed) void loadAdminData();
      else {
        setError('Akses /admin hanya untuk user dengan app_metadata role admin.');
        setLoading(false);
      }
    };

    void verifyAdmin();
  }, [session]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError(authError.message);
    else setMessage('Login berhasil.');
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error: saveError } = await supabase.from('site_settings').upsert({
      key: 'landing_page',
      value: siteContent,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);
    if (saveError) setError(saveError.message);
    else setMessage('Konten landing page berhasil disimpan.');
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const payload = toProductPayload(form);
    const request = isEditing
      ? supabase.from('products').update(payload).eq('id', form.id)
      : supabase.from('products').insert(payload);
    const { error: saveError } = await request;
    if (saveError) setError(saveError.message);
    else {
      setMessage(isEditing ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
      setForm(emptyForm);
      await loadAdminData();
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Hapus produk ${product.name}?`)) return;
    setLoading(true);
    setError('');
    setMessage('');
    const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
    if (deleteError) setError(deleteError.message);
    else {
      setMessage('Produk berhasil dihapus.');
      await loadAdminData();
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="admin-page">
          <section className="admin-panel auth-panel">
            <p className="section-label">Admin</p>
            <h1>Login Admin</h1>
            <p>Masuk dengan akun Supabase Auth sebelum mengubah produk atau konten landing page.</p>
            <form className="admin-form" onSubmit={handleLogin}>
              <label>
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="button button-primary" type="submit" disabled={loading || !isSupabaseConfigured}>
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>
            {message && <p className="admin-message success">{message}</p>}
            {error && <p className="admin-message error">{error}</p>}
          </section>
        </main>
      </>
    );
  }

  if (adminChecked && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="admin-page">
          <section className="admin-panel auth-panel">
            <p className="section-label">Admin</p>
            <h1>Akses ditolak</h1>
            <p>SQL editor dan dashboard admin hanya tersedia untuk akun Supabase Auth yang diberi peran admin.</p>
            {error && <p className="admin-message error">{error}</p>}
            <button className="button button-secondary" type="button" onClick={() => supabase.auth.signOut()}>
              Logout
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-header">
          <div>
            <p className="section-label">Dashboard</p>
            <h1>Admin Markas Kolam</h1>
            <p>Edit konten landing page dan kelola produk e-katalog dari Supabase.</p>
          </div>
          <button className="button button-secondary" type="button" onClick={() => supabase.auth.signOut()}>
            Logout
          </button>
        </section>

        {loading && <p className="admin-message">Memproses...</p>}
        {message && <p className="admin-message success">{message}</p>}
        {error && <p className="admin-message error">{error}</p>}

        <div className="admin-grid">
          <section className="admin-panel">
            <h2>Edit Landing Page</h2>
            <form className="admin-form" onSubmit={handleSaveSettings}>
              <label>
                Headline
                <textarea
                  value={siteContent.headline}
                  onChange={(event) => setSiteContent({ ...siteContent, headline: event.target.value })}
                  required
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  value={siteContent.description}
                  onChange={(event) => setSiteContent({ ...siteContent, description: event.target.value })}
                  required
                />
              </label>
              <label>
                Label CTA
                <input
                  value={siteContent.ctaLabel}
                  onChange={(event) => setSiteContent({ ...siteContent, ctaLabel: event.target.value })}
                  required
                />
              </label>
              <label>
                Pesan CTA WhatsApp
                <textarea
                  value={siteContent.ctaWhatsAppMessage}
                  onChange={(event) => setSiteContent({ ...siteContent, ctaWhatsAppMessage: event.target.value })}
                  required
                />
              </label>
              <label>
                Kontak WhatsApp
                <textarea
                  value={siteContent.whatsappContactMessage}
                  onChange={(event) => setSiteContent({ ...siteContent, whatsappContactMessage: event.target.value })}
                  required
                />
              </label>
              <button className="button button-primary" type="submit" disabled={loading}>
                Simpan Konten
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <h2>{isEditing ? 'Ubah Produk' : 'Tambah Produk'}</h2>
            <form className="admin-form" onSubmit={handleSaveProduct}>
              <label>
                Nama Produk
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
              <label>
                Kategori
                <input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  required
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
              <label>
                Harga
                <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </label>
              <label>
                Use cases (pisahkan dengan koma)
                <input value={form.useCases} onChange={(event) => setForm({ ...form, useCases: event.target.value })} />
              </label>
              <label>
                Pesan WhatsApp Produk
                <textarea
                  value={form.whatsappMessage}
                  onChange={(event) => setForm({ ...form, whatsappMessage: event.target.value })}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                />
                Jadikan featured
              </label>
              <div className="admin-actions">
                <button className="button button-primary" type="submit" disabled={loading}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
                {isEditing && (
                  <button className="button button-secondary" type="button" onClick={() => setForm(emptyForm)}>
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        <SqlEditor />

        <section className="admin-panel product-manager">
          <h2>Produk E-Katalog</h2>
          <div className="admin-product-list">
            {products.map((product) => (
              <article className="admin-product-item" key={product.id}>
                <div>
                  <span>{product.category}</span>
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                </div>
                <div className="admin-actions">
                  <button className="button button-secondary" type="button" onClick={() => setForm(toProductForm(product))}>
                    Ubah
                  </button>
                  <button className="button danger-button" type="button" onClick={() => handleDeleteProduct(product)}>
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  const pathname = window.location.pathname;

  if (pathname === paths.admin) return <AdminPage />;
  if (pathname.startsWith(paths.catalog)) return <CatalogPage />;
  return <HomePage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
