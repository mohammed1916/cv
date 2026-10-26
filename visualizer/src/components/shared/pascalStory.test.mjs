import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPascalStory} from './pascalTrace.js';
test('triangle and in-place rows equal binomial coefficients',()=>{
  const choose=(n,k)=>{let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-i+1)/BigInt(i);return Number(v);};
  for(let n=0;n<=33;n++)assert.deepEqual(buildPascalStory(String(n),'row').frames.at(-1).row,Array.from({length:n+1},(_,k)=>choose(n,k)));
  const triangle=buildPascalStory('30','triangle');triangle.rows.forEach((row,n)=>assert.deepEqual(row,Array.from({length:n+1},(_,k)=>choose(n,k))));
  assert.equal(triangle.frames[0].visibleRows,0);assert.deepEqual(triangle.frames[0].row,[]);
});
test('right-to-left trace always reads previous-row operands and rejects malformed input',()=>{
  const story=buildPascalStory('8','row');
  for(const f of story.frames.filter(f=>f.phase==='sum')){assert.equal(f.a,f.previous[f.j-1]);assert.equal(f.b,f.previous[f.j]);}
  for(const input of ['','3x','1.5','-1','34'])assert.throws(()=>buildPascalStory(input,'row'));
  assert.throws(()=>buildPascalStory('0','triangle'));
});
