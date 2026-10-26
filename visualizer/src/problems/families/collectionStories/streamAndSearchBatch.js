const specs={
2034:['operations','Maintain corrected stock prices and answer current, minimum, and maximum queries.','Store the latest price per timestamp, overwriting corrections. Current means the greatest timestamp, while extrema must be computed from all corrected values rather than historical updates.','start an empty timestamp-price map|read the next update or query|overwrite updates and track the greatest timestamp|answer current or scan corrected values for an extremum|return operation results with null for updates','O(updates + queries*distinct timestamps) direct-scan time; O(distinct timestamps) space.'],
2035:['nums','Split an even-length array into two equally sized groups with minimum sum difference.','Enumerate subset sums separately for each half, grouped by selected count. Pair complementary counts and binary-search the right-half sum closest to half the total minus the chosen left sum.','enumerate half-subsets grouped by cardinality|sort each right-half sum group|choose each left subset and the complementary right count|check neighbors around the target half-sum|return the smallest absolute partition difference','O(n*2^n) time and O(2^n) space for total length 2n.'],
2036:['nums','Maximize an alternating sum over a nonempty contiguous subarray.','Track the best subarray ending here with its last term added or subtracted. A new added state may start at this value or extend a subtracted state; a subtracted state must extend the previous added state.','initialize both ending-parity states as unreachable|read the next value|compute added and subtracted states from the previous pair|keep the best value across either ending parity|return the maximum alternating subarray sum','O(n) time; O(1) auxiliary space.'],
2037:['seats students','Assign each student to one seat with minimum total movement.','Sort both coordinate lists and pair them in order. Crossing assignments can be uncrossed without increasing total distance, so matching equal ranks is optimal.','sort seats and students independently|pair the next equal-rank positions|compute their absolute distance|add that movement to the total|return the minimum total moves','O(n log n) time; O(n) copied storage.'],
2038:['colors','Determine whether Alice wins when only removable same-color interior pieces may be deleted.','A run of length L supplies max(0,L-2) legal removals to its owner. Removing interior pieces never removes the run endpoints, so the players move budgets are independent.','start separate Alice and Bob move counts|inspect each interior piece|check whether both neighbors share its color|credit one removable piece to that color owner|return whether Alice has strictly more available moves','O(n) time; O(1) counting space.'],
2039:['edges patience','Find the first second when no network messages remain in transit.','BFS gives shortest round-trip latency to the master. A server resends at patience intervals strictly before its first reply; the last resend plus its round trip determines its final arriving reply.','build the network and BFS distances from the master|find each server round-trip time|compute the last resend strictly before its first reply|maximize last resend plus round trip|return one second after the latest reply','O(vertices+edges) time and graph/traversal space.'],
2040:['nums1 nums2 k','Find the kth smallest pair product from two sorted signed arrays.','Binary search the answer value. For each first-array value, binary-search how many second-array products are at most the threshold; negative multipliers reverse the monotone direction.','bound the answer using extreme endpoint products|choose a candidate product threshold|count qualifying products with sign-aware binary searches|retain the lower half when at least k products qualify|return the smallest threshold reaching rank k','O(m*log n*log product range) time; O(1) auxiliary counting state.'],
};
const solvers={
2034({operations},emit){const prices=new Map(),result=[];let latest=-1;for(let i=0;i<operations.length;i++){const[operation,timestamp,price]=operations[i];let answer=null,previous=null;if(operation==='update'){previous=prices.get(timestamp)??null;prices.set(timestamp,price);latest=Math.max(latest,timestamp);}else if(operation==='current')answer=prices.get(latest);else if(operation==='maximum')answer=Math.max(...prices.values());else answer=Math.min(...prices.values());result.push(answer);emit(operation==='update'?'Overwrite the price at this timestamp. An older correction can change the extrema without changing which timestamp is current.':'Read only the corrected map. Current follows the greatest timestamp, while maximum and minimum inspect all surviving corrected prices.',{sequence:operations.map(op=>op.join(' ')),index:i,output:[...result],table:[...prices].sort((a,b)=>a[0]-b[0]).map(([time,value])=>[time,value,time===latest?'current':'earlier']),tableHeaders:['Timestamp','Corrected price','Status'],codeStage:'update',metrics:{operation,previous,latest,result:answer}},'update');}return result;},
2035({nums},emit){const n=nums.length/2,left=Array.from({length:n+1},()=>[]),right=Array.from({length:n+1},()=>[]),total=nums.reduce((a,b)=>a+b,0);for(let mask=0;mask<1<<n;mask++){let count=0,a=0,b=0;for(let i=0;i<n;i++)if(mask&(1<<i)){count++;a+=nums[i];b+=nums[n+i];}left[count].push({sum:a,mask});right[count].push({sum:b,mask});}for(const group of right)group.sort((a,b)=>a.sum-b.sum);let best=Infinity;for(let count=0;count<=n;count++)for(const chosen of left[count]){const group=right[n-count],target=total/2-chosen.sum;let low=0,high=group.length;while(low<high){const mid=Math.floor((low+high)/2);if(group[mid].sum<target)low=mid+1;else high=mid;}for(const index of [low-1,low]){if(index<0||index>=group.length)continue;const other=group[index],sum=chosen.sum+other.sum,difference=Math.abs(total-2*sum),selected=nums.map((_,i)=>i<n?Boolean(chosen.mask&(1<<i)):Boolean(other.mask&(1<<(i-n))));best=Math.min(best,difference);emit('Complementary cardinalities keep both final groups the same size. Only the two sums around the insertion point can be closest to the desired half-total.',{marks:Object.fromEntries(selected.map((picked,i)=>[i,picked?'first group':'second group'])),table:[['First group',nums.filter((_,i)=>selected[i]).join(', '),sum],['Second group',nums.filter((_,i)=>!selected[i]).join(', '),total-sum]],tableHeaders:['Partition','Values','Sum'],codeStage:'update',metrics:{leftCount:count,rightCount:n-count,targetRightSum:target,rightSum:other.sum,difference,best}},'update');}}return best;},
2036({nums},emit){let plus=-Infinity,minus=-Infinity,best=-Infinity;for(let i=0;i<nums.length;i++){const previousPlus=plus,previousMinus=minus;plus=Math.max(nums[i],previousMinus+nums[i]);minus=previousPlus-nums[i];best=Math.max(best,plus,minus);emit('Contiguity requires extending the immediately previous state. An added state may also start a fresh subarray here; a subtracted state cannot start a new subarray by itself.',{index:i,table:[['Last term added',Number.isFinite(previousPlus)?previousPlus:'unreachable',plus],['Last term subtracted',Number.isFinite(previousMinus)?previousMinus:'unreachable',Number.isFinite(minus)?minus:'unreachable']],tableHeaders:['Ending parity','Previous','Current'],codeStage:'update',metrics:{value:nums[i],best}},'update');}return best;},
2037({seats,students},emit){const a=[...seats].sort((x,y)=>x-y),b=[...students].sort((x,y)=>x-y);let total=0;const pairs=[];for(let i=0;i<a.length;i++){const distance=Math.abs(a[i]-b[i]);total+=distance;pairs.push([a[i],b[i],distance]);emit('Match the next seat and student in sorted order. Crossing two assignment paths cannot reduce total absolute distance, so equal-rank pairing is sufficient.',{matrix:[a,b],matrixLabel:'Sorted seats (row 0) and students (row 1)',cell:[0,i],otherCell:[1,i],table:[...pairs],tableHeaders:['Seat','Student','Moves'],codeStage:'update',metrics:{pair:i,distance,total}},'update');}return total;},
2038({colors},emit){let alice=0,bob=0;for(let i=1;i<colors.length-1;i++){const removable=colors[i-1]===colors[i]&&colors[i]===colors[i+1];if(removable){if(colors[i]==='A')alice++;else bob++;}emit('Each interior position of a same-color run contributes one possible removal. The run endpoints remain, so neither player can create extra moves for the other by deleting a piece.',{index:i,codeStage:'update',metrics:{color:colors[i],removable,aliceMoves:alice,bobMoves:bob}},'update');}return alice>bob;},
2039({edges,patience},emit){const n=patience.length,graph=Array.from({length:n},()=>[]);for(const[a,b]of edges){graph[a].push(b);graph[b].push(a);}const distance=Array(n).fill(-1),queue=[0];distance[0]=0;for(let head=0;head<queue.length;head++){const node=queue[head];for(const neighbor of graph[node])if(distance[neighbor]===-1){distance[neighbor]=distance[node]+1;queue.push(neighbor);}emit('Breadth-first traversal discovers shortest one-way message distances from the master. Every reply travels the same distance back.',{sequence:Array.from({length:n},(_,i)=>i),index:node,table:distance.map((d,i)=>[i,d<0?'unvisited':d,graph[i].join(', ')]),tableHeaders:['Server','Distance','Neighbors'],codeStage:'bfs',metrics:{server:node,distance:distance[node]}});}let latest=0;const timing=[];for(let node=1;node<n;node++){const roundTrip=2*distance[node],lastSent=Math.floor((roundTrip-1)/patience[node])*patience[node],lastReply=lastSent+roundTrip;latest=Math.max(latest,lastReply);timing.push([node,patience[node],roundTrip,lastSent,lastReply]);emit('A reply arriving exactly on a resend boundary prevents that resend. Subtract one before division to count only sends strictly before the first reply.',{sequence:Array.from({length:n},(_,i)=>i),index:node,table:[...timing],tableHeaders:['Server','Patience','Round trip','Last send','Last reply'],codeStage:'update',metrics:{server:node,roundTrip,lastSent,lastReply,idleAt:latest+1}},'update');}return latest+1;},
2040({nums1,nums2,k},emit){const corners=[nums1[0]*nums2[0],nums1[0]*nums2.at(-1),nums1.at(-1)*nums2[0],nums1.at(-1)*nums2.at(-1)];let low=Math.min(...corners),high=Math.max(...corners);while(low<high){const threshold=Math.floor((low+high)/2),rows=[];let count=0;for(const value of nums1){let a=0,b=nums2.length,qualifying=0;if(value===0)qualifying=threshold>=0?nums2.length:0;else{while(a<b){const middle=Math.floor((a+b)/2),fits=value*nums2[middle]<=threshold;if(value>0){if(fits)a=middle+1;else b=middle;}else{if(fits)b=middle;else a=middle+1;}}qualifying=value>0?a:nums2.length-a;}count+=qualifying;rows.push([value,qualifying]);}emit('Positive multipliers admit a prefix of the second array; negative multipliers admit a suffix. Count zero products separately, then use the total to locate the smallest threshold whose rank reaches k.',{matrix:nums1.map(a=>nums2.map(b=>a*b)),matrixLabel:'Pair products (rows nums1, columns nums2)',table:rows,tableHeaders:['First-array value','Products at most threshold'],codeStage:'update',metrics:{low,high,threshold,count,k,enough:count>=k}},'update');if(count>=k)high=threshold;else low=threshold+1;}return low;},
};
const python={
2034:`class StockPrice:
    def __init__(self):
        self.prices = {}
        self.latest = -1

    def update(self, timestamp, price):
        self.prices[timestamp] = price
        self.latest = max(self.latest, timestamp)

    def current(self):
        return self.prices[self.latest]

    def maximum(self):
        return max(self.prices.values())

    def minimum(self):
        return min(self.prices.values())

def runOperations(operations):
    stock = StockPrice()
    result = []
    for operation in operations:
        name, *arguments = operation
        result.append(getattr(stock, name)(*arguments))  # step: update
    return result  # step: return`,
2035:`def minimumDifference(nums):
    from bisect import bisect_left
    n, total = len(nums) // 2, sum(nums)
    left = [[] for _ in range(n + 1)]
    right = [[] for _ in range(n + 1)]
    for mask in range(1 << n):
        count = mask.bit_count()
        left[count].append(sum(nums[i] for i in range(n) if mask & (1 << i)))
        right[count].append(sum(nums[n + i] for i in range(n) if mask & (1 << i)))
    for group in right:
        group.sort()
    best = float('inf')
    for count, sums in enumerate(left):
        group = right[n - count]
        for chosen in sums:
            index = bisect_left(group, total / 2 - chosen)
            for candidate in (index - 1, index):
                if 0 <= candidate < len(group):
                    best = min(best, abs(total - 2 * (chosen + group[candidate])))  # step: update
    return best  # step: return`,
2036:`def maximumAlternatingSubarraySum(nums):
    plus = minus = best = float('-inf')
    for value in nums:
        previous_plus, previous_minus = plus, minus
        plus = max(value, previous_minus + value)
        minus = previous_plus - value
        best = max(best, plus, minus)  # step: update
    return best  # step: return`,
2037:`def minMovesToSeat(seats, students):
    ordered_seats, ordered_students = sorted(seats), sorted(students)
    total = 0
    for seat, student in zip(ordered_seats, ordered_students):
        total += abs(seat - student)  # step: update
    return total  # step: return`,
2038:`def winnerOfGame(colors):
    alice = bob = 0
    for i in range(1, len(colors) - 1):
        if colors[i - 1] == colors[i] == colors[i + 1]:
            if colors[i] == 'A':
                alice += 1
            else:
                bob += 1
        # step: update
    return alice > bob  # step: return`,
2039:`def networkBecomesIdle(edges, patience):
    n = len(patience)
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    distance, queue = [-1] * n, [0]
    distance[0] = 0
    for node in queue:
        for neighbor in graph[node]:
            if distance[neighbor] == -1:
                distance[neighbor] = distance[node] + 1
                queue.append(neighbor)
        # step: bfs
    latest = 0
    for node in range(1, n):
        round_trip = 2 * distance[node]
        last_sent = (round_trip - 1) // patience[node] * patience[node]
        latest = max(latest, last_sent + round_trip)  # step: update
    return latest + 1  # step: return`,
2040:`def kthSmallestProduct(nums1, nums2, k):
    corners = [a * b for a in (nums1[0], nums1[-1]) for b in (nums2[0], nums2[-1])]
    low, high = min(corners), max(corners)
    while low < high:
        threshold = (low + high) // 2
        count = 0
        for value in nums1:
            if value == 0:
                count += len(nums2) if threshold >= 0 else 0
                continue
            left, right = 0, len(nums2)
            while left < right:
                middle = (left + right) // 2
                fits = value * nums2[middle] <= threshold
                if value > 0:
                    if fits:
                        left = middle + 1
                    else:
                        right = middle
                else:
                    if fits:
                        right = middle
                    else:
                        left = middle + 1
            count += left if value > 0 else len(nums2) - left
        # step: update
        if count >= k:
            high = threshold
        else:
            low = threshold + 1
    return low  # step: return`,
};
const cases={
2034:[['Old and current timestamps receive different corrections',{operations:[['update',8,47],['update',12,63],['update',5,29],['current'],['maximum'],['update',12,35],['current'],['maximum'],['update',5,72],['maximum'],['minimum'],['current']]}],['Replacing the only timestamp changes every query',{operations:[['update',3,18],['update',3,44],['current'],['maximum'],['minimum']]}],['The latest operation need not have the latest timestamp',{operations:[['update',20,81],['update',4,12],['current'],['minimum']]}],['Equal prices at distinct timestamps remain separate records',{operations:[['update',2,30],['update',7,30],['update',11,30],['update',7,9],['maximum'],['minimum'],['current']]}]],
2035:[['Positive and negative values need balanced group cardinality',{nums:[8,-3,14,5,-9,11,2,-6,17,-4,7,1]}],['Two values form two singleton groups',{nums:[-12,7]}],['Repeated equal values permit an exact balance',{nums:[6,6,6,6,6,6]}],['Odd total cannot be split into equal integer sums',{nums:[1,4,7,9]}]],
2036:[['Sign changes reward different ending parities',{nums:[5,-4,7,-2,-8,6,3,-9,4]}],['An even-length winner subtracts a negative value',{nums:[3,-11]}],['All negative values still require a nonempty subarray',{nums:[-8,-3,-12,-5]}],['A single negative value is the only choice',{nums:[-7]}]],
2037:[['Unordered positions lead to several paired movements',{seats:[18,3,11,25,7,16],students:[5,22,1,14,19,9]}],['Duplicate positions still represent distinct seats',{seats:[4,4,10,10],students:[3,7,7,12]}],['Students already occupy all seat coordinates',{seats:[2,6,13,20],students:[20,6,2,13]}],['One student travels to one seat',{seats:[17],students:[4]}]],
2038:[['Several runs provide independent move budgets',{colors:'AAAABBAAAAAABBBBBAAA'}],['Equal move counts make Alice run out first',{colors:'AAABBB'}],['Alternation offers no legal removal',{colors:'ABABABAB'}],['One piece has no neighbors',{colors:'A'}]],
2039:[['Branches have different distances and resend periods',{edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[5,6],[4,7],[6,7]],patience:[0,2,1,3,7,2,4,5]}],['Reply exactly at a resend boundary prevents that send',{edges:[[0,1],[1,2]],patience:[0,2,4]}],['Large patience values require no resends',{edges:[[0,1],[1,2],[2,3]],patience:[0,10,10,10]}],['One nearby impatient server',{edges:[[0,1]],patience:[0,1]}]],
2040:[['Negative, zero, and positive products share the rank order',{nums1:[-8,-3,0,2,7],nums2:[-6,-1,0,4,9],k:14}],['All products are negative with reversed per-row order',{nums1:[-7,-2],nums2:[3,5,11],k:4}],['Duplicate products occupy distinct pair ranks',{nums1:[0,0,3],nums2:[-2,0,4],k:6}],['A single product fixes the answer without a search',{nums1:[-9],nums2:[6],k:1}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2034){need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80,'Use 1-80 stock-price operations.');let initialized=false;for(const operation of input.operations){need(Array.isArray(operation)&&['update','current','maximum','minimum'].includes(operation[0]),'Use update/current/maximum/minimum operations.');if(operation[0]==='update'){need(operation.length===3&&integer(operation[1],1)&&integer(operation[2],1),'Updates need positive bounded timestamp and price.');initialized=true;}else need(operation.length===1&&initialized,'Queries need no arguments and must follow at least one update.');}}
  if(id===2035)need(vector(input.nums,-10000,16)&&input.nums.length>=2&&input.nums.length%2===0,'Use an even length from 2 to 16 with bounded signed values.');
  if(id===2036)need(vector(input.nums,-10000),'Use 1-60 signed values between -10000 and 10000.');
  if(id===2037)need(vector(input.seats)&&vector(input.students)&&input.seats.length===input.students.length,'Use equal-length positive seat and student coordinate arrays, at most 60 entries.');
  if(id===2038)need(typeof input.colors==='string'&&/^[AB]{1,120}$/.test(input.colors),'Use 1-120 A/B pieces.');
  if(id===2039){const p=input.patience;need(Array.isArray(p)&&p.length>=2&&p.length<=30&&p[0]===0&&p.slice(1).every(v=>integer(v,1)),'Use 2-30 patience values, with master zero and other values positive.');need(Array.isArray(input.edges)&&input.edges.length>=1&&input.edges.length<=100&&input.edges.every(e=>Array.isArray(e)&&e.length===2&&integer(e[0],0,p.length-1)&&integer(e[1],0,p.length-1)&&e[0]!==e[1])&&new Set(input.edges.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size===input.edges.length,'Use distinct undirected edges with valid different endpoints.');const graph=p.map(()=>[]),queue=[0],seen=new Set([0]);for(const[a,b]of input.edges){graph[a].push(b);graph[b].push(a);}for(let i=0;i<queue.length;i++)for(const node of graph[queue[i]])if(!seen.has(node)){seen.add(node);queue.push(node);}need(seen.size===p.length,'Every server must connect to the master.');}
  if(id===2040)need([input.nums1,input.nums2].every(row=>vector(row,-10000,12)&&row.every((v,i)=>!i||v>=row[i-1]))&&integer(input.k,1,input.nums1.length*input.nums2.length),'Use two sorted signed arrays of length 1-12 and a valid one-based product rank.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2039:{bfs:1}},tags:{2034:['Design'],2035:['Meet in the Middle','Binary Search'],2036:['Dynamic Programming'],2037:['Sorting','Greedy'],2038:['Game Theory'],2039:['Graph','Breadth-First Search'],2040:['Binary Search']}};
