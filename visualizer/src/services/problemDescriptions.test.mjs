import test from 'node:test';
import assert from 'node:assert/strict';
import { createProblemDescriptionStore } from './problemDescriptions.js';

const json = (content) => new Response(JSON.stringify({ content, exampleTestcases: '' }), {
  headers: { 'content-type': 'application/json' },
});

test('loads only the requested slug, shares requests, and caches results', async () => {
  const urls = [];
  const store = createProblemDescriptionStore(async (url) => {
    urls.push(url);
    return json('Two Sum');
  });
  assert.deepEqual(urls, []);
  const first = store.load('two-sum');
  assert.equal(store.load('two-sum'), first);
  await first;
  await store.load('two-sum');
  assert.deepEqual(urls, ['/data/descriptions/two-sum.json']);
  assert.equal(store.getSnapshot('two-sum').description.content, 'Two Sum');
});

test('late responses and notifications remain scoped to their problem', async () => {
  const resolve = {};
  const store = createProblemDescriptionStore((url) => new Promise((done) => { resolve[url] = done; }));
  const slow = store.load('slow');
  const fast = store.load('fast');
  await Promise.resolve();
  resolve['/data/descriptions/fast.json'](json('fast'));
  await fast;
  let fastUpdates = 0;
  const unsubscribe = store.subscribe('fast', () => { fastUpdates++; });
  resolve['/data/descriptions/slow.json'](json('slow'));
  await slow;
  assert.equal(store.getSnapshot('fast').description.content, 'fast');
  assert.equal(fastUpdates, 0);
  unsubscribe();
});

test('missing files and SPA fallback HTML are cached as missing', async () => {
  for (const response of [new Response('', { status: 404 }), new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
  })]) {
    let calls = 0;
    const store = createProblemDescriptionStore(async () => { calls++; return response; });
    assert.equal((await store.load('missing')).status, 'missing');
    await store.load('missing');
    assert.equal(calls, 1);
  }
});

test('failed requests can be retried and invalid slugs make no request', async () => {
  for (const failure of [() => { throw new Error('offline'); },
    () => new Response('', { status: 503 }),
    () => new Response('{}'),
    () => new Response('invalid JSON')]) {
    let calls = 0;
    const store = createProblemDescriptionStore(async () => ++calls === 1 ? failure() : json('recovered'));
    await store.load(null);
    await store.load('../escape');
    assert.equal(calls, 0);
    assert.equal((await store.load('two-sum')).status, 'error');
    assert.equal((await store.load('two-sum')).status, 'ready');
    assert.equal(calls, 2);
  }
});
