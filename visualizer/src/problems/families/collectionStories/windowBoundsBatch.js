const specs={
1156:['text','Find the longest repeated-character substring obtainable with at most one swap.','For each target letter, maintain a window containing at most one different letter. A swap can repair that one position only if enough target copies exist globally, so cap the candidate by the target total count.','count each letter global frequency|scan a window for each possible target letter|shrink whenever it contains more than one different letter|cap window length by available target copies and maximize|return the longest attainable repeated run','O(26*n) time and O(26) count space.'],
1574:['arr','Remove the shortest contiguous segment so the remaining array is nondecreasing.','Keep a sorted prefix and sorted suffix. Their boundary values must fit together; use two pointers to find the smallest gap between compatible prefix and suffix endpoints.','find the longest nondecreasing prefix|find the longest nondecreasing suffix|start with deleting everything outside either sorted side|merge compatible prefix and suffix boundaries using two pointers|return the smallest removable middle length','O(n) time and O(1) auxiliary space.'],
2395:['nums','Determine whether two different length-two subarrays have the same sum.','Each adjacent pair contributes one sum keyed by its ending position. A previously seen sum proves a different pair exists, even when the pairs overlap.','start an empty set of pair sums|read each adjacent pair|check whether its sum appeared at an earlier pair position|return true on a repeated sum otherwise remember it|return false if every pair sum is distinct','O(n) expected time and O(n) space.'],
2401:['nums','Find the longest subarray whose different elements have pairwise disjoint set bits.','Within a valid window each set bit belongs to at most one element. Its OR mask detects conflicts with the next value; removing an element with XOR is safe because its bits are unique inside the window.','start an empty window and zero bit mask|inspect the next value for overlapping set bits|remove leftmost values with XOR until no conflict remains|OR in the value and maximize the window length|return the longest nice subarray','O(n) time and O(1) mask space.'],
2414:['s','Find the longest substring whose letters advance consecutively through the alphabet.','Track the run ending at each character. It extends only when the current letter code is exactly one greater than the preceding code; repeated letters, gaps, and z-to-a reset it.','start a run at the first character|compare each character with its predecessor|extend only for an alphabetic increase of exactly one|otherwise reset to one and update the maximum|return the longest continuous alphabet run','O(n) time and O(1) space.'],
2419:['nums','Find the longest subarray attaining the maximum possible bitwise AND.','A singleton maximum value attains the global maximum AND. No smaller value can belong to a subarray with that AND, so the answer is the longest consecutive run of the array maximum.','find the global maximum value|scan the array for consecutive copies of that maximum|extend the run on a maximum and reset otherwise|retain the longest maximum-value run|return its length','O(n) time and O(1) auxiliary space.'],
2444:['nums minK maxK','Count subarrays whose minimum is minK and maximum is maxK.','Track the latest out-of-range value and latest occurrences of both required bounds. For each end, valid starts lie after the barrier and no later than the earlier bound occurrence.','initialize latest barrier and bound positions before the array|update the barrier for values outside the allowed interval|update occurrences of the required minimum and maximum|add valid starts between the barrier and earlier bound position|return the total fixed-bound subarrays','O(n) time and O(1) space.'],
2461:['nums k','Find the maximum sum of a length-k subarray with all distinct values.','Maintain the fixed window sum and a frequency map. Once the window reaches length k, it is eligible exactly when the map also contains k distinct keys.','extend the window sum and value frequencies|remove the value falling beyond the fixed length k|check whether the full window has k distinct values|maximize the eligible window sum|return zero when no eligible window exists','O(n) expected time and O(k) frequency space.'],
2447:['nums k','Count subarrays whose greatest common divisor is exactly k.','Extend each start while updating its rolling GCD. GCD can only lose factors; if the current GCD is not divisible by k, no further extension can recover the target.','choose each subarray start|extend its endpoint and update the rolling GCD|count each endpoint where GCD equals k|stop that start when the GCD cannot remain divisible by k|return the total matching subarrays','O(n^2 * log(max value)) time and O(1) auxiliary space.'],
2470:['nums k','Count subarrays whose least common multiple is exactly k.','Extend each start with a rolling LCM computed using GCD. LCM only gains factors, so stop once it no longer divides k; no longer extension can return to the target.','choose each subarray start|combine the next value using LCM equals a divided by gcd times b|count each endpoint where LCM equals k|stop when the current LCM does not divide k|return the total matching subarrays','O(n^2 * log(max value)) time and O(1) auxiliary space.'],
};
const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};
const solvers={
1156({text},emit){const counts=new Map();for(const c of text)counts.set(c,(counts.get(c)||0)+1);let best=0;for(const[target,total]of counts){let left=0,other=0;for(let right=0;right<text.length;right++){if(text[right]!==target)other++;while(other>1){if(text[left]!==target)other--;left++;}const candidate=Math.min(right-left+1,total);best=Math.max(best,candidate);emit('This window needs at most one replacement to become uniform. Cap its length by all available copies of the target letter, because a swap cannot create another copy.',{sequence:text.split(''),index:right,window:[left,right],codeStage:'window',metrics:{target,totalCopies:total,otherCharacters:other,candidate,best}},'update');}}return best;},
1574({arr},emit){const n=arr.length;let prefix=0;while(prefix+1<n&&arr[prefix]<=arr[prefix+1])prefix++;if(prefix===n-1)return 0;let suffix=n-1;while(suffix>0&&arr[suffix-1]<=arr[suffix])suffix--;let best=Math.min(n-prefix-1,suffix),left=0,right=suffix;while(left<=prefix&&right<n){const compatible=arr[left]<=arr[right];if(compatible)best=Math.min(best,right-left-1);emit(compatible?'These sorted prefix and suffix endpoints fit together. Remove only the gap and try keeping a longer prefix.':'The prefix endpoint is too large for this suffix start. Advance the suffix boundary until they fit.',{sequence:arr,index:left,window:[left+1,right-1],codeStage:'merge',metrics:{prefixEnd:prefix,suffixStart:suffix,left,right,compatible,best}},'update');if(compatible)left++;else right++;}return best;},
2395({nums},emit){const seen=new Map();for(let i=1;i<nums.length;i++){const sum=nums[i-1]+nums[i],repeated=seen.has(sum);emit(repeated?'This sum already belongs to another pair position. Overlap between the two pairs is allowed.':'This adjacent-pair sum is new, so remember its starting position.',{sequence:nums,index:i,window:[i-1,i],table:[...seen],tableHeaders:['Earlier pair sum','Starting index'],codeStage:'pair',metrics:{sum,repeated,earlierStart:seen.get(sum)??'none'}},'inspect');if(repeated)return true;seen.set(sum,i-1);}return false;},
2401({nums},emit){let left=0,mask=0,best=0;for(let right=0;right<nums.length;right++){while((mask&nums[right])!==0)mask^=nums[left++];mask|=nums[right];best=Math.max(best,right-left+1);emit('Every active bit belongs to one window element. Remove conflicting left elements, then add the new disjoint bits and measure the valid window.',{sequence:nums,index:right,window:[left,right],codeStage:'window',metrics:{mask:mask.toString(2),left,right,best}},'update');}return best;},
2414({s},emit){let run=0,best=0;for(let i=0;i<s.length;i++){run=i&&s.charCodeAt(i)===s.charCodeAt(i-1)+1?run+1:1;best=Math.max(best,run);emit('Extend only when this character immediately follows the previous one in alphabet order. Alphabet wrapping is not allowed.',{sequence:s.split(''),index:i,window:[i-run+1,i],codeStage:'run',metrics:{run,best}},'update');}return best;},
2419({nums},emit){const maximum=Math.max(...nums);let run=0,best=0;for(let i=0;i<nums.length;i++){run=nums[i]===maximum?run+1:0;best=Math.max(best,run);emit('Only copies of the global maximum can form a subarray with the maximum possible AND. Count their consecutive run length.',{sequence:nums,index:i,window:run?[i-run+1,i]:null,codeStage:'run',metrics:{maximum,run,best}},'update');}return best;},
2444({nums,minK,maxK},emit){let bad=-1,minimum=-1,maximum=-1,answer=0;for(let i=0;i<nums.length;i++){const value=nums[i];if(value<minK||value>maxK)bad=i;if(value===minK)minimum=i;if(value===maxK)maximum=i;const added=Math.max(0,Math.min(minimum,maximum)-bad);answer+=added;emit('A valid subarray must include both required bounds while starting after the latest out-of-range barrier. Equal minK and maxK use the same occurrence for both requirements.',{sequence:nums,index:i,codeStage:'count',metrics:{lastBarrier:bad,lastMinimum:minimum,lastMaximum:maximum,newSubarrays:added,total:answer}},'update');}return answer;},
2461({nums,k},emit){const counts=new Map();let sum=0,best=0;for(let i=0;i<nums.length;i++){sum+=nums[i];counts.set(nums[i],(counts.get(nums[i])||0)+1);if(i>=k){const old=nums[i-k];sum-=old;const count=counts.get(old)-1;if(count)counts.set(old,count);else counts.delete(old);}const eligible=i+1>=k&&counts.size===k;if(eligible)best=Math.max(best,sum);emit('A full length-k window qualifies only when every value appears once. Use the distinct-key count to test that condition while keeping the running sum.',{sequence:nums,index:i,window:[Math.max(0,i-k+1),i],table:[...counts],tableHeaders:['Value','Window count'],codeStage:'window',metrics:{sum,distinct:counts.size,eligible,best}},'update');}return best;},
2447({nums,k},emit){let answer=0;for(let left=0;left<nums.length;left++){let value=0;for(let right=left;right<nums.length;right++){value=gcd(value,nums[right]);if(value===k)answer++;const stop=value%k!==0;emit(stop?'The current GCD is not divisible by k. Further extensions only remove factors, so this start cannot reach k again.':'Update the rolling GCD and count this endpoint if it equals the target.',{sequence:nums,index:right,window:[left,right],codeStage:'extend',metrics:{gcd:value,target:k,matched:value===k,stop,total:answer}},'update');if(stop)break;}}return answer;},
2470({nums,k},emit){let answer=0;for(let left=0;left<nums.length;left++){let value=1;for(let right=left;right<nums.length;right++){value=value/gcd(value,nums[right])*nums[right];if(value===k)answer++;const stop=k%value!==0;emit(stop?'The current LCM contains factors or powers that cannot fit inside k. Extensions only add factors, so stop this start.':'Combine the next value exactly using GCD, then count this endpoint if the LCM equals k.',{sequence:nums,index:right,window:[left,right],codeStage:'extend',metrics:{lcm:value,target:k,matched:value===k,stop,total:answer}},'update');if(stop)break;}}return answer;},
};
const python={
1156:`def maxRepOpt1(text):
    from collections import Counter
    counts, best = Counter(text), 0
    for target, total in counts.items():
        left, other = 0, 0
        for right, character in enumerate(text):
            other += character != target
            while other > 1:
                other -= text[left] != target
                left += 1
            best = max(best, min(right - left + 1, total))  # step: window
    return best  # step: return`,
1574:`def findLengthOfShortestSubarray(arr):
    n, prefix = len(arr), 0
    while prefix + 1 < n and arr[prefix] <= arr[prefix + 1]:
        prefix += 1
    if prefix == n - 1:
        return 0  # step: sorted
    suffix = n - 1
    while suffix > 0 and arr[suffix - 1] <= arr[suffix]:
        suffix -= 1
    best, left, right = min(n - prefix - 1, suffix), 0, suffix
    while left <= prefix and right < n:
        if arr[left] <= arr[right]:
            best = min(best, right - left - 1)  # step: merge
            left += 1
        else:
            right += 1
    return best  # step: return`,
2395:`def findSubarrays(nums):
    seen = set()
    for index in range(1, len(nums)):
        total = nums[index - 1] + nums[index]
        if total in seen:  # step: pair
            return True
        seen.add(total)
    return False  # step: return`,
2401:`def longestNiceSubarray(nums):
    left, mask, best = 0, 0, 0
    for right, value in enumerate(nums):
        while mask & value:
            mask ^= nums[left]
            left += 1
        mask |= value
        best = max(best, right - left + 1)  # step: window
    return best  # step: return`,
2414:`def longestContinuousSubstring(s):
    run, best = 0, 0
    for index, character in enumerate(s):
        run = run + 1 if index > 0 and ord(character) == ord(s[index - 1]) + 1 else 1
        best = max(best, run)  # step: run
    return best  # step: return`,
2419:`def longestSubarray(nums):
    maximum, run, best = max(nums), 0, 0
    for value in nums:
        run = run + 1 if value == maximum else 0
        best = max(best, run)  # step: run
    return best  # step: return`,
2444:`def countSubarrays(nums, minK, maxK):
    bad, minimum, maximum, answer = -1, -1, -1, 0
    for index, value in enumerate(nums):
        if value < minK or value > maxK:
            bad = index
        if value == minK:
            minimum = index
        if value == maxK:
            maximum = index
        answer += max(0, min(minimum, maximum) - bad)  # step: count
    return answer  # step: return`,
2461:`def maximumSubarraySum(nums, k):
    counts, total, best = {}, 0, 0
    for index, value in enumerate(nums):
        total += value
        counts[value] = counts.get(value, 0) + 1
        if index >= k:
            old = nums[index - k]
            total -= old
            counts[old] -= 1
            if counts[old] == 0:
                del counts[old]
        if index + 1 >= k and len(counts) == k:
            best = max(best, total)  # step: window
    return best  # step: return`,
2447:`def subarrayGCD(nums, k):
    from math import gcd
    answer = 0
    for left in range(len(nums)):
        value = 0
        for right in range(left, len(nums)):
            value = gcd(value, nums[right])  # step: extend
            answer += value == k
            if value % k != 0:
                break
    return answer  # step: return`,
2470:`def subarrayLCM(nums, k):
    from math import gcd
    answer = 0
    for left in range(len(nums)):
        value = 1
        for right in range(left, len(nums)):
            value = value // gcd(value, nums[right]) * nums[right]  # step: extend
            answer += value == k
            if k % value != 0:
                break
    return answer  # step: return`,
};
const cases={
1156:[['One swap bridges a gap while other runs compete',{text:'aaabaaacccacccbbba'}],['All copies already belong to one run',{text:'zzzzzz'}],['A missing spare copy caps a one-gap window',{text:'aaabaaa'}],['All distinct characters permit no longer repeated run',{text:'orbit'}]],
1574:[['A long sorted prefix and suffix can meet after a short removal',{arr:[1,3,5,8,12,4,6,9,13,15]}],['Already sorted values require no removal',{arr:[2,2,4,7,7]}],['A descending array keeps just one element',{arr:[9,7,5,3,1]}],['Equal boundary values allow a valid merge',{arr:[1,2,2,9,8,2,2,3]}]],
2395:[['A repeated pair sum appears after several different pairs',{nums:[3,8,2,7,4,9,1]}],['Overlapping pairs are still different subarrays',{nums:[6,2,6]}],['Distinct adjacent sums return false',{nums:[1,3,7,15]}],['A two-element array has only one pair',{nums:[4,9]}]],
2401:[['Disjoint bit runs are interrupted by conflicts',{nums:[1,2,8,16,3,4,32,64,5,128]}],['Repeated set bits force length one',{nums:[7,7,7,7]}],['Different powers of two all coexist',{nums:[2,4,8,16,32]}],['A singleton is always nice',{nums:[19]}]],
2414:[['Several alphabet runs compete across repeated and skipped letters',{s:'mnoptabcdeffghijkzab'}],['Alphabet wrapping does not extend a run',{s:'xyzabc'}],['Repeated letters reset every step',{s:'qqqqqq'}],['A complete alphabet is one continuous run',{s:'abcdefghijklmnopqrstuvwxyz'}]],
2419:[['Separated maximum runs have different lengths',{nums:[4,12,12,3,12,12,12,8,12,2]}],['Every equal value belongs to the maximum run',{nums:[6,6,6,6]}],['A unique maximum has answer one',{nums:[1,8,3,5]}],['A maximum run at the end must be retained',{nums:[2,3,9,9,9,9]}]],
2444:[['Bound occurrences compete across out-of-range barriers',{nums:[2,4,6,3,2,6,7,2,5,6,2,1,6],minK:2,maxK:6}],['Equal bounds count runs of the one required value',{nums:[4,4,2,4,4,4],minK:4,maxK:4}],['A missing required maximum gives zero',{nums:[2,3,4,2],minK:2,maxK:5}],['Every out-of-range value blocks all crossing windows',{nums:[1,8,1,8],minK:2,maxK:6}]],
2461:[['Window sums rise and fall as duplicates enter and leave',{nums:[4,7,2,7,9,1,5,9,3,8],k:4}],['No full window has distinct values',{nums:[6,6,6,6],k:3}],['Length one chooses the largest value',{nums:[3,8,2,7],k:1}],['The whole distinct array is the only full window',{nums:[2,5,9,4],k:4}]],
2447:[['Rolling divisors reach the target before incompatible values stop extension',{nums:[18,30,42,12,5,24,36,6],k:6}],['Every target value supports many matching windows',{nums:[7,7,7,7],k:7}],['Values lacking the target factor stop immediately',{nums:[5,11,17],k:3}],['Coprime neighbors can create gcd one',{nums:[8,15,14],k:1}]],
2470:[['Several factor combinations reach the same target LCM',{nums:[2,3,4,6,12,5,2,6],k:12}],['Every one-only subarray has LCM one',{nums:[1,1,1,1],k:1}],['An extra prime makes a start permanently impossible',{nums:[5,2,3,5],k:6}],['A target singleton and its extensions are counted separately',{nums:[18,3,6],k:18}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===1156||id===2414){const s=id===1156?input.text:input.s;need(typeof s==='string'&&/^[a-z]{1,120}$/.test(s),'Use 1-120 lowercase letters.');return input;}const nums=id===1574?input.arr:input.nums;need(Array.isArray(nums)&&nums.length>=(id===2395?2:1)&&nums.length<=([2447,2470].includes(id)?40:120)&&nums.every(v=>integer(v,id===2395?-10000:1,id===2401?1000000000:10000)),'Use a bounded integer array, positive except pair-sum inputs; at most 40 entries for GCD/LCM enumeration and 120 otherwise.');if(id===2461)need(integer(input.k,1,nums.length),'Window length must be between one and array length.');if(id===2447||id===2470)need(integer(input.k,1,1000000),'Target must be a positive integer up to one million.');if(id===2444)need(integer(input.minK,1,10000)&&integer(input.maxK,input.minK,10000),'Use ordered positive fixed bounds no greater than 10000.');return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===1574&&result===0?'sorted':id===2395&&result?'pair':'return',pseudocodeStages:{1156:{window:4},1574:{sorted:1,merge:4},2395:{pair:3},2401:{window:4},2414:{run:4},2419:{run:4},2444:{count:4},2461:{window:4},2447:{extend:2},2470:{extend:2}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['2447','2470'].includes(id)?['Math','Enumeration']:['Sliding Window','Two Pointers']]))};
