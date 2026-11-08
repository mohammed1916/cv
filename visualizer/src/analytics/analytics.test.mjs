import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseConsent, CONSENT_TTL } from './consent.js';

test('consent requires a current, explicit, versioned choice', () => {
  const now = 20000000000;
  for (const raw of [null, '{}', 'broken', JSON.stringify({version:1,choice:'granted',savedAt:now-CONSENT_TTL}), JSON.stringify({version:1,choice:'granted',savedAt:now+1})]) assert.equal(parseConsent(raw,now),null);
  for (const choice of ['granted','denied']) assert.equal(parseConsent(JSON.stringify({version:1,choice,savedAt:now}),now),choice);
});

test('analytics waits for consent, deduplicates pages, sanitizes, revokes and drops in-flight events', async () => {
  const values = new Map(), events = [], calls = [];
  globalThis.localStorage = {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  globalThis.window = {dispatchEvent:()=>{}};
  globalThis.location = {origin:'https://visualizer.pro',hostname:'visualizer.pro'};
  globalThis.document = {cookie:'',referrer:'https://example.com/private?email=secret'};
  let release;
  const supported = new Promise(resolve=>{release=resolve});
  globalThis.__analyticsMock = {
    isSupported:()=>supported, initializeAnalytics:(_,options)=>{calls.push(options);return {};},
    setConsent:()=>{},setAnalyticsCollectionEnabled:()=>{},setDefaultEventParameters:()=>{},
    logEvent:(_,name,params)=>events.push({name,params}),
  };
  const consentURL = new URL('./consent.js',import.meta.url).href;
  const code=(await readFile(new URL('./client.js',import.meta.url),'utf8'))
    .replace("'./consent.js'",JSON.stringify(consentURL))
    .replaceAll('import.meta.env','({PROD:true})')
    .replace("import('firebase/analytics')",'Promise.resolve(globalThis.__analyticsMock)')
    .replace("import('../access/firebase.js')",'Promise.resolve({firebaseApp:{}})');
  const client=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  await client.trackEvent('login',{method:'google'});
  assert.equal(calls.length,0);
  const page={path:'/problems/example',title:'Example'};
  await client.trackPage(page);
  client.setConsentChoice('granted');
  const stale=client.trackEvent('login',{method:'google'});
  client.setConsentChoice('denied');
  release(true); await stale;
  assert.equal(calls.length,0); assert.equal(events.length,0);
  client.setConsentChoice('granted');
  await client.trackPage(page);
  await client.trackPage({...page});
  assert.equal(events.filter(e=>e.name==='page_view').length,1);
  assert.equal(calls[0].config.send_page_view,false);
  assert.equal(calls[0].config.page_referrer,'https://example.com');
  await client.trackEvent('login',{method:'google',email:'secret',source:'private code'});
  assert.equal(events.at(-1).params.email,undefined);
  assert.equal(client.sanitizeEvent('unknown',{anything:'secret'}),null);
  assert.equal(client.sanitizeEvent('purchase',{value:100,currency:'INR'}),null);
  const count=events.length;
  client.setConsentChoice('denied');
  await client.trackEvent('visualization_start');
  assert.equal(events.length,count);
  assert.equal(window['ga-disable-G-N7TMKW7YXH'],true);
});
