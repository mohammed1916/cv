const specs={
862:['nums k','Find the shortest nonempty subarray with sum at least k even when values are negative.','Prefix sums turn a range sum into a difference. A deque retains candidate starts with increasing prefix sums; discard satisfied starts after recording their lengths and discard dominated larger prefixes from the back.','build prefix sums including the empty prefix|pop qualifying front starts while recording shorter lengths|remove back starts with prefix sum at least the current prefix|append the current prefix boundary|return the shortest length or minus one','O(n) time and O(n) space.'],
907:['arr','Sum the minimum value of every subarray modulo 1000000007.','Assign each subarray to one minimum occurrence using asymmetric equal-value boundaries. Popping a monotonic stack reveals the previous strictly smaller index and the next smaller-or-equal index, giving the number of subarrays owned by that occurrence.','scan values with an increasing index stack|pop values at least the current value or flush at the end|measure left and right boundary choice counts|add popped value times both choice counts modulo the modulus|return the total minimum sum','O(n) time and O(n) stack space.'],
1063:['nums','Count subarrays whose first value is no greater than every later value in that subarray.','For each starting index, the first strictly smaller value ends its valid range. A nondecreasing stack waits for that boundary; equal values do not end a range.','scan values while retaining starts with nondecreasing values|pop starts when a strictly smaller value arrives|add the distance to each popped start as its valid endpoint count|flush unresolved starts at the array end|return the total valid subarrays','O(n) time and O(n) stack space.'],
1425:['nums k','Find the largest sum of a nonempty subsequence whose consecutive selected indices differ by at most k.','DP at i is nums[i] plus the best positive DP among the preceding k indices. A decreasing deque keeps that sliding maximum, removing expired indices and values dominated by the new DP result.','discard deque indices farther than k behind the current index|add the best positive eligible DP to the current value|remove smaller or equal DP candidates from the deque back|append this index and update the global best|return the largest nonempty subsequence sum','O(n) time and O(n) DP/output space.'],
2334:['nums threshold','Find any subarray length k whose every element is greater than threshold divided by k.','Use each element as a candidate minimum. Monotonic-stack boundaries reveal a span where every value is at least that minimum. The span qualifies exactly when minimum times length exceeds the threshold.','maintain an increasing stack of candidate minima|pop when a smaller-or-equal value reveals a right boundary|measure the full span bounded by smaller values|return its width when minimum times width exceeds threshold|return minus one when no span qualifies','O(n) time and O(n) stack space.'],
2454:['nums','Find for each index the second later value that is strictly greater than its value.','Use one decreasing stack for indices awaiting their first greater value and another for indices awaiting their second. Resolve second-stage indices first, then transfer newly promoted first-stage indices in reverse pop order.','resolve second-stage indices smaller than the current value|pop first-stage indices seeing their first greater value|reverse those popped indices into the second-stage stack|push the current index into the first-stage stack|return second-greater values or minus one when absent','O(n) time and O(n) stack/output space.'],
};
const solvers={
862({nums,k},emit){const prefix=[0];for(const value of nums)prefix.push(prefix.at(-1)+value);const deque=[];let head=0,best=Infinity;for(let i=0;i<prefix.length;i++){while(head<deque.length&&prefix[i]-prefix[deque[head]]>=k){best=Math.min(best,i-deque[head]);deque[head++]=null;}while(head<deque.length&&prefix[deque.at(-1)]>=prefix[i])deque.pop();deque.push(i);emit('Record every satisfied front start before removing it. A newer boundary with a no-larger prefix dominates older back candidates because it gives at least as much sum with a shorter span.',{sequence:nums,index:i-1,table:deque.slice(head).map(index=>[index,prefix[index]]),tableHeaders:['Candidate start boundary','Prefix sum'],output:prefix,outputIndex:i,codeStage:'deque',metrics:{boundary:i,prefix:prefix[i],best:Number.isFinite(best)?best:'none'}},'update');}return Number.isFinite(best)?best:-1;},
907({arr},emit){const stack=[],mod=1000000007;let answer=0;for(let i=0;i<=arr.length;i++){while(stack.length&&(i===arr.length||arr[stack.at(-1)]>=arr[i])){const index=stack.pop(),left=stack.at(-1)??-1,count=(index-left)*(i-index),contribution=arr[index]*count;answer=(answer+contribution)%mod;emit('The popped value owns every choice of start after its previous smaller boundary and end before this smaller-or-equal boundary. The tie rule assigns equal minima once.',{sequence:arr,index,window:[left+1,i-1],output:[...stack],codeStage:'contribution',metrics:{minimum:arr[index],leftBoundary:left,rightBoundary:i,ownedSubarrays:count,contribution,total:answer}},'update');}if(i<arr.length)stack.push(i);}return answer;},
1063({nums},emit){const stack=[];let answer=0;for(let i=0;i<=nums.length;i++){while(stack.length&&(i===nums.length||nums[stack.at(-1)]>nums[i])){const start=stack.pop(),count=i-start;answer+=count;emit('This first strictly smaller value blocks every longer range from the popped start. All endpoints before this boundary are valid, including the singleton.',{sequence:nums,index:start,window:[start,i-1],output:[...stack],codeStage:'boundary',metrics:{start,firstSmaller:i===nums.length?'end':i,validEnds:count,total:answer}},'update');}if(i<nums.length)stack.push(i);}return answer;},
1425({nums,k},emit){const dp=[],deque=[];let head=0,best=-Infinity;for(let i=0;i<nums.length;i++){while(head<deque.length&&deque[head]<i-k)head++;const prior=head<deque.length?Math.max(0,dp[deque[head]]):0;dp[i]=nums[i]+prior;while(head<deque.length&&dp[deque.at(-1)]<=dp[i])deque.pop();deque.push(i);best=Math.max(best,dp[i]);emit('Extend the best positive eligible subsequence or start fresh at this index. The deque removes older candidates no better than this new DP value.',{sequence:nums,index:i,window:[Math.max(0,i-k),i],output:[...dp],table:deque.slice(head).map(index=>[index,dp[index]]),tableHeaders:['Deque index','Subsequence sum ending here'],codeStage:'dp',metrics:{index:i,eligiblePriorBest:prior,currentDP:dp[i],globalBest:best}},'update');}return best;},
2334({nums,threshold},emit){const stack=[];for(let i=0;i<=nums.length;i++){while(stack.length&&(i===nums.length||nums[stack.at(-1)]>=nums[i])){const index=stack.pop(),left=stack.at(-1)??-1,width=i-left-1,qualifies=nums[index]*width>threshold;emit('This span has no value below the candidate minimum. Multiplying by its width avoids floating-point division in the strict threshold comparison.',{sequence:nums,index,window:[left+1,i-1],codeStage:'span',metrics:{minimum:nums[index],width,product:nums[index]*width,threshold,qualifies}},'inspect');if(qualifies)return width;}if(i<nums.length)stack.push(i);}return -1;},
2454({nums},emit){const first=[],second=[],answer=Array(nums.length).fill(-1);for(let i=0;i<nums.length;i++){const resolved=[];while(second.length&&nums[second.at(-1)]<nums[i]){const index=second.pop();answer[index]=nums[i];resolved.push(index);}const moved=[];while(first.length&&nums[first.at(-1)]<nums[i])moved.push(first.pop());for(let j=moved.length-1;j>=0;j--)second.push(moved[j]);first.push(i);emit('Resolve old second-stage candidates before promoting new ones, so this value cannot count as both greater occurrences. Reverse promotions to preserve the second stack order.',{sequence:nums,index:i,output:[...answer],table:[...first.map(index=>[index,nums[index],'awaiting first']),...second.map(index=>[index,nums[index],'awaiting second'])],tableHeaders:['Index','Original value','Stage'],codeStage:'stages',metrics:{resolved:resolved.join(', ')||'none',promoted:moved.join(', ')||'none'}},'update');}return answer;},
};
const python={
862:`def shortestSubarray(nums, k):
    from collections import deque
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    candidates, best = deque(), len(nums) + 1
    for index, total in enumerate(prefix):
        while candidates and total - prefix[candidates[0]] >= k:
            best = min(best, index - candidates.popleft())
        while candidates and prefix[candidates[-1]] >= total:
            candidates.pop()
        candidates.append(index)  # step: deque
    return best if best <= len(nums) else -1  # step: return`,
907:`def sumSubarrayMins(arr):
    stack, answer, modulus = [], 0, 1000000007
    for right in range(len(arr) + 1):
        while stack and (right == len(arr) or arr[stack[-1]] >= arr[right]):
            index = stack.pop()
            left = stack[-1] if stack else -1
            answer = (answer + arr[index] * (index - left) * (right - index)) % modulus  # step: contribution
        if right < len(arr):
            stack.append(right)
    return answer  # step: return`,
1063:`def validSubarrays(nums):
    stack, answer = [], 0
    for right in range(len(nums) + 1):
        while stack and (right == len(nums) or nums[stack[-1]] > nums[right]):
            start = stack.pop()
            answer += right - start  # step: boundary
        if right < len(nums):
            stack.append(right)
    return answer  # step: return`,
1425:`def constrainedSubsetSum(nums, k):
    from collections import deque
    dp, candidates, best = [], deque(), float('-inf')
    for index, value in enumerate(nums):
        while candidates and candidates[0] < index - k:
            candidates.popleft()
        prior = max(0, dp[candidates[0]]) if candidates else 0
        dp.append(value + prior)
        while candidates and dp[candidates[-1]] <= dp[index]:
            candidates.pop()
        candidates.append(index)
        best = max(best, dp[index])  # step: dp
    return best  # step: return`,
2334:`def validSubarraySize(nums, threshold):
    stack = []
    for right in range(len(nums) + 1):
        while stack and (right == len(nums) or nums[stack[-1]] >= nums[right]):
            index = stack.pop()
            left = stack[-1] if stack else -1
            width = right - left - 1
            if nums[index] * width > threshold:  # step: span
                return width
        if right < len(nums):
            stack.append(right)
    return -1  # step: return`,
2454:`def secondGreaterElement(nums):
    first, second, answer = [], [], [-1] * len(nums)
    for index, value in enumerate(nums):
        while second and nums[second[-1]] < value:
            answer[second.pop()] = value
        moved = []
        while first and nums[first[-1]] < value:
            moved.append(first.pop())
        second.extend(reversed(moved))
        first.append(index)  # step: stages
    return answer  # step: return`,
};
const cases={
862:[['Negative values require prefix dominance rather than a plain sum window',{nums:[4,-6,8,3,-2,7,-9,6,5],k:13}],['A later singleton can beat every earlier multi-value answer',{nums:[2,-3,4,1,12],k:10}],['No qualifying subarray returns minus one',{nums:[-4,2,-3,1],k:7}],['An exact threshold sum qualifies',{nums:[3,-1,5],k:7}]],
907:[['Several minima own overlapping ranges with distinct boundaries',{arr:[8,3,6,2,5,5,1,7]}],['Equal minima require one consistent tie owner',{arr:[4,4,4,4]}],['Increasing values wait for the final stack flush',{arr:[1,3,5,7,9]}],['One value contributes exactly itself',{arr:[12]}]],
1063:[['Smaller values close several pending start ranges',{nums:[3,6,4,7,2,5,5,1]}],['Equal values never violate the first-value condition',{nums:[8,8,8,8]}],['A decreasing array permits only singleton ranges',{nums:[9,7,5,3]}],['An increasing array permits every subarray',{nums:[1,4,6,10]}]],
1425:[['Positive choices bridge bounded negative gaps',{nums:[8,-5,4,-12,7,-2,9,-15,6],k:3}],['All negative values still require a nonempty answer',{nums:[-8,-3,-11,-5],k:2}],['k one becomes a contiguous maximum-sum choice',{nums:[5,-2,4,-9,6],k:1}],['A wide gap allowance can skip all negative entries',{nums:[3,-20,7,-30,11],k:5}]],
2334:[['A low boundary can reveal a longer qualifying interior span',{nums:[2,7,8,9,6,1,5],threshold:24}],['Strict equality is not enough',{nums:[4,4,4],threshold:12}],['A single large value can be the answer',{nums:[1,2,20,3],threshold:15}],['The full plateau qualifies when the threshold is slightly lower',{nums:[6,6,6,6],threshold:23}]],
2454:[['Two pending stages interact across rises and dips',{nums:[4,9,2,7,11,5,13,8,15]}],['Equal values do not count as greater',{nums:[5,5,5,6,6]}],['A decreasing array has no second greater values',{nums:[12,9,6,3]}],['Two increasing values still leave both answers absent',{nums:[4,8]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},values=id===907?input.arr:input.nums;need(Array.isArray(values)&&values.length>=1&&values.length<=100&&values.every(v=>Number.isInteger(v)&&v>=([862,1425].includes(id)?-10000:id===2454?0:1)&&v<=10000),'Use 1-100 bounded integers, allowing negatives only for the signed-sum problems.');if(id===862)need(Number.isInteger(input.k)&&input.k>=1&&input.k<=1000000,'k must be a positive target no greater than one million.');if(id===1425)need(Number.isInteger(input.k)&&input.k>=1&&input.k<=values.length,'k must be from one to array length.');if(id===2334)need(Number.isInteger(input.threshold)&&input.threshold>=1&&input.threshold<=1000000,'Threshold must be from one to one million.');return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2334&&result>0?'span':'return',pseudocodeStages:{862:{deque:4},907:{contribution:4},1063:{boundary:3},1425:{dp:4},2334:{span:4},2454:{stages:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['862','1425'].includes(id)?['Monotonic Queue']:['Monotonic Stack']]))};
