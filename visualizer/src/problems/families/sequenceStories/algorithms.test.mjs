import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from './definitions.js';

const sum = a => a.reduce((x,y) => x+y,0);
const frequencies = a => [...new Set(a)].map(v => a.filter(n => n === v).length);
const triples = a => a.flatMap((x,i) => a.slice(i+1).flatMap((y,j) => a.slice(i+j+2).map(z => [x,y,z])));
// Deliberately small exhaustive/reference versions independent of trace logic.
const oracles = {
  605: ({flowerbed:a,n}) => {
    let best=0;
    for(let mask=0;mask<2**a.length;mask++) {
      const b=a.map((v,i)=>v || (mask>>i&1));
      if(b.every((v,i)=>!v || !b[i-1]))best=Math.max(best,sum(b)-sum(a));
    }
    return best>=n;
  },
  611: ({nums:a})=>triples(a).filter(([x,y,z])=>x+y>z&&x+z>y&&y+z>x).length,
  628: ({nums:a})=>Math.max(...triples(a).map(t=>t.reduce((x,y)=>x*y,1))),
  633: ({c})=>Array.from({length:Math.floor(Math.sqrt(c))+1},(_,a)=>a).some(a=>Number.isInteger(Math.sqrt(c-a*a))),
  643: ({nums:a,k})=>Math.max(...a.slice(k-1).map((_,i)=>sum(a.slice(i,i+k))/k)),
  645: ({nums:a})=>[a.find((v,i)=>a.indexOf(v)!==i),Array.from({length:a.length},(_,i)=>i+1).find(v=>!a.includes(v))],
  674: ({nums:a})=>Math.max(...a.map((_,i)=>{let j=i+1;while(j<a.length&&a[j]>a[j-1])j++;return j-i;})),
  697: ({nums:a})=>{const degree=Math.max(...frequencies(a));for(let len=1;len<=a.length;len++)for(let i=0;i+len<=a.length;i++)if(Math.max(...frequencies(a.slice(i,i+len)))===degree)return len;},
  724: ({nums:a})=>a.findIndex((_,i)=>sum(a.slice(0,i))===sum(a.slice(i+1))),
  747: ({nums:a})=>a.findIndex((v,i)=>a.every((other,j)=>i===j||v>=2*other)),
  766: ({matrix:a})=>a.every((row,r)=>row.every((v,c)=>{const d=Math.min(r,c);return v===a[r-d][c-d];})),
  832: ({matrix:a})=>a.map(row=>[...row].reverse().map(v=>v^1)),
  867: ({matrix:a})=>a[0].map((_,c)=>a.map(row=>row[c])),
  896: ({nums:a})=>a.every((v,i)=>!i||v>=a[i-1])||a.every((v,i)=>!i||v<=a[i-1]),
  905: ({nums:a})=>[...a.filter(v=>v%2===0),...a.filter(v=>v%2!==0)],
  922: ({nums:a})=>{const even=a.filter(v=>v%2===0),odd=a.filter(v=>v%2!==0);return a.map((_,i)=>i%2?odd[(i-1)/2]:even[i/2]);},
  977: ({nums:a})=>a.map(v=>v*v).sort((x,y)=>x-y),
  1047: ({s})=>{let previous;do{previous=s;s=s.replace(/([a-z])\1/g,'');}while(previous!==s);return s;},
  1207: ({nums:a})=>new Set(frequencies(a)).size===new Set(a).size,
  1295: ({nums:a})=>a.filter(v=>{let digits=0;do{digits++;v=Math.floor(v/10);}while(v);return digits%2===0;}).length,
  1431: ({candies:a,extraCandies:e})=>a.map(v=>a.every(other=>v+e>=other)),
  1480: ({nums:a})=>a.map((_,i)=>sum(a.slice(0,i+1))),
  1512: ({nums:a})=>a.reduce((total,v,i)=>total+a.slice(i+1).filter(n=>n===v).length,0),
  1672: ({accounts:a})=>Math.max(...a.map(sum)),
};

function check(id, input) {
  const before=JSON.stringify(input), run=definitions[id].build(input);
  assert.deepEqual(run.result,oracles[id](input), `${id}: ${before}`);
  assert.equal(JSON.stringify(input),before,'Input is not mutated');
  assert.equal(run.frames[0].phase,'start');
  assert.equal(run.frames.at(-1).phase,'done');
  assert.deepEqual(run.frames.at(-1).result,run.result);
  assert.ok(run.frames.every(f=>f.message.length>10&&f.activeLine>=1&&f.activeLine<=5));
  return run;
}

for(const [id,d] of Object.entries(definitions)) test(`${id}: every authored example agrees with an independent oracle`,()=>{
  assert.ok(d.examples.length>=4);
  for(const e of d.examples) check(id,d.parse(e.input));
});

let seed=5138;
const rand = n => {seed=(1664525*seed+1013904223)>>>0;return seed%n;};
test('24 solvers agree with small-input oracles over 100 deterministic rounds',()=>{
  for(let t=0;t<100;t++) {
    const nums=Array.from({length:3+rand(7)},()=>rand(21)-10), positive=nums.map(v=>Math.abs(v)+1);
    for(const id of [628,674,697,724,896,1207,1480])check(id,{nums});
    for(const id of [611,905,1295,1512])check(id,{nums:positive});
    check(643,{nums,k:1+rand(nums.length)});
    check(977,{nums:[...nums].sort((a,b)=>a-b)});
    check(1431,{candies:positive,extraCandies:1+rand(8)});
    check(633,{c:rand(10000)});
    check(747,{nums:[...positive,100]});
    const n=2+rand(7), mismatch=Array.from({length:n},(_,i)=>i+1);const missing=rand(n);let duplicate=(missing+1+rand(n-1))%n;mismatch[missing]=duplicate+1;
    check(645,{nums:mismatch});
    const bed=nums.map(()=>rand(2));for(let i=1;i<bed.length;i++)if(bed[i-1])bed[i]=0;
    check(605,{flowerbed:bed,n:rand(bed.length+1)});
    check(922,{nums:[2,4,6,8,1,3,5,7].sort(()=>rand(3)-1)});
    check(1047,{s:nums.map(()=>String.fromCharCode(97+rand(4))).join('')});
    const rows=1+rand(4), cols=1+rand(5), matrix=Array.from({length:rows},()=>Array.from({length:cols},()=>rand(9)+1));
    check(766,{matrix});check(867,{matrix});check(1672,{accounts:matrix});
    check(832,{matrix:Array.from({length:rows},()=>Array.from({length:rows},()=>rand(2)))});
  }
});

test('invalid domain inputs are rejected instead of producing misleading traces',()=>{
  const bad={605:{flowerbed:[1,1],n:0},611:{nums:[-1,2,3]},628:{nums:[1,2]},633:{c:-1},643:{nums:[1],k:0},645:{nums:[1,2,3]},674:{nums:[]},697:{nums:[]},724:{nums:['x']},747:{nums:[3,3]},766:{matrix:[[1],[1,2]]},832:{matrix:[[2]]},867:{matrix:[]},896:{nums:[null]},905:{nums:[-1]},922:{nums:[2,4]},977:{nums:[2,1]},1047:{s:'A'},1207:{nums:[]},1295:{nums:[0]},1431:{candies:[1],extraCandies:-1},1480:{nums:[1.5]},1512:{nums:[-2]},1672:{accounts:[[0]]}};
  for(const [id,input] of Object.entries(bad))assert.throws(()=>definitions[id].parse(JSON.stringify(input)),undefined,id);
});

test('replaying early frames cannot show later mutations',()=>{
  const run=check(832,{matrix:[[1,0],[0,1]]});
  assert.deepEqual(run.frames[1].outputMatrix,[[1,null],[null,null]]);
  const prefix=check(1480,{nums:[3,7,-2]});
  assert.deepEqual(prefix.frames[1].output,[3]);
});
