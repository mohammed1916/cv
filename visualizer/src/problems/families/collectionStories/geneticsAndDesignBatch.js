const specs={
2003:['parents nums','Find the smallest missing positive genetic value in every subtree.','Subtrees that do not contain value one have answer one. Starting at the node carrying one, walk toward the root and add newly encountered descendants to a shared seen-value set.','initialize every answer to one|locate genetic value one and walk up its ancestors|visit only descendants not already added|advance the smallest-missing pointer and store this ancestor answer|return all subtree answers','O(n) time and tree/seen space for distinct genetic values.'],
2006:['nums k','Count index pairs whose absolute difference is k.','As each value arrives, earlier values equal to value-k or value+k form new pairs. Add their frequencies before recording the current occurrence.','start an empty prior-frequency table|read each value|look up value minus k and value plus k|add those prior counts then record this occurrence|return the pair count','O(n) expected time; O(distinct values) space.'],
2007:['changed','Recover an array whose values and doubles form the supplied multiset.','For nonnegative values, process the smallest remaining value first. It must pair with its double; decrement the original occurrence before checking the partner so zero correctly consumes two copies.','reject an odd input length and sort the multiset|take the smallest still-unused value|reserve that occurrence and find its double|consume the double or reject the entire reconstruction|return the original values or an empty array','O(n log n) time; O(n) multiset space.'],
2008:['n rides','Maximize taxi earnings from nonoverlapping rides along increasing positions.','DP at a position stores the best earnings available by that point. Either carry the previous value forward or finish a ride using the best earnings already available at its start.','group rides by their ending position|advance through road positions|compare skipping with each ride ending here|combine its fare and tip with the best start-position earnings|return the earnings at the final position','O(n+rides) time; O(n+rides) space.'],
2009:['nums','Replace the fewest entries to obtain n distinct consecutive integers.','Deduplicate and sort. Keep as many existing distinct values as possible inside any integer interval of width n-1; every other original position must be replaced.','sort the distinct values|start each candidate interval at a unique value|advance the right boundary while values fit within width n-1|maximize retained distinct values|return original length minus retained count','O(n log n) time; O(n) unique-value space.'],
2011:['operations','Compute the value after a sequence of increment and decrement operations.','The middle character identifies plus or minus regardless of whether the operator is written before or after X. Update the running integer once per operation.','start X at zero|read the next operation|inspect its middle operator character|add one for plus or subtract one for minus|return X','O(n) time; O(1) auxiliary space.'],
2012:['nums','Sum each interior element beauty based on global or local ordering.','Prefix maxima and suffix minima decide whether every left value is smaller and every right value larger. If that stronger condition fails, check only the two immediate neighbors for one point.','compute suffix minima and initialize left maximum|inspect each interior position|check global left/right ordering first|otherwise check immediate neighbors and add the appropriate beauty|return the total beauty','O(n) time; O(n) suffix space.'],
2013:['operations','Maintain points and count axis-aligned squares with a requested corner.','For each stored horizontal partner, its distance fixes both possible square heights. Multiply the occurrence counts of the three stored corners; the requested corner itself need not be stored.','start a point multiplicity table|process each add or count operation|for a count choose horizontal partners and both vertical directions|multiply the three stored-corner counts and sum contributions|return operation results with null for additions','O(operations*distinct points) direct-query time; O(distinct points) space.'],
2014:['s k','Find the longest subsequence whose k repetitions occur in s, breaking ties lexicographically.','Only letters appearing at least k times can participate. Breadth-first search extends valid repeated prefixes; a failed prefix cannot lead to a valid extension.','collect letters frequent enough for k copies|start breadth-first search from the empty candidate|append each eligible letter and scan s for k repetitions|keep valid extensions and update longest lexicographically largest answer|return the best repeated subsequence','O(valid candidates*alphabet size*string length) search time; O(valid candidates*answer length) space.'],
};
const solvers={
2003({parents,nums},emit){const children=parents.map(()=>[]),answer=parents.map(()=>1),visited=new Set(),seen=new Set();for(let i=1;i<parents.length;i++)children[parents[i]].push(i);let node=nums.indexOf(1),missing=1;if(node<0)emit('No subtree can contain genetic value one, so every smallest missing value is immediately one.',{sequence:nums,output:[...answer],codeStage:'absent',metrics:{containsOne:false}});while(node!==-1){const stack=[node],added=[];while(stack.length){const current=stack.pop();if(visited.has(current))continue;visited.add(current);seen.add(nums[current]);added.push(current);stack.push(...children[current]);}while(seen.has(missing))missing++;answer[node]=missing;emit('Moving to the parent adds only previously unseen branches. Previously collected descendant values remain valid, so each tree node is visited once and the missing-value pointer only moves forward.',{sequence:nums,index:node,output:[...answer],outputIndex:node,table:nums.map((v,i)=>[i,parents[i],v,visited.has(i)?'seen':'unvisited']),tableHeaders:['Node','Parent','Genetic value','Collected'],codeStage:'update',metrics:{ancestor:node,newNodes:added.join(', '),missing}},'update');node=parents[node];}return answer;},
2006({nums,k},emit){const counts=new Map();let pairs=0;for(let i=0;i<nums.length;i++){const value=nums[i],lower=counts.get(value-k)||0,upper=counts.get(value+k)||0;pairs+=lower+upper;counts.set(value,(counts.get(value)||0)+1);emit('Only prior occurrences contribute, so each pair is counted once at its later index. The positive difference gives two distinct lookup values.',{index:i,table:[...counts],tableHeaders:['Value','Prior/current occurrences'],codeStage:'update',metrics:{value,lowerMatches:lower,upperMatches:upper,pairs}},'update');}return pairs;},
2007({changed},emit){const ordered=[...changed].sort((a,b)=>a-b),counts=new Map(),original=[];let valid=changed.length%2===0;for(const value of ordered)counts.set(value,(counts.get(value)||0)+1);if(!valid)emit('A doubled array must contain an even number of entries, so an odd length cannot be paired.',{codeStage:'length',metrics:{length:changed.length,valid:false}});if(valid)for(const value of ordered){if(!counts.get(value))continue;counts.set(value,counts.get(value)-1);const doubled=2*value,available=(counts.get(doubled)||0)>0;if(available){counts.set(doubled,counts.get(doubled)-1);original.push(value);}else valid=false;emit('Use the smallest unpaired value as an original. Reserving it first makes zero require a second distinct zero occurrence rather than pairing an item with itself.',{sequence:ordered,output:[...original],table:[...counts],tableHeaders:['Value','Unused occurrences'],codeStage:'update',metrics:{value,doubled,available}},'update');if(!valid)break;}return valid?original:[];},
2008({n,rides},emit){const ending=Array.from({length:n+1},()=>[]),dp=Array(n+1).fill(0);for(const ride of rides)ending[ride[1]].push(ride);for(let position=1;position<=n;position++){dp[position]=dp[position-1];const choices=[];for(const[start,end,tip]of ending[position]){const fare=end-start+tip,candidate=dp[start]+fare;dp[position]=Math.max(dp[position],candidate);choices.push([start,end,tip,dp[start],candidate]);}emit('Carry previous earnings forward when no ride is useful. A ride ending here may follow any optimal schedule ending by its start, including one that ends at the same position.',{sequence:Array.from({length:n},(_,i)=>i+1),index:position-1,output:dp.slice(1).map((v,i)=>i<position?v:null),outputIndex:position-1,table:choices,tableHeaders:['Start','End','Tip','Best at start','Candidate'],codeStage:'update',metrics:{position,earnings:dp[position]}},'update');}return dp[n];},
2009({nums},emit){const unique=[...new Set(nums)].sort((a,b)=>a-b),n=nums.length;let right=0,kept=0;for(let left=0;left<unique.length;left++){while(right<unique.length&&unique[right]<unique[left]+n)right++;kept=Math.max(kept,right-left);emit('A continuous array has n distinct values spanning n-1. Repeated input values cannot occupy separate retained positions, so count only unique values within this candidate interval.',{sequence:unique,index:left,window:[left,right-1],codeStage:'update',metrics:{intervalStart:unique[left],intervalEnd:unique[left]+n-1,retained:right-left,bestRetained:kept,replacements:n-kept}},'update');}return n-kept;},
2011({operations},emit){let value=0;for(let i=0;i<operations.length;i++){const delta=operations[i][1]==='+'?1:-1;value+=delta;emit('The middle character carries the operation sign in both prefix and postfix notation. Apply exactly one update to X.',{index:i,codeStage:'update',metrics:{operation:operations[i],delta,value}},'update');}return value;},
2012({nums},emit){const suffix=Array(nums.length).fill(Infinity);suffix[nums.length-1]=nums.at(-1);for(let i=nums.length-2;i>=0;i--)suffix[i]=Math.min(nums[i],suffix[i+1]);let left=nums[0],total=0;for(let i=1;i<nums.length-1;i++){const global=left<nums[i]&&nums[i]<suffix[i+1],local=nums[i-1]<nums[i]&&nums[i]<nums[i+1],beauty=global?2:local?1:0;total+=beauty;emit('Award two points only when every value on each side is correctly ordered. Immediate-neighbor ordering earns one point only when that stronger condition failed.',{index:i,codeStage:'update',metrics:{leftMaximum:left,value:nums[i],rightMinimum:suffix[i+1],global,local,beauty,total}},'update');left=Math.max(left,nums[i]);}return total;},
2013({operations},emit){const points=new Map(),result=[],key=(x,y)=>`${x},${y}`,get=(x,y)=>points.get(key(x,y))?.count||0,snapshot=()=>[...points.values()].map(p=>({...p}));for(let i=0;i<operations.length;i++){const[operation,x,y]=operations[i];if(operation==='add'){const k=key(x,y);if(!points.has(k))points.set(k,{x,y,count:0});points.get(k).count++;result.push(null);emit('Store another occurrence at this coordinate. Duplicate points multiply later square counts rather than creating new geometric locations.',{sequence:operations.map(op=>op.join(' ')),index:i,pointState:{points:snapshot()},output:[...result],codeStage:'add',metrics:{x,y,multiplicity:get(x,y)}},'update');}else{let count=0;for(const point of points.values()){if(point.y!==y||point.x===x)continue;const side=Math.abs(point.x-x);for(const sign of [-1,1]){const otherY=y+sign*side,contribution=point.count*get(x,otherY)*get(point.x,otherY);count+=contribution;emit('A horizontal partner fixes the side length. Multiply the three stored corner multiplicities; a missing corner contributes zero and the query corner need not be stored.',{sequence:operations.map(op=>op.join(' ')),index:i,pointState:{points:snapshot(),query:{x,y},square:[{x,y},{x:point.x,y},{x:point.x,y:otherY},{x,y:otherY}]},output:[...result],codeStage:'count',metrics:{side,otherY,horizontal:point.count,vertical:get(x,otherY),diagonal:get(point.x,otherY),contribution,count}},'update');}}result.push(count);emit('Record this query total without adding the query point to the data structure.',{sequence:operations.map(op=>op.join(' ')),index:i,pointState:{points:snapshot(),query:{x,y}},output:[...result],codeStage:'record',metrics:{count}},'update');}}return result;},
2014({s,k},emit){const counts=new Map();for(const c of s)counts.set(c,(counts.get(c)||0)+1);const letters=[...counts].filter(([,count])=>count>=k).map(([c])=>c).sort(),queue=[''];let answer='';function repeated(candidate){let at=0,copies=0;for(const c of s)if(c===candidate[at]){at++;if(at===candidate.length){at=0;copies++;if(copies===k)return true;}}return false;}for(let head=0;head<queue.length;head++){const prefix=queue[head],accepted=[];if(prefix.length>=Math.floor(s.length/k))continue;for(const letter of letters){const candidate=prefix+letter;if(repeated(candidate)){queue.push(candidate);accepted.push(candidate);if(candidate.length>answer.length||candidate.length===answer.length&&candidate>answer)answer=candidate;}}emit('Every accepted extension can be repeated k times as a subsequence. A rejected prefix cannot become valid by appending more letters, so only accepted prefixes enter the next search layer.',{sequence:[...s],output:accepted,codeStage:'update',metrics:{prefix:prefix||'empty',eligibleLetters:letters.join(''),tested:letters.length,accepted:accepted.length,queued:queue.length-head-1,best:answer}},'update');}return answer;},
};
const python={
2003:`def smallestMissingValueSubtree(parents, nums):
    children = [[] for _ in parents]
    for node in range(1, len(parents)):
        children[parents[node]].append(node)
    answer = [1] * len(parents)
    if 1 not in nums:
        return answer  # step: absent
    node = nums.index(1)
    visited, seen = set(), set()
    missing = 1
    while node != -1:
        stack = [node]
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            seen.add(nums[current])
            stack.extend(children[current])
        while missing in seen:
            missing += 1
        answer[node] = missing  # step: update
        node = parents[node]
    return answer  # step: return`,
2006:`def countKDifference(nums, k):
    counts = {}
    pairs = 0
    for value in nums:
        pairs += counts.get(value - k, 0) + counts.get(value + k, 0)
        counts[value] = counts.get(value, 0) + 1  # step: update
    return pairs  # step: return`,
2007:`def findOriginalArray(changed):
    from collections import Counter
    valid = len(changed) % 2 == 0  # step: length
    counts = Counter(changed)
    original = []
    if valid:
        for value in sorted(changed):
            if not counts[value]:
                continue
            counts[value] -= 1
            if counts[2 * value]:
                counts[2 * value] -= 1
                original.append(value)
            else:
                valid = False
            # step: update
            if not valid:
                break
    return original if valid else []  # step: return`,
2008:`def maxTaxiEarnings(n, rides):
    ending = [[] for _ in range(n + 1)]
    for start, end, tip in rides:
        ending[end].append((start, end, tip))
    dp = [0] * (n + 1)
    for position in range(1, n + 1):
        dp[position] = dp[position - 1]
        for start, end, tip in ending[position]:
            dp[position] = max(dp[position], dp[start] + end - start + tip)
        # step: update
    return dp[n]  # step: return`,
2009:`def minOperations(nums):
    unique = sorted(set(nums))
    n = len(nums)
    right = kept = 0
    for left in range(len(unique)):
        while right < len(unique) and unique[right] < unique[left] + n:
            right += 1
        kept = max(kept, right - left)  # step: update
    return n - kept  # step: return`,
2011:`def finalValueAfterOperations(operations):
    value = 0
    for operation in operations:
        value += 1 if operation[1] == '+' else -1  # step: update
    return value  # step: return`,
2012:`def sumOfBeauties(nums):
    suffix = nums[:]
    for i in range(len(nums) - 2, -1, -1):
        suffix[i] = min(nums[i], suffix[i + 1])
    left, total = nums[0], 0
    for i in range(1, len(nums) - 1):
        if left < nums[i] < suffix[i + 1]:
            total += 2
        elif nums[i - 1] < nums[i] < nums[i + 1]:
            total += 1
        # step: update
        left = max(left, nums[i])
    return total  # step: return`,
2013:`class DetectSquares:
    def __init__(self):
        from collections import Counter
        self.points = Counter()

    def add(self, point):
        self.points[tuple(point)] += 1  # step: add

    def count(self, point):
        x, y = point
        total = 0
        for (other_x, other_y), multiplicity in self.points.items():
            if other_y != y or other_x == x:
                continue
            side = abs(other_x - x)
            for sign in (-1, 1):
                target_y = y + sign * side
                total += multiplicity * self.points[x, target_y] * self.points[other_x, target_y]  # step: count
        return total

def runOperations(operations):
    squares = DetectSquares()
    result = []
    for operation, x, y in operations:
        if operation == 'add':
            squares.add([x, y])
            result.append(None)
        else:
            result.append(squares.count([x, y]))  # step: record
    return result  # step: return`,
2014:`def longestSubsequenceRepeatedK(s, k):
    from collections import Counter
    frequency = Counter(s)
    letters = sorted(letter for letter, count in frequency.items() if count >= k)
    def repeated(candidate):
        at = copies = 0
        for letter in s:
            if letter == candidate[at]:
                at += 1
                if at == len(candidate):
                    at = 0
                    copies += 1
                    if copies == k:
                        return True
        return False
    queue, answer = [''], ''
    for prefix in queue:
        if len(prefix) >= len(s) // k:
            continue
        for letter in letters:
            candidate = prefix + letter
            if repeated(candidate):
                queue.append(candidate)
                if (len(candidate), candidate) > (len(answer), answer):
                    answer = candidate
        # step: update
    return answer  # step: return`,
};
const cases={
2003:[['The value-one branch expands through several ancestor subtrees',{parents:[-1,0,0,1,1,2,2,3,3,5,5],nums:[12,8,3,6,9,2,11,1,4,5,7]}],['No node carries genetic value one',{parents:[-1,0,0,1],nums:[4,7,9,13]}],['The root carries one so only the root can differ',{parents:[-1,0,0,1,1],nums:[1,2,3,4,5]}],['A single node carries one',{parents:[-1],nums:[1]}]],
2006:[['Repeated values create multiple index pairs',{nums:[3,8,5,3,10,7,5,12,8,10],k:2}],['No values differ by the requested amount',{nums:[2,6,10,14],k:3}],['Both smaller and larger prior values contribute',{nums:[4,8,6,4,8],k:2}],['One entry cannot form a pair',{nums:[9],k:4}]],
2007:[['Scrambled originals, doubles, and zeroes',{changed:[14,0,6,18,4,7,0,9,12,2,3,6]}],['Zero must consume two separate occurrences',{changed:[0,0,0,0]}],['A missing double invalidates the whole candidate',{changed:[2,4,5,11]}],['Odd length cannot be a doubled array',{changed:[3,6,9]}]],
2008:[['Competing rides and exact endpoint handoffs',{n:18,rides:[[1,5,6],[3,9,12],[5,10,8],[9,14,7],[10,18,10],[1,18,16],[14,18,9],[6,12,14]]}],['Two rides can meet at one position',{n:9,rides:[[1,5,3],[5,9,4]]}],['A profitable long ride beats short alternatives',{n:12,rides:[[1,12,40],[1,4,2],[4,8,3],[8,12,2]]}],['A ride need not start at position one',{n:10,rides:[[6,9,8]]}]],
2009:[['Duplicate values and a distant cluster reduce retained entries',{nums:[14,8,11,8,10,29,12,15,10]}],['Already continuous despite input order',{nums:[7,4,6,5]}],['All entries are equal',{nums:[13,13,13,13,13]}],['A singleton is already continuous',{nums:[42]}]],
2011:[['Mixed prefix and postfix operations cross zero repeatedly',{operations:['X++','++X','--X','X--','--X','X++','++X','X++','X--']}],['All decrements produce a negative result',{operations:['--X','X--','--X','X--']}],['Operations cancel completely',{operations:['++X','X--','X++','--X']}],['One increment',{operations:['X++']}]],
2012:[['Global ordering and local ordering award different scores',{nums:[4,2,5,7,6,9,11,8,13]}],['Every interior value earns two',{nums:[2,5,9,14,20]}],['Equal neighbors prevent strict beauty',{nums:[6,6,6,6]}],['Only one interior position exists',{nums:[8,3,12]}]],
2013:[['Several square sizes and duplicate corners coexist',{operations:[['add',2,2],['add',2,6],['add',6,2],['count',6,6],['add',2,6],['count',6,6],['add',6,10],['add',10,6],['add',10,10],['count',6,6],['add',2,10],['add',10,2],['count',2,2]]}],['A query corner need not be stored',{operations:[['add',1,3],['add',5,3],['add',1,7],['count',5,7]]}],['Three collinear points make no square',{operations:[['add',2,4],['add',5,4],['add',8,4],['count',5,7]]}],['Counting an empty structure returns zero',{operations:[['count',7,9]]}]],
2014:[['A seven-character word can repeat as a full subsequence',{s:'orchardorchard',k:2}],['No letter appears often enough',{s:'abcdef',k:2}],['Tied one-letter answers choose the largest letter',{s:'xyzzyx',k:2}],['Repeated equal characters form a longer answer',{s:'aaaaaaaaaaaa',k:3}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2003){const p=input.parents;need(Array.isArray(p)&&p.length>=1&&p.length<=40&&p[0]===-1&&p.slice(1).every((v,i)=>integer(v,0,p.length-1)&&v!==i+1)&&vector(input.nums,1,40)&&input.nums.length===p.length&&new Set(input.nums).size===p.length,'Use a rooted parent tree and equally many distinct positive genetic values, at most 40 nodes.');for(let i=1;i<p.length;i++){const seen=new Set();let node=i;while(node!==-1){need(!seen.has(node),'Parent links must be acyclic.');seen.add(node);node=p[node];}}}
  if(id===2006)need(vector(input.nums,1)&&input.nums.every(v=>v<=100)&&integer(input.k,1,99),'Use positive values up to 100 and a difference from 1 to 99.');
  if(id===2007)need(vector(input.changed),'Use 1-60 nonnegative changed-array entries.');
  if(id===2008)need(integer(input.n,2,60)&&Array.isArray(input.rides)&&input.rides.length>=1&&input.rides.length<=40&&input.rides.every(r=>Array.isArray(r)&&r.length===3&&integer(r[0],1,input.n-1)&&integer(r[1],r[0]+1,input.n)&&integer(r[2],1)),'Use road length 2-60 and 1-40 [start,end,tip] rides with increasing endpoints and positive tips.');
  if(id===2009)need(vector(input.nums,1),'Use 1-60 positive integers.');
  if(id===2011)need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80&&input.operations.every(op=>['++X','X++','--X','X--'].includes(op)),'Use 1-80 increment/decrement operations.');
  if(id===2012)need(vector(input.nums,1)&&input.nums.length>=3,'Use 3-60 positive integers.');
  if(id===2013)need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60&&input.operations.every(op=>Array.isArray(op)&&op.length===3&&['add','count'].includes(op[0])&&integer(op[1],0,1000)&&integer(op[2],0,1000)),'Use 1-60 [add/count,x,y] operations with coordinates from zero to 1000.');
  if(id===2014)need(typeof input.s==='string'&&/^[a-z]{1,30}$/.test(input.s)&&integer(input.k,2,30)&&input.s.length<input.k*8,'Use 1-30 lowercase characters, k from 2 to 30, and length strictly below 8*k.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===2003&&!input.nums.includes(1)?'absent':'return',pseudocodeStages:{2003:{absent:2},2007:{length:1},2013:{add:2,count:4,record:4}},tags:{2003:['Tree'],2006:['Hash Table'],2007:['Sorting','Greedy'],2008:['Dynamic Programming'],2009:['Sliding Window'],2011:['Simulation'],2012:['Prefix Sum'],2013:['Design','Geometry'],2014:['Breadth-First Search','String']}};
