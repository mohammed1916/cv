const specs={
2025:['nums k','Maximize equal-sum split points after changing at most one value to k.','Store each split imbalance as twice its prefix sum minus the total. A replacement shifts splits before the changed position one way and splits after it the opposite way, so two frequency maps count all repaired splits.','build all original split imbalances|keep split counts before and after the candidate replacement|compute delta = k - current value|count left imbalances equal to delta and right imbalances equal to -delta|return the best count including no change','O(n) expected time; O(n) frequency-map space.'],
2027:['s','Convert every X to O using the fewest length-three changes.','At the leftmost remaining X, one operation must cover it. Cover it and as much of the remaining suffix as possible, then skip the positions this operation settles.','scan from the left|skip positions already O|at an X choose a length-three covering segment|change the segment to O and advance beyond the settled suffix|return the number of changes','O(n) time; O(n) displayed result copy.'],
2028:['rolls mean n','Construct n missing die rolls that achieve the requested overall mean.','The required missing sum is fixed by the total count and mean. It must lie between n and 6n; distribute it as evenly as possible using a quotient and remainder.','compute the required missing sum|check the one-through-six feasibility bounds|divide the sum by n|assign quotient plus one to the remainder slots and quotient elsewhere|return a valid roll list or empty result','O(known rolls+n) time; O(n) output space.'],
2029:['stones','Determine whether Alice wins the modulo-three stone-removal game.','Only residue counts matter. An even number of residue-zero stones leaves a win exactly when both other residues exist; an odd count requires their counts to differ by more than two.','count stones by remainder modulo three|inspect parity of the zero-remainder count|compare presence and balance of the other two groups|apply the corresponding winning condition|return whether Alice can force a win','O(n) time; O(1) residue-count space.'],
2030:['s k letter repetition','Find the lexicographically smallest length-k subsequence containing enough copies of a required letter.','Use a monotonic stack, but pop only if enough total characters and required letters remain to finish. Reserve available slots for still-needed required letters before accepting other characters.','count remaining required letters and start an empty stack|read the next character|pop larger tails only when length and letter feasibility survive|append when space permits while reserving required-letter slots|return the constrained smallest subsequence','O(n) time; O(k) stack space.'],
2031:['nums','Count subarrays containing more ones than zeroes.','Map one to +1 and zero to -1. A subarray has positive sum when its ending prefix is greater than its starting prefix; a Fenwick tree counts earlier prefixes strictly below the current value.','record the empty prefix in a Fenwick tree|advance the signed prefix sum|query counts at coordinates strictly below it|add the query result and insert the current prefix|return the count modulo 1000000007','O(n log n) time; O(n) Fenwick space.'],
2032:['nums1 nums2 nums3','Return values present in at least two of three arrays.','Deduplicate each array before recording membership. A value needs two distinct source arrays, not merely two occurrences inside one array.','start value-to-membership masks|visit each source array once|deduplicate its values|set that array membership bit and retain values with at least two bits|return the qualifying distinct values','O(total input size + output sorting) reference time; O(distinct values) space.'],
2033:['grid x','Make every grid value equal with the fewest additions or subtractions of x.','Reachability requires every value to share the same remainder modulo x. Among reachable targets, a median minimizes the sum of absolute distances; divide those distances by x.','flatten and sort grid values|check all values have the same remainder modulo x|choose the median as target|sum each distance to the median divided by x|return the move count or -1 when unreachable','O(cells log cells) time; O(cells) sorted copy space.'],
};
const solvers={
2025({nums,k},emit){const total=nums.reduce((a,b)=>a+b,0),differences=[],left=new Map(),right=new Map();let prefix=0;for(let i=0;i<nums.length-1;i++){prefix+=nums[i];const d=2*prefix-total;differences.push(d);right.set(d,(right.get(d)||0)+1);}let best=right.get(0)||0;for(let i=0;i<nums.length;i++){const delta=k-nums[i],before=left.get(delta)||0,after=right.get(-delta)||0;best=Math.max(best,before+after);emit('A changed value lies on the right side of earlier splits and the left side of later splits. Their imbalances move in opposite directions, so look up opposite signed corrections.',{index:i,table:[...new Set([...left.keys(),...right.keys()])].sort((a,b)=>a-b).map(d=>[d,left.get(d)||0,right.get(d)||0]),tableHeaders:['Original imbalance','Earlier splits','Later splits'],codeStage:'update',metrics:{replacement:k,delta,repairedEarlier:before,repairedLater:after,best}},'update');if(i<differences.length){const d=differences[i];right.set(d,right.get(d)-1);left.set(d,(left.get(d)||0)+1);}}return best;},
2027({s},emit){const result=[...s];let moves=0;for(let i=0;i<s.length;){if(s[i]==='O'){emit('This position is already O, so spending an operation here cannot help the leftmost remaining X.',{index:i,output:[...result],codeStage:'inspect',metrics:{moves}});i++;continue;}const start=Math.min(i,s.length-3);for(let j=start;j<start+3;j++)result[j]='O';moves++;emit('Cover the leftmost unresolved X and the next available positions. Near the end, shift the full three-character operation left; previously settled O positions remain O.',{index:i,window:[start,start+2],output:[...result],codeStage:'update',metrics:{start,end:start+2,moves}},'update');i+=3;}return moves;},
2028({rolls,mean,n},emit){const required=mean*(rolls.length+n)-rolls.reduce((a,b)=>a+b,0);if(required<n||required>6*n){emit('Even choosing every missing roll as one or every roll as six cannot meet this required sum.',{codeStage:'failed',metrics:{required,minimum:n,maximum:6*n}});return[];}const base=Math.floor(required/n),extra=required%n,result=[];for(let i=0;i<n;i++){result.push(base+Number(i<extra));emit('Spread the missing sum evenly. The quotient supplies every roll and the remainder adds one to exactly this many slots, keeping all rolls in the valid die range.',{output:[...result],codeStage:'update',metrics:{required,base,extra,index:i,value:result[i]}},'update');}return result;},
2029({stones},emit){const counts=[0,0,0];for(let i=0;i<stones.length;i++){counts[stones[i]%3]++;emit('Only the value modulo three changes the running remainder, so compress all stone values into three residue counts.',{index:i,table:counts.map((count,residue)=>[residue,count]),tableHeaders:['Residue','Stones'],codeStage:'count',metrics:{value:stones[i],residue:stones[i]%3}},'update');}const even=counts[0]%2===0,win=even?counts[1]>0&&counts[2]>0:Math.abs(counts[1]-counts[2])>2;emit(even?'Residue-zero moves occur in parity-neutral pairs. Alice needs both nonzero residue groups to force the unsafe remainder onto Bob.':'An unmatched residue-zero move changes turn parity. Alice can force a win only when one nonzero group exceeds the other by at least three.',{table:counts.map((count,residue)=>[residue,count]),tableHeaders:['Residue','Stones'],codeStage:'classify',metrics:{zeroCountEven:even,difference:Math.abs(counts[1]-counts[2]),aliceWins:win}},'update');return win;},
2030({s,k,letter,repetition},emit){const stack=[];let remaining=[...s].filter(c=>c===letter).length,used=0;for(let i=0;i<s.length;i++){const c=s[i],popped=[];while(stack.length&&stack.at(-1)>c&&stack.length-1+s.length-i>=k&&(stack.at(-1)!==letter||used-1+remaining>=repetition)){const removed=stack.pop();popped.push(removed);if(removed===letter)used--;}let appended=false;if(stack.length<k){if(c===letter){stack.push(c);used++;appended=true;}else if(k-stack.length>repetition-used){stack.push(c);appended=true;}}if(c===letter)remaining--;emit('A lexicographically smaller tail is useful only when a full length-k answer with enough required letters remains possible. Reserve free slots for the remaining required-letter deficit.',{index:i,output:[...stack],codeStage:'update',metrics:{character:c,popped:popped.join('')||'none',appended,requiredLetter:letter,used,remaining,slots:k-stack.length,stillNeeded:Math.max(0,repetition-used)}},'update');}return stack.join('');},
2031({nums},emit){const n=nums.length,tree=Array(2*n+3).fill(0),add=index=>{for(let i=index;i<tree.length;i+=i&-i)tree[i]++;};add(n+1);let prefix=0,answer=0;for(let i=0;i<n;i++){prefix+=nums[i]?1:-1;const index=prefix+n+1,reads=[];let smaller=0;for(let j=index-1;j>0;j-=j&-j){reads.push([j,tree[j]]);smaller+=tree[j];}answer=(answer+smaller)%1000000007;add(index);emit('Query only coordinates below the current prefix. Equal prefixes would produce equal ones and zeroes, so they must not contribute to the strict positive-sum count.',{index:i,table:reads,tableHeaders:['Fenwick query cell','Earlier prefix count'],codeStage:'update',metrics:{prefix,coordinate:index,earlierSmaller:smaller,total:answer}},'update');}return answer;},
2032({nums1,nums2,nums3},emit){const masks=new Map();for(const[array,values]of [nums1,nums2,nums3].entries()){for(const value of new Set(values))masks.set(value,(masks.get(value)||0)|(1<<array));const result=[...masks].filter(([,mask])=>(mask&(mask-1))!==0).map(([value])=>value).sort((a,b)=>a-b);emit('Set one membership bit per source array. Duplicates within this source cannot set a second bit and therefore cannot qualify a value by themselves.',{sequence:values,output:result,table:[...masks].sort((a,b)=>a[0]-b[0]).map(([value,mask])=>[value,Boolean(mask&1),Boolean(mask&2),Boolean(mask&4)]),tableHeaders:['Value','Array one','Array two','Array three'],codeStage:'update',metrics:{source:array+1,qualified:result.length}},'update');}return[...masks].filter(([,mask])=>(mask&(mask-1))!==0).map(([value])=>value).sort((a,b)=>a-b);},
2033({grid,x},emit){const values=grid.flat().sort((a,b)=>a-b),remainder=values[0]%x;if(values.some(v=>v%x!==remainder)){emit('Adding or subtracting x preserves the remainder modulo x. Different remainders can never reach one common value.',{sequence:values,codeStage:'failed',metrics:{x,remainders:[...new Set(values.map(v=>v%x))].join(', ')}});return-1;}const target=values[Math.floor(values.length/2)];let total=0;for(let i=0;i<values.length;i++){const moves=Math.abs(values[i]-target)/x;total+=moves;emit('A median minimizes total absolute distance. Shared remainders guarantee each distance is an exact number of x-sized moves.',{sequence:values,index:i,codeStage:'update',metrics:{value:values[i],target,x,moves,total}},'update');}return total;},
};
const python={
2025:`def waysToPartition(nums, k):
    from collections import Counter
    total = sum(nums)
    differences, prefix = [], 0
    for value in nums[:-1]:
        prefix += value
        differences.append(2 * prefix - total)
    left, right = Counter(), Counter(differences)
    best = right[0]
    for i, value in enumerate(nums):
        delta = k - value
        best = max(best, left[delta] + right[-delta])  # step: update
        if i < len(differences):
            difference = differences[i]
            right[difference] -= 1
            left[difference] += 1
    return best  # step: return`,
2027:`def minimumMoves(s):
    index = moves = 0
    while index < len(s):
        if s[index] == 'O':  # step: inspect
            index += 1
        else:
            moves += 1  # step: update
            index += 3
    return moves  # step: return`,
2028:`def missingRolls(rolls, mean, n):
    required = mean * (len(rolls) + n) - sum(rolls)
    if required < n or required > 6 * n:
        return []  # step: failed
    base, extra = divmod(required, n)
    result = []
    for i in range(n):
        result.append(base + (i < extra))  # step: update
    return result  # step: return`,
2029:`def stoneGameIX(stones):
    counts = [0, 0, 0]
    for value in stones:
        counts[value % 3] += 1  # step: count
    if counts[0] % 2 == 0:
        win = counts[1] > 0 and counts[2] > 0
    else:
        win = abs(counts[1] - counts[2]) > 2
    # step: classify
    return win  # step: return`,
2030:`def smallestSubsequence(s, k, letter, repetition):
    stack = []
    remaining, used = s.count(letter), 0
    for i, character in enumerate(s):
        while (stack and stack[-1] > character
               and len(stack) - 1 + len(s) - i >= k
               and (stack[-1] != letter or used - 1 + remaining >= repetition)):
            removed = stack.pop()
            used -= removed == letter
        if len(stack) < k:
            if character == letter:
                stack.append(character)
                used += 1
            elif k - len(stack) > repetition - used:
                stack.append(character)
        remaining -= character == letter
        # step: update
    return ''.join(stack)  # step: return`,
2031:`def subarraysWithMoreZerosThanOnes(nums):
    # The required count is subarrays with strictly MORE ONES than zeroes.
    n = len(nums)
    tree = [0] * (2 * n + 3)
    def add(index):
        while index < len(tree):
            tree[index] += 1
            index += index & -index
    add(n + 1)
    prefix = answer = 0
    for value in nums:
        prefix += 1 if value else -1
        index = prefix + n + 1
        query, smaller = index - 1, 0
        while query:
            smaller += tree[query]
            query -= query & -query
        answer = (answer + smaller) % 1_000_000_007
        add(index)  # step: update
    return answer  # step: return`,
2032:`def twoOutOfThree(nums1, nums2, nums3):
    masks = {}
    for source, values in enumerate((nums1, nums2, nums3)):
        for value in set(values):
            masks[value] = masks.get(value, 0) | (1 << source)
        # step: update
    return sorted(value for value, mask in masks.items() if mask & (mask - 1))  # step: return`,
2033:`def minOperations(grid, x):
    values = sorted(value for row in grid for value in row)
    remainder = values[0] % x
    if any(value % x != remainder for value in values):
        return -1  # step: failed
    target = values[len(values) // 2]
    total = 0
    for value in values:
        total += abs(value - target) // x  # step: update
    return total  # step: return`,
};
const cases={
2025:[['One replacement repairs different splits on either side',{nums:[5,-2,3,0,4,-1,2,1],k:3}],['Keeping the original already maximizes balanced splits',{nums:[0,0,0,0,0],k:9}],['Two values have only one possible split',{nums:[4,11],k:4}],['Replacement equal to an existing value changes nothing there',{nums:[2,2,2,2,2,2],k:2}]],
2027:[['Separated X runs require different covering choices',{s:'XOOXXOXOOXXXOX'}],['Already converted text needs no moves',{s:'OOOOOOOO'}],['A final X uses a full segment shifted left',{s:'OOOOOX'}],['The smallest all-X string',{s:'XXX'}]],
2028:[['A longer known history leaves several missing rolls',{rolls:[2,5,3,6,4,1,5,2],mean:4,n:6}],['The missing rolls must all be ones',{rolls:[4,4],mean:2,n:4}],['The missing rolls must all be sixes',{rolls:[3,3],mean:5,n:4}],['Requested mean exceeds the missing-roll capacity',{rolls:[1,1,1],mean:6,n:2}]],
2029:[['All residue groups appear with different counts',{stones:[3,6,9,1,4,7,10,2,5]}],['Even zero count but one nonzero group is missing',{stones:[3,6,1,4,7]}],['Odd zero count needs a strict imbalance above two',{stones:[3,1,4,7,10,2]}],['An imbalance of exactly two is insufficient in the odd case',{stones:[3,1,4,7,2]}]],
2030:[['Lexicographic pops compete with a required-letter quota',{s:'cbadabecadba',k:7,letter:'a',repetition:3}],['Every output slot is reserved for the required letter',{s:'zbazayaa',k:4,letter:'a',repetition:4}],['Taking the whole string forbids every deletion',{s:'cababa',k:6,letter:'b',repetition:2}],['A late required letter must keep an available slot',{s:'abcdefz',k:3,letter:'z',repetition:1}]],
2031:[['Prefix differences repeat around several positive runs',{nums:[1,0,1,1,0,0,1,1,1,0,1]}],['All ones make every nonempty subarray valid',{nums:[1,1,1,1,1]}],['All zeroes produce no valid subarray',{nums:[0,0,0,0]}],['Equal prefix sums must not count ties',{nums:[1,0,1,0]}]],
2032:[['Duplicates and cross-array membership have different effects',{nums1:[4,4,7,9,12,18],nums2:[2,7,7,12,16],nums3:[4,8,12,18,20]}],['Many copies in one array are still one membership',{nums1:[6,6,6,6],nums2:[3],nums3:[9]}],['Every value appears in all sources',{nums1:[2,5,11],nums2:[11,2,5],nums3:[5,11,2]}],['Only two sources share a value',{nums1:[13],nums2:[13],nums3:[17]}]],
2033:[['A common remainder allows movement toward the median',{grid:[[5,17,11],[23,8,14],[20,2,26]],x:3}],['Different remainders make equality impossible',{grid:[[4,7],[10,12]],x:3}],['All cells already agree',{grid:[[9,9,9],[9,9,9]],x:7}],['One cell needs no operations',{grid:[[18]],x:5}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2025)need(vector(input.nums,-10000)&&input.nums.length>=2&&integer(input.k,-10000),'Use 2-80 bounded signed integers and a bounded signed replacement value.');
  if(id===2027)need(typeof input.s==='string'&&/^[XO]{3,120}$/.test(input.s),'Use 3-120 X/O characters.');
  if(id===2028)need(vector(input.rolls,1,60)&&input.rolls.every(v=>v<=6)&&integer(input.mean,1,6)&&integer(input.n,1,40),'Use die rolls from one to six, an integer mean from one to six, and 1-40 missing rolls.');
  if(id===2029)need(vector(input.stones),'Use 1-80 positive stone values.');
  if(id===2030)need(typeof input.s==='string'&&/^[a-z]{1,100}$/.test(input.s)&&integer(input.k,1,input.s.length)&&typeof input.letter==='string'&&/^[a-z]$/.test(input.letter)&&integer(input.repetition,1,input.k)&&[...input.s].filter(c=>c===input.letter).length>=input.repetition,'Use lowercase text, a valid subsequence length, and an achievable positive required-letter count.');
  if(id===2031)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=120&&input.nums.every(v=>v===0||v===1),'Use 1-120 binary values.');
  if(id===2032)need([input.nums1,input.nums2,input.nums3].every(values=>vector(values)&&values.every(v=>v<=100)),'Use three nonempty arrays of at most 80 values from one to 100.');
  if(id===2033)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=8&&input.grid.every(row=>vector(row,1,8)&&row.length===input.grid[0].length)&&integer(input.x,1),'Use a positive rectangular grid up to eight by eight and a positive step x.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2028&&result.length===0||id===2033&&result===-1?'failed':'return',pseudocodeStages:{2028:{failed:2},2029:{count:1,classify:4},2033:{failed:2}},tags:{2025:['Prefix Sum','Hash Table'],2027:['Greedy'],2028:['Math'],2029:['Game Theory'],2030:['Monotonic Stack','Greedy'],2031:['Fenwick Tree'],2032:['Hash Table'],2033:['Median','Math']}};
