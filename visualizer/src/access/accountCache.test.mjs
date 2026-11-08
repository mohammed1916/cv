import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountCache, ACCOUNT_CACHE_MS} from './accountCache.js';
test('reuses checks across remounts and tabs, deduplicates calls, refreshes deliberately', async()=>{
  let time=100, calls=0;
  const data=new Map();
  const storage=()=>({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)});
  const load=async uid=>{calls++;return {pro:true,uid};};
  const cache=createAccountCache({load,storage,now:()=>time});
  await Promise.all([cache.get('a'),cache.get('a')]);assert.equal(calls,1);
  await cache.get('a');assert.equal(calls,1);
  await createAccountCache({load,storage,now:()=>time}).get('a');assert.equal(calls,1);
  await cache.get('b');assert.equal(calls,2);
  await cache.get('a',{force:true});assert.equal(calls,3);
  time+=ACCOUNT_CACHE_MS;await cache.get('a');assert.equal(calls,4);
  cache.clear('a');await cache.get('a');assert.equal(calls,5);
});
test('failed checks do not stick and storage failures do not break access',async()=>{
  let calls=0;
  const cache=createAccountCache({load:async()=>{if(++calls===1)throw Error('offline');return {pro:false};},storage:()=>{throw Error('blocked');}});
  await assert.rejects(cache.get('a'));
  assert.deepEqual(await cache.get('a'),{pro:false});
  await cache.get('a');assert.equal(calls,2);
});
