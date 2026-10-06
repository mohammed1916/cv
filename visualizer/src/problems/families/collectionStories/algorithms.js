import { nextSequenceSolvers } from './nextSequenceBatch.js';
import { graphGridSolvers } from './graphGridAlgorithms.js';
import { databaseSolvers } from './databaseAlgorithms.js';
import { broadSolvers } from './expansionBroadAlgorithms.js';
import { rangeSolvers } from './expansionRangeAlgorithms.js';
import { trieSolvers } from './trieAlgorithms.js';
import { continuedSolvers } from './expansionContinuedAlgorithms.js';
import { forwardSolvers } from './expansionForwardAlgorithms.js';
import { advanceSolvers } from './expansionAdvanceAlgorithms.js';
import { progressSolvers } from './expansionProgressAlgorithms.js';
import { continuingSolvers } from './expansionNextAlgorithms.js';
import { nextSolvers } from './nextAlgorithms.js';
import { expansionSolvers } from './expansionAlgorithms.js';
import { dpSolvers } from './expansionDPAlgorithms.js';
import { moreSolvers } from './expansionMoreAlgorithms.js';
import { laterSolvers } from './expansionLaterAlgorithms.js';
const sum = values => values.reduce((a, b) => a + b, 0);
const frequencies = values => { const counts = new Map(); for (const v of values) counts.set(v, (counts.get(v) || 0) + 1); return counts; };
const gcd = (a, b) => b ? gcd(b, a % b) : a;

export const solvers = {
  ...nextSolvers,
  ...expansionSolvers,
  ...dpSolvers,
  ...moreSolvers,
  ...laterSolvers,
...continuingSolvers,
...progressSolvers,
...advanceSolvers,
...forwardSolvers,
...continuedSolvers,
...trieSolvers,
...rangeSolvers,
...broadSolvers,
...databaseSolvers,
...nextSequenceSolvers,
...graphGridSolvers,
  860({bills}, emit) {
    let five=0,ten=0;
    for(let i=0;i<bills.length;i++) { const bill=bills[i];let possible=true;
      if(bill===5)five++;else if(bill===10){five--;ten++;}else if(ten>0){ten--;five--;}else five-=3;
      if(five<0)possible=false;
      emit(`Customer ${i} pays ${bill}. ${bill===20?'Prefer a ten and a five to conserve fives.':''} ${possible?'Change is available.':'Required change is unavailable.'}`,{index:i,metrics:{fiveDollarBills:Math.max(0,five),tenDollarBills:ten,possible}},'update');if(!possible)return false;
    }return true;
  },
  861({grid},emit) {
    const a=grid.map(r=>[...r]);for(let r=0;r<a.length;r++){if(!a[r][0])a[r]=a[r].map(v=>1-v);emit(`Row ${r}: make its highest-weight bit one, which outweighs all lower bits combined.`,{matrix:a,cell:[r,0]},'update');}
    for(let c=1;c<a[0].length;c++){const ones=a.filter(r=>r[c]).length;if(ones<a.length-ones)for(const row of a)row[c]=1-row[c];emit(`Column ${c} had ${ones} ones. Choose its orientation with the most ones independently.`,{matrix:a,cell:[0,c],metrics:{column:c,onesBefore:ones}},'update');}return sum(a.map(row=>row.reduce((value,bit)=>value*2+bit,0)));
  },
  868({n},emit) {
    const bits=n.toString(2);let last=-1,best=0;[...bits].forEach((bit,i)=>{if(bit==='1'){if(last>=0)best=Math.max(best,i-last);last=i;}emit(`Read bit ${bit}; distances are measured between neighboring set-bit positions.`,{sequence:bits,index:i,metrics:{lastOne:last,longestGap:best}},'update');});return best;
  },
  869({n},emit) {
    const signature=v=>[...String(v)].sort().join(''),target=signature(n);for(let power=1;power<=1073741824;power*=2){const match=signature(power)===target;emit(`Compare the digit multiset of ${n} with power ${power}: ${match?'equal':'different'}.`,{metrics:{candidate:power,inputDigits:target,candidateDigits:signature(power)}});if(match)return true;}return false;
  },
  881({people,limit},emit) {
    const a=[...people].sort((x,y)=>x-y);let left=0,right=a.length-1,boats=0;
    while(left<=right){const light=left,heavy=right,paired=left<right&&a[left]+a[right]<=limit;if(paired)left++;right--;boats++;emit(`Send the heaviest remaining person ${a[heavy]} ${paired?'with '+a[light]:'alone'}. Pairing with the lightest is the best possible attempt.`,{sequence:a,marks:{[light]:'lightest',[heavy]:'heaviest'},metrics:{boats,limit,paired}},'update');}return boats;
  },
  883({grid},emit) {
    let top=0;const rows=grid.map(()=>0),cols=grid[0].map(()=>0);grid.forEach((row,r)=>row.forEach((h,c)=>{if(h)top++;rows[r]=Math.max(rows[r],h);cols[c]=Math.max(cols[c],h);emit(`Stack (${r},${c}) of height ${h}: occupied cells contribute to the top view; row and column maxima determine side views.`,{matrix:grid,cell:[r,c],metrics:{top,rowMaxima:rows,columnMaxima:cols}},'update');}));return top+sum(rows)+sum(cols);
  },
  884({s1,s2},emit) {
    const words=(s1+' '+s2).split(' '),counts=new Map();words.forEach((word,i)=>{counts.set(word,(counts.get(word)||0)+1);emit(`Count '${word}' across both sentences. Uncommon means exactly one combined occurrence.`,{sequence:words,index:i,table:[...counts]},'update');});return [...counts].filter(([,n])=>n===1).map(([word])=>word);
  },
  888({aliceSizes,bobSizes},emit) {
    const delta=(sum(aliceSizes)-sum(bobSizes))/2,available=new Set(bobSizes);
    for(let i=0;i<aliceSizes.length;i++){const a=aliceSizes[i],b=a-delta;emit(`Giving Alice's ${a} requires Bob's ${b}, because a-b must equal half the total difference (${delta}).`,{sequence:aliceSizes,index:i,metrics:{differenceHalf:delta,aliceGives:a,bobMustGive:b}});if(available.has(b))return [a,b];}throw new Error('No balancing swap exists.');
  },
  890({words,pattern},emit) {
    const output=[];words.forEach((word,i)=>{const forward=new Map(),reverse=new Map();let matches=word.length===pattern.length;for(let j=0;matches&&j<word.length;j++){const a=pattern[j],b=word[j];if(forward.has(a)&&forward.get(a)!==b||reverse.has(b)&&reverse.get(b)!==a)matches=false;forward.set(a,b);reverse.set(b,a);}if(matches)output.push(word);emit(`'${word}' ${matches?'has':'does not have'} a one-to-one character mapping with '${pattern}'. Both directions must agree.`,{index:i,output,metrics:{pattern,matches,mapping:[...forward]}},'update');});return output;
  },
  892({grid},emit) {
    let area=0;grid.forEach((row,r)=>row.forEach((h,c)=>{let added=0;if(h){added=2+4*h;if(r)added-=2*Math.min(h,grid[r-1][c]);if(c)added-=2*Math.min(h,grid[r][c-1]);}area+=added;emit(`Stack (${r},${c}): add its exposed base/top and sides, subtract both faces at each shared earlier boundary.`,{matrix:grid,cell:[r,c],metrics:{height:h,added,area}},'update');}));return area;
  },
  893({words},emit) {
    const groups=new Set();words.forEach((word,i)=>{const parity=p=>[...word].filter((_,j)=>j%2===p).sort().join(''),key=parity(0)+'|'+parity(1);groups.add(key);emit(`'${word}' has signature ${key}. Swaps preserve the even-position and odd-position multisets separately.`,{index:i,output:[...groups],metrics:{groups:groups.size}},'update');});return groups.size;
  },
  898({arr},emit) {
    let ending=new Set();const all=new Set();arr.forEach((v,i)=>{ending=new Set([v,...[...ending].map(x=>x|v)]);for(const x of ending)all.add(x);emit(`OR results ending at ${i} extend every previous suffix, plus singleton ${v}. Deduplicate equal results.`,{sequence:arr,index:i,output:[...ending],metrics:{distinctOverall:all.size}},'update');});return all.size;
  },
  899({s,k},emit) {
    if(k>1){const sorted=[...s].sort().join('');emit('With at least two choices, repeated allowed operations can realize adjacent exchanges, so the sorted permutation is reachable.',{sequence:s,output:[...sorted],metrics:{k}},'update');return sorted;}
    let best=s;for(let i=0;i<s.length;i++){const rotated=s.slice(i)+s.slice(0,i);if(rotated<best)best=rotated;emit(`k=1 permits only rotations. Compare rotation ${i} with the best so far.`,{sequence:rotated,metrics:{rotation:i,best}},'update');}return best;
  },
  901({prices},emit) {
    const stack=[],output=[];prices.forEach((price,i)=>{let span=1;while(stack.length&&stack.at(-1)[0]<=price)span+=stack.pop()[1];stack.push([price,span]);output.push(span);emit(`Price ${price} absorbs blocks with prices no greater than itself; each stored block carries its full span.`,{index:i,output,table:stack,tableHeaders:['Price','Absorbed span']},'update');});return output;
  },
  904({fruits},emit) {
    const counts=new Map();let left=0,best=0;fruits.forEach((v,right)=>{counts.set(v,(counts.get(v)||0)+1);while(counts.size>2){const out=fruits[left++],n=counts.get(out)-1;if(n)counts.set(out,n);else counts.delete(out);}best=Math.max(best,right-left+1);emit(`The window now contains ${counts.size} fruit types. Shrink only when a third type appears.`,{sequence:fruits,index:right,window:[left,right],table:[...counts],metrics:{best}},'update');});return best;
  },
  908({nums,k},emit) {
    const minimum=Math.min(...nums),maximum=Math.max(...nums),range=Math.max(0,maximum-minimum-2*k);emit('The smallest value can rise by k and the greatest can fall by k. If their reachable intervals overlap, all values can meet.',{metrics:{minimum,maximum,k,range}},'update');return range;
  },
  914({deck},emit) {
    const counts=frequencies(deck);let divisor=0;for(const [value,count]of counts){divisor=gcd(divisor,count);emit(`Value ${value} occurs ${count} times. A common group size must divide every frequency; cumulative gcd is ${divisor}.`,{table:[...counts],metrics:{value,count,commonDivisor:divisor}},'update');}return divisor>=2;
  },
  915({nums},emit) {
    let boundary=0,leftMax=nums[0],seenMax=nums[0];for(let i=1;i<nums.length;i++){seenMax=Math.max(seenMax,nums[i]);const expanded=nums[i]<leftMax;if(expanded){boundary=i;leftMax=seenMax;}emit(`At ${i}, ${expanded?'this value belongs within the expanded left region':'no additional expansion is needed'}. The left maximum must not exceed any eventual right value.`,{index:i,window:[0,boundary],metrics:{leftMaximum:leftMax,seenMaximum:seenMax,boundary}},'update');}return boundary+1;
  },
  917({s},emit) {
    const a=[...s],letter=c=>/[a-zA-Z]/.test(c);let left=0,right=a.length-1;while(left<right){if(!letter(a[left]))left++;else if(!letter(a[right]))right--;else{[a[left],a[right]]=[a[right],a[left]];emit(`Swap letters at ${left} and ${right}; nonletter positions stay fixed.`,{sequence:a,marks:{[left]:'left',[right]:'right'}},'update');left++;right--;}}return a.join('');
  },
  918({nums},emit) {
    let total=0,maxEnd=0,minEnd=0,best=-Infinity,worst=Infinity;nums.forEach((v,i)=>{maxEnd=Math.max(v,maxEnd+v);minEnd=Math.min(v,minEnd+v);best=Math.max(best,maxEnd);worst=Math.min(worst,minEnd);total+=v;emit('Track the best ordinary subarray and the worst excluded block. A wrapping answer is total minus that excluded block.',{index:i,metrics:{total,maxEnd,minEnd,best,worst}},'update');});return best<0?best:Math.max(best,total-worst);
  },
  921({s},emit) {
    let open=0,inserted=0;[...s].forEach((c,i)=>{if(c==='(')open++;else if(open)open--;else inserted++;emit(`Read '${c}': pair a closing bracket if possible, otherwise it needs a new opener.`,{index:i,metrics:{unmatchedOpen:open,insertedOpen:inserted}},'update');});return open+inserted;
  },
  925({name,typed},emit) {
    let i=0;for(let j=0;j<typed.length;j++){const exact=i<name.length&&name[i]===typed[j],repeat=j>0&&typed[j]===typed[j-1];if(exact)i++;emit(`Typed '${typed[j]}' ${exact?'consumes the next name character':repeat?'repeats the previous press':'cannot match or repeat'}.`,{sequence:typed,index:j,metrics:{matchedNameCharacters:i,name}},'update');if(!exact&&!repeat)return false;}return i===name.length;
  },
  926({s},emit) {
    let ones=0,flips=0;[...s].forEach((c,i)=>{if(c==='1')ones++;else flips=Math.min(flips+1,ones);emit(`For a zero after earlier ones, either flip this zero or flip every earlier one. Keep the cheaper prefix solution.`,{index:i,metrics:{onesSeen:ones,minimumFlips:flips}},'update');});return flips;
  },
  929({emails},emit) {
    const seen=new Set();emails.forEach((email,i)=>{const [local,domain]=email.split('@'),normalized=local.split('+')[0].replaceAll('.','')+'@'+domain;seen.add(normalized);emit(`Normalize only the local part of '${email}' to '${normalized}'. Domain dots and characters remain significant.`,{index:i,output:[...seen],metrics:{distinct:seen.size}},'update');});return seen.size;
  },
  930({nums,goal},emit) {
    const counts=new Map([[0,1]]);let prefix=0,total=0;nums.forEach((v,i)=>{prefix+=v;const added=counts.get(prefix-goal)||0;total+=added;counts.set(prefix,(counts.get(prefix)||0)+1);emit(`Prefix ${prefix} needs an earlier prefix ${prefix-goal}. ${added} occurrences produce valid subarrays ending here.`,{index:i,table:[...counts],tableHeaders:['Prefix sum','Occurrences'],metrics:{prefix,added,total}},'update');});return total;
  },
  931({matrix},emit) {
    const dp=matrix.map(row=>row.map(()=>null));dp[0]=[...matrix[0]];emit('The first row has no predecessor; each starting cost is its own cell value.',{matrix,outputMatrix:dp},'update');for(let r=1;r<matrix.length;r++)for(let c=0;c<matrix[0].length;c++){const candidates=dp[r-1].slice(Math.max(0,c-1),c+2);dp[r][c]=matrix[r][c]+Math.min(...candidates);emit(`Cost at (${r},${c}) is ${matrix[r][c]} plus the least of the valid three previous-row neighbors.`,{matrix,cell:[r,c],outputMatrix:dp,outputCell:[r,c],metrics:{predecessorCosts:candidates}},'update');}return Math.min(...dp.at(-1));
  },
  933({times},emit) {
    let head=0;const output=[];times.forEach((t,i)=>{while(times[head]<t-3000)head++;output.push(i-head+1);emit(`At time ${t}, keep calls in the inclusive interval [${t-3000},${t}].`,{sequence:times,index:i,window:[head,i],output,metrics:{oldestIncluded:times[head],count:i-head+1}},'update');});return output;
  },
  941({arr},emit) {
    let i=0;while(i+1<arr.length&&arr[i]<arr[i+1]){i++;emit('Climb a strictly increasing edge.',{sequence:arr,index:i},'update');}if(i===0||i===arr.length-1){emit('A valid mountain needs nonempty increasing and decreasing sides.');return false;}while(i+1<arr.length&&arr[i]>arr[i+1]){i++;emit('Descend a strictly decreasing edge; any plateau or new rise invalidates the mountain.',{sequence:arr,index:i},'update');}return i===arr.length-1;
  },
  942({s},emit) {
    let low=0,high=s.length;const output=[];[...s].forEach((c,i)=>{output.push(c==='I'?low++:high--);emit(`'${c}': use the ${c==='I'?'smallest':'largest'} remaining number so the next relation is guaranteed.`,{index:i,output,metrics:{low,high}},'update');});output.push(low);return output;
  },
  944({strs},emit) {
    let deleted=0;for(let c=0;c<strs[0].length;c++){const bad=strs.some((s,r)=>r>0&&s[c]<strs[r-1][c]);if(bad)deleted++;emit(`Column ${c} ${bad?'contains a descending pair and must be deleted':'is nondecreasing from top to bottom'}.`,{matrix:strs.map(s=>[...s]),cell:[0,c],metrics:{column:c,deleted}},'update');}return deleted;
  },
  945({nums},emit) {
    const a=[...nums].sort((x,y)=>x-y);let moves=0;for(let i=1;i<a.length;i++){const old=a[i];a[i]=Math.max(a[i],a[i-1]+1);moves+=a[i]-old;emit(`At ${i}, raise ${old} only as far as ${a[i]}, the smallest value above its predecessor.`,{sequence:a,index:i,metrics:{added:a[i]-old,moves}},'update');}return moves;
  },
  946({pushed,popped},emit) {
    const stack=[];let j=0;pushed.forEach((v,i)=>{stack.push(v);emit(`Push ${v} so it becomes available as the next stack top.`,{sequence:pushed,index:i,output:stack,metrics:{nextPop:popped[j]??'none'}},'update');while(stack.length&&stack.at(-1)===popped[j]){stack.pop();j++;emit('The stack top matches the next requested pop; remove it now.',{sequence:pushed,index:i,output:stack,metrics:{consumedPops:j,nextPop:popped[j]??'none'}},'update');}});return j===popped.length;
  },
  948({tokens,power},emit) {
    const a=[...tokens].sort((x,y)=>x-y);let left=0,right=a.length-1,score=0,best=0;while(left<=right){if(power>=a[left]){power-=a[left++];score++;best=Math.max(best,score);}else if(score>0&&left<right){power+=a[right--];score--;}else break;emit('Buy score with the cheapest token when possible; otherwise sell the largest remaining token only when another purchase may follow.',{sequence:a,window:[left,right],metrics:{power,score,best}},'update');}return best;
  },
  950({deck},emit) {
    const sorted=[...deck].sort((a,b)=>a-b),queue=deck.map((_,i)=>i),output=deck.map(()=>null);sorted.forEach((v,i)=>{const slot=queue.shift();output[slot]=v;if(queue.length)queue.push(queue.shift());emit(`The next reveal position is ${slot}; place the next smallest card ${v} there, then rotate the remaining position queue.`,{sequence:sorted,index:i,output,outputIndex:slot,metrics:{remainingPositions:queue}},'update');});return output;
  },
  953({words,order},emit) {
    const rank=new Map([...order].map((c,i)=>[c,i]));for(let i=1;i<words.length;i++){const a=words[i-1],b=words[i];let j=0;while(j<Math.min(a.length,b.length)&&a[j]===b[j])j++;const valid=j===Math.min(a.length,b.length)?a.length<=b.length:rank.get(a[j])<rank.get(b[j]);emit(`Compare '${a}' then '${b}': ${j===Math.min(a.length,b.length)?'shared prefix makes shorter-first mandatory':'first differing characters determine the order'}.`,{index:i,metrics:{first:a,second:b,position:j,valid}});if(!valid)return false;}return true;
  },
  961({nums},emit) {
    const seen=new Set();for(let i=0;i<nums.length;i++){const v=nums[i],found=seen.has(v);emit(`Read ${v}: ${found?'its second occurrence identifies the promised repeated value':'first occurrence, remember it'}.`,{index:i,output:[...seen]});if(found)return v;seen.add(v);}throw new Error('No repeated value.');
  },
  962({nums},emit) {
    const stack=[];nums.forEach((v,i)=>{if(!stack.length||v<nums[stack.at(-1)])stack.push(i);emit('Keep only strictly decreasing left candidates; an earlier no-greater value always gives a wider ramp.',{index:i,output:stack,metrics:{stage:'left candidates'}},'update');});let best=0;for(let j=nums.length-1;j>=0;j--)while(stack.length&&nums[stack.at(-1)]<=nums[j]){const i=stack.pop();best=Math.max(best,j-i);emit(`Right endpoint ${j} reaches candidate ${i}; this is its farthest possible right endpoint.`,{index:j,marks:{[i]:'left'},output:stack,metrics:{width:j-i,best}},'update');}return best;
  },
  970({x,y,bound},emit) {
    const seen=new Set();for(let a=1;a<=bound;a*=x){for(let b=1;a+b<=bound;b*=y){seen.add(a+b);emit(`Combine powers ${a} and ${b}; keep sum ${a+b} once.`,{sequence:[a,b],output:[...seen].sort((p,q)=>p-q),metrics:{bound}},'update');if(y===1)break;}if(x===1)break;}return [...seen].sort((a,b)=>a-b);
  },
  973({points,k},emit) {
    const ranked=points.map((point,i)=>({point,index:i,distance:point[0]**2+point[1]**2})).sort((a,b)=>a.distance-b.distance||a.index-b.index),output=[];ranked.forEach((entry,i)=>{if(i<k)output.push(entry.point);emit(`Squared distance for (${entry.point}) is ${entry.distance}; ${i<k?'include it among the k closest':'it follows the chosen prefix'}.`,{sequence:ranked.map(p=>`(${p.point})`),index:i,output:output.map(p=>`(${p})`),metrics:{squaredDistance:entry.distance,rank:i+1,k}},'update');});return output;
  },
  974({nums,k},emit) {
    const counts=new Map([[0,1]]);let remainder=0,total=0;nums.forEach((v,i)=>{remainder=((remainder+v)%k+k)%k;const added=counts.get(remainder)||0;total+=added;counts.set(remainder,added+1);emit(`Normalized remainder ${remainder} matches ${added} earlier prefixes; each difference is divisible by ${k}.`,{index:i,table:[...counts],tableHeaders:['Remainder','Frequency'],metrics:{remainder,added,total}},'update');});return total;
  },
  976({nums},emit) {
    const a=[...nums].sort((x,y)=>y-x);for(let i=0;i+2<a.length;i++){const valid=a[i+1]+a[i+2]>a[i];emit(`Try sides ${a.slice(i,i+3)}. ${valid?'Their largest perimeter is valid.':'Even the next two largest cannot support this largest side; discard it.'}`,{sequence:a,index:i,window:[i,i+2],metrics:{valid}});if(valid)return sum(a.slice(i,i+3));}return 0;
  },
  978({arr},emit) {
    let previous=0,length=1,best=1;for(let i=1;i<arr.length;i++){const sign=Math.sign(arr[i]-arr[i-1]);length=sign===0?1:sign===-previous?length+1:2;best=Math.max(best,length);previous=sign;emit('A nonzero comparison opposite to the prior comparison extends turbulence; equality resets the run.',{sequence:arr,index:i,window:[i-length+1,i],metrics:{comparison:sign,length,best}},'update');}return best;
  },
  983({days,costs},emit) {
    const dp=Array(days.length+1).fill(0);for(let i=days.length-1;i>=0;i--){const choices=[1,7,30].map((duration,index)=>{let next=i;while(next<days.length&&days[next]<days[i]+duration)next++;return costs[index]+dp[next];});dp[i]=Math.min(...choices);emit(`Cover travel day ${days[i]} using each pass duration, then pay the optimal remaining suffix after its coverage ends.`,{sequence:days,index:i,output:dp,metrics:{oneDay:choices[0],sevenDays:choices[1],thirtyDays:choices[2]}},'update');}return dp[0];
  },
  985({nums,queries},emit) {
    const a=[...nums],output=[];let even=sum(a.filter(v=>v%2===0));queries.forEach(([value,index],i)=>{const before=a[index];if(before%2===0)even-=before;a[index]+=value;if(a[index]%2===0)even+=a[index];output.push(even);emit(`Query ${i}: remove old even contribution ${before}, update index ${index} by ${value}, then add its new even contribution if any.`,{sequence:a,index,output,metrics:{before,after:a[index],evenSum:even}},'update');});return output;
  },
  989({num,k},emit) {
    const output=[];let carry=k;for(let i=num.length-1;i>=0||carry>0;i--){if(i>=0)carry+=num[i];output.push(carry%10);carry=Math.floor(carry/10);emit('Process one decimal position from right to left: keep the units digit and carry the quotient.',{sequence:num,index:Math.max(0,i),output:[...output].reverse(),metrics:{carry}},'update');}return output.reverse();
  },
  991({startValue,target},emit) {
    let value=target,steps=0;while(value>startValue){const before=value;value=value%2?value+1:value/2;steps++;emit(`Work backward from ${before}: ${before%2?'undo a decrement by adding one':'undo a doubling by halving'}.`,{sequence:[startValue,value],metrics:{targetRemaining:value,steps}},'update');}return steps+startValue-value;
  },
  997({n,trust},emit) {
    const incoming=Array(n+1).fill(0),outgoing=Array(n+1).fill(0);trust.forEach(([a,b],i)=>{outgoing[a]++;incoming[b]++;emit(`Person ${a} trusts ${b}. The judge needs n-1 incoming edges and no outgoing edge.`,{sequence:trust.map(p=>`${p[0]} → ${p[1]}`),index:i,table:Array.from({length:n},(_,j)=>[j+1,incoming[j+1],outgoing[j+1]]),tableHeaders:['Person','Incoming','Outgoing']},'update');});return incoming.findIndex((count,i)=>i>0&&count===n-1&&outgoing[i]===0);
  },
  999({board},emit) {
    let r=0,c=0;board.forEach((row,i)=>row.forEach((v,j)=>{if(v==='R'){r=i;c=j;}}));let captures=0;for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]])for(let i=r+dr,j=c+dc;i>=0&&i<8&&j>=0&&j<8;i+=dr,j+=dc){const value=board[i][j];if(value==='p')captures++;emit(`Scan from rook (${r},${c}) toward (${i},${j}): ${value==='.'?'empty, continue':value==='p'?'pawn can be captured; stop this ray':'bishop blocks this ray'}.`,{matrix:board,cell:[i,j],otherCell:[r,c],metrics:{captures}},'update');if(value!=='.')break;}return captures;
  },
  1002({words},emit) {
    let common=frequencies([...words[0]]);words.forEach((word,i)=>{const counts=frequencies([...word]);for(const[c,n]of common)common.set(c,Math.min(n,counts.get(c)||0));emit(`Intersect character multiplicities with '${word}'; keep the minimum count seen in every processed word.`,{index:i,table:[...common],metrics:{processed:i+1}},'update');});return [...common].flatMap(([c,n])=>Array(n).fill(c));
  },
  1005({nums,k},emit) {
    const a=[...nums].sort((x,y)=>x-y);let remaining=k;for(let i=0;i<a.length&&a[i]<0&&remaining;i++){a[i]=-a[i];remaining--;emit('Flip the most negative remaining value to gain the most sum with this operation.',{sequence:a,index:i,metrics:{remaining}},'update');}const total=sum(a),minimum=Math.min(...a);emit('Unused operations cancel in pairs. An odd leftover flips the smallest absolute value once.',{sequence:a,metrics:{remaining,total,smallestMagnitude:minimum}});return total-(remaining%2?2*minimum:0);
  },
};
