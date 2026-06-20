import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const forbiddenPattern = /\b(drop|truncate|alter|delete|update|insert|upsert|merge|grant|revoke|create|replace|copy|execute|call|comment|vacuum|analyze)\b/i;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeQuery = (query: unknown) => (typeof query === 'string' ? query.trim() : '');

const assertSafeSql = (query: string) => {
  if (!query) throw new Error('Query wajib diisi.');
  if (query.length > 5000) throw new Error('Query terlalu panjang. Maksimal 5000 karakter.');
  const withoutTrailingSemicolon = query.replace(/;\s*$/, '');
  if (withoutTrailingSemicolon.includes(';')) throw new Error('Multi-statement SQL tidak diizinkan.');
  if (!/^select\b/i.test(withoutTrailingSemicolon)) throw new Error('SQL editor ini hanya mengizinkan statement SELECT read-only.');
  if (forbiddenPattern.test(withoutTrailingSemicolon)) throw new Error('Statement berbahaya tidak diizinkan di SQL editor admin.');
  return `select * from (${withoutTrailingSemicolon}) as admin_sql_editor_limited limit 100`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method tidak didukung.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Environment Supabase function belum lengkap.' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;

  if (userError || !user) return jsonResponse({ error: 'Akses hanya untuk admin terautentikasi.' }, 403);

  const { data: adminProfile, error: adminProfileError } = await adminClient
    .from('admin_profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminProfileError || !adminProfile) return jsonResponse({ error: 'Akses hanya untuk admin terautentikasi.' }, 403);

  let query = '';
  try {
    const body = await req.json();
    query = normalizeQuery(body?.query);
    const safeQuery = assertSafeSql(query);

    const { data, error } = await adminClient.rpc('admin_execute_readonly_sql', { sql_query: safeQuery });
    await adminClient.from('admin_audit_logs').insert({ user_id: user.id, action: error ? 'sql_editor.error' : 'sql_editor.run', sql: query });

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ rows: data ?? [] });
  } catch (error) {
    if (query) {
      await adminClient.from('admin_audit_logs').insert({
        user_id: user.id,
        action: 'sql_editor.rejected',
        sql: query,
      });
    }
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
