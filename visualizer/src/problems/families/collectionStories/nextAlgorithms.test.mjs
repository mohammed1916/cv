import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from './definitions.js';
import { nextSolvers } from './nextAlgorithms.js';

const sum=a=>a.reduce((x,y)=>x+y,0);
const references={
1053:({arr})=>{const less=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]<b[i];return false;};let best=null;for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const a=[...arr];[a[i],a[j]]=[a[j],a[i]];if(less(a,arr)&&(!best||less(best,a)))best=a;}return best??arr;},
1064:({arr})=>arr.findIndex((v,i)=>v===i),
1071:({str1,str2})=>{for(let n=Math.min(str1.length,str2.length);n>=1;n--){const s=str1.slice(0,n);if(str1.length%n===0&&str2.length%n===0&&s.repeat(str1.length/n)===str1&&s.repeat(str2.length/n)===str2)return s;}return '';},
1078:({text,first,second})=>{const a=text.split(' ');return a.filter((_,i)=>i>=2&&a[i-2]===first&&a[i-1]===second);},
1085:({nums})=>{let n=[...nums].sort((a,b)=>a-b)[0],sum=0;while(n){sum+=n%10;n=Math.floor(n/10);}return sum%2===0?1:0;},
1089:({arr})=>arr.flatMap(v=>v===0?[0,0]:[v]).slice(0,arr.length),
1094:({trips,capacity})=>Array.from({length:Math.max(...trips.map(t=>t[2]))},(_,location)=>sum(trips.filter(([,a,b])=>a<=location&&location<b).map(t=>t[0]))).every(n=>n<=capacity),
1099:({nums,k})=>Math.max(-1,...nums.flatMap((v,i)=>nums.slice(i+1).map(w=>v+w)).filter(n=>n<k)),
1006:({n})=>{let answer=0;for(let start=n,group=0;start>=1;start-=4,group++){let term=start;if(start>=2)term*=start-1;if(start>=3)term=Math.floor(term/(start-2));answer+=(group===0?term:-term);if(start>=4)answer+=start-3;}return answer;},
1007:({tops,bottoms})=>{let best=Infinity;for(let mask=0;mask<2**tops.length;mask++){const a=tops.map((v,i)=>mask>>i&1?bottoms[i]:v),b=bottoms.map((v,i)=>mask>>i&1?tops[i]:v);if(new Set(a).size===1||new Set(b).size===1)best=Math.min(best,[...mask.toString(2)].filter(c=>c==='1').length);}return best===Infinity?-1:best;},
1009:({n})=>{let mask=1;while(mask<=n)mask*=2;return n===0?1:mask-1-n;},
1010:({time})=>{let count=0;for(let i=0;i<time.length;i++)for(let j=i+1;j<time.length;j++)if((time[i]+time[j])%60===0)count++;return count;},
1011:({weights,days})=>{for(let capacity=Math.max(...weights);capacity<=sum(weights);capacity++){let remaining=capacity,used=1;for(const w of weights){if(remaining<w){used++;remaining=capacity;}remaining-=w;}if(used<=days)return capacity;}throw Error('No feasible capacity');},
1013:({arr})=>{for(let i=1;i<arr.length-1;i++)for(let j=i+1;j<arr.length;j++)if(sum(arr.slice(0,i))===sum(arr.slice(i,j))&&sum(arr.slice(i,j))===sum(arr.slice(j)))return true;return false;},
1014:({values})=>{let best=-Infinity;for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++)best=Math.max(best,values[i]+values[j]+i-j);return best;},
1015:({k})=>{let whole=0n;for(let length=1;length<=k;length++){whole=whole*10n+1n;if(whole%BigInt(k)===0n)return length;}return -1;},
1017:({n})=>n,
1018:({nums})=>nums.map((_,i)=>BigInt('0b'+nums.slice(0,i+1).join(''))%5n===0n),
1021:({s})=>{let depth=0,start=0,answer='';for(let i=0;i<s.length;i++){depth+=s[i]==='('?1:-1;if(depth===0){answer+=s.slice(start+1,i);start=i+1;}}return answer;},
1023:({queries,pattern})=>queries.map(q=>{const memo=new Map();const accepts=(i,j)=>{if(i===q.length)return j===pattern.length;const key=i+','+j;if(memo.has(key))return memo.get(key);const match=q[i]===pattern[j]&&accepts(i+1,j+1),skip=/[a-z]/.test(q[i])&&accepts(i+1,j);memo.set(key,match||skip);return match||skip;};return accepts(0,0);}),
1025:({n})=>n%2===0,
1029:({costs})=>{let best=Infinity;for(let mask=0;mask<2**costs.length;mask++)if([...mask.toString(2)].filter(c=>c==='1').length===costs.length/2)best=Math.min(best,sum(costs.map((pair,i)=>pair[mask>>i&1])));return best;},
1030:({rows,cols,rCenter,cCenter})=>Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>Math.abs(r-rCenter)+Math.abs(c-cCenter))).flat().sort((a,b)=>a-b),
1037:({points:[[a,b],[c,d],[e,f]]})=>a*d+c*f+e*b!==b*c+d*e+f*a,
1041:({instructions})=>{let x=0,y=0,dx=0,dy=1;for(const c of instructions.repeat(4)){if(c==='G'){x+=dx;y+=dy;}else if(c==='L')[dx,dy]=[-dy,dx];else[dx,dy]=[dy,-dx];}return x===0&&y===0;},
1046:({stones})=>{const a=[...stones];const take=()=>a.splice(a.indexOf(Math.max(...a)),1)[0];while(a.length>1){const first=take(),second=take();if(first!==second)a.push(first-second);}return a[0]??0;},
1051:({heights})=>{const counts=Array(101).fill(0);for(const h of heights)counts[h]++;const sorted=counts.flatMap((n,h)=>Array(n).fill(h));return heights.filter((v,i)=>v!==sorted[i]).length;},
1052:({customers,grumpy,minutes})=>Math.max(...Array.from({length:customers.length-minutes+1},(_,start)=>sum(customers.map((n,i)=>!grumpy[i]||i>=start&&i<start+minutes?n:0)))),
};

function verify(id,input){
  const original=structuredClone(input),d=definitions[id],run=d.build(d.parse(JSON.stringify(input))),expected=references[id](input);
  assert.deepEqual(input,original,'must preserve caller input');
  if(id===1017){assert.match(run.result,/^(0|1[01]*)$/);assert.equal([...run.result].reverse().reduce((n,c,i)=>n+Number(c)*(-2)**i,0),expected);}
  else if(id===1030){assert.equal(run.result.length,input.rows*input.cols);assert.equal(new Set(run.result.map(p=>p.join(','))).size,run.result.length);assert.ok(run.result.every(([r,c])=>Number.isInteger(r)&&r>=0&&r<input.rows&&Number.isInteger(c)&&c>=0&&c<input.cols));assert.deepEqual(run.result.map(([r,c])=>Math.abs(r-input.rCenter)+Math.abs(c-input.cCenter)),expected);}
  else assert.deepEqual(run.result,expected);
  assert.equal(run.frames[0].phase,'start');assert.equal(run.frames.at(-1).phase,'done');assert.deepEqual(run.frames.at(-1).result,run.result);
  assert.ok(run.frames.every(f=>typeof f.message==='string'&&f.message.length>15&&[1,3,4,5].includes(f.activeLine)&&f.sequence!==undefined));
  const snapshot=JSON.stringify(run);d.build(input);assert.equal(JSON.stringify(run),snapshot,'a new run must not rewrite prior frames');
  return run;
}

for(const key of Object.keys(nextSolvers))test(`${key}: original examples match independent references and invariants`,()=>{
  const id=Number(key),d=definitions[id];assert.equal(d.examples.length,4);assert.equal(d.code.length,5);
  for(const e of d.examples)verify(id,JSON.parse(e.input));
  assert.throws(()=>d.parse('{}'));assert.throws(()=>d.parse('null'));assert.throws(()=>d.parse('[]'));
});

let seed=10371011;
const random=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
const vector=(n,max=10)=>Array.from({length:n},()=>random(max));
const word=(n,alphabet)=>vector(n,alphabet.length).map(i=>alphabet[i]).join('');
const generators={
1053:()=>({arr:vector(9,6).map(v=>v+1)}),1064:()=>({arr:[...new Set(vector(16,30).map(v=>v-10))].sort((a,b)=>a-b)}),1071:()=>{const base=word(3,'ABC');return{str1:base.repeat(1+random(5)),str2:random(3)?base.repeat(1+random(5)):word(8,'ABC')};},1078:()=>({text:Array.from({length:14},()=>word(2,'ab')).join(' '),first:word(2,'ab'),second:word(2,'ab')}),1085:()=>({nums:vector(12,10000).map(v=>v+1)}),1089:()=>({arr:vector(14,4)}),1094:()=>({trips:Array.from({length:7},()=>{const start=random(12);return[1+random(5),start,start+1+random(8)];}),capacity:1+random(15)}),1099:()=>({nums:vector(10,50).map(v=>v+1),k:1+random(100)}),
1006:()=>({n:1+random(80)}),1007:()=>({tops:vector(2+random(7),6).map(v=>v+1),bottoms:[]}),1009:()=>({n:random(1000000001)}),1010:()=>({time:vector(12,500).map(v=>v+1)}),1011:()=>({weights:vector(8,12).map(v=>v+1),days:1+random(8)}),1013:()=>({arr:vector(10,9).map(v=>v-4)}),1014:()=>({values:vector(10,30).map(v=>v+1)}),1015:()=>({k:1+random(150)}),1017:()=>({n:random(1000000001)}),1018:()=>({nums:vector(80,2)}),1021:()=>{let s='',depth=0;for(let i=0;i<20;i++){if(depth&&random(2)){s+=')';depth--;}else{s+='(';depth++;}}return{s:s+')'.repeat(depth)};},1023:()=>({queries:Array.from({length:8},()=>word(8,'abAB')),pattern:word(3,'abAB')}),1025:()=>({n:1+random(60)}),1029:()=>({costs:Array.from({length:8},()=>vector(2,300).map(v=>v+1))}),1030:()=>{const rows=1+random(7),cols=1+random(7);return{rows,cols,rCenter:random(rows),cCenter:random(cols)};},1037:()=>({points:Array.from({length:3},()=>vector(2,101))}),1041:()=>({instructions:word(20,'GLR')}),1046:()=>({stones:vector(12,80).map(v=>v+1)}),1051:()=>({heights:vector(20,100).map(v=>v+1)}),1052:()=>({customers:vector(12,20),grumpy:vector(12,2),minutes:1+random(12)}),
};
test('5600 generated cases match independent calculations',()=>{
  for(let round=0;round<200;round++)for(const key of Object.keys(nextSolvers)){
    const id=Number(key),input=generators[id]();if(id===1007)input.bottoms=vector(input.tops.length,6).map(v=>v+1);
    try{verify(id,input);}catch(error){error.message=`${id}, round ${round}, ${JSON.stringify(input)}: ${error.message}`;throw error;}
  }
});
test('every new problem rejects malformed domain inputs',()=>{
  const invalid={1006:{n:0},1007:{tops:[1,2],bottoms:[3]},1009:{n:-1},1010:{time:[0]},1011:{weights:[1,2],days:3},1013:{arr:[0,0]},1014:{values:[7]},1015:{k:0},1017:{n:1.5},1018:{nums:[0,2]},1021:{s:')('},1023:{queries:['a1'],pattern:'a'},1025:{n:61},1029:{costs:[[1,2],[3,4],[5,6]]},1030:{rows:2,cols:2,rCenter:2,cCenter:0},1037:{points:[[1,2],[3,4]]},1041:{instructions:'GGF'},1046:{stones:[0]},1051:{heights:[101]},1052:{customers:[1,2],grumpy:[0,1],minutes:0}};
  Object.assign(invalid,{1053:{arr:[0]},1064:{arr:[1,1]},1071:{str1:'abc',str2:'ABC'},1078:{text:'two  spaces',first:'two',second:'spaces'},1085:{nums:[0]},1089:{arr:[10]},1094:{trips:[[2,4,4]],capacity:3},1099:{nums:[1,2],k:0}});
  assert.deepEqual(Object.keys(invalid),Object.keys(nextSolvers));for(const [id,input]of Object.entries(invalid))assert.throws(()=>definitions[id].build(input),`Problem ${id}`);
});
test('snapshots preserve intermediate stacks and binary-search feasibility bounds',()=>{
  const run=definitions[1006].build({n:6}),updates=run.frames.filter(f=>f.phase==='update');
  assert.deepEqual(updates[0].output,[30]);assert.deepEqual(updates[1].output,[7]);assert.deepEqual(updates[2].output,[7,3]);
  const shipping=definitions[1011].build({weights:[7,3,11,4,8,2,9,5],days:3}),bounds=shipping.frames.filter(f=>f.phase==='update');
  for(const frame of bounds)assert.ok(frame.metrics.low<=shipping.result&&frame.metrics.high>=shipping.result);
});
