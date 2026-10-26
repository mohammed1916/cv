// Explicit algorithms; emit records the state actually reached by each decision.
export const solvers = {
  594({nums}, emit) {
    const counts=new Map(); let best=0;
    nums.forEach((v,i)=>{counts.set(v,(counts.get(v)||0)+1);emit(`Record occurrence of ${v}.`,{index:i,table:[...counts]},'update');});
    for(const [v,n] of counts){const adjacent=counts.get(v+1)||0;if(adjacent)best=Math.max(best,n+adjacent);emit(`Only ${v} and ${v+1} can form this candidate: difference must be exactly one.`,{table:[...counts],metrics:{lower:v,lowerCount:n,upperCount:adjacent,best}});}
    return best;
  },
  598({m,n,ops},emit) {
    let rows=m,cols=n;
    ops.forEach(([a,b],i)=>{rows=Math.min(rows,a);cols=Math.min(cols,b);emit(`Operation ${i} covers an origin-anchored rectangle. Their common rectangle is now ${rows} by ${cols}.`,{index:i,metrics:{rows,cols,maximalCells:rows*cols}},'update');});
    return rows*cols;
  },
  599({list1,list2},emit) {
    const indices=new Map(list1.map((name,i)=>[name,i]));let best=Infinity;const output=[];
    list2.forEach((name,j)=>{const i=indices.get(name);if(i!==undefined){if(i+j<best){best=i+j;output.length=0;}if(i+j===best)output.push(name);}emit(i===undefined?`${name} is absent from the first list.`:`${name}: first index ${i} plus second index ${j} is ${i+j}. Keep every minimum tie.`,{sequence:list2,index:j,output,metrics:{best:best===Infinity?'no common entry':best}},'update');});
    return output;
  },
  646({pairs},emit) {
    const ordered=[...pairs].sort((a,b)=>a[1]-b[1]);let end=-Infinity;const output=[];
    ordered.forEach(([a,b],i)=>{const take=a>end;if(take){output.push([a,b]);end=b;}emit(take?`Take [${a},${b}]: it starts strictly after the previous end.`:`Skip [${a},${b}]: touching or overlapping cannot extend the chain.`,{sequence:ordered.map(p=>`[${p}]`),index:i,output:output.map(p=>`[${p}]`),metrics:{end,length:output.length}},'update');});
    return output.length;
  },
  657({moves},emit) {
    let x=0,y=0;const delta={U:[0,1],D:[0,-1],L:[-1,0],R:[1,0]};
    [...moves].forEach((v,i)=>{x+=delta[v][0];y+=delta[v][1];emit(`Move ${v} to (${x},${y}); opposite moves cancel on each axis.`,{index:i,metrics:{x,y}},'update');});
    return x===0&&y===0;
  },
  658({arr,k,x},emit) {
    let left=0,right=arr.length-1;
    while(right-left+1>k){const dropLeft=Math.abs(arr[left]-x)>Math.abs(arr[right]-x);emit(`Compare distances ${Math.abs(arr[left]-x)} and ${Math.abs(arr[right]-x)}. ${dropLeft?'Discard left.':'Discard right; ties favor smaller values.'}`,{sequence:arr,window:[left,right],marks:{[left]:'left',[right]:'right'},metrics:{target:x,remaining:right-left+1}});if(dropLeft)left++;else right--;}
    emit(`Keep indices ${left} through ${right}.`,{sequence:arr,window:[left,right],output:arr.slice(left,right+1)},'update');return arr.slice(left,right+1);
  },
  661({img},emit) {
    const output=img.map(row=>row.map(()=>null));
    for(let r=0;r<img.length;r++)for(let c=0;c<img[0].length;c++){let sum=0,count=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const value=img[r+dr]?.[c+dc];if(value!==undefined){sum+=value;count++;}}output[r][c]=Math.floor(sum/count);emit(`Cell (${r},${c}) uses ${count} existing neighbors including itself: floor(${sum}/${count}) = ${output[r][c]}.`,{matrix:img,cell:[r,c],outputMatrix:output,outputCell:[r,c],metrics:{sum,count}},'update');}
    return output;
  },
  665({nums},emit) {
    const a=[...nums];let edits=0;
    for(let i=1;i<a.length;i++){if(a[i]<a[i-1]){edits++;if(edits>1){emit('A second descending pair requires another edit; one modification cannot suffice.',{sequence:a,index:i,metrics:{edits}});return false;}if(i<2||a[i]>=a[i-2])a[i-1]=a[i];else a[i]=a[i-1];}emit(`Prefix through ${i} is nondecreasing after ${edits} edit(s). Lower the prior value only when it preserves the earlier boundary.`,{sequence:a,index:i,metrics:{edits}},'update');}
    return true;
  },
  670({num},emit) {
    const digits=[...String(num)],last=Array(10).fill(-1);digits.forEach((d,i)=>last[+d]=i);
    for(let i=0;i<digits.length;i++){for(let d=9;d>+digits[i];d--)if(last[d]>i){const j=last[d];[digits[i],digits[j]]=[digits[j],digits[i]];emit(`Improve the earliest possible digit by swapping with the rightmost ${d} at ${j}.`,{sequence:digits,index:i,marks:{[j]:'swapped'},metrics:{value:Number(digits.join(''))}},'update');return Number(digits.join(''));}emit(`No greater digit exists to the right of index ${i}; keep this prefix.`,{sequence:digits,index:i});}return num;
  },
  673({nums},emit) {
    const lengths=nums.map(()=>1),counts=nums.map(()=>1);
    for(let i=0;i<nums.length;i++){for(let j=0;j<i;j++){if(nums[j]<nums[i]){if(lengths[j]+1>lengths[i]){lengths[i]=lengths[j]+1;counts[i]=counts[j];}else if(lengths[j]+1===lengths[i])counts[i]+=counts[j];}emit(`Consider extending an increasing subsequence ending at ${j} into ${i}; equal best lengths add their counts.`,{index:i,marks:{[j]:'predecessor'},table:nums.map((v,k)=>[k,v,lengths[k],counts[k]]),tableHeaders:['Index','Value','Length','Ways']},'update');}}
    const best=Math.max(...lengths);return counts.reduce((total,n,i)=>total+(lengths[i]===best?n:0),0);
  },
  678({s},emit) {
    let low=0,high=0;
    for(let i=0;i<s.length;i++){low+=s[i]==='('?1:-1;high+=s[i]===')'?-1:1;if(high<0){emit('Even treating every star as an opener leaves an unmatched closing bracket.',{index:i,metrics:{low,high}});return false;}low=Math.max(0,low);emit(`After '${s[i]}', feasible unmatched open counts range from ${low} to ${high}.`,{index:i,metrics:{minimumOpen:low,maximumOpen:high}},'update');}return low===0;
  },
  680({s},emit) {
    const palindrome=(left,right)=>{while(left<right){emit(`Check remaining pair ${left}, ${right} after spending the one deletion.`,{sequence:s,marks:{[left]:'left',[right]:'right'}});if(s[left++]!==s[right--])return false;}return true;};
    let left=0,right=s.length-1;while(left<right){emit(`Compare '${s[left]}' and '${s[right]}'. A mismatch permits deleting only one endpoint.`,{marks:{[left]:'left',[right]:'right'}});if(s[left]!==s[right])return palindrome(left+1,right)||palindrome(left,right-1);left++;right--;}return true;
  },
  682({operations},emit) {
    const stack=[];
    operations.forEach((op,i)=>{if(op==='C')stack.pop();else if(op==='D')stack.push(2*stack.at(-1));else if(op==='+')stack.push(stack.at(-1)+stack.at(-2));else stack.push(Number(op));emit(`Apply ${op} to the record of valid rounds; canceled rounds no longer contribute.`,{index:i,output:stack,metrics:{total:stack.reduce((a,b)=>a+b,0)}},'update');});return stack.reduce((a,b)=>a+b,0);
  },
  686({a,b},emit) {
    let text='',repeats=0;const limit=Math.ceil(b.length/a.length)+1;
    while(repeats<limit){text+=a;repeats++;const found=text.includes(b);emit(`After ${repeats} repeats, the target ${found?'appears':'does not appear'} as a contiguous substring.`,{sequence:text,metrics:{repeats,target:b}},'update');if(found)return repeats;}return -1;
  },
  692({words,k},emit) {
    const counts=new Map();words.forEach((word,i)=>{counts.set(word,(counts.get(word)||0)+1);emit(`Count '${word}' before ranking; frequency ties will use alphabetical order.`,{index:i,table:[...counts]},'update');});
    const ranked=[...counts].sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0));emit('Rank greater frequency first, then lexicographically smaller words.',{table:ranked,output:ranked.slice(0,k).map(([word])=>word)});return ranked.slice(0,k).map(([word])=>word);
  },
  693({n},emit) {
    const bits=n.toString(2);for(let i=1;i<bits.length;i++){emit(`Adjacent bits ${bits[i-1]} and ${bits[i]} must differ.`,{sequence:bits,index:i});if(bits[i]===bits[i-1])return false;}return true;
  },
  696({s},emit) {
    let previous=0,current=1,total=0;
    for(let i=1;i<s.length;i++){if(s[i]===s[i-1])current++;else{total+=Math.min(previous,current);previous=current;current=1;}emit('Only neighboring equal-character runs can form grouped balanced substrings.',{index:i,metrics:{previousRun:previous,currentRun:current,completedPairs:total}},'update');}return total+Math.min(previous,current);
  },
  709({s},emit) {
    const output=[];[...s].forEach((c,i)=>{const code=c.charCodeAt(0);output.push(code>=65&&code<=90?String.fromCharCode(code+32):c);emit(`Character '${c}' ${code>=65&&code<=90?'is uppercase ASCII: shift by 32':'stays unchanged'}.`,{index:i,output},'update');});return output.join('');
  },
  713({nums,k},emit) {
    if(k<=1){emit('Every product is at least one, so no nonempty subarray meets this threshold.');return 0;}
    let left=0,product=1,count=0;nums.forEach((v,right)=>{product*=v;while(left<=right&&product>=k)product/=nums[left++];const added=right-left+1;count+=added;emit(`After shrinking, ${added} valid subarrays end at ${right}; extend each possible start within the window.`,{index:right,window:[left,right],metrics:{product,added,count}},'update');});return count;
  },
  714({prices,fee},emit) {
    let cash=0,hold=-prices[0];
    for(let i=1;i<prices.length;i++){const oldCash=cash,oldHold=hold;cash=Math.max(oldCash,oldHold+prices[i]-fee);hold=Math.max(oldHold,oldCash-prices[i]);emit(`Day ${i}: compare keeping cash with selling, and keeping stock with buying. Charge the fee only when selling.`,{index:i,metrics:{price:prices[i],fee,cash,hold}},'update');}return cash;
  },
  717({bits},emit) {
    let i=0;while(i<bits.length-1){const width=bits[i]===1?2:1;emit(`At ${i}, leading bit ${bits[i]} consumes ${width} bit(s).`,{sequence:bits,index:i,window:[i,i+width-1],metrics:{width}});i+=width;}return i===bits.length-1;
  },
  718({nums1,nums2},emit) {
    const dp=Array.from({length:nums1.length+1},()=>Array(nums2.length+1).fill(0));let best=0;
    for(let i=1;i<=nums1.length;i++)for(let j=1;j<=nums2.length;j++){dp[i][j]=nums1[i-1]===nums2[j-1]?dp[i-1][j-1]+1:0;best=Math.max(best,dp[i][j]);emit(`Compare nums1[${i-1}]=${nums1[i-1]} with nums2[${j-1}]=${nums2[j-1]}. A mismatch resets the common suffix to zero.`,{matrix:dp,cell:[i,j],otherCell:[i-1,j-1],matrixLabel:'DP: common suffix length (row/column 0 are empty prefixes)',metrics:{best}},'update');}return best;
  },
  728({left,right},emit) {
    const output=[];for(let n=left;n<=right;n++){const digits=[...String(n)].map(Number),valid=digits.every(d=>d!==0&&n%d===0);if(valid)output.push(n);emit(`${n}: ${digits.includes(0)?'a zero digit disqualifies it':valid?'every digit divides the number':'at least one digit does not divide the number'}.`,{sequence:digits,output,metrics:{candidate:n,valid}},'update');}return output;
  },
  733({image,sr,sc,color},emit) {
    const output=image.map(row=>[...row]),old=image[sr][sc];if(old===color){emit('The starting pixel already has the new color; return unchanged.',{matrix:output,cell:[sr,sc]});return output;}
    const queue=[[sr,sc]];output[sr][sc]=color;
    for(let head=0;head<queue.length;head++){const [r,c]=queue[head];for(const [dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(output[nr]?.[nc]===old){output[nr][nc]=color;queue.push([nr,nc]);}}emit(`Visit (${r},${c}); recolor matching orthogonal neighbors when enqueuing so each pixel enters once.`,{matrix:output,cell:[r,c],output:queue.slice(head+1).map(p=>`(${p})`),metrics:{originalColor:old,newColor:color,visited:head+1}},'update');}return output;
  },
  735({asteroids},emit) {
    const stack=[];asteroids.forEach((v,i)=>{let alive=true;while(alive&&v<0&&stack.at(-1)>0){const top=stack.at(-1);if(top<-v)stack.pop();else{if(top===-v)stack.pop();alive=false;}emit(`Incoming ${v} meets right-moving ${top}; the smaller magnitude disappears, equal magnitudes both disappear.`,{index:i,output:stack,metrics:{incoming:v,alive}},'update');}if(alive)stack.push(v);emit('The stack holds survivors; only a positive top and negative incoming asteroid can collide.',{index:i,output:stack},'update');});return stack;
  },
  738({n},emit) {
    const digits=[...String(n)].map(Number);let mark=digits.length;
    for(let i=digits.length-1;i>0;i--){if(digits[i]<digits[i-1]){digits[i-1]--;mark=i;}emit(`Inspect boundary ${i-1}/${i}; a descent lowers its left digit and marks the suffix for nines.`,{sequence:digits,index:i,metrics:{suffixStart:mark}},'update');}
    for(let i=mark;i<digits.length;i++)digits[i]=9;emit('Fill the marked suffix with nines to maximize the number without exceeding the original.',{sequence:digits},'update');return Number(digits.join(''));
  },
  740({nums},emit) {
    const points=new Map();for(const v of nums)points.set(v,(points.get(v)||0)+v);const keys=[...points.keys()].sort((a,b)=>a-b);let take=0,skip=0,previous=-Infinity;
    keys.forEach((v,i)=>{const best=Math.max(take,skip),nextTake=(v===previous+1?skip:best)+points.get(v);skip=best;take=nextTake;previous=v;emit(`Value ${v} earns ${points.get(v)} total points. ${i&&v===keys[i-1]+1?'Taking it excludes the previous value.':'There is no adjacent-value conflict with the prior group.'}`,{sequence:keys,index:i,table:[...points],tableHeaders:['Value','Points'],metrics:{take,skip}},'update');});return Math.max(take,skip);
  },
  744({letters,target},emit) {
    let left=0,right=letters.length;while(left<right){const mid=Math.floor((left+right)/2);emit(`At ${mid}, '${letters[mid]}' ${letters[mid]>target?'is greater: keep this upper candidate':'is not greater: search to its right'}.`,{sequence:letters,index:mid,window:[left,right-1],metrics:{left,right,target}});if(letters[mid]>target)right=mid;else left=mid+1;}return letters[left%letters.length];
  },
  771({jewels,stones},emit) {
    const known=new Set(jewels);let count=0;[...stones].forEach((v,i)=>{if(known.has(v))count++;emit(`Stone '${v}' ${known.has(v)?'matches':'does not match'} the case-sensitive jewel set.`,{sequence:stones,index:i,metrics:{jewels,count}},'update');});return count;
  },
  796({s,goal},emit) {
    if(s.length!==goal.length){emit('A rotation preserves length; these lengths differ.');return false;}
    for(let offset=0;offset<s.length;offset++){const candidate=s.slice(offset)+s.slice(0,offset);emit(`Rotate left by ${offset}: compare '${candidate}' with '${goal}'.`,{sequence:candidate,metrics:{offset,goal}});if(candidate===goal)return true;}return false;
  },
  804({words},emit) {
    // Standard alphabet table; no problem-specific prose or examples are copied.
    const alphabet=['.-','-...','-.-.','-..','.','..-.','--.','....','..','.---','-.-','.-..','--','-.','---','.--.','--.-','.-.','...','-','..-','...-','.--','-..-','-.--','--..'];
    const seen=new Set();words.forEach((word,i)=>{const code=[...word].map(c=>alphabet[c.charCodeAt(0)-97]).join('');seen.add(code);emit(`Encode '${word}' as '${code}' and insert it into the set of transformations.`,{index:i,output:[...seen],metrics:{distinct:seen.size}},'update');});return seen.size;
  },
  806({widths,s},emit) {
    let lines=1,width=0;[...s].forEach((c,i)=>{const next=widths[c.charCodeAt(0)-97],wrap=width+next>100;if(wrap){lines++;width=0;}width+=next;emit(`'${c}' needs ${next} units. ${wrap?'Start a new line before writing.':'It fits on this line.'}`,{sequence:s,index:i,metrics:{lines,width}},'update');});return [lines,width];
  },
  821({s,c},emit) {
    const distances=Array(s.length).fill(null);let last=-Infinity;
    for(let i=0;i<s.length;i++){if(s[i]===c)last=i;distances[i]=Number.isFinite(last)?i-last:null;emit('Forward pass: distance to the closest target seen on the left.',{index:i,output:distances,metrics:{pass:'left to right',target:c}},'update');}
    last=Infinity;for(let i=s.length-1;i>=0;i--){if(s[i]===c)last=i;distances[i]=Math.min(distances[i]??Infinity,last-i);emit('Backward pass: compare with the closest target on the right.',{index:i,output:distances,metrics:{pass:'right to left',target:c}},'update');}return distances;
  },
  830({s},emit) {
    const output=[];let start=0;for(let i=1;i<=s.length;i++)if(i===s.length||s[i]!==s[start]){if(i-start>=3)output.push([start,i-1]);emit(`Run '${s[start]}' spans ${start}..${i-1}, length ${i-start}; ${i-start>=3?'record it':'it is too short'}.`,{index:i-1,window:[start,i-1],output:output.map(p=>`[${p}]`)},'update');start=i;}return output;
  },
  836({rec1,rec2},emit) {
    const width=Math.min(rec1[2],rec2[2])-Math.max(rec1[0],rec2[0]),height=Math.min(rec1[3],rec2[3])-Math.max(rec1[1],rec2[1]);
    emit('Intersect the horizontal and vertical ranges. Both intersection lengths must be strictly positive; touching an edge has zero area.',{sequence:[`A: ${rec1}`,`B: ${rec2}`],metrics:{intersectionWidth:width,intersectionHeight:height}},'update');return width>0&&height>0;
  },
  844({s,t},emit) {
    const reduce=text=>{const stack=[];[...text].forEach((c,i)=>{if(c==='#')stack.pop();else stack.push(c);emit(`Process '${c}' in '${text}': ${c==='#'?'remove the last surviving character if any':'append the character'}.`,{sequence:text,index:i,output:stack},'update');});return stack.join('');};const a=reduce(s),b=reduce(t);emit('Compare the two fully edited strings.',{metrics:{first:a,second:b}});return a===b;
  },
  849({seats},emit) {
    let last=-1,best=0;seats.forEach((v,i)=>{if(v){const distance=last<0?i:Math.floor((i-last)/2);best=Math.max(best,distance);emit(last<0?'Leading empty seats are bounded on only one side.':'Inside a gap, the best seat is halfway between occupied endpoints.',{sequence:seats,index:i,metrics:{previousOccupied:last,currentOccupied:i,gapBest:distance,best}},'update');last=i;}});return Math.max(best,seats.length-1-last);
  },
  852({arr},emit) {
    let left=0,right=arr.length-1;while(left<right){const mid=Math.floor((left+right)/2);emit(`Compare arr[${mid}]=${arr[mid]} with arr[${mid+1}]=${arr[mid+1]}. ${arr[mid]<arr[mid+1]?'Peak lies to the right.':'Peak is at mid or to the left.'}`,{sequence:arr,index:mid,window:[left,right],metrics:{left,right}});if(arr[mid]<arr[mid+1])left=mid+1;else right=mid;}return left;
  },
  856({s},emit) {
    let depth=0,score=0;for(let i=0;i<s.length;i++){if(s[i]==='(')depth++;else{depth--;if(s[i-1]==='(')score+=2**depth;}emit(`Depth is ${depth}. An immediate '()' contributes 2^depth because each enclosing pair doubles it.`,{index:i,metrics:{depth,score}},'update');}return score;
  },
  859({s,goal},emit) {
    if(s.length!==goal.length){emit('A swap cannot change string length.');return false;}const different=[];for(let i=0;i<s.length;i++){if(s[i]!==goal[i])different.push(i);emit(`Compare index ${i}; a single swap can affect exactly two differing positions.`,{index:i,output:different,metrics:{goal}},'update');}
    if(different.length===0)return new Set(s).size<s.length;
    if(different.length!==2)return false;const [a,b]=different;return s[a]===goal[b]&&s[b]===goal[a];
  },
};
