const specs={
712:['s1 s2','Delete characters from two strings at minimum ASCII cost until the strings are equal.','DP over prefix pairs either keeps matching final characters for free or deletes one final character and pays its ASCII value. Empty-prefix borders accumulate all necessary deletions.','initialize costs for deleting each prefix into an empty string|compare the final characters of each prefix pair|keep a matching pair with the diagonal cost|otherwise choose the cheaper one-character deletion|return the full-prefix minimum cost','O(length1*length2) time and displayed DP space.'],
1035:['nums1 nums2','Draw the largest number of equal-value connections without crossings.','Noncrossing connections preserve order in both arrays, so they form a common subsequence. Prefix DP either connects matching final values or skips one side to preserve the best earlier alignment.','initialize zero matches for empty prefixes|compare each prefix pair final values|extend the diagonal by one when they match|otherwise keep the better result from skipping either value|return the longest common-subsequence count','O(length1*length2) time and displayed DP space.'],
1216:['s k','Decide whether removing at most k characters can leave a palindrome.','Interval DP stores the fewest deletions needed for each substring. Equal ends can remain around the inner solution; unequal ends require deleting one endpoint and choosing the cheaper remaining interval.','initialize zero deletions for single-character intervals|grow interval length from two upward|keep equal endpoints around their inner interval|otherwise delete either endpoint and take the smaller cost plus one|compare the complete interval cost with k','O(n^2) time and space.'],
1458:['nums1 nums2','Maximize the dot product of two equally long nonempty subsequences.','Prefix DP may skip an element on either side or pair the current elements. Start a new nonempty product at that pair when the earlier diagonal is negative; negative-infinity borders forbid an empty answer.','initialize empty-prefix states as impossible|pair current elements and optionally extend a positive diagonal result|compare pairing with skipping either array element|store the greatest nonempty dot product for each prefix pair|return the full-prefix optimum','O(length1*length2) time and displayed DP space.'],
1027:['nums','Find the longest arithmetic subsequence with one constant consecutive difference.','Each ending index owns a map from difference to best length. A pair extends an earlier subsequence with the same difference, or begins a new two-element subsequence when none exists.','create a difference-to-length map for each ending index|compare every earlier value with the current value|extend the matching earlier difference state or start length two|keep the largest length for this endpoint and difference|return the largest arithmetic subsequence length','O(n^2) time and O(n^2) map space.'],
1043:['arr k','Partition the array into blocks of length at most k to maximize the sum after each block is replaced by its maximum.','For each prefix end, try all allowed final-block lengths. Track that block maximum while extending backward, then combine its replaced sum with the best earlier prefix.','start with zero value for an empty prefix|advance the prefix end|try every allowed final block while updating its maximum|combine previous optimum with block maximum times length|return the best full-array partition score','O(n*k) time and O(n) DP space.'],
1049:['stones','Minimize the final stone weight after repeatedly smashing pairs.','Every outcome corresponds to splitting weights into two signed groups. Find the largest achievable subset sum at most half the total; the remaining imbalance is total minus twice that sum.','compute half of the total stone weight|start a subset-sum table with only zero reachable|add each stone by scanning capacities downward|find the largest reachable sum at most half|return total minus twice that sum','O(stones*total weight) time and O(total weight) space.'],
801:['nums1 nums2','Use the fewest same-index swaps so both sequences become strictly increasing.','Keep two costs for each index: leave this pair in place or swap it. Straight comparisons preserve the previous swap status; cross comparisons allow changing that status.','start with cost zero to keep the first pair and one to swap it|compare current and previous pairs in straight and crossed order|relax keep and swap costs using every valid ordering|replace the previous two-state costs|return the cheaper final state','O(n) time and O(1) DP state excluding trace.'],
813:['nums k','Partition positive values into at most k contiguous groups to maximize the sum of group averages.','With positive values, splitting a group cannot decrease the total average sum, so an optimum uses k groups. Prefix sums price each final group while DP tries all earlier split positions.','build prefix sums for constant-time group averages|start with zero groups covering an empty prefix|advance the group count and each covered prefix|try every final split and maximize prior score plus group average|return the score for k groups covering all values','O(k*n^2) time and O(k*n) displayed DP space.'],
1335:['jobDifficulty d','Schedule ordered jobs across exactly d nonempty days to minimize the sum of daily maximum difficulty.','Try every possible final-day starting job. Its cost is the maximum difficulty in that suffix block, added to the best valid schedule for earlier jobs on one fewer day.','reject fewer jobs than days|initialize the empty schedule and impossible other states|advance day count and covered job prefix|try final-day starts while tracking the daily maximum|return the minimum complete schedule cost','O(days*jobs^2) time and O(jobs) rolling algorithm state.'],
};
const shown=table=>table.map(row=>row.map(v=>Number.isFinite(v)?v:v<0?'−∞':'∞'));
const solvers={
712({s1,s2},emit){const dp=Array.from({length:s1.length+1},()=>Array(s2.length+1).fill(0));for(let i=1;i<=s1.length;i++)dp[i][0]=dp[i-1][0]+s1.charCodeAt(i-1);for(let j=1;j<=s2.length;j++)dp[0][j]=dp[0][j-1]+s2.charCodeAt(j-1);for(let i=1;i<=s1.length;i++)for(let j=1;j<=s2.length;j++){const equal=s1[i-1]===s2[j-1];dp[i][j]=equal?dp[i-1][j-1]:Math.min(dp[i-1][j]+s1.charCodeAt(i-1),dp[i][j-1]+s2.charCodeAt(j-1));emit(equal?'Matching final characters can both stay, so use the diagonal prefix cost.':'Delete either final character, pay its ASCII value, and retain the cheaper prefix alignment.',{sequence:s1.split(''),index:i-1,output:s2.split(''),outputIndex:j-1,outputMatrix:dp.map(row=>[...row]),outputMatrixLabel:'Minimum deletion cost by prefix lengths',outputCell:[i,j],codeStage:'cell',metrics:{first:s1[i-1],second:s2[j-1],cost:dp[i][j]}},'update');}return dp[s1.length][s2.length];},
1035({nums1,nums2},emit){const dp=Array.from({length:nums1.length+1},()=>Array(nums2.length+1).fill(0));for(let i=1;i<=nums1.length;i++)for(let j=1;j<=nums2.length;j++){const equal=nums1[i-1]===nums2[j-1];dp[i][j]=equal?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);emit(equal?'Connect these equal final values after the best smaller-prefix alignment. Their order preserves noncrossing lines.':'These final values cannot connect. Keep the better alignment obtained by skipping one side.',{sequence:nums1,index:i-1,output:nums2,outputIndex:j-1,outputMatrix:dp.map(row=>[...row]),outputMatrixLabel:'Maximum noncrossing matches by prefix lengths',outputCell:[i,j],codeStage:'cell',metrics:{matches:dp[i][j]}},'update');}return dp[nums1.length][nums2.length];},
1216({s,k},emit){const n=s.length,dp=Array.from({length:n},()=>Array(n).fill(0));for(let length=2;length<=n;length++){for(let left=0;left+length<=n;left++){const right=left+length-1;dp[left][right]=s[left]===s[right]?(length===2?0:dp[left+1][right-1]):1+Math.min(dp[left+1][right],dp[left][right-1]);}emit('All shorter intervals are ready. Matching ends keep the inner cost; mismatched ends pay one deletion and choose the better remaining interval.',{sequence:s.split(''),outputMatrix:dp.map(row=>[...row]),outputMatrixLabel:'Minimum deletions for intervals [row, column]',codeStage:'interval',metrics:{intervalLength:length,allowedDeletions:k}},'update');}return dp[0][n-1]<=k;},
1458({nums1,nums2},emit){const dp=Array.from({length:nums1.length+1},()=>Array(nums2.length+1).fill(-Infinity));for(let i=1;i<=nums1.length;i++)for(let j=1;j<=nums2.length;j++){const product=nums1[i-1]*nums2[j-1],paired=product+Math.max(0,dp[i-1][j-1]);dp[i][j]=Math.max(paired,dp[i-1][j],dp[i][j-1]);emit('Pairing these elements starts a nonempty answer or extends a beneficial earlier pairing. Compare it with skipping either element; an empty zero answer is never an available final state.',{sequence:nums1,index:i-1,output:nums2,outputIndex:j-1,outputMatrix:shown(dp),outputMatrixLabel:'Best nonempty dot product by prefix lengths',outputCell:[i,j],codeStage:'cell',metrics:{product,paired,best:dp[i][j]}},'update');}return dp[nums1.length][nums2.length];},
1027({nums},emit){const dp=nums.map(()=>new Map());let best=1;for(let i=0;i<nums.length;i++)for(let j=0;j<i;j++){const difference=nums[i]-nums[j],length=(dp[j].get(difference)||1)+1;dp[i].set(difference,Math.max(dp[i].get(difference)||0,length));best=Math.max(best,dp[i].get(difference));emit('The prior endpoint can extend only a subsequence with this same difference. Without such a state, the two selected values start a length-two arithmetic subsequence.',{sequence:nums,index:i,table:[...dp[i]],tableHeaders:['Difference ending here','Best length'],codeStage:'extend',metrics:{previousIndex:j,difference,candidate:length,best}},'update');}return best;},
1043({arr,k},emit){const dp=Array(arr.length+1).fill(0);for(let end=1;end<=arr.length;end++){let maximum=0;const options=[];for(let length=1;length<=Math.min(k,end);length++){maximum=Math.max(maximum,arr[end-length]);const candidate=dp[end-length]+maximum*length;dp[end]=Math.max(dp[end],candidate);options.push([end-length,end-1,maximum,candidate]);}emit('Every candidate fixes the last block, allowing the earlier prefix to use its already-optimal partition. A longer block may replace more values but also changes where the earlier optimum ends.',{sequence:arr,index:end-1,output:[...dp],outputIndex:end,table:options,tableHeaders:['Block start','Block end','Block maximum','Candidate score'],codeStage:'partition',metrics:{prefixLength:end,best:dp[end]}},'update');}return dp[arr.length];},
1049({stones},emit){const total=stones.reduce((a,b)=>a+b,0),half=Math.floor(total/2),reachable=Array(half+1).fill(false);reachable[0]=true;for(let i=0;i<stones.length;i++){for(let sum=half;sum>=stones[i];sum--)if(reachable[sum-stones[i]])reachable[sum]=true;emit('Update capacities downward so this stone is used at most once. Reachable subset sums near half the total create the smallest final imbalance.',{sequence:stones,index:i,output:reachable.flatMap((yes,sum)=>yes?[sum]:[]),codeStage:'subset',metrics:{stone:stones[i],total,targetHalf:half}},'update');}let best=half;while(!reachable[best])best--;return total-2*best;},
801({nums1,nums2},emit){let keep=0,swap=1;const table=[[0,keep,swap]];for(let i=1;i<nums1.length;i++){let nextKeep=Infinity,nextSwap=Infinity;const straight=nums1[i]>nums1[i-1]&&nums2[i]>nums2[i-1],cross=nums1[i]>nums2[i-1]&&nums2[i]>nums1[i-1];if(straight){nextKeep=keep;nextSwap=swap+1;}if(cross){nextKeep=Math.min(nextKeep,swap);nextSwap=Math.min(nextSwap,keep+1);}keep=nextKeep;swap=nextSwap;table.push([i,Number.isFinite(keep)?keep:'impossible',Number.isFinite(swap)?swap:'impossible']);emit('Straight inequalities allow keeping the previous swap status. Cross inequalities allow changing it; choose the lowest cost for each current status.',{sequence:nums1,index:i,output:nums2,outputIndex:i,table:[...table],tableHeaders:['Index','Keep cost','Swap cost'],codeStage:'states',metrics:{straight,cross}},'update');}return Math.min(keep,swap);},
813({nums,k},emit){const n=nums.length,prefix=[0];for(const value of nums)prefix.push(prefix.at(-1)+value);const dp=Array.from({length:k+1},()=>Array(n+1).fill(-Infinity));dp[0][0]=0;for(let groups=1;groups<=k;groups++){for(let end=groups;end<=n;end++)for(let split=groups-1;split<end;split++)dp[groups][end]=Math.max(dp[groups][end],dp[groups-1][split]+(prefix[end]-prefix[split])/(end-split));emit('Try every start for the final group. Prefix sums provide its average, and the previous row supplies the best partition of everything before it.',{sequence:nums,outputMatrix:shown(dp),outputMatrixLabel:'Best sum of averages: rows groups, columns prefix length',codeStage:'groups',metrics:{groups,bestFullPrefix:dp[groups][n]}},'update');}return dp[k][n];},
1335({jobDifficulty,d},emit){const n=jobDifficulty.length;if(n<d)return -1;let dp=Array(n+1).fill(Infinity);dp[0]=0;for(let day=1;day<=d;day++){const next=Array(n+1).fill(Infinity);for(let end=day;end<=n;end++){let maximum=0,bestStart=null;for(let start=end-1;start>=day-1;start--){maximum=Math.max(maximum,jobDifficulty[start]);const candidate=dp[start]+maximum;if(candidate<next[end]){next[end]=candidate;bestStart=start;}}emit('Choose a nonempty final-day block. Its maximum difficulty is added to a valid schedule of the preceding jobs on one fewer day.',{sequence:jobDifficulty,index:end-1,window:bestStart===null?null:[bestStart,end-1],output:next.map(v=>Number.isFinite(v)?v:'impossible'),outputIndex:end,codeStage:'day',metrics:{day,coveredJobs:end,bestFinalDayStart:bestStart,best:next[end]}},'update');}dp=next;}return dp[n];},
};
const python={
712:`def minimumDeleteSum(s1, s2):
    dp = [[0] * (len(s2) + 1) for _ in range(len(s1) + 1)]
    for i in range(1, len(s1) + 1):
        dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])
    for j in range(1, len(s2) + 1):
        dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])
    for i in range(1, len(s1) + 1):
        for j in range(1, len(s2) + 1):
            dp[i][j] = (dp[i - 1][j - 1] if s1[i - 1] == s2[j - 1]
                        else min(dp[i - 1][j] + ord(s1[i - 1]), dp[i][j - 1] + ord(s2[j - 1])))  # step: cell
    return dp[-1][-1]  # step: return`,
1035:`def maxUncrossedLines(nums1, nums2):
    dp = [[0] * (len(nums2) + 1) for _ in range(len(nums1) + 1)]
    for i in range(1, len(nums1) + 1):
        for j in range(1, len(nums2) + 1):
            dp[i][j] = (dp[i - 1][j - 1] + 1 if nums1[i - 1] == nums2[j - 1]
                        else max(dp[i - 1][j], dp[i][j - 1]))  # step: cell
    return dp[-1][-1]  # step: return`,
1216:`def isValidPalindrome(s, k):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            if s[left] == s[right]:
                dp[left][right] = dp[left + 1][right - 1] if length > 2 else 0
            else:
                dp[left][right] = 1 + min(dp[left + 1][right], dp[left][right - 1])
        # step: interval
    return dp[0][-1] <= k  # step: return`,
1458:`def maxDotProduct(nums1, nums2):
    dp = [[float('-inf')] * (len(nums2) + 1) for _ in range(len(nums1) + 1)]
    for i in range(1, len(nums1) + 1):
        for j in range(1, len(nums2) + 1):
            paired = nums1[i - 1] * nums2[j - 1] + max(0, dp[i - 1][j - 1])
            dp[i][j] = max(paired, dp[i - 1][j], dp[i][j - 1])  # step: cell
    return dp[-1][-1]  # step: return`,
1027:`def longestArithSeqLength(nums):
    dp, best = [{} for _ in nums], 1
    for end in range(len(nums)):
        for previous in range(end):
            difference = nums[end] - nums[previous]
            length = dp[previous].get(difference, 1) + 1
            dp[end][difference] = max(dp[end].get(difference, 0), length)  # step: extend
            best = max(best, dp[end][difference])
    return best  # step: return`,
1043:`def maxSumAfterPartitioning(arr, k):
    dp = [0] * (len(arr) + 1)
    for end in range(1, len(arr) + 1):
        maximum = 0
        for length in range(1, min(k, end) + 1):
            maximum = max(maximum, arr[end - length])
            dp[end] = max(dp[end], dp[end - length] + maximum * length)
        # step: partition
    return dp[-1]  # step: return`,
1049:`def lastStoneWeightII(stones):
    total = sum(stones)
    half = total // 2
    reachable = [True] + [False] * half
    for stone in stones:
        for value in range(half, stone - 1, -1):
            reachable[value] = reachable[value] or reachable[value - stone]
        # step: subset
    best = max(value for value in range(half + 1) if reachable[value])
    return total - 2 * best  # step: return`,
801:`def minSwap(nums1, nums2):
    keep, swap = 0, 1
    for index in range(1, len(nums1)):
        next_keep = next_swap = float('inf')
        if nums1[index] > nums1[index - 1] and nums2[index] > nums2[index - 1]:
            next_keep, next_swap = keep, swap + 1
        if nums1[index] > nums2[index - 1] and nums2[index] > nums1[index - 1]:
            next_keep, next_swap = min(next_keep, swap), min(next_swap, keep + 1)
        keep, swap = next_keep, next_swap  # step: states
    return min(keep, swap)  # step: return`,
813:`def largestSumOfAverages(nums, k):
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    n = len(nums)
    dp = [[float('-inf')] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for groups in range(1, k + 1):
        for end in range(groups, n + 1):
            for split in range(groups - 1, end):
                dp[groups][end] = max(dp[groups][end], dp[groups - 1][split]
                                      + (prefix[end] - prefix[split]) / (end - split))
        # step: groups
    return dp[k][n]  # step: return`,
1335:`def minDifficulty(jobDifficulty, d):
    n = len(jobDifficulty)
    if n < d:
        return -1  # step: impossible
    dp = [0] + [float('inf')] * n
    for day in range(1, d + 1):
        following = [float('inf')] * (n + 1)
        for end in range(day, n + 1):
            maximum = 0
            for start in range(end - 1, day - 2, -1):
                maximum = max(maximum, jobDifficulty[start])
                following[end] = min(following[end], dp[start] + maximum)
            # step: day
        dp = following
    return dp[n]  # step: return`,
};
const cases={
712:[['Shared letters compete with their different deletion costs',{s1:'stargazer',s2:'trailblazer'}],['Identical text costs nothing to retain',{s1:'orbit',s2:'orbit'}],['No shared letters requires deleting both strings',{s1:'abc',s2:'xyz'}],['Repeated letters permit several alignments',{s1:'babaab',s2:'abbaba'}]],
1035:[['Repeated numbers create competing noncrossing alignments',{nums1:[3,7,2,7,5,2,9],nums2:[7,3,7,2,9,5,2]}],['Disjoint values permit no lines',{nums1:[1,3,5],nums2:[2,4,6]}],['Equal repeats connect only as many positions as both arrays contain',{nums1:[8,8,8,8],nums2:[8,8]}],['Identical arrays connect every position',{nums1:[4,1,7,3],nums2:[4,1,7,3]}]],
1216:[['Several interval choices compete to repair a near-palindrome',{s:'abrcadacbrba',k:3}],['An existing palindrome needs zero deletions',{s:'rotator',k:0}],['Distinct letters need all but one removed',{s:'planet',k:4}],['One allowed deletion can remove a mismatched endpoint',{s:'xlevel',k:1}]],
1458:[['Positive and negative pair products create competing alignments',{nums1:[4,-3,7,-2,5],nums2:[-6,2,-4,8]}],['Every possible product is negative but an empty result is forbidden',{nums1:[2,5,7],nums2:[-8,-3]}],['Negative pairs can make a positive optimum',{nums1:[-5,-2],nums2:[-7,-4]}],['A zero product can beat every negative pairing',{nums1:[0,3],nums2:[-5,-2]}]],
1027:[['Different endpoint differences compete along one array',{nums:[4,10,7,13,16,19,8,22]}],['Repeated equal values use difference zero',{nums:[6,6,6,6,6]}],['A descending arithmetic chain uses a negative difference',{nums:[20,16,12,8,4]}],['Two values always form an arithmetic subsequence',{nums:[3,17]}]],
1043:[['Long high-value blocks compete with earlier optimal partitions',{arr:[3,12,4,7,2,11,5,9],k:3}],['Length-one blocks leave the original sum',{arr:[4,8,2,6],k:1}],['One whole-array block can use the global maximum',{arr:[2,7,3,5],k:4}],['Equal values make every partition score identical',{arr:[6,6,6,6,6],k:2}]],
1049:[['Near-half subset sums determine the lightest final imbalance',{stones:[9,14,6,11,3,8,5]}],['An exact equal partition can leave zero',{stones:[4,7,3,8]}],['A single stone remains unchanged',{stones:[13]}],['One dominant stone exceeds all other weights combined',{stones:[30,2,3,4]}]],
801:[['Several local swaps restore two longer increasing sequences',{nums1:[1,7,5,11,9,15],nums2:[2,4,8,8,12,12]}],['Already increasing sequences need no swaps',{nums1:[1,3,6,9],nums2:[2,5,8,12]}],['A final swap repairs both strict inequalities',{nums1:[1,4,7,6],nums2:[2,3,5,10]}],['Single-element sequences are already increasing',{nums1:[8],nums2:[3]}]],
813:[['Large values compete for singleton groups within a fixed group budget',{nums:[8,2,6,1,9,3,7,4],k:3}],['One group is simply the whole-array average',{nums:[3,7,2,8],k:1}],['One group per value yields the original sum',{nums:[2,5,8,4],k:4}],['Equal values make every same-group-count partition equivalent',{nums:[6,6,6,6,6],k:3}]],
1335:[['Ordered high and low jobs create competing daily blocks',{jobDifficulty:[8,2,6,10,3,7,4,9],d:3}],['More days than jobs is impossible',{jobDifficulty:[4,7],d:3}],['One day pays only the maximum difficulty',{jobDifficulty:[3,9,2,6],d:1}],['One job per day pays the sum',{jobDifficulty:[5,2,8,4],d:4}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max,array=(a,min,max,length=30)=>Array.isArray(a)&&a.length>=1&&a.length<=length&&a.every(v=>integer(v,min,max));if(id===712)need([input.s1,input.s2].every(s=>typeof s==='string'&&/^[a-z]{1,18}$/.test(s)),'Use two lowercase strings of length 1-18.');if(id===1216)need(typeof input.s==='string'&&/^[a-z]{1,40}$/.test(input.s)&&integer(input.k,0,input.s.length),'Use 1-40 lowercase letters and a deletion budget from zero to string length.');if([1035,1458,801].includes(id)){need([input.nums1,input.nums2].every(a=>array(a,id===1458?-100:0,100,id===1035||id===1458?20:40)),'Use bounded nonempty integer arrays; dot products allow negative values.');if(id===801){need(input.nums1.length===input.nums2.length,'The two sequences must have equal lengths.');let keep=true,swap=true;for(let i=1;i<input.nums1.length;i++){const straight=input.nums1[i]>input.nums1[i-1]&&input.nums2[i]>input.nums2[i-1],cross=input.nums1[i]>input.nums2[i-1]&&input.nums2[i]>input.nums1[i-1];[keep,swap]=[straight&&keep||cross&&swap,straight&&swap||cross&&keep];}need(keep||swap,'At least one sequence of same-index swaps must make both arrays strictly increasing.');}}if(id===1027)need(array(input.nums,0,10000,30)&&input.nums.length>=2,'Use 2-30 nonnegative values up to 10000.');if(id===1043)need(array(input.arr,0,10000,60)&&integer(input.k,1,input.arr.length),'Use 1-60 nonnegative values and a valid block length k.');if(id===1049)need(array(input.stones,1,100,30),'Use 1-30 stone weights from one to 100.');if(id===813)need(array(input.nums,1,10000,30)&&integer(input.k,1,input.nums.length),'Use 1-30 positive values with one through n groups.');if(id===1335)need(array(input.jobDifficulty,0,10000,30)&&integer(input.d,1,10),'Use 1-30 job difficulties and 1-10 days.');return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===1335&&result===-1?'impossible':'return',pseudocodeStages:{712:{cell:4},1035:{cell:4},1216:{interval:4},1458:{cell:4},1027:{extend:4},1043:{partition:4},1049:{subset:3},801:{states:4},813:{groups:4},1335:{impossible:1,day:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Dynamic Programming']]))};
