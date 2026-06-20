type QueryOptions = {
  select?: string;
  eq?: [string, string];
  maybeSingle?: boolean;
  orders?: Array<{ column: string; ascending: boolean }>;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const storageKey = 'markas-kolam-supabase-session';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const getSessionFromStorage = () => {
  const rawSession = window.localStorage.getItem(storageKey);
  return rawSession ? JSON.parse(rawSession) : null;
};

const setSessionInStorage = (session: unknown) => {
  if (session) window.localStorage.setItem(storageKey, JSON.stringify(session));
  else window.localStorage.removeItem(storageKey);
};

const request = async (path: string, init: RequestInit = {}, useAuth = false) => {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase belum dikonfigurasi.');

  const session = getSessionFromStorage();
  const token = useAuth && session?.access_token ? session.access_token : supabaseAnonKey;
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...init.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return { data: null, error: new Error(data?.msg || data?.message || response.statusText) };
  }

  return { data, error: null };
};

const buildPath = (table: string, options: QueryOptions) => {
  const params = new URLSearchParams();
  params.set('select', options.select ?? '*');
  options.orders?.forEach((order) => params.append('order', `${order.column}.${order.ascending ? 'asc' : 'desc'}`));
  if (options.eq) params.set(options.eq[0], `eq.${options.eq[1]}`);
  if (options.maybeSingle) params.set('limit', '1');
  return `/rest/v1/${table}?${params.toString()}`;
};

const tableClient = (table: string) => ({
  select(select = '*') {
    const options: QueryOptions = { select, orders: [] };
    const run = () => request(buildPath(table, options));
    return {
      order(column: string, config: { ascending: boolean }) {
        options.orders?.push({ column, ascending: config.ascending });
        return this;
      },
      eq(column: string, value: string) {
        options.eq = [column, value];
        return this;
      },
      maybeSingle() {
        options.maybeSingle = true;
        return run().then(({ data, error }) => ({ data: Array.isArray(data) ? data[0] ?? null : data, error }));
      },
      then(resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
        return run().then(resolve, reject);
      },
    };
  },
  insert(payload: unknown) {
    return request(`/rest/v1/${table}`, { method: 'POST', body: JSON.stringify(payload) }, true);
  },
  upsert(payload: unknown) {
    return request(`/rest/v1/${table}`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }, true);
  },
  update(payload: unknown) {
    return {
      eq(column: string, value: string) {
        return request(`/rest/v1/${table}?${column}=eq.${value}`, { method: 'PATCH', body: JSON.stringify(payload) }, true);
      },
    };
  },
  delete() {
    return {
      eq(column: string, value: string) {
        return request(`/rest/v1/${table}?${column}=eq.${value}`, { method: 'DELETE' }, true);
      },
    };
  },
});

export const supabase = {
  from: tableClient,
  auth: {
    async getSession() {
      return { data: { session: getSessionFromStorage() }, error: null };
    },
    onAuthStateChange(callback: (_event: string, session: unknown) => void) {
      callback('INITIAL_SESSION', getSessionFromStorage());
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      const { data, error } = await request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (!error) setSessionInStorage(data);
      return { data, error };
    },
    async signOut() {
      setSessionInStorage(null);
      window.location.reload();
      return { error: null };
    },
  },
};
