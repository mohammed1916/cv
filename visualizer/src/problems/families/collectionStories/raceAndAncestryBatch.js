import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout.js';
const specs={
2188:['tires changeTime numLaps','Finish all race laps in minimum time while choosing when to change tires.','Precompute the cheapest uninterrupted run of each useful length. Stop extending a tire once its next lap is slower than changing to the fastest fresh tire, then partition the race with DP.','precompute costs of useful consecutive laps on each tire|retain the cheapest run for each length|build the best total time for increasing lap counts|try a final run plus one change while making the first change free|return the best time for all laps','O(tire count*L+numLaps*L) time and O(numLaps+L) space, with L bounded by useful tire growth.'],
2190:['nums key','Find the most frequent value immediately following the key.','Only adjacent successors of key occurrences contribute. Count those values and retain the largest frequency; a key at the final position has no successor.','scan all positions with a following element|when the current value equals key count its successor|update the most frequent successor|ignore non-key positions and a final key|return the most frequent following value','O(n) expected time and O(distinct successor values) space.'],
2191:['mapping nums','Sort numbers by their digit-mapped values while preserving ties in original order.','Map every decimal digit, including the single digit of zero. Leading mapped zeros do not contribute numeric weight; decorate each value with its mapped number and original index before sorting.','map each number digit by digit|interpret the mapped digits as a number|sort by mapped value then original index|read the original values in that order|return the stable jumbled-number ordering','O(total digits+n log n) time and O(n) space.'],
2192:['n edges','List every ancestor of each vertex in a directed acyclic graph.','Process vertices in topological order. Before a vertex leaves the queue, all its ancestors are complete; propagate that set plus the vertex itself along each outgoing edge.','build adjacency lists and incoming-edge counts|enqueue zero-indegree vertices|propagate each vertex and its ancestors to its children|enqueue children only after every incoming edge is processed|return sorted ancestor sets for all vertices','O(E*V+V^2 log V) worst-case time with set unions and output sorting; O(V^2+E) space.'],
2193:['s','Form a palindrome using the fewest adjacent swaps.','Pair the leftmost unsettled letter with its rightmost available match and bubble that match to the right boundary. If the letter has no partner, move it one step toward the center and retry.','hold the unsettled left and right boundaries|find the rightmost match for the left letter|bubble a found partner to the right boundary|move an unmatched center letter right by one and retry|return the adjacent swap count','O(n^2) time and O(n) mutable-character space.'],
2194:['s','Enumerate spreadsheet cells in a rectangular range by column then row.','Decode the two column letters and row digits. Nested loops over columns first and rows second produce the required order, including both endpoints.','decode the start and end coordinates|visit each column from left to right|visit each row from top to bottom in that column|append the column letter and row number|return all cell names','O(number of returned cells) time and output space.'],
2195:['nums k','Append k distinct absent positive integers with minimum total sum.','Sorted existing values reveal gaps of missing positive integers. Consume the smallest available gaps first and sum each arithmetic run without enumerating every appended value.','sort and deduplicate existing positive values|find the next missing interval before each existing value|take as many smallest missing values as still needed|sum each taken interval and finish with a final tail if necessary|return the minimum appended sum','O(n log n) time and O(n) sorting space.'],
2196:['descriptions','Construct the binary tree described by parent child and side triples.','Create one node per value and attach each edge to its specified side. The unique value that never appears as a child is the root.','create nodes for all described values|find the value never used as a child|attach each child to its parent on the specified side|retain shared node identity as subtrees connect|return the tree in compact level order','O(n) time and O(n) node space.'],
2197:['nums','Repeatedly merge adjacent non-coprime values into their least common multiple.','A stack stores a settled prefix. Each incoming value may merge with the top; the new LCM can expose another non-coprime neighbor, so keep merging backward until the boundary is coprime.','scan values into a stack|compare the current value with the stack top using gcd|merge non-coprime neighbors as value divided by gcd times top|repeat backward until the boundary is coprime|return the remaining stack','O(n log M) gcd work for bounded integer magnitudes; O(n) space.'],
2200:['nums key k','Return every index within distance k of some key occurrence.','Each key occurrence covers an index interval. Since key positions arrive in order, append only the portion of each interval beyond the last covered index to avoid duplicates.','scan key occurrences from left to right|clip each radius-k interval to the array|skip its already covered prefix|append newly covered indices in order|return the union of covered indices','O(n) time and output space.'],
};
function describedTree(descriptions){const nodes=new Map(),children=new Set();for(const[parent,child]of descriptions){if(!nodes.has(parent))nodes.set(parent,{id:parent,val:parent,left:null,right:null});if(!nodes.has(child))nodes.set(child,{id:child,val:child,left:null,right:null});children.add(child);}const root=[...nodes.keys()].find(value=>!children.has(value));return{nodes,root};}
function treeValues(root){const queue=[root],values=[];for(let i=0;i<queue.length;i++){const node=queue[i];values.push(node?.val??null);if(node)queue.push(node.left,node.right);}while(values.at(-1)===null)values.pop();return values;}
const solvers={
2188({tires,changeTime,numLaps},emit){const cheapestFresh=Math.min(...tires.map(t=>t[0])),bestRun=Array(numLaps+1).fill(Infinity);let maxRun=0;for(let tire=0;tire<tires.length;tire++){const[first,ratio]=tires[tire];let lap=first,total=0;for(let length=1;length<=numLaps&&lap<=changeTime+cheapestFresh;length++){total+=lap;bestRun[length]=Math.min(bestRun[length],total);maxRun=Math.max(maxRun,length);emit('Extend this uninterrupted tire run only while its next lap can compete with changing to the fastest fresh tire. Retain the cheapest complete run of each length across all tire types.',{table:bestRun.slice(1,maxRun+1).map((cost,i)=>[i+1,cost]),tableHeaders:['Consecutive laps','Best run time'],codeStage:'run',metrics:{tire,firstLap:first,ratio,runLength:length,currentLapTime:lap,runTime:total}},'update');lap*=ratio;}}const dp=Array(numLaps+1).fill(Infinity);dp[0]=-changeTime;for(let laps=1;laps<=numLaps;laps++){const choices=[];for(let length=1;length<=Math.min(laps,maxRun);length++){const candidate=dp[laps-length]+changeTime+bestRun[length];dp[laps]=Math.min(dp[laps],candidate);choices.push([length,dp[laps-length],bestRun[length],candidate]);}emit('Choose the final uninterrupted run length. The negative base value cancels the first change fee, while every later run pays exactly one tire change.',{output:dp.map(v=>Number.isFinite(v)?v:null),outputIndex:laps,table:choices,tableHeaders:['Final run laps','Previous best','Run cost','Candidate total'],codeStage:'laps',metrics:{completedLaps:laps,target:numLaps,best:dp[laps]}},'update');}return dp[numLaps];},
2190({nums,key},emit){const counts=new Map();let answer=null,best=0;for(let i=0;i+1<nums.length;i++){if(nums[i]!==key)continue;const next=nums[i+1],count=(counts.get(next)||0)+1;counts.set(next,count);if(count>best){best=count;answer=next;}emit('Only this immediate successor follows the key occurrence. Count it once even if the key appears again later in the array.',{index:i,window:[i,i+1],table:[...counts],tableHeaders:['Following value','Count'],codeStage:'count',metrics:{key,following:next,count,bestValue:answer,bestCount:best}},'update');}return answer;},
2191({mapping,nums},emit){const decorated=[];for(let i=0;i<nums.length;i++){const mappedDigits=[...String(nums[i])].map(c=>mapping[Number(c)]).join(''),mapped=Number(mappedDigits);decorated.push({value:nums[i],mapped,index:i});emit('Map every original digit, then interpret the result numerically. Remember the source index so equal mapped values retain their original relative order.',{sequence:nums,index:i,table:decorated.map(item=>[item.index,item.value,item.mapped]),tableHeaders:['Original index','Original value','Mapped numeric value'],codeStage:'map',metrics:{value:nums[i],mappedDigits,mapped}},'update');}decorated.sort((a,b)=>a.mapped-b.mapped||a.index-b.index);const answer=decorated.map(item=>item.value);emit('Sort by mapped numeric value, using original position to resolve ties without changing their order.',{output:answer,table:decorated.map(item=>[item.index,item.value,item.mapped]),tableHeaders:['Original index','Original value','Mapped numeric value'],codeStage:'sort'},'update');return answer;},
2192({n,edges},emit){const graph=Array.from({length:n},()=>[]),indegree=Array(n).fill(0),ancestors=Array.from({length:n},()=>new Set()),queue=[];for(const[a,b]of edges){graph[a].push(b);indegree[b]++;}indegree.forEach((d,i)=>{if(!d)queue.push(i);});for(let at=0;at<queue.length;at++){const node=queue[at];for(const child of graph[node]){ancestors[child].add(node);for(const ancestor of ancestors[node])ancestors[child].add(ancestor);if(--indegree[child]===0)queue.push(child);}emit('All incoming paths to this vertex have been processed, so its ancestor set is complete. Propagate the vertex itself and those ancestors to every child.',{sequence:queue,index:at,table:ancestors.map((set,i)=>[i,[...set].sort((a,b)=>a-b).join(', ')||'none',indegree[i]]),tableHeaders:['Vertex','Known ancestors','Unprocessed incoming edges'],codeStage:'propagate',metrics:{node,children:graph[node].join(', ')||'none',queued:queue.length-at-1}},'update');}return ancestors.map(set=>[...set].sort((a,b)=>a-b));},
2193({s},emit){const letters=[...s];let left=0,right=letters.length-1,moves=0;while(left<right){let match=right;while(match>left&&letters[match]!==letters[left])match--;if(match===left){[letters[left],letters[left+1]]=[letters[left+1],letters[left]];moves++;emit('This letter has no partner in the unsettled interval and must become the palindrome center. Move it one step inward, then retry the same boundary.',{sequence:[...letters],window:[left,right],index:left+1,codeStage:'center',metrics:{left,right,moves}},'update');}else{while(match<right){[letters[match],letters[match+1]]=[letters[match+1],letters[match]];match++;moves++;emit('Move the rightmost matching partner one adjacent step toward the right boundary. Choosing the nearest available partner minimizes the cost of fixing this outer pair.',{sequence:[...letters],window:[left,right],index:match,codeStage:'swap',metrics:{left,right,partnerPosition:match,moves}},'update');}left++;right--;}}return moves;},
2194({s},emit){const first=s.charCodeAt(0),last=s.charCodeAt(3),low=Number(s[1]),high=Number(s[4]),answer=[];for(let column=first;column<=last;column++)for(let row=low;row<=high;row++){const cell=String.fromCharCode(column)+row;answer.push(cell);emit('Finish every requested row in this column before moving to the next column, including the rectangle endpoints.',{output:[...answer],codeStage:'cell',metrics:{column:String.fromCharCode(column),row,cell,count:answer.length}},'update');}return answer;},
2195({nums,k},emit){const ordered=[...new Set(nums)].sort((a,b)=>a-b);let next=1,remaining=k,total=0;for(let i=0;i<ordered.length&&remaining;i++){const existing=ordered[i];if(existing<next)continue;const take=Math.min(remaining,existing-next);if(take){const end=next+take-1,added=(next+end)*take/2;total+=added;remaining-=take;emit('Every positive integer in this gap is absent. Take its smallest still-needed prefix and sum it as an arithmetic series.',{sequence:ordered,index:i,codeStage:'gap',metrics:{firstAdded:next,lastAdded:end,count:take,added,total,remaining}},'update');}next=existing+1;}if(remaining){const end=next+remaining-1,added=(next+end)*remaining/2;total+=added;emit('All existing values have been passed. The remaining smallest absent values form one consecutive tail.',{codeStage:'tail',metrics:{firstAdded:next,lastAdded:end,count:remaining,added,total}},'update');}return total;},
2196({descriptions},emit){const{nodes,root}=describedTree(descriptions),attached=[];for(const[parent,child,isLeft]of descriptions){nodes.get(parent)[isLeft?'left':'right']=nodes.get(child);attached.push([parent,child,isLeft?'left':'right']);emit('Attach the existing child node object to the requested parent side. A subtree may already exist before its connection to the root is described.',{treeDiagram:{...binaryTreeLayout(nodes.get(root)),activeIds:new Set([parent,child])},table:[...attached],tableHeaders:['Parent','Child','Side'],codeStage:'attach',metrics:{root,parent,child,side:isLeft?'left':'right'}},'update');}return treeValues(nodes.get(root));},
2197({nums},emit){const stack=[],gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};for(let i=0;i<nums.length;i++){let value=nums[i];while(stack.length){const previous=stack.at(-1),common=gcd(previous,value);if(common===1)break;stack.pop();const merged=previous/common*value;if(!Number.isSafeInteger(merged))throw new Error('A merged LCM exceeds exact JavaScript integer range; use smaller values for this visualization.');value=merged;emit('The adjacent pair shares a factor, so replace it with its LCM. Recheck the new value against the earlier stack boundary because merging may create another connection.',{index:i,output:[...stack,value],codeStage:'merge',metrics:{previous,gcd:common,merged:value}},'update');}stack.push(value);emit('This value now has a coprime boundary with the settled prefix, so retain it on the stack.',{index:i,output:[...stack],codeStage:'settle',metrics:{retained:value,stackSize:stack.length}},'update');}return stack;},
2200({nums,key,k},emit){const answer=[];let covered=-1;for(let i=0;i<nums.length;i++)if(nums[i]===key){const left=Math.max(0,i-k),right=Math.min(nums.length-1,i+k),start=Math.max(left,covered+1);for(let index=start;index<=right;index++)answer.push(index);covered=Math.max(covered,right);emit('This key covers a clipped radius interval. Append only indices beyond the previous coverage boundary so overlapping intervals do not create duplicates.',{index:i,window:[left,right],output:[...answer],codeStage:'interval',metrics:{keyIndex:i,left,right,newStart:start,newCount:Math.max(0,right-start+1),coveredThrough:covered}},'update');}return answer;},
};
const python={
2188:`def minimumFinishTime(tires, changeTime, numLaps):
    cheapest_fresh = min(first for first, _ in tires)
    best_run = [float('inf')] * (numLaps + 1)
    max_run = 0
    for first, ratio in tires:
        lap, total, length = first, 0, 1
        while length <= numLaps and lap <= changeTime + cheapest_fresh:
            total += lap
            best_run[length] = min(best_run[length], total)
            max_run = max(max_run, length)  # step: run
            lap *= ratio
            length += 1
    dp = [float('inf')] * (numLaps + 1)
    dp[0] = -changeTime
    for laps in range(1, numLaps + 1):
        for length in range(1, min(laps, max_run) + 1):
            dp[laps] = min(dp[laps], dp[laps - length] + changeTime + best_run[length])
        # step: laps
    return dp[numLaps]  # step: return`,
2190:`def mostFrequent(nums, key):
    counts, answer, best = {}, None, 0
    for i in range(len(nums) - 1):
        if nums[i] != key:
            continue
        following = nums[i + 1]
        counts[following] = counts.get(following, 0) + 1
        if counts[following] > best:
            best, answer = counts[following], following
        # step: count
    return answer  # step: return`,
2191:`def sortJumbled(mapping, nums):
    decorated = []
    for index, value in enumerate(nums):
        mapped = int(''.join(str(mapping[int(char)]) for char in str(value)))
        decorated.append((mapped, index, value))  # step: map
    decorated.sort()  # step: sort
    return [value for _, _, value in decorated]  # step: return`,
2192:`def getAncestors(n, edges):
    from collections import deque
    graph = [[] for _ in range(n)]
    indegree, ancestors = [0] * n, [set() for _ in range(n)]
    for parent, child in edges:
        graph[parent].append(child)
        indegree[child] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    while queue:
        node = queue.popleft()
        for child in graph[node]:
            ancestors[child].add(node)
            ancestors[child].update(ancestors[node])
            indegree[child] -= 1
            if indegree[child] == 0:
                queue.append(child)
        # step: propagate
    return [sorted(values) for values in ancestors]  # step: return`,
2193:`def minMovesToMakePalindrome(s):
    letters = list(s)
    left, right, moves = 0, len(s) - 1, 0
    while left < right:
        match = right
        while match > left and letters[match] != letters[left]:
            match -= 1
        if match == left:
            letters[left], letters[left + 1] = letters[left + 1], letters[left]
            moves += 1  # step: center
        else:
            while match < right:
                letters[match], letters[match + 1] = letters[match + 1], letters[match]
                match += 1
                moves += 1  # step: swap
            left += 1
            right -= 1
    return moves  # step: return`,
2194:`def cellsInRange(s):
    first, last = ord(s[0]), ord(s[3])
    low, high = int(s[1]), int(s[4])
    answer = []
    for column in range(first, last + 1):
        for row in range(low, high + 1):
            answer.append(chr(column) + str(row))  # step: cell
    return answer  # step: return`,
2195:`def minimalKSum(nums, k):
    ordered = sorted(set(nums))
    next_value, remaining, total = 1, k, 0
    for existing in ordered:
        if remaining == 0:
            break
        if existing < next_value:
            continue
        take = min(remaining, existing - next_value)
        if take:
            end = next_value + take - 1
            total += (next_value + end) * take // 2
            remaining -= take  # step: gap
        next_value = existing + 1
    if remaining:
        end = next_value + remaining - 1
        total += (next_value + end) * remaining // 2  # step: tail
    return total  # step: return`,
2196:`def createBinaryTree(descriptions):
    from collections import deque
    nodes, children = {}, set()
    for parent, child, _ in descriptions:
        for value in (parent, child):
            if value not in nodes:
                nodes[value] = {'val': value, 'left': None, 'right': None}
        children.add(child)
    root_value = next(value for value in nodes if value not in children)
    for parent, child, is_left in descriptions:
        nodes[parent]['left' if is_left else 'right'] = nodes[child]  # step: attach
    queue, answer = deque([nodes[root_value]]), []
    while queue:
        node = queue.popleft()
        answer.append(node['val'] if node else None)
        if node:
            queue.extend((node['left'], node['right']))
    while answer and answer[-1] is None:
        answer.pop()
    return answer  # step: return`,
2197:`def replaceNonCoprimes(nums):
    from math import gcd
    stack = []
    for value in nums:
        while stack:
            common = gcd(stack[-1], value)
            if common == 1:
                break
            previous = stack.pop()
            value = previous // common * value  # step: merge
        stack.append(value)  # step: settle
    return stack  # step: return`,
2200:`def findKDistantIndices(nums, key, k):
    answer, covered = [], -1
    for i, value in enumerate(nums):
        if value != key:
            continue
        left, right = max(0, i - k), min(len(nums) - 1, i + k)
        answer.extend(range(max(left, covered + 1), right + 1))
        covered = max(covered, right)  # step: interval
    return answer  # step: return`,
};
const cases={
2188:[['Several tire types trade cheap starts against slower degradation',{tires:[[3,2],[2,4],[5,2],[1,7]],changeTime:9,numLaps:12}],['One lap needs no tire-change fee',{tires:[[7,3],[4,5],[6,2]],changeTime:20,numLaps:1}],['Cheap changes favor frequent fresh tires',{tires:[[2,5],[4,2]],changeTime:1,numLaps:8}],['An expensive change makes longer runs worthwhile',{tires:[[1,2],[3,3]],changeTime:40,numLaps:10}]],
2190:[['Several successors compete across repeated key occurrences',{nums:[4,8,4,3,4,8,7,4,2,4,8,4,3],key:4}],['A final key has no following value',{nums:[6,9,6],key:6}],['Consecutive keys can make the key its own successor',{nums:[5,5,5,2,5,5,3],key:5}],['One qualifying adjacent pair determines the answer',{nums:[1,7,12,4],key:7}]],
2191:[['Mapped leading zeros and ties retain original positions',{mapping:[4,0,7,2,9,1,8,5,3,6],nums:[12,2,101,0,45,91,120,11,5]}],['Identity mapping is ordinary stable numeric sorting',{mapping:[0,1,2,3,4,5,6,7,8,9],nums:[31,4,18,4,0]}],['Zero is mapped as one digit rather than an empty representation',{mapping:[9,8,7,6,5,4,3,2,1,0],nums:[0,9,90,99,10]}],['Equal original values remain repeated occurrences',{mapping:[1,2,3,4,5,6,7,8,9,0],nums:[22,7,22,9,7]}]],
2192:[['Merging paths accumulate ancestors from several independent roots',{n:9,edges:[[0,3],[1,3],[1,4],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7],[7,8]]}],['An edgeless graph has no ancestors',{n:4,edges:[]}],['A chain accumulates every earlier vertex',{n:5,edges:[[0,1],[1,2],[2,3],[3,4]]}],['A diamond reaches the same ancestor along two paths only once',{n:4,edges:[[0,1],[0,2],[1,3],[2,3]]}]],
2193:[['Repeated pairs and one center letter require several local moves',{s:'aabbccddeeffg'}],['An existing palindrome needs no swaps',{s:'racecar'}],['The unique odd letter starts at an outer boundary',{s:'xaa'}],['One pair is already a palindrome',{s:'zz'}]],
2194:[['A wider rectangle enumerates each whole column before the next',{s:'C2:G6'}],['One cell is both endpoints',{s:'M5:M5'}],['One row spans several columns',{s:'R4:V4'}],['One column spans every supported row',{s:'Z1:Z9'}]],
2195:[['Several missing gaps and duplicates precede the final appended tail',{nums:[2,5,5,9,14,1,20,8],k:12}],['The first missing values lie entirely before the smallest existing value',{nums:[20,30,40],k:5}],['A consecutive existing prefix forces the tail to start later',{nums:[1,2,3,4,5,6],k:4}],['Repeated existing values block only one positive integer',{nums:[3,3,3,3],k:6}]],
2196:[['Subtrees are described before their connections to the root',{descriptions:[[18,9,1],[65,81,0],[40,18,1],[18,27,0],[65,52,1],[40,65,0],[27,23,1]]}],['One edge forms the smallest described tree',{descriptions:[[7,12,0]]}],['A right-only chain preserves null left positions',{descriptions:[[4,9,0],[9,16,0],[16,25,0]]}],['The root need not be the smallest or first parent',{descriptions:[[8,3,1],[8,11,0],[20,8,1],[20,27,0]]}]],
2197:[['A merge can trigger several earlier stack merges',{nums:[6,35,10,9,14,25,11,22,13]}],['Pairwise coprime neighbors remain unchanged',{nums:[5,7,11,13]}],['Ones never merge with any neighbor',{nums:[1,6,1,10,1]}],['Repeated values collapse to the same least common multiple',{nums:[12,12,12,12]}]],
2200:[['Overlapping key neighborhoods form one ordered union',{nums:[3,8,2,8,5,1,8,4,7,8,6,2,8],key:8,k:2}],['Radius zero returns exactly key positions',{nums:[4,2,4,7,4],key:4,k:0}],['A large radius covers the entire array',{nums:[2,5,9,3,1],key:9,k:20}],['No key occurrence covers any index',{nums:[1,3,5,7],key:2,k:3}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2188)need(Array.isArray(input.tires)&&input.tires.length>=1&&input.tires.length<=30&&input.tires.every(t=>Array.isArray(t)&&t.length===2&&integer(t[0],1,10000)&&integer(t[1],2,10))&&integer(input.changeTime,1,10000)&&integer(input.numLaps,1,60),'Use 1-30 [first-lap time, growth ratio] tires, positive times at most 10000, ratios 2-10, and 1-60 laps.');
  if(id===2190){need(vector(input.nums,1)&&integer(input.key,1),'Use 1-80 positive values and a positive key.');const counts=new Map();for(let i=0;i+1<input.nums.length;i++)if(input.nums[i]===input.key)counts.set(input.nums[i+1],(counts.get(input.nums[i+1])||0)+1);const frequencies=[...counts.values()],best=Math.max(...frequencies);need(frequencies.length>0&&frequencies.filter(v=>v===best).length===1,'The key must have a following value, with one uniquely most frequent successor.');}
  if(id===2191)need(Array.isArray(input.mapping)&&input.mapping.length===10&&input.mapping.every(v=>integer(v,0,9))&&new Set(input.mapping).size===10&&vector(input.nums),'Use a permutation of digits 0-9 as mapping and 1-80 nonnegative values at most one million.');
  if(id===2192){need(integer(input.n,1,30)&&Array.isArray(input.edges)&&input.edges.length<=80&&input.edges.every(e=>Array.isArray(e)&&e.length===2&&e.every(v=>integer(v,0,input.n-1))&&e[0]!==e[1])&&new Set(input.edges.map(e=>e.join(':'))).size===input.edges.length,'Use 1-30 vertices and at most 80 distinct directed edges.');const graph=Array.from({length:input.n},()=>[]),degree=Array(input.n).fill(0);for(const[a,b]of input.edges){graph[a].push(b);degree[b]++;}const queue=degree.flatMap((d,i)=>d===0?[i]:[]);for(const v of queue)for(const child of graph[v])if(--degree[child]===0)queue.push(child);need(queue.length===input.n,'The directed graph must be acyclic.');}
  if(id===2193){need(typeof input.s==='string'&&/^[a-z]{1,40}$/.test(input.s),'Use 1-40 lowercase letters.');const counts=new Map();for(const c of input.s)counts.set(c,(counts.get(c)||0)+1);need([...counts.values()].filter(count=>count%2).length<=1,'The character counts must permit a palindrome: at most one odd frequency.');}
  if(id===2194)need(typeof input.s==='string'&&/^[A-Z][1-9]:[A-Z][1-9]$/.test(input.s)&&input.s[0]<=input.s[3]&&input.s[1]<=input.s[4],'Use an ordered single-letter range such as C2:G6, with rows one through nine.');
  if(id===2195)need(vector(input.nums,1)&&integer(input.k,1),'Use 1-80 positive existing values and append count 1-1000000.');
  if(id===2196){need(Array.isArray(input.descriptions)&&input.descriptions.length>=1&&input.descriptions.length<=30&&input.descriptions.every(d=>Array.isArray(d)&&d.length===3&&integer(d[0],1)&&integer(d[1],1)&&d[0]!==d[1]&&(d[2]===0||d[2]===1)),'Use 1-30 [parent,child,isLeft] descriptions with positive values and binary sides.');const children=new Set(),sides=new Set(),values=new Set(),graph=new Map();for(const[parent,child,side]of input.descriptions){need(!children.has(child)&&!sides.has(`${parent}:${side}`),'Each child must have one parent, and each parent side at most one child.');children.add(child);sides.add(`${parent}:${side}`);values.add(parent);values.add(child);if(!graph.has(parent))graph.set(parent,[]);graph.get(parent).push(child);}const roots=[...values].filter(v=>!children.has(v));need(roots.length===1,'Descriptions must have exactly one root.');const seen=new Set(),queue=[roots[0]];for(const v of queue){need(!seen.has(v),'Descriptions must be acyclic.');seen.add(v);queue.push(...(graph.get(v)||[]));}need(seen.size===values.size,'All described nodes must belong to one connected tree.');}
  if(id===2197)need(vector(input.nums,1),'Use 1-80 positive values; merged LCMs must remain exact safe integers for playback.');
  if(id===2200)need(vector(input.nums,1)&&integer(input.key,1)&&integer(input.k,0,1000),'Use 1-80 positive values, a positive key, and radius 0-1000.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2188:{run:2,laps:4},2190:{count:3},2191:{map:2,sort:3},2192:{propagate:3},2193:{center:4,swap:3},2194:{cell:4},2195:{gap:3,tail:4},2196:{attach:3},2197:{merge:3,settle:4},2200:{interval:4}},tags:{2188:['Dynamic Programming'],2190:['Counting'],2191:['Sorting'],2192:['Graph','Topological Sort'],2193:['Greedy','Two Pointers'],2194:['String'],2195:['Greedy'],2196:['Tree'],2197:['Stack','Math'],2200:['Intervals']}};
