const specs={
2167:['s','Remove every illegal car with minimum cost using end removals or individual removals.','For each prefix, choose between paying two for a newly encountered illegal car and removing the entire prefix from the left. Combine that best prefix cost with removing the untouched suffix from the right.','scan the train left to right|extend the best cleaned-prefix cost|compare individual removal with deleting the whole prefix|combine it with deleting the remaining suffix|return the smallest total cost over all split points','O(n) time; O(1) auxiliary space.'],
2168:['s','Count distinct substrings whose present digits all occur equally often.','Extend each start position while updating ten digit counts. A substring qualifies when all nonzero counts agree; a set deduplicates equal text appearing at different positions.','choose each substring start|extend its end and update digit counts|compare the nonzero frequencies|insert qualifying text into a distinct-substring set|return the set size','O(n^3) time and stored-character space including substring materialization; ten-counter checks per extension.'],
2169:['num1 num2','Count repeated larger-minus-smaller operations until one number reaches zero.','A run of identical subtractions is one division quotient. Add that quotient to the operation count and replace the larger value with its remainder, following the Euclidean algorithm.','while both numbers are nonzero choose the larger|divide it by the smaller to count consecutive subtractions|add that quotient to the operation count|replace the larger value by the remainder|return the total number of subtractions','O(log(max value)) arithmetic steps; O(1) space.'],
2170:['nums','Change the fewest values so every even index shares one value and every odd index another.','Keep the most frequent value in each parity group unless those values conflict. Comparing the top two candidates from each side is sufficient to find the best distinct pair.','count values separately at even and odd positions|retain the two most frequent candidates per side|compare candidate pairs with different values|maximize the occurrences kept unchanged|return array length minus the kept count','O(n+u log u) time using sorted frequency tables; O(u) space.'],
2171:['beans','Remove the fewest beans so every nonempty bag has the same count.','For a chosen positive target, bags smaller than it must be emptied and larger bags reduced. Sort counts; choosing the target at index i keeps target times the number of bags from i onward.','sort bag counts and compute their total|try each existing count as the common nonempty size|empty smaller bags and trim the remaining suffix|maximize the beans retained|return total beans minus the best retained amount','O(n log n) time; O(n) sorting space.'],
2172:['nums numSlots','Assign numbers to slots of capacity two to maximize the sum of number AND slot.','Encode each slot occupancy as a base-three digit: zero one or two. The total occupancy tells which input number comes next, and each available slot yields one transition.','initialize the empty base-three occupancy state|read the next number implied by total occupancy|try placing it in each slot with spare capacity|update the best AND sum for the new occupancy|return the best score after assigning all numbers','O(3^slots*slots) time and O(3^slots) space.'],
2176:['nums k','Count equal-value index pairs whose index product is divisible by k.','Check each pair with the earlier index strictly smaller. Values must match and their zero-based index product must be a multiple of k; index zero makes the product zero.','choose an earlier index|visit each later index|check value equality and product divisibility|count qualifying pairs exactly once|return the pair count','O(n^2) time; O(1) auxiliary space.'],
2177:['num','Find three consecutive integers whose sum equals the requested number.','Three consecutive integers centered at x sum to 3x. A solution exists precisely when the target is divisible by three, and then the middle value is fixed.','divide the target by three|reject a nonzero remainder|use the quotient as the middle integer|place its predecessor and successor beside it|return the triple or an empty array','O(1) time and space.'],
};
const solvers={
2167({s},emit){let left=0,best=s.length;for(let i=0;i<s.length;i++){const individual=left+(s[i]==='1'?2:0),wholePrefix=i+1;left=Math.min(individual,wholePrefix);const suffix=s.length-i-1,total=left+suffix;best=Math.min(best,total);emit('The cleaned prefix can be obtained by removing this illegal car individually or discarding the entire prefix from the left. Any untouched suffix can be removed from the right at one per car.',{sequence:[...s],index:i,window:[0,i],codeStage:'choose',metrics:{individualOption:individual,wholePrefixOption:wholePrefix,bestPrefix:left,suffixRemoval:suffix,total,best}},'update');}return best;},
2168({s},emit){const distinct=new Set();for(let start=0;start<s.length;start++){const counts=Array(10).fill(0);for(let end=start;end<s.length;end++){counts[Number(s[end])]++;const present=counts.filter(Boolean),equal=present.every(c=>c===present[0]),text=s.slice(start,end+1),newText=equal&&!distinct.has(text);if(equal)distinct.add(text);emit('Ignore absent digits when comparing counts. Equal frequencies qualify this text, but a repeated occurrence contributes nothing if that text is already in the set.',{sequence:[...s],window:[start,end],index:end,table:counts.map((count,digit)=>[digit,count]),tableHeaders:['Digit','Window count'],codeStage:'extend',metrics:{start,end,text,equalFrequencies:equal,newDistinctText:newText,totalDistinct:distinct.size}},'update');}}return distinct.size;},
2169({num1,num2},emit){let a=num1,b=num2,count=0;while(a!==0&&b!==0){const beforeA=a,beforeB=b;let quotient;if(a>=b){quotient=Math.floor(a/b);a%=b;}else{quotient=Math.floor(b/a);b%=a;}count+=quotient;emit('The quotient counts a whole run of subtracting the same smaller value. The remainder is exactly the state reached after those individual operations.',{sequence:[a,b],codeStage:'reduce',metrics:{beforeA,beforeB,batchedSubtractions:quotient,afterA:a,afterB:b,totalOperations:count}},'update');}return count;},
2170({nums},emit){const counts=[new Map(),new Map()];nums.forEach((value,i)=>counts[i%2].set(value,(counts[i%2].get(value)||0)+1));const top=counts.map(map=>{const choices=[...map].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,2);while(choices.length<2)choices.push([null,0]);return choices;});let kept=0;for(const[a,ca]of top[0])for(const[b,cb]of top[1]){const valid=a===null||b===null||a!==b;if(valid)kept=Math.max(kept,ca+cb);emit('Even and odd positions must use different values. A missing candidate represents choosing a fresh value that preserves no existing occurrence on that side.',{sequence:nums,table:[...counts[0]].map(([v,c])=>['even',v,c]).concat([...counts[1]].map(([v,c])=>['odd',v,c])),tableHeaders:['Parity','Value','Frequency'],codeStage:'pair',metrics:{evenValue:a??'fresh',oddValue:b??'fresh',evenKept:ca,oddKept:cb,valid,bestKept:kept,changes:nums.length-kept}},'update');}return nums.length-kept;},
2171({beans},emit){const ordered=[...beans].sort((a,b)=>a-b),total=ordered.reduce((a,b)=>a+b,0);let best=0;for(let i=0;i<ordered.length;i++){const target=ordered[i],kept=target*(ordered.length-i);best=Math.max(best,kept);emit('Empty bags below the target and reduce every bag in this suffix to the target. Choosing an existing size is sufficient because increasing a feasible target until the next bag boundary retains more beans.',{sequence:ordered,index:i,window:[i,ordered.length-1],codeStage:'target',metrics:{target,nonemptyBags:ordered.length-i,kept,removed:total-kept,bestRemoved:total-best}},'update');}return total-best;},
2172({nums,numSlots},emit){const powers=Array.from({length:numSlots},(_,i)=>3**i),dp=Array(3**numSlots).fill(-1);dp[0]=0;let best=0;for(let state=0;state<dp.length;state++){if(dp[state]<0)continue;const occupancy=powers.map(p=>Math.floor(state/p)%3),used=occupancy.reduce((a,b)=>a+b,0);if(used===nums.length){best=Math.max(best,dp[state]);continue;}const transitions=[];for(let slot=0;slot<numSlots;slot++)if(occupancy[slot]<2){const next=state+powers[slot],gain=nums[used]&(slot+1),candidate=dp[state]+gain;dp[next]=Math.max(dp[next],candidate);transitions.push([slot+1,gain,next,dp[next]]);}emit('Each base-three digit records one slot occupancy. The number already placed selects the next input value; only slots below capacity two can receive it.',{sequence:nums,index:used,table:transitions,tableHeaders:['Destination slot','AND gain','Next state','Best next score'],output:occupancy,codeStage:'assign',metrics:{state,occupancy:occupancy.join(', '),placed:used,nextNumber:nums[used],score:dp[state]}},'update');}return best;},
2176({nums,k},emit){let count=0;for(let i=0;i<nums.length;i++){const matches=[];for(let j=i+1;j<nums.length;j++)if(nums[i]===nums[j]&&(i*j)%k===0){count++;matches.push(j);}emit('Only later indices are considered, so no pair is double-counted. For this earlier index, the listed partners satisfy both equal values and divisibility.',{sequence:nums,index:i,marks:Object.fromEntries(matches.map(j=>[j,'valid partner'])),codeStage:'scan',metrics:{earlierIndex:i,value:nums[i],k,matchingLaterIndices:matches.join(', ')||'none',added:matches.length,count}},'update');}return count;},
2177({num},emit){const divisible=num%3===0,middle=num/3,answer=divisible?[middle-1,middle,middle+1]:[];emit('The predecessor and successor cancel their offsets around the middle. Their total is exactly three times that middle integer.',{output:answer,codeStage:'derive',metrics:{target:num,remainder:num%3,integerMiddle:divisible?middle:'none',exists:divisible}},'update');return answer;},
};
const python={
2167:`def minimumTime(s):
    left, best = 0, len(s)
    for i, char in enumerate(s):
        left = min(left + (2 if char == '1' else 0), i + 1)
        best = min(best, left + len(s) - i - 1)  # step: choose
    return best  # step: return`,
2168:`def equalDigitFrequency(s):
    distinct = set()
    for start in range(len(s)):
        counts = [0] * 10
        for end in range(start, len(s)):
            counts[int(s[end])] += 1
            present = [count for count in counts if count]
            if all(count == present[0] for count in present):
                distinct.add(s[start:end + 1])
            # step: extend
    return len(distinct)  # step: return`,
2169:`def countOperations(num1, num2):
    a, b, count = num1, num2, 0
    while a and b:
        if a >= b:
            quotient, a = divmod(a, b)
        else:
            quotient, b = divmod(b, a)
        count += quotient  # step: reduce
    return count  # step: return`,
2170:`def minimumOperations(nums):
    from collections import Counter
    counts = [Counter(nums[::2]), Counter(nums[1::2])]
    top = []
    for counts_for_parity in counts:
        choices = sorted(counts_for_parity.items(), key=lambda item: (-item[1], item[0]))[:2]
        choices += [(None, 0)] * (2 - len(choices))
        top.append(choices)
    kept = 0
    for a, count_a in top[0]:
        for b, count_b in top[1]:
            if a is None or b is None or a != b:
                kept = max(kept, count_a + count_b)
            # step: pair
    return len(nums) - kept  # step: return`,
2171:`def minimumRemoval(beans):
    ordered = sorted(beans)
    total, best = sum(ordered), 0
    for i, target in enumerate(ordered):
        kept = target * (len(ordered) - i)
        best = max(best, kept)  # step: target
    return total - best  # step: return`,
2172:`def maximumANDSum(nums, numSlots):
    powers = [3 ** slot for slot in range(numSlots)]
    dp = [-1] * (3 ** numSlots)
    dp[0], best = 0, 0
    for state in range(len(dp)):
        if dp[state] < 0:
            continue
        occupancy = [(state // power) % 3 for power in powers]
        used = sum(occupancy)
        if used == len(nums):
            best = max(best, dp[state])
            continue
        for slot, power in enumerate(powers):
            if occupancy[slot] < 2:
                next_state = state + power
                dp[next_state] = max(dp[next_state], dp[state] + (nums[used] & (slot + 1)))
        # step: assign
    return best  # step: return`,
2176:`def countPairs(nums, k):
    count = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j] and (i * j) % k == 0:
                count += 1
        # step: scan
    return count  # step: return`,
2177:`def sumOfThree(num):
    answer = []
    if num % 3 == 0:
        middle = num // 3
        answer = [middle - 1, middle, middle + 1]
    # step: derive
    return answer  # step: return`,
};
const cases={
2167:[['Interior illegal cars compete with deleting long end prefixes',{s:'001011001110010100'}],['An all-legal train needs no removal',{s:'0000000'}],['An all-illegal train can be removed from an end',{s:'111111'}],['One isolated interior illegal car favors its individual removal',{s:'0001000'}]],
2168:[['Repeated digit patterns create equal-frequency and duplicate text windows',{s:'121203031212'}],['One repeated digit makes every length valid but duplicate occurrences collapse',{s:'777777'}],['All distinct digits give equal frequency one in every substring',{s:'024681'}],['A single zero is a valid distinct substring',{s:'0'}]],
2169:[['Several Euclidean phases batch repeated subtraction runs',{num1:233,num2:89}],['One number already zero needs no operation',{num1:0,num2:47}],['Equal positive numbers reach zero in one subtraction',{num1:36,num2:36}],['A small divisor compresses a long subtraction run',{num1:999999,num2:1}]],
2170:[['Conflicting parity favorites require a second-choice value',{nums:[4,4,4,4,7,4,4,8,7,8,4,4]}],['An alternating array already satisfies both rules',{nums:[3,9,3,9,3,9]}],['All equal values force one parity group to change',{nums:[6,6,6,6,6]}],['A singleton needs no change',{nums:[12]}]],
2171:[['Emptying small bags can beat trimming every bag',{beans:[4,17,6,12,3,19,8,12,15]}],['Equal bag sizes already satisfy the condition',{beans:[7,7,7,7]}],['One bag needs no removal',{beans:[21]}],['One huge bag can make emptying all small bags optimal',{beans:[1,2,3,100]}]],
2172:[['Several slot capacities compete for bitwise gains',{nums:[7,3,5,2,6,1,4,7],numSlots:4}],['One slot accepts at most two values',{nums:[2,7],numSlots:1}],['More slots than values leaves some unused',{nums:[6,5],numSlots:4}],['Repeated values still consume separate capacity',{nums:[3,3,3,3,3,3],numSlots:3}]],
2176:[['Repeated groups include zero-index and nonzero-index divisible pairs',{nums:[5,8,5,5,8,5,2,8,5,2,5,8],k:6}],['A divisor of one accepts every equal-value pair',{nums:[4,4,7,4,7],k:1}],['Distinct values have no equal pair',{nums:[2,6,10,14],k:3}],['Index zero makes its product divisible by any positive k',{nums:[9,3,9],k:97}]],
2177:[['A larger multiple fixes the middle integer directly',{num:123456}],['A nonmultiple has no integer middle',{num:100}],['Zero permits a negative predecessor',{num:0}],['The smallest positive multiple has a zero predecessor',{num:3}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2167)need(typeof input.s==='string'&&/^[01]{1,120}$/.test(input.s),'Use 1-120 binary car markers.');
  if(id===2168)need(typeof input.s==='string'&&/^[0-9]{1,40}$/.test(input.s),'Use 1-40 digits for bounded substring enumeration.');
  if(id===2169)need(integer(input.num1)&&integer(input.num2),'Use two nonnegative integers at most one million.');
  if(id===2170)need(vector(input.nums,1),'Use 1-80 positive integer values.');
  if(id===2171)need(vector(input.beans,1),'Use 1-80 positive bag sizes.');
  if(id===2172)need(integer(input.numSlots,1,5)&&vector(input.nums,1,2*input.numSlots)&&input.nums.every(v=>v<=15),'Use 1-5 slots and at most two values per slot, with each value from one through fifteen.');
  if(id===2176)need(vector(input.nums,1,60)&&integer(input.k,1),'Use 1-60 positive values and a positive divisor at most one million.');
  if(id===2177)need(integer(input.num,0,1000000000000),'Use a nonnegative integer at most one trillion.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2167:{choose:4},2168:{extend:4},2169:{reduce:4},2170:{pair:4},2171:{target:4},2172:{assign:4},2176:{scan:4},2177:{derive:4}},tags:{2167:['Dynamic Programming'],2168:['Hash Table','Enumeration'],2169:['Math'],2170:['Counting'],2171:['Greedy','Sorting'],2172:['Dynamic Programming','Bit Manipulation'],2176:['Enumeration'],2177:['Math']}};
