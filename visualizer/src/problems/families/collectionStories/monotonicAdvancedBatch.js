const specs={
1776:['cars','Find when each moving car first collides with the fleet ahead of it.','Scan cars from right to left. A candidate ahead is useful only if this car can catch it before that candidate joins another fleet; otherwise discard it and inspect the next fleet representative.','scan cars from right to left with a candidate stack|discard candidates that cannot be caught at their current speed|discard catches occurring after the candidate already collides|record the first feasible catch time and push the current car|return first collision times or minus one','O(cars) time and O(cars) stack space.'],
2281:['strength','Sum minimum strength times total strength over every contiguous group modulo 1000000007.','A monotonic stack assigns every subarray to one minimum occurrence. Prefix sums of prefix sums aggregate the total strengths of all ranges owned by that occurrence without enumerating those ranges.','build prefix sums and prefix sums of those sums|pop minima to discover asymmetric smaller boundaries|combine left-start and right-end prefix-sum totals|multiply each owned range-sum total by its minimum|return the modular sum of all contributions','O(n) time and O(n) space with exact integer arithmetic.'],
2355:['books','Take the most books from a contiguous shelf range while taking a strictly increasing positive count from left to right.','At an ending shelf, take its cap and step downward by one to the left. A stack of increasing books[i]-i finds where that arithmetic progression meets a smaller cap; DP reuses the optimal earlier segment there.','scan shelf endpoints with adjusted cap books minus index|pop adjusted caps that cannot anchor the current progression|sum the positive decreasing arithmetic run ending here|combine with the previous compatible endpoint DP|return the greatest total across ending shelves','O(shelves) time and O(shelves) stack/DP space.'],
2411:['nums','For each start find the shortest subarray attaining that start suffix maximum bitwise OR.','Scan from right to left and remember the nearest occurrence of every set bit. To collect every bit available in the suffix, the end must reach the farthest of those nearest occurrences.','scan start positions from right to left|update nearest positions of bits present in the current value|find the farthest required nearest-bit position|store its distance from the start plus one|return every shortest suffix-OR window length','O(30*n) time and O(30+n) space.'],
2940:['heights queries','Find the leftmost building where each pair can meet by moving right to strictly taller buildings.','Resolve pairs that can meet at their right endpoint immediately. For the rest, process right boundaries from right to left; a monotonic skyline retains undominated buildings, and binary search finds the nearest one taller than both starts.','normalize each query left and right starting indices|answer same-building and directly reachable right-endpoint queries|process remaining boundaries right to left while maintaining a skyline|binary search the skyline for the leftmost sufficiently tall building|return meeting indices or minus one','O(n + queries log queries + queries log n) time and O(n+queries) space.'],
};
const solvers={
1776({cars},emit){const stack=[],answer=Array(cars.length).fill(-1);for(let i=cars.length-1;i>=0;i--){const[position,speed]=cars[i];while(stack.length){const j=stack.at(-1),[nextPosition,nextSpeed]=cars[j];if(speed<=nextSpeed){stack.pop();continue;}const time=(nextPosition-position)/(speed-nextSpeed);if(answer[j]<0||time<=answer[j]){answer[i]=time;break;}stack.pop();}stack.push(i);emit('The stack keeps the next fleet boundary this car can reach before that boundary changes. A faster car ahead or an already-earlier fleet merger is skipped.',{matrix:cars,matrixLabel:'Car position and speed',cell:[i,0],output:[...answer],outputIndex:i,table:stack.map(j=>[j,cars[j][0],cars[j][1],answer[j]]),tableHeaders:['Candidate car','Position','Speed','First collision time'],codeStage:'fleet',metrics:{car:i,collisionTime:answer[i]}},'update');}return answer;},
2281({strength},emit){const n=strength.length,prefix=[0n],double=[0n];for(const v of strength)prefix.push(prefix.at(-1)+BigInt(v));for(const v of prefix)double.push(double.at(-1)+v);const stack=[],mod=1000000007n;let answer=0n;for(let right=0;right<=n;right++){while(stack.length&&(right===n||strength[stack.at(-1)]>=strength[right])){const index=stack.pop(),left=stack.at(-1)??-1,sumRight=double[right+1]-double[index+1],sumLeft=double[index+1]-double[left+1],rangeTotals=BigInt(index-left)*sumRight-BigInt(right-index)*sumLeft,contribution=BigInt(strength[index])*rangeTotals;answer=(answer+contribution)%mod;emit('Each right-end prefix appears once for every allowed start, and each left-start prefix is subtracted once for every allowed end. Multiply that aggregate range sum by the owning minimum.',{sequence:strength,index,window:[left+1,right-1],table:[[left,index,right,String(sumLeft),String(sumRight),String(rangeTotals)]],tableHeaders:['Left boundary','Minimum index','Right boundary','Left prefix total','Right prefix total','Owned range sums'],codeStage:'contribution',metrics:{minimum:strength[index],contribution:String(contribution),modularTotal:String(answer)}},'update');}if(right<n)stack.push(right);}return Number(answer);},
2355({books},emit){const stack=[],dp=Array(books.length).fill(0);let best=0;for(let i=0;i<books.length;i++){while(stack.length&&books[stack.at(-1)]-stack.at(-1)>=books[i]-i)stack.pop();const previous=stack.at(-1)??-1,length=Math.min(books[i],i-previous),run=(2*books[i]-length+1)*length/2;dp[i]=run+(previous>=0?dp[previous]:0);best=Math.max(best,dp[i]);stack.push(i);emit('From this ending cap, the chosen counts descend by one when moving left. Stop before counts become nonpositive or at the previous compatible cap, then reuse its DP total.',{sequence:books,index:i,window:[i-length+1,i],output:[...dp],table:stack.map(j=>[j,books[j]-j,dp[j]]),tableHeaders:['Shelf','Adjusted cap','Best ending total'],codeStage:'progression',metrics:{previous,length,progressionSum:run,totalEndingHere:dp[i],best}},'update');}return best;},
2411({nums},emit){const nearest=Array(30).fill(-1),answer=Array(nums.length).fill(0);for(let i=nums.length-1;i>=0;i--){for(let bit=0;bit<30;bit++)if(nums[i]&(1<<bit))nearest[bit]=i;const end=Math.max(i,...nearest);answer[i]=end-i+1;emit('Every suffix bit must be included. Its closest occurrence is enough, and the farthest such occurrence determines the shortest endpoint collecting them all.',{sequence:nums,index:i,window:[i,end],output:[...answer],outputIndex:i,table:nearest.flatMap((position,bit)=>position<0?[]:[[bit,position]]),tableHeaders:['Required bit','Nearest index'],codeStage:'bits',metrics:{start:i,end,length:answer[i]}},'update');}return answer;},
2940({heights,queries},emit){const answer=Array(queries.length).fill(-1),pending=[];for(let q=0;q<queries.length;q++){const[a,b]=[...queries[q]].sort((a,b)=>a-b);if(a===b||heights[a]<heights[b]){answer[q]=b;emit('Both starts can meet at the right starting building: they are already there together or the left start can move directly to its taller height.',{sequence:heights,index:b,output:[...answer],codeStage:'direct',metrics:{query:q,left:a,right:b,meeting:b}},'update');}else pending.push([b,heights[a],q]);}pending.sort((a,b)=>b[0]-a[0]);const stack=[];let index=heights.length-1;for(const[right,target,q]of pending){while(index>right){while(stack.length&&heights[stack.at(-1)]<=heights[index])stack.pop();stack.push(index--);}let low=0,high=stack.length;while(low<high){const mid=Math.floor((low+high)/2);if(heights[stack[mid]]>target)low=mid+1;else high=mid;}answer[q]=low?stack[low-1]:-1;emit('The skyline contains only buildings not dominated by an earlier equally tall or taller building. Find the last skyline entry taller than both starts; its index is the leftmost reachable meeting.',{sequence:heights,index:right,table:stack.map(j=>[j,heights[j],heights[j]>target]),tableHeaders:['Skyline building','Height','Above required height?'],output:[...answer],codeStage:'search',metrics:{query:q,rightBoundary:right,requiredGreaterThan:target,meeting:answer[q]}},'update');}return answer;},
};
const python={
1776:`def getCollisionTimes(cars):
    stack, answer = [], [-1.0] * len(cars)
    for index in range(len(cars) - 1, -1, -1):
        position, speed = cars[index]
        while stack:
            ahead = stack[-1]
            next_position, next_speed = cars[ahead]
            if speed <= next_speed:
                stack.pop()
                continue
            time = (next_position - position) / (speed - next_speed)
            if answer[ahead] < 0 or time <= answer[ahead]:
                answer[index] = time
                break
            stack.pop()
        stack.append(index)  # step: fleet
    return answer  # step: return`,
2281:`def totalStrength(strength):
    n, modulus = len(strength), 1000000007
    prefix, double = [0], [0]
    for value in strength:
        prefix.append(prefix[-1] + value)
    for value in prefix:
        double.append(double[-1] + value)
    stack, answer = [], 0
    for right in range(n + 1):
        while stack and (right == n or strength[stack[-1]] >= strength[right]):
            index = stack.pop()
            left = stack[-1] if stack else -1
            sum_right = double[right + 1] - double[index + 1]
            sum_left = double[index + 1] - double[left + 1]
            range_totals = (index - left) * sum_right - (right - index) * sum_left
            answer = (answer + strength[index] * range_totals) % modulus  # step: contribution
        if right < n:
            stack.append(right)
    return answer  # step: return`,
2355:`def maximumBooks(books):
    stack, dp, best = [], [0] * len(books), 0
    for index, cap in enumerate(books):
        while stack and books[stack[-1]] - stack[-1] >= cap - index:
            stack.pop()
        previous = stack[-1] if stack else -1
        length = min(cap, index - previous)
        progression = (2 * cap - length + 1) * length // 2
        dp[index] = progression + (dp[previous] if previous >= 0 else 0)  # step: progression
        best = max(best, dp[index])
        stack.append(index)
    return best  # step: return`,
2411:`def smallestSubarrays(nums):
    nearest, answer = [-1] * 30, [0] * len(nums)
    for index in range(len(nums) - 1, -1, -1):
        for bit in range(30):
            if nums[index] & (1 << bit):
                nearest[bit] = index
        end = max(index, max(nearest))
        answer[index] = end - index + 1  # step: bits
    return answer  # step: return`,
2940:`def leftmostBuildingQueries(heights, queries):
    answer, pending = [-1] * len(queries), []
    for query_index, pair in enumerate(queries):
        left, right = sorted(pair)
        if left == right or heights[left] < heights[right]:
            answer[query_index] = right  # step: direct
        else:
            pending.append((right, heights[left], query_index))
    pending.sort(reverse=True)
    stack, index = [], len(heights) - 1
    for right, target, query_index in pending:
        while index > right:
            while stack and heights[stack[-1]] <= heights[index]:
                stack.pop()
            stack.append(index)
            index -= 1
        low, high = 0, len(stack)
        while low < high:
            middle = (low + high) // 2
            if heights[stack[middle]] > target:
                low = middle + 1
            else:
                high = middle
        answer[query_index] = stack[low - 1] if low else -1  # step: search
    return answer  # step: return`,
};
const cases={
1776:[['Candidate cars merge into fleets before a rear car can reach them',{cars:[[2,7],[7,4],[13,6],[18,3],[26,5],[35,2]]}],['Increasing speeds never collide',{cars:[[1,2],[5,4],[12,6],[20,8]]}],['Equal speeds preserve all separations',{cars:[[3,5],[9,5],[16,5]]}],['Two cars can meet at a fractional time',{cars:[[4,8],[15,5]]}]],
2281:[['Different minimum owners contribute weighted range sums',{strength:[7,2,5,3,8,1,6]}],['Repeated equal minima need a consistent ownership rule',{strength:[4,4,4,4]}],['One strength contributes its own square',{strength:[13]}],['Large strengths require exact modular arithmetic',{strength:[999999,888888,777777,666666]}]],
2355:[['A low shelf interrupts several increasing selection candidates',{books:[9,4,7,3,8,10,6,12]}],['Zero-cap shelves cannot belong to a positive selection',{books:[0,0,0]}],['Equal caps force a rising arithmetic selection',{books:[5,5,5,5]}],['A rising cap sequence can be taken in full',{books:[1,3,5,7,9]}]],
2411:[['Future bit positions force windows of different lengths',{nums:[1,4,0,2,8,3,0,12,1]}],['All zeros need only their singleton windows',{nums:[0,0,0,0]}],['Identical masks already attain every suffix OR',{nums:[11,11,11]}],['A unique far-right bit forces earlier windows to reach it',{nums:[1,1,1,16]}]],
2940:[['Direct moves and skyline searches answer several start pairs',{heights:[8,3,6,2,10,7,12,5,14],queries:[[0,2],[1,3],[4,5],[6,8],[7,7],[8,0],[6,7]]}],['Equal heights do not permit a strict upward move',{heights:[5,5,5,5],queries:[[0,1],[1,3],[2,2]]}],['An increasing skyline resolves pairs at their right start',{heights:[2,4,7,11],queries:[[0,2],[3,1],[1,1]]}],['A descending skyline has no later taller meeting',{heights:[12,9,6,3],queries:[[0,1],[1,2],[2,3]]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===1776){need(Array.isArray(input.cars)&&input.cars.length>=1&&input.cars.length<=60&&input.cars.every((car,i)=>Array.isArray(car)&&car.length===2&&integer(car[0],1,1000000)&&integer(car[1],1,1000000)&&(!i||car[0]>input.cars[i-1][0])),'Use 1-60 cars with strictly increasing positive positions and positive speeds, at most one million.');return input;}const values=id===2281?input.strength:id===2355?input.books:id===2411?input.nums:input.heights;need(Array.isArray(values)&&values.length>=1&&values.length<=100&&values.every(v=>integer(v,id===2355||id===2411?0:1,id===2411?1000000000:1000000)),'Use 1-100 bounded integer values; zero is allowed for books and bitwise OR inputs.');if(id===2940)need(Array.isArray(input.queries)&&input.queries.length>=1&&input.queries.length<=80&&input.queries.every(q=>Array.isArray(q)&&q.length===2&&q.every(v=>integer(v,0,values.length-1))),'Use 1-80 valid pairs of building indices.');return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{1776:{fleet:4},2281:{contribution:4},2355:{progression:4},2411:{bits:4},2940:{direct:2,search:4}},tags:{1776:['Monotonic Stack'],2281:['Monotonic Stack','Prefix Sum'],2355:['Monotonic Stack','Dynamic Programming'],2411:['Bit Manipulation'],2940:['Monotonic Stack','Binary Search']}};
