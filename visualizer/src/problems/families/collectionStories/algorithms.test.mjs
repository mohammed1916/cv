import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from './definitions.js';
const sum = a => a.reduce((x,y)=>x+y,0);
const segments = a => a.flatMap((_,i)=>a.slice(i).map((_,j)=>a.slice(i,i+j+1)));
const freq = a => [...new Set(a)].map(v=>[v,a.filter(x=>x===v).length]);
const sorted = a => [...a].sort((x,y)=>String(x).localeCompare(String(y)));
const references = {
860:({bills})=>{let states=[[0,0]];for(const b of bills){const next=[];for(const [f,t]of states)for(let x=0;x<=3;x++)for(let y=0;y<=1;y++)if(x<=f&&y<=t&&5*x+10*y===b-5)next.push([f-x+(b===5),t-y+(b===10)]);states=next;}return states.length>0;},
861:({grid})=>{let best=0;const r=grid.length,c=grid[0].length;for(let mask=0;mask<2**(r+c);mask++){let total=0;for(let i=0;i<r;i++)for(let j=0;j<c;j++)total+=(grid[i][j]^((mask>>i)&1)^((mask>>(r+j))&1))*2**(c-j-1);best=Math.max(best,total);}return best;},
868:({n})=>{const p=[...n.toString(2)].flatMap((v,i)=>v==='1'?[i]:[]);return Math.max(0,...p.slice(1).map((v,i)=>v-p[i]));},
869:({n})=>{const count=v=>Array.from({length:10},(_,d)=>String(v).split(String(d)).length-1).join(',');return Array.from({length:31},(_,p)=>2**p).some(v=>count(v)===count(n));},
881:({people,limit})=>{const memo=new Map();const best=mask=>{if(!mask)return 0;if(memo.has(mask))return memo.get(mask);const i=people.findIndex((_,i)=>mask>>i&1);let answer=1+best(mask^(1<<i));for(let j=i+1;j<people.length;j++)if((mask>>j&1)&&people[i]+people[j]<=limit)answer=Math.min(answer,1+best(mask^(1<<i)^(1<<j)));memo.set(mask,answer);return answer;};return best(2**people.length-1);},
883:({grid})=>grid.flat().filter(v=>v>0).length+sum(grid.map(row=>Math.max(...row)))+sum(grid[0].map((_,c)=>Math.max(...grid.map(row=>row[c])))),
884:({s1,s2})=>freq((s1+' '+s2).split(' ')).filter(([,n])=>n===1).map(([v])=>v),
888:({aliceSizes:a,bobSizes:b})=>a.flatMap(x=>b.filter(y=>sum(a)-x+y===sum(b)-y+x).map(y=>[x,y])),
890:({words,pattern})=>{const shape=s=>[...s].map(c=>s.indexOf(c)).join(',');return words.filter(w=>shape(w)===shape(pattern));},
892:({grid})=>{let faces=0;for(let r=0;r<grid.length;r++)for(let c=0;c<grid.length;c++)for(let z=0;z<grid[r][c];z++)for(const[dr,dc,dz]of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(z+dz<0||(grid[r+dr]?.[c+dc]??0)<=z+dz)faces++;return faces;},
893:({words})=>{const groups=[];const equal=(a,b)=>[0,1].every(p=>sorted([...a].filter((_,i)=>i%2===p)).join('')===sorted([...b].filter((_,i)=>i%2===p)).join(''));for(const w of words)if(!groups.some(g=>equal(g,w)))groups.push(w);return groups.length;},
898:({arr})=>new Set(segments(arr).map(a=>a.reduce((x,y)=>x|y,0))).size,
899:({s,k})=>k===1?Array.from({length:s.length},(_,i)=>s.slice(i)+s.slice(0,i)).sort()[0]:[...s].sort().join(''),
901:({prices})=>prices.map((v,i)=>{let j=i;while(j>=0&&prices[j]<=v)j--;return i-j;}),
904:({fruits})=>Math.max(...segments(fruits).filter(a=>new Set(a).size<=2).map(a=>a.length)),
908:({nums,k})=>{let lower=-Infinity,upper=Infinity;for(const v of nums){lower=Math.max(lower,v-k);upper=Math.min(upper,v+k);}return Math.max(0,lower-upper);},
914:({deck})=>Array.from({length:deck.length-1},(_,i)=>i+2).some(size=>freq(deck).every(([,n])=>n%size===0)),
915:({nums})=>nums.findIndex((_,i)=>i<nums.length-1&&Math.max(...nums.slice(0,i+1))<=Math.min(...nums.slice(i+1)))+1,
917:({s})=>{const letters=[...s].filter(c=>/[a-zA-Z]/.test(c));return [...s].map(c=>/[a-zA-Z]/.test(c)?letters.pop():c).join('');},
918:({nums})=>{let best=-Infinity;for(let i=0;i<nums.length;i++)for(let n=1;n<=nums.length;n++)best=Math.max(best,sum(Array.from({length:n},(_,j)=>nums[(i+j)%nums.length])));return best;},
921:({s})=>{let reduced=s;while(reduced.includes('()'))reduced=reduced.replaceAll('()','');return reduced.length;},
925:({name,typed})=>{const a=name.match(/(.)\1*/g),b=typed.match(/(.)\1*/g);return a.length===b.length&&a.every((g,i)=>g[0]===b[i][0]&&g.length<=b[i].length);},
926:({s})=>Math.min(...Array.from({length:s.length+1},(_,i)=>[...s.slice(0,i)].filter(c=>c==='1').length+[...s.slice(i)].filter(c=>c==='0').length)),
929:({emails})=>new Set(emails.map(e=>{let local='',ignore=false,domain=false;for(const c of e){if(c==='@'){domain=true;local+=c;}else if(domain)local+=c;else if(c==='+')ignore=true;else if(c!=='.'&&!ignore)local+=c;}return local;})).size,
930:({nums,goal})=>segments(nums).filter(a=>sum(a)===goal).length,
931:({matrix:a})=>{const walk=(r,c)=>a[r][c]+(r===a.length-1?0:Math.min(...[-1,0,1].map(d=>c+d>=0&&c+d<a.length?walk(r+1,c+d):Infinity)));return Math.min(...a[0].map((_,c)=>walk(0,c)));},
933:({times})=>times.map((t,i)=>times.slice(0,i+1).filter(v=>v>=t-3000).length),
941:({arr:a})=>a.some((_,p)=>p>0&&p<a.length-1&&a.slice(1,p+1).every((v,i)=>v>a[i])&&a.slice(p+1).every((v,i)=>v<a[p+i])),
942:({s})=>s,
944:({strs})=>strs[0].split('').filter((_,c)=>strs.some((s,r)=>r&&s[c]<strs[r-1][c])).length,
945:({nums})=>{const used=new Set();let cost=0;for(const v of nums){let target=v;while(used.has(target))target++;cost+=target-v;used.add(target);}return cost;},
946:({pushed,popped})=>{const search=(i,j,stack)=>{if(j===popped.length)return true;if(stack.at(-1)===popped[j]&&search(i,j+1,stack.slice(0,-1)))return true;return i<pushed.length&&search(i+1,j,[...stack,pushed[i]]);};return search(0,0,[]);},
948:({tokens,power})=>{const memo=new Map();const search=(mask,p,s)=>{const key=[mask,p,s].join();if(memo.has(key))return memo.get(key);let best=s;tokens.forEach((v,i)=>{if(mask>>i&1){if(p>=v)best=Math.max(best,search(mask^(1<<i),p-v,s+1));if(s>0)best=Math.max(best,search(mask^(1<<i),p+v,s-1));}});memo.set(key,best);return best;};return search(2**tokens.length-1,power,0);},
950:({deck})=>[...deck].sort((a,b)=>a-b),
953:({words,order})=>{const translated=words.map(w=>[...w].map(c=>String.fromCharCode(97+order.indexOf(c))).join(''));return translated.every((w,i)=>!i||w>=translated[i-1]);},
961:({nums})=>freq(nums).find(([,n])=>n>1)[0],
962:({nums})=>Math.max(0,...nums.flatMap((v,i)=>nums.map((w,j)=>i<j&&v<=w?j-i:0))),
970:({x,y,bound})=>{const a=new Set(),b=new Set();for(let i=0;i<21;i++){if(x**i<=bound)a.add(x**i);if(y**i<=bound)b.add(y**i);}return [...new Set([...a].flatMap(v=>[...b].map(w=>v+w)).filter(v=>v<=bound))].sort((a,b)=>a-b);},
973:({points,k})=>points.map(([x,y])=>x*x+y*y).sort((a,b)=>a-b).slice(0,k),
974:({nums,k})=>segments(nums).filter(a=>sum(a)%k===0).length,
976:({nums:a})=>{let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++){const sides=[a[i],a[j],a[k]].sort((x,y)=>x-y);if(sides[0]+sides[1]>sides[2])best=Math.max(best,sum(sides));}return best;},
978:({arr})=>Math.max(...segments(arr).filter(a=>a.every((v,i)=>!i||(v!==a[i-1]&&(i===1||(v-a[i-1])*(a[i-1]-a[i-2])<0)))).map(a=>a.length)),
983:({days,costs})=>{const dp=Array(366).fill(0),travel=new Set(days);for(let d=1;d<=365;d++)dp[d]=travel.has(d)?Math.min(...[1,7,30].map((len,i)=>dp[Math.max(0,d-len)]+costs[i])):dp[d-1];return dp[365];},
985:({nums,queries})=>{const a=[...nums];return queries.map(([v,i])=>{a[i]+=v;return sum(a.filter(x=>x%2===0));});},
989:({num,k})=>[...String(BigInt(num.join(''))+BigInt(k))].map(Number),
991:({startValue,target})=>{let queue=[startValue],seen=new Set(queue),depth=0;while(queue.length){if(queue.includes(target))return depth;const next=[];for(const v of queue)for(const w of [v-1,v*2])if(w>0&&w<=2*Math.max(startValue,target)+2&&!seen.has(w)){seen.add(w);next.push(w);}queue=next;depth++;}throw Error('unreachable');},
997:({n,trust})=>Array.from({length:n},(_,i)=>i+1).find(p=>!trust.some(([a])=>a===p)&&Array.from({length:n},(_,i)=>i+1).filter(x=>x!==p).every(x=>trust.some(([a,b])=>a===x&&b===p)))??-1,
999:({board})=>{const pieces=board.flatMap((row,r)=>row.flatMap((v,c)=>v==='.'?[]:[[r,c,v]])),[r,c]=pieces.find(p=>p[2]==='R');return pieces.filter(([y,x,v])=>v==='p'&&(y===r||x===c)&&!pieces.some(([a,b,w])=>w!=='R'&&(y===r?a===r&&b>Math.min(x,c)&&b<Math.max(x,c):b===c&&a>Math.min(y,r)&&a<Math.max(y,r)))).length;},
1002:({words})=>[...'abcdefghijklmnopqrstuvwxyz'].flatMap(c=>Array(Math.min(...words.map(w=>w.split(c).length-1))).fill(c)),
1005:({nums,k})=>{let states=new Map([[nums.join(','),nums]]);for(let step=0;step<k;step++){const next=new Map();for(const a of states.values())for(let i=0;i<a.length;i++){const b=[...a];b[i]=-b[i];next.set(b.join(','),b);}states=next;}return Math.max(...[...states.values()].map(sum));},
};

function check(id,input) {
  const before=structuredClone(input),run=definitions[id].build(input),actual=run.result,expected=references[id](input);
  assert.deepEqual(input,before,'solver must not mutate editor input');
  if(id===888) assert.ok(expected.some(pair=>JSON.stringify(pair)===JSON.stringify(actual)));
  else if(id===942) {assert.deepEqual([...actual].sort((a,b)=>a-b),Array.from({length:input.s.length+1},(_,i)=>i));assert.ok([...input.s].every((c,i)=>c==='I'?actual[i]<actual[i+1]:actual[i]>actual[i+1]));}
  else if(id===950) {const queue=[...actual],reveal=[];while(queue.length){reveal.push(queue.shift());if(queue.length)queue.push(queue.shift());}assert.deepEqual(reveal,expected);}
  else if(id===973) {assert.deepEqual(actual.map(([x,y])=>x*x+y*y).sort((a,b)=>a-b),expected);const available=input.points.map(JSON.stringify);for(const p of actual){const i=available.indexOf(JSON.stringify(p));assert.ok(i>=0);available.splice(i,1);}}
  else if([884,1002].includes(id))assert.deepEqual(sorted(actual),sorted(expected));
  else assert.deepEqual(actual,expected);
  assert.equal(run.frames[0].phase,'start');assert.equal(run.frames.at(-1).phase,'done');
  assert.deepEqual(run.frames.at(-1).result,actual);
  assert.ok(run.frames.every(f=>f.message.length>10&&[1,3,4,5].includes(f.activeLine)));
  return run;
}
for(const [key,d]of Object.entries(definitions).filter(([id])=>id in references))test(`${key}: original presets, independent reference, stable snapshots`,()=>{
  assert.equal(d.examples.length,4);assert.equal(d.code.length,5);
  for(const example of d.examples){const input=d.parse(example.input),run=check(+key,input),snapshot=JSON.stringify(run);d.build(input);assert.equal(JSON.stringify(run),snapshot);}
  assert.throws(()=>d.parse('{}'));assert.throws(()=>d.parse('null'));
});

let seed=43807;
const int=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const array=(n=1+int(7),bound=10)=>Array.from({length:n},()=>int(bound));
const word=(n=1+int(7),alphabet='abc')=>array(n,alphabet.length).map(i=>alphabet[i]).join('');
const shuffle=a=>[...a].map(v=>[int(1000000),v]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);
const generators={
860:()=>({bills:array().map(v=>[5,10,20][v%3])}),861:()=>({grid:Array.from({length:1+int(3)},()=>array(3,2))}),868:()=>({n:1+int(100000)}),869:()=>({n:1+int(100000)}),
881:()=>({people:array().map(v=>v+1),limit:10}),883:()=>({grid:Array.from({length:3},()=>array(3,5))}),884:()=>({s1:array().map(()=>word(2)).join(' '),s2:array().map(()=>word(2)).join(' ')}),
888:()=>{const a=array().map(v=>v+1);return {aliceSizes:a,bobSizes:shuffle(a)};},890:()=>({words:array().map(()=>word(4)),pattern:word(4)}),892:()=>({grid:Array.from({length:3},()=>array(3,5))}),893:()=>({words:array().map(()=>word(4))}),898:()=>({arr:array()}),899:()=>({s:word(),k:1+int(2)}),
901:()=>({prices:array().map(v=>v+1)}),904:()=>({fruits:array()}),908:()=>({nums:array(),k:int(6)}),914:()=>({deck:array()}),915:()=>({nums:[...array(),20]}),917:()=>({s:word(10,'aB-z!?2')}),918:()=>({nums:array().map(v=>v-5)}),921:()=>({s:word(10,'()')}),925:()=>({name:word(),typed:word(10)}),926:()=>({s:word(12,'01')}),929:()=>({emails:array().map(()=>`${word(3)}.${word(2)}+${word(2)}@${word(2)}.org`)}),930:()=>({nums:array(8,2),goal:int(6)}),931:()=>({matrix:Array.from({length:3},()=>array(3).map(v=>v-5))}),933:()=>({times:[...new Set(array(8,9000).map(v=>v+1))].sort((a,b)=>a-b)}),941:()=>({arr:array()}),942:()=>({s:word(10,'ID')}),944:()=>({strs:array().map(()=>word(4))}),945:()=>({nums:array()}),946:()=>{const a=shuffle([2,4,6,8,10]);return{pushed:a,popped:shuffle(a)};},948:()=>({tokens:array(6),power:int(15)}),950:()=>({deck:shuffle([2,4,6,8,10,12])}),953:()=>({words:array().map(()=>word()),order:shuffle([...'abcdefghijklmnopqrstuvwxyz']).join('')}),961:()=>({nums:shuffle([9,9,9,1,2,3])}),962:()=>({nums:array(8)}),970:()=>({x:1+int(6),y:1+int(6),bound:int(100)}),973:()=>({points:array(6).map(()=>[int(11)-5,int(11)-5]),k:1+int(6)}),974:()=>({nums:array().map(v=>v-5),k:1+int(7)}),976:()=>({nums:array(7).map(v=>v+1)}),978:()=>({arr:array()}),983:()=>({days:[...new Set(array(10,365).map(v=>v+1))].sort((a,b)=>a-b),costs:array(3,20).map(v=>v+1)}),985:()=>({nums:array(5).map(v=>v-5),queries:array(7).map(()=>[int(11)-5,int(5)])}),989:()=>({num:[1+int(9),...array(8)],k:int(10000)}),991:()=>({startValue:1+int(30),target:1+int(120)}),997:()=>({n:4,trust:[[1,2],[1,3],[1,4],[2,1],[2,3],[2,4],[3,1],[3,2],[3,4],[4,1],[4,2],[4,3]].filter(()=>int(2))}),999:()=>{const board=Array.from({length:8},()=>Array(8).fill('.'));for(let i=0;i<12;i++)board[int(8)][int(8)]=int(2)?'p':'B';board[int(8)][int(8)]='R';return{board};},1002:()=>({words:array().map(()=>word())}),1005:()=>({nums:array(5).map(v=>v-5),k:1+int(5)}),
};
test('5000 generated valid inputs agree with independent references',()=>{
  for(let round=0;round<100;round++)for(const id of Object.keys(references).map(Number)) {
    const input=generators[id]();if(id===899)input.k=Math.min(input.k,input.s.length);
    try{check(id,definitions[id].parse(JSON.stringify(input)));}catch(error){error.message=`Problem ${id}, round ${round}, ${JSON.stringify(input)}: ${error.message}`;throw error;}
  }
});
test('reject malformed domain inputs before trace execution',()=>{
  const invalid={860:{bills:[15]},861:{grid:[[0,2]]},868:{n:0},869:{n:1.5},881:{people:[11],limit:10},883:{grid:[[1,-1],[1,1]]},884:{s1:' a',s2:'b'},888:{aliceSizes:[8],bobSizes:[12]},890:{words:['aa'],pattern:'a'},892:{grid:[[1,2]]},893:{words:['a','bb']},898:{arr:[-1]},899:{s:'ab',k:3},901:{prices:[0]},904:{fruits:[-1]},908:{nums:[1],k:-1},914:{deck:[-1]},915:{nums:[3,2,1]},917:{s:'é'},918:{nums:[]},921:{s:'x'},925:{name:'A',typed:'a'},926:{s:'012'},929:{emails:['a@@b.org']},930:{nums:[2],goal:1},931:{matrix:[[1,2]]},933:{times:[3,3]},941:{arr:[]},942:{s:'X'},944:{strs:['a','bb']},945:{nums:[-1]},946:{pushed:[1,1],popped:[1,1]},948:{tokens:[1],power:-1},950:{deck:[2,2]},953:{words:['a'],order:'a'.repeat(26)},961:{nums:[1,1,2,2]},962:{nums:[1]},970:{x:0,y:2,bound:10},973:{points:[[1,2]],k:2},974:{nums:[1],k:0},976:{nums:[1,2]},978:{arr:[]},983:{days:[2,1],costs:[1,2,3]},985:{nums:[1],queries:[[2,1]]},989:{num:[0,1],k:1},991:{startValue:0,target:2},997:{n:2,trust:[[1,2],[1,2]]},999:{board:[]},1002:{words:[]},1005:{nums:[1],k:0}};
  for(const [id,input]of Object.entries(invalid))assert.throws(()=>definitions[id].build(input),`Problem ${id}`);
});
