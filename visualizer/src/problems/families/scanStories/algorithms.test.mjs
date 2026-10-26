import test from 'node:test';
import assert from 'node:assert/strict';
import { definitions } from './definitions.js';

const sum=a=>a.reduce((x,y)=>x+y,0);
const sorted=a=>a.every((v,i)=>!i||v>=a[i-1]);
const palindrome=s=>s===[...s].reverse().join('');
const subsets=a=>Array.from({length:2**a.length},(_,mask)=>a.filter((_,i)=>mask>>i&1));
const morse='.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..'.split(' ');
const oracles={
  594:({nums})=>Math.max(0,...[...new Set(nums)].map(v=>nums.includes(v+1)?nums.filter(x=>x===v||x===v+1).length:0)),
  598:({m,n,ops})=>{const a=Array.from({length:m},()=>Array(n).fill(0));for(const [rows,cols]of ops)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)a[r][c]++;const max=Math.max(...a.flat());return a.flat().filter(v=>v===max).length;},
  599:({list1,list2})=>{const common=list1.filter(s=>list2.includes(s));const score=s=>list1.indexOf(s)+list2.indexOf(s);return common.filter(s=>score(s)===Math.min(...common.map(score))).sort();},
  646:({pairs})=>{const a=[...pairs].sort((x,y)=>x[0]-y[0]),dp=a.map(()=>1);for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(a[j][1]<a[i][0])dp[i]=Math.max(dp[i],dp[j]+1);return Math.max(...dp);},
  657:({moves})=>['UD','LR'].every(([a,b])=>moves.split(a).length===moves.split(b).length),
  658:({arr,k,x})=>[...arr].sort((a,b)=>Math.abs(a-x)-Math.abs(b-x)||a-b).slice(0,k).sort((a,b)=>a-b),
  661:({img})=>img.map((row,r)=>row.map((_,c)=>{const values=img.flatMap((line,y)=>line.filter((_,x)=>Math.abs(y-r)<=1&&Math.abs(x-c)<=1));return Math.floor(sum(values)/values.length);})),
  665:({nums})=>sorted(nums)||nums.some((_,i)=>nums.some(value=>{const a=[...nums];a[i]=value;return sorted(a);})),
  670:({num})=>{const a=[...String(num)];let best=num;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const b=[...a];[b[i],b[j]]=[b[j],b[i]];best=Math.max(best,Number(b.join('')));}return best;},
  673:({nums})=>{const candidates=subsets(nums).filter(a=>a.length&&a.every((v,i)=>!i||v>a[i-1]));const best=Math.max(...candidates.map(a=>a.length));return candidates.filter(a=>a.length===best).length;},
  678:({s})=>{function valid(i,depth){if(depth<0)return false;if(i===s.length)return depth===0;return s[i]==='*'?valid(i+1,depth)||valid(i+1,depth+1)||valid(i+1,depth-1):valid(i+1,depth+(s[i]==='('?1:-1));}return valid(0,0);},
  680:({s})=>palindrome(s)||[...s].some((_,i)=>palindrome(s.slice(0,i)+s.slice(i+1))),
  682:({operations})=>{let records=[];for(const op of operations){if(op==='C')records=records.slice(0,-1);else if(op==='D')records=[...records,records[records.length-1]*2];else if(op==='+')records=[...records,sum(records.slice(-2))];else records=[...records,+op];}return sum(records);},
  686:({a,b})=>{for(let n=1;n<=Math.ceil(b.length/a.length)+2;n++)if(a.repeat(n).includes(b))return n;return -1;},
  692:({words,k})=>{const unique=[...new Set(words)],count=w=>words.filter(v=>v===w).length;return unique.map(w=>[w,unique.filter(v=>count(v)>count(w)||count(v)===count(w)&&v<w).length]).filter(([,rank])=>rank<k).sort((a,b)=>a[1]-b[1]).map(([w])=>w);},
  693:({n})=>!/(00|11)/.test(n.toString(2)),
  696:({s})=>{let count=0;for(let i=0;i<s.length;i++)for(let j=i+2;j<=s.length;j++){const t=s.slice(i,j);if(/^(0+1+|1+0+)$/.test(t)&&t.split('0').length===t.split('1').length)count++;}return count;},
  709:({s})=>s.toLowerCase(),
  713:({nums,k})=>{let count=0;for(let i=0;i<nums.length;i++)for(let j=i+1;j<=nums.length;j++)if(nums.slice(i,j).reduce((a,b)=>a*b,1)<k)count++;return count;},
  714:({prices,fee})=>{const memo=new Map();function best(day,holding){if(day===prices.length)return holding?-Infinity:0;const key=day+':'+holding;if(memo.has(key))return memo.get(key);const result=Math.max(best(day+1,holding),(holding?prices[day]-fee:-prices[day])+best(day+1,!holding));memo.set(key,result);return result;}return best(0,false);},
  717:({bits})=>{const symbols=[];for(let i=0;i<bits.length;){const width=bits[i]?2:1;symbols.push(bits.slice(i,i+width));i+=width;}return symbols.at(-1).length===1;},
  718:({nums1:a,nums2:b})=>{let best=0;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){let k=0;while(i+k<a.length&&j+k<b.length&&a[i+k]===b[j+k])k++;best=Math.max(best,k);}return best;},
  728:({left,right})=>Array.from({length:right-left+1},(_,i)=>left+i).filter(n=>{let q=n;while(q){const d=q%10;if(!d||!Number.isInteger(n/d))return false;q=Math.floor(q/10);}return true;}),
  733:({image,sr,sc,color})=>{const reachable=new Set([sr+','+sc]),old=image[sr][sc];let changed=true;while(changed){changed=false;image.forEach((row,r)=>row.forEach((v,c)=>{const key=r+','+c;if(v===old&&!reachable.has(key)&&[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(p=>reachable.has(p.join(',')))){reachable.add(key);changed=true;}}));}return image.map((row,r)=>row.map((v,c)=>reachable.has(r+','+c)?color:v));},
  735:({asteroids})=>{const a=[...asteroids];let i=0;while(i<a.length-1){if(a[i]>0&&a[i+1]<0){const left=a[i],right=-a[i+1];if(left===right)a.splice(i,2);else if(left<right)a.splice(i,1);else a.splice(i+1,1);i=Math.max(0,i-1);}else i++;}return a;},
  738:({n})=>{while(!sorted([...String(n)].map(Number)))n--;return n;},
  740:({nums})=>Math.max(...subsets([...new Set(nums)]).filter(a=>!a.some(v=>a.includes(v+1))).map(a=>sum(nums.filter(v=>a.includes(v))))),
  744:({letters,target})=>letters.find(c=>c>target)||letters[0],
  771:({jewels,stones})=>[...stones].filter(c=>jewels.includes(c)).length,
  796:({s,goal})=>s.length===goal.length&&(s+s).includes(goal),
  804:({words})=>new Set(words.map(w=>[...w].reduce((s,c)=>s+morse[c.charCodeAt(0)-97],''))).size,
  806:({widths,s})=>{const lineWidths=[0];for(const c of s){const w=widths[c.charCodeAt(0)-97];if(lineWidths.at(-1)+w>100)lineWidths.push(w);else lineWidths[lineWidths.length-1]+=w;}return [lineWidths.length,lineWidths.at(-1)];},
  821:({s,c})=>[...s].map((_,i)=>Math.min(...[...s].flatMap((v,j)=>v===c?[Math.abs(i-j)]:[]))),
  830:({s})=>[...s.matchAll(/(.)\1{2,}/g)].map(m=>[m.index,m.index+m[0].length-1]),
  836:({rec1:a,rec2:b})=>!(a[0]>=b[2]||b[0]>=a[2]||a[1]>=b[3]||b[1]>=a[3]),
  844:({s,t})=>{const reduce=x=>{while(x.includes('#'))x=x.replace(/(^|[^#])#/,'');return x;};return reduce(s)===reduce(t);},
  849:({seats:a})=>Math.max(...a.flatMap((v,i)=>v?[]:[Math.min(...a.flatMap((x,j)=>x?[Math.abs(j-i)]:[]))])),
  852:({arr})=>arr.indexOf(Math.max(...arr)),
  856:({s})=>{function score(start,end){if(start===end)return 0;let depth=0;for(let i=start;i<end;i++){depth+=s[i]==='('?1:-1;if(depth===0)return (i===start+1?1:2*score(start+1,i))+score(i+1,end);}}return score(0,s.length);},
  859:({s,goal})=>{for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++){const chars=[...s];[chars[i],chars[j]]=[chars[j],chars[i]];if(chars.join('')===goal)return true;}return false;},
};

function check(id,input){const before=JSON.stringify(input),run=definitions[id].build(input);let actual=run.result;if(+id===599)actual=[...actual].sort();assert.deepEqual(actual,oracles[id](input),`${id}: ${before}`);assert.equal(JSON.stringify(input),before);assert.equal(run.frames[0].phase,'start');assert.equal(run.frames.at(-1).phase,'done');assert.ok(run.frames.every(f=>f.message&&f.activeLine>=1&&f.activeLine<=5));return run;}
for(const [id,d]of Object.entries(definitions))test(`${id}: all four original examples agree with an independent reference`,()=>{for(const e of d.examples)check(id,d.parse(e.input));});

let seed=7319;
const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
const word=(n=8,alphabet='abcd')=>Array.from({length:n},()=>alphabet[rand(alphabet.length)]).join('');
test('40 algorithms pass 100 rounds of varied deterministic inputs',()=>{
 for(let t=0;t<100;t++){
  const nums=Array.from({length:3+rand(5)},()=>rand(12)-5),positive=nums.map(v=>Math.abs(v)+1),s=word();
  for(const id of [594,665,673])check(id,{nums});
  check(598,{m:5,n:7,ops:Array.from({length:rand(5)},()=>[1+rand(5),1+rand(7)])});
  check(599,{list1:['birch','elm','oak','pine'],list2:['elm','oak','pine','birch'].slice(rand(3))});
  check(646,{pairs:nums.map(v=>[v,v+1+rand(6)])});
  check(657,{moves:word(12,'UDLR')});check(658,{arr:[...nums].sort((a,b)=>a-b),k:1+rand(nums.length),x:rand(15)-5});
  const img=Array.from({length:3},()=>Array.from({length:4},()=>rand(5)));check(661,{img});
  check(670,{num:rand(999999)});check(678,{s:word(9,'()*')});check(680,{s});
  check(682,{operations:[String(rand(15)),String(-rand(10)),'+','D','C','+']});
  check(686,{a:word(3),b:word(7)});
  const words=Array.from({length:10},()=>word(2));check(692,{words,k:1+rand(new Set(words).size)});
  check(693,{n:1+rand(10000)});check(696,{s:word(14,'01')});check(709,{s:word(20,'abCDzZ!?29')});
  check(713,{nums:positive,k:rand(80)});check(714,{prices:positive,fee:rand(8)});
  check(717,{bits:[...word(10,'01')].map(Number).concat(0)});check(718,{nums1:positive,nums2:[...positive].reverse()});
  const left=1+rand(500);check(728,{left,right:left+20});check(733,{image:img,sr:rand(3),sc:rand(4),color:rand(5)});
  check(735,{asteroids:nums.map(v=>v||1)});check(738,{n:rand(10000)});check(740,{nums:positive});
  check(744,{letters:['a','d','d','h','m','z'],target:word(1,'acdhxz')});check(771,{jewels:'aC',stones:word(20,'abCd')});
  const cut=rand(s.length);check(796,{s,goal:t%2?s.slice(cut)+s.slice(0,cut):word()});check(804,{words});
  check(806,{widths:Array.from({length:26},()=>2+rand(9)),s:word(35)});check(821,{s,c:s[rand(s.length)]});
  check(830,{s:word(30,'ab')});check(836,{rec1:[0,0,5,6],rec2:[rand(9)-3,rand(9)-3,9,10]});
  check(844,{s:word(12,'abc#'),t:word(12,'abc#')});check(849,{seats:[1,...nums.map(()=>rand(2)),0]});
  check(852,{arr:[0,2,5,9,14,11,6,1]});check(856,{s:'('.repeat(1+t%8)+')'.repeat(1+t%8)+'()'});
  check(859,{s,goal:t%2?s.slice(1,2)+s[0]+s.slice(2):word()});
 }
});

test('walkthrough labels describe the intended positive boundary',()=>{
 for(const id of [657,680,844,859])assert.equal(definitions[id].build(definitions[id].parse(definitions[id].examples[0].input)).result,true);
 assert.equal(definitions[804].build({words:['ab','etb']}).result,1);
 assert.deepEqual(definitions[806].build({widths:Array(26).fill(10),s:'abcdefghij'}).result,[1,100]);
});

test('input contracts reject malformed shapes and broken domain promises',()=>{
 const invalid={594:{nums:[]},598:{m:2,n:3,ops:[[4,1]]},599:{list1:['a'],list2:['b']},646:{pairs:[[3,1]]},657:{moves:'URX'},658:{arr:[3,1],k:1,x:2},661:{img:[[1],[2,3]]},665:{nums:[null]},670:{num:-1},673:{nums:Array(31).fill(1)},678:{s:'a'},680:{s:'Ab'},682:{operations:['+']},686:{a:'',b:'abc'},692:{words:['a'],k:2},693:{n:0},696:{s:'012'},709:{s:'é'},713:{nums:[0],k:5},714:{prices:[3],fee:-1},717:{bits:[1]},718:{nums1:Array(13).fill(1),nums2:[1]},728:{left:0,right:10},733:{image:[[1]],sr:2,sc:0,color:3},735:{asteroids:[0]},738:{n:-1},740:{nums:[0]},744:{letters:['z','a'],target:'b'},771:{jewels:'aa',stones:'a'},796:{s:'a',goal:''},804:{words:['A']},806:{widths:[4],s:'a'},821:{s:'abc',c:'x'},830:{s:'ABC'},836:{rec1:[1,1,0,0],rec2:[1,2,3,4]},844:{s:'A',t:'a'},849:{seats:[1,1]},852:{arr:[1,2,3]},856:{s:'())'},859:{s:'A',goal:'a'}};
 for(const[id,input]of Object.entries(invalid))assert.throws(()=>definitions[id].parse(JSON.stringify(input)),undefined,id);
});

test('matrix and stack snapshots retain earlier states after the run finishes',()=>{
 const fill=check(733,{image:[[1,1],[1,1]],sr:0,sc:0,color:8});assert.deepEqual(fill.frames[1].matrix,[[8,8],[8,1]]);
 const rounds=check(682,{operations:['7','D','C']});assert.deepEqual(rounds.frames[1].output,[7]);
});
