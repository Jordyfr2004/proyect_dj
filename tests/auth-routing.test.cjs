const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function loadSource(file, mocks) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: module.exports, module, URL,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-only' } },
    require: name => name in mocks ? mocks[name] : require(name),
  }, { filename: file });
  return module.exports;
}
function setupProxy({ user = null, cookies = [], throws = false } = {}) {
  return loadSource('proxy.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => ({ auth: { getUser: async () => {
      if (cookies.length) options.cookies.setAll(cookies);
      if (throws) throw new Error('Offline');
      return { data: { user } };
    } } }) },
  }).proxy;
}
const request = pathname => new NextRequest(`https://zonamix.example${pathname}`);

test('signed-out visitors can open both home and login', async () => {
  const proxy = setupProxy();
  for (const url of ['/', '/auth/login']) {
    const response = await proxy(request(url));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});
test('protected pages redirect to login, preserving the intended path and query', async () => {
  const response = await setupProxy()(request('/platform/explorar?genre=house'));
  const location = new URL(response.headers.get('location'));
  assert.equal(location.pathname, '/auth/login');
  assert.equal(location.searchParams.get('redirectTo'), '/platform/explorar?genre=house');
});
test('authenticated visitors keep existing platform redirections', async () => {
  const proxy = setupProxy({ user: { id: 'user' } });
  for (const url of ['/', '/auth/login', '/auth/register']) {
    assert.equal(new URL((await proxy(request(url))).headers.get('location')).pathname, '/platform');
  }
  assert.equal((await proxy(request('/platform'))).status, 200);
});
test('refreshed cookie values and options survive redirects', async () => {
  const response = await setupProxy({ user: { id: 'user' }, cookies: [{ name: 'sb-test-auth-token', value: 'refreshed', options: { maxAge: 5000, path: '/', sameSite: 'lax' } }] })(request('/auth/login'));
  assert.equal(response.cookies.get('sb-test-auth-token').value, 'refreshed');
  assert.equal(response.cookies.get('sb-test-auth-token').maxAge, 5000);
});
test('cookie deletion survives redirects without being changed to a one-day lifetime', async () => {
  const response = await setupProxy({ cookies: [{ name: 'sb-test-auth-token.0', value: '', options: { maxAge: 0, path: '/' } }] })(request('/platform'));
  assert.equal(response.cookies.get('sb-test-auth-token.0').maxAge, 0);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
});
test('refreshed cookies are forwarded to downstream server components', async () => {
  const response = await setupProxy({ user: { id: 'user' }, cookies: [{ name: 'sb-test-auth-token', value: 'new', options: { path: '/' } }] })(request('/platform'));
  assert.match(response.headers.get('x-middleware-request-cookie'), /sb-test-auth-token=new/);
});
test('auth service failure keeps public pages available but protects platform', async () => {
  const proxy = setupProxy({ throws: true });
  assert.equal((await proxy(request('/'))).status, 200);
  assert.equal((await proxy(request('/auth/login'))).status, 200);
  assert.equal(new URL((await proxy(request('/platform'))).headers.get('location')).pathname, '/auth/login');
});
test('logout endpoint reports Supabase errors instead of false success', async () => {
  for (const error of [null, { message: 'Service unavailable' }]) {
    const { POST } = loadSource('app/api/logout/route.ts', {
      'next/headers': { cookies: async () => ({ getAll: () => [], set() {} }) },
      '@supabase/ssr': { createServerClient: () => ({ auth: { signOut: async () => ({ error }) } }) },
    });
    const response = await POST();
    assert.equal(response.status, error ? 500 : 200);
    const data = await response.json();
    assert.equal(data.success, error ? undefined : true);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});
