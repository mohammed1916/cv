import {AuthoredMinHeap} from './authoredMinHeap.js';
import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
import {parseLevelOrderTree} from '../../../components/shared/levelOrderTree.js';
import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout.js';

const specs={
2093:['n highways discounts','Reach the last city at minimum toll while spending at most the available discounts.','A city alone is not a complete state: arriving with discounts left can be more useful than arriving slightly cheaper without them. Run Dijkstra on city and discounts-used pairs.','initialize distance for city zero with no discounts used|settle the cheapest city and discount-count state|relax each highway at full cost and optionally half cost rounded down|keep separate best costs for every discount count|return the first settled destination cost or -1','O((V+E)*(D+1)*log(V*(D+1))) time; O(V*(D+1)+E) space.'],
2094:['digits','List every distinct three-digit even number constructible from the digit occurrences.','Enumerate numeric positions in ascending order. The hundreds digit cannot be zero, the units digit must be even, and repeated digits consume separate occurrences.','count available digit occurrences|choose a nonzero hundreds digit and any tens digit|choose an even units digit|accept when all required multiplicities are available|return the ascending distinct numbers','O(n+900) time; O(1) auxiliary space excluding output.'],
2095:['head','Remove the middle node, choosing index floor(length/2).','A fast pointer travels twice as quickly as a slow pointer. When fast reaches the end, slow identifies the middle; its predecessor reconnects around that node.','build the list and initialize slow fast and predecessor|advance fast twice and slow once|stop when fast cannot advance a pair|bypass the slow node or clear a singleton head|return the remaining list','O(n) time; O(1) pointer space excluding input decoding and output.'],
2096:['root startValue destValue','Describe the shortest route between two tree nodes using U L and R.','Root-to-node paths share their route through the lowest common ancestor. Remove that common prefix, go up for the remaining start path, then follow the remaining destination path.','find root-to-start and root-to-destination paths|compare their common prefix|replace the remaining start path with upward moves|append the remaining destination directions|return the shortest direction string','O(n) time and path space.'],
2097:['pairs','Arrange all directed pairs into one continuous edge trail.','Hierholzer follows unused outgoing edges until stuck, then writes vertices during backtracking. Reversing that postorder splices every excursion into a trail using each pair once.','build outgoing-edge lists and degree balances|start at the extra-outgoing vertex or any edge origin|follow and remove unused outgoing edges|backtrack stuck vertices into a reverse trail|reverse the trail and return adjacent vertex pairs','O(E) time and space.'],
2098:['nums k','Choose exactly k values with the largest possible even sum.','Start with the largest k values. If their sum is odd, any repair needs a parity-changing exchange; compare the cheapest odd-to-even and even-to-odd replacements.','sort values descending and choose the first k|keep the selection if its sum is even|find the smallest selected value and largest unselected value of each parity|compare both possible parity-changing exchanges|return the best even sum or -1','O(n log n) time; O(n) sorting space.'],
2099:['nums k','Keep a length-k subsequence with maximum sum while preserving original order.','Choose the indices of the k largest values, breaking ties consistently by earlier index. Sorting those chosen indices restores the required subsequence order without changing the sum.','rank indices by descending value then ascending position|take the first k indices|sort the chosen indices into original order|append their values in that order|return the maximum-sum subsequence','O(n log n) time and O(n) space.'],
2100:['security time','Find days surrounded by enough nonincreasing and nondecreasing security counts.','Count consecutive nonincreasing steps ending at each day and consecutive nondecreasing steps starting there. A day qualifies only if both run lengths meet time.','compute nonincreasing run lengths from the left|compute nondecreasing run lengths from the right|compare both lengths with the required time|collect days satisfying both sides|return all qualifying day indices','O(n) time and space.'],
2101:['bombs','Find the largest chain reaction triggered by a single bomb.','Reach is directed: one bomb may cover another without being covered in return. Build edges with squared-distance comparisons, then explore the reachable set from each possible starting bomb.','connect each bomb to centers within its own radius|choose each bomb as the initial detonation|expand a queue of newly reached bombs|track the size of each complete chain reaction|return the largest reachable count','O(n^3) time and O(n^2) graph space.'],
2102:['operations','Answer successive rank queries while new locations join the ranking.','Maintain locations ordered by descending score and ascending name. The first get asks for rank one, the second for rank two, and later additions may shift previously returned locations.','maintain a sorted list and a get counter|insert each added location by score and name|increment the counter for each get|read the current location at that ordinal rank|return null for additions and the names returned by queries','O(n) per insertion and O(1) per query with this sorted-array implementation; O(n) space.'],
};
const treeState=root=>binaryTreeLayout(parseLevelOrderTree(JSON.stringify(root)));
const solvers={
2093({n,highways,discounts},emit){const graph=Array.from({length:n},()=>[]),dist=Array.from({length:n},()=>Array(discounts+1).fill(Infinity)),heap=new AuthoredMinHeap((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);for(const[a,b,c]of highways){graph[a].push([b,c]);graph[b].push([a,c]);}dist[0][0]=0;heap.push([0,0,0]);while(heap.size){const[cost,city,used]=heap.pop();if(cost!==dist[city][used])continue;const state={outputMatrix:dist.map(row=>row.map(x=>Number.isFinite(x)?x:'unreached')),outputMatrixLabel:'Best cost by city (row) and discounts used (column)',outputCell:[city,used],codeStage:'settle',metrics:{city,used,cost,queued:heap.size}};if(city===n-1){emit('This destination state is the cheapest remaining state across every discount count, so its toll is globally optimal.',{...state,codeStage:'found'},'update');return cost;}for(const[next,toll]of graph[city])for(const spend of [0,1]){if(used+spend>discounts)continue;const candidate=cost+(spend?Math.floor(toll/2):toll);if(candidate<dist[next][used+spend]){dist[next][used+spend]=candidate;heap.push([candidate,next,used+spend]);}}emit('Expand this cheapest unsettled state. Keeping discount counts separate preserves routes that save a coupon for a later expensive highway.',{...state,outputMatrix:dist.map(row=>row.map(x=>Number.isFinite(x)?x:'unreached'))},'update');}emit('No unsettled reachable state remains, and none reached the destination.',{codeStage:'failed'});return-1;},
2094({digits},emit){const available=Array(10).fill(0),answer=[];digits.forEach(d=>available[d]++);for(let a=1;a<=9;a++)for(let b=0;b<=9;b++)for(let c=0;c<=8;c+=2){const needed=Array(10).fill(0);for(const d of [a,b,c])needed[d]++;if(needed.every((count,d)=>count<=available[d])){const value=100*a+10*b+c;answer.push(value);emit('This arrangement has a nonzero leading digit, an even final digit, and enough separate occurrences for every repeated digit.',{sequence:digits,output:[...answer],table:available.map((count,d)=>[d,count,needed[d]]),tableHeaders:['Digit','Available','Required'],codeStage:'accept',metrics:{value,accepted:answer.length}},'update');}}return answer;},
2095({head},emit){const nodes=makeListNodes(head);let slow=0,fast=0,previous=null,root=0;while(fast!==null&&nodes[fast].next!==null){previous=slow;slow=nodes[slow].next;fast=nodes[nodes[fast].next].next;emit('Fast has advanced two links while slow advances one. The predecessor is retained so the middle can be bypassed without searching again.',{linkedList:snapshotLinkedList(nodes,root,[{label:'slow',nodeId:slow},{label:'fast',nodeId:fast},{label:'previous',nodeId:previous}],[slow]),codeStage:'advance',metrics:{slow,fast:fast??'null',previous}},'update');}if(previous===null)root=null;else nodes[previous].next=nodes[slow].next;emit('Bypass the identified middle node. Stable node IDs show that the remaining nodes are reconnected rather than their values shifted.',{linkedList:snapshotLinkedList(nodes,root,[],previous===null?[]:[previous]),codeStage:'remove',metrics:{removedIndex:slow,removedValue:nodes[slow].val}},'update');return head.filter((_,i)=>i!==slow);},
2096({root,startValue,destValue},emit){const tree=parseLevelOrderTree(JSON.stringify(root)),layout=binaryTreeLayout(tree),visited=new Set(),paths=new Map();function visit(node,path){if(!node)return;visited.add(node.id);if(node.val===startValue||node.val===destValue)paths.set(node.val,path);emit('Record directions from the root. The shared prefix of the two target paths will locate their lowest common ancestor.',{treeDiagram:{...layout,activeIds:new Set([node.id]),visitedIds:new Set(visited)},table:[...paths].map(([v,p])=>[v,p||'(root)']),tableHeaders:['Target','Root path'],codeStage:'visit',metrics:{node:node.val,path:path||'(root)'}});visit(node.left,path+'L');visit(node.right,path+'R');}visit(tree,'');const a=paths.get(startValue),b=paths.get(destValue);let common=0;while(common<Math.min(a.length,b.length)&&a[common]===b[common])common++;const answer='U'.repeat(a.length-common)+b.slice(common);emit('Discard the shared root prefix. Climb from start to the common ancestor, then follow the destination suffix downward.',{treeDiagram:{...layout,activeIds:new Set(layout.nodes.filter(node=>node.val===startValue||node.val===destValue).map(node=>node.id)),visitedIds:visited},output:[...answer],codeStage:'combine',metrics:{startPath:a||'(root)',destinationPath:b||'(root)',commonPrefix:a.slice(0,common)||'(root)',upMoves:a.length-common,answer}},'update');return answer;},
2097({pairs},emit){const graph=new Map(),balance=new Map();for(const[a,b]of pairs){if(!graph.has(a))graph.set(a,[]);graph.get(a).push(b);balance.set(a,(balance.get(a)||0)+1);balance.set(b,(balance.get(b)||0)-1);}const start=[...balance].find(([,d])=>d===1)?.[0]??pairs[0][0],stack=[start],reverse=[];while(stack.length){const vertex=stack.at(-1),edges=graph.get(vertex);let codeStage;if(edges?.length){stack.push(edges.pop());codeStage='follow';}else{reverse.push(stack.pop());codeStage='backtrack';}emit(codeStage==='follow'?'Consume one unused edge and continue this excursion. Every original pair is removed exactly once.':'This vertex has no unused outgoing edge. Write it to the reverse trail so completed excursions splice together when reversed.',{sequence:[...stack],output:[...reverse],table:[...graph].map(([v,e])=>[v,e.join(', ')||'none']),tableHeaders:['Vertex','Unused destinations'],codeStage,metrics:{start,stackLength:stack.length,finishedVertices:reverse.length}},'update');}reverse.reverse();return reverse.slice(1).map((v,i)=>[reverse[i],v]);},
2098({nums,k},emit){const sorted=[...nums].sort((a,b)=>b-a),chosen=sorted.slice(0,k),rest=sorted.slice(k),sum=chosen.reduce((a,b)=>a+b,0);emit('The largest k values maximize the unrestricted sum. An even sum is already optimal; an odd sum needs a parity-changing replacement.',{sequence:sorted,window:[0,k-1],codeStage:'choose',metrics:{k,sum,even:sum%2===0}});if(sum%2===0)return sum;let best=-1;for(const parity of [0,1]){const removed=[...chosen].reverse().find(x=>x%2===parity),added=rest.find(x=>x%2!==parity),possible=removed!==undefined&&added!==undefined,candidate=possible?sum-removed+added:-1;best=Math.max(best,candidate);emit('For this parity direction, remove the cheapest selected value and add the largest available opposite-parity value. Any other exchange of this type loses at least as much.',{sequence:sorted,window:[0,k-1],codeStage:'exchange',metrics:{removedParity:parity,removed:removed??'none',added:added??'none',possible,candidate,best}},'update');}return best;},
2099({nums,k},emit){const indices=nums.map((_,i)=>i).sort((a,b)=>nums[b]-nums[a]||a-b).slice(0,k).sort((a,b)=>a-b),answer=[];for(const index of indices){answer.push(nums[index]);emit('This index belongs to the maximum-sum selection. Reading selected indices in ascending order preserves the subsequence requirement.',{index,marks:Object.fromEntries(indices.map(i=>[i,'selected'])),output:[...answer],codeStage:'append',metrics:{index,value:nums[index],selected:answer.length,required:k}},'update');}return answer;},
2100({security,time},emit){const n=security.length,left=Array(n).fill(0),right=Array(n).fill(0),answer=[];for(let i=1;i<n;i++){if(security[i]<=security[i-1])left[i]=left[i-1]+1;emit('Count adjacent nonincreasing steps ending at this day. A rise resets the usable left run.',{index:i,output:[...left],codeStage:'left',metrics:{day:i,leftRun:left[i],time}},'update');}for(let i=n-2;i>=0;i--){if(security[i]<=security[i+1])right[i]=right[i+1]+1;emit('Looking from right to left measures nondecreasing steps that will follow this day.',{index:i,output:[...right],codeStage:'right',metrics:{day:i,rightRun:right[i],time}},'update');}for(let i=0;i<n;i++){const good=left[i]>=time&&right[i]>=time;if(good)answer.push(i);emit('Both run lengths must cover the requested number of days. A zero-day requirement accepts every position.',{index:i,table:security.map((v,j)=>[j,v,left[j],right[j]]),tableHeaders:['Day','Security','Left steps','Right steps'],output:[...answer],codeStage:'collect',metrics:{day:i,good,time}},'update');}return answer;},
2101({bombs},emit){const graph=bombs.map(([x,y,r],i)=>bombs.flatMap(([a,b],j)=>i!==j&&(a-x)**2+(b-y)**2<=r*r?[j]:[])),points=bombs.map(([x,y,r],id)=>({id,x,y,label:String(id),description:`Bomb ${id}: radius ${r}`}));let best=0;for(let start=0;start<bombs.length;start++){const queue=[start],seen=new Set(queue);for(let at=0;at<queue.length;at++){const active=queue[at],[x,y,radius]=bombs[active];for(const next of graph[active])if(!seen.has(next)){seen.add(next);queue.push(next);}emit('Only this active bomb radius determines its outgoing reach. Newly triggered bombs enter the queue and later apply their own radii.',{pointState:{points,query:{x,y},queryLabel:'active bomb',reach:{x,y,radius},pointCaption:'Point labels are bomb IDs.'},sequence:queue,index:at,table:graph.map((neighbors,i)=>[i,neighbors.join(', ')||'none',seen.has(i)]),tableHeaders:['Bomb','Directly reaches','Triggered'],codeStage:'expand',metrics:{start,active,triggered:seen.size,bestCompleted:best}},'update');}best=Math.max(best,seen.size);}return best;},
2102({operations},emit){const ranking=[],answer=[];let gets=0;const compare=(a,b)=>b.score-a.score||(a.name<b.name?-1:a.name>b.name?1:0);for(let i=0;i<operations.length;i++){const[type,name,score]=operations[i];let result=null,codeStage;if(type==='add'){const item={name,score};let lo=0,hi=ranking.length;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(compare(ranking[mid],item)<0)lo=mid+1;else hi=mid;}ranking.splice(lo,0,item);codeStage='add';}else{result=ranking[gets++].name;codeStage='get';}answer.push(result);emit(type==='add'?'Insert by descending score, breaking equal scores alphabetically. This can change the location occupying any future query rank.':'Advance the ordinal query count, then read that rank from the current ordering. A previously returned location may appear again after insertions.',{index:i,table:ranking.map((item,j)=>[j+1,item.name,item.score]),tableHeaders:['Current rank','Location','Score'],output:[...answer],codeStage,metrics:{operation:i+1,type,queriesSoFar:gets,nextQueryRank:gets+1,result:result??'added'}},'update');}return answer;},
};
const python={
2093:`def minimumCost(n, highways, discounts):
    from heapq import heappush, heappop
    graph = [[] for _ in range(n)]
    for a, b, toll in highways:
        graph[a].append((b, toll))
        graph[b].append((a, toll))
    dist = [[float('inf')] * (discounts + 1) for _ in range(n)]
    dist[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        cost, city, used = heappop(heap)
        if cost != dist[city][used]:
            continue
        if city == n - 1:
            return cost  # step: found
        for neighbor, toll in graph[city]:
            for spend in (0, 1):
                if used + spend > discounts:
                    continue
                candidate = cost + (toll // 2 if spend else toll)
                if candidate < dist[neighbor][used + spend]:
                    dist[neighbor][used + spend] = candidate
                    heappush(heap, (candidate, neighbor, used + spend))
        # step: settle
    return -1  # step: failed`,
2094:`def findEvenNumbers(digits):
    from collections import Counter
    available = Counter(digits)
    answer = []
    for hundreds in range(1, 10):
        for tens in range(10):
            for units in range(0, 10, 2):
                needed = Counter((hundreds, tens, units))
                if all(count <= available[digit] for digit, count in needed.items()):
                    answer.append(100 * hundreds + 10 * tens + units)  # step: accept
    return answer  # step: return`,
2095:`class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def deleteMiddle(head):
    # Decode the visualizer's JSON list into actual linked nodes.
    dummy = ListNode(0)
    tail = dummy
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    root = slow = fast = dummy.next
    previous = None
    while fast is not None and fast.next is not None:
        previous = slow
        slow = slow.next
        fast = fast.next.next  # step: advance
    if previous is None:
        root = None
    else:
        previous.next = slow.next
    # step: remove
    answer = []
    while root is not None:
        answer.append(root.val)
        root = root.next
    return answer  # step: return`,
2096:`def getDirections(root, startValue, destValue):
    from collections import deque
    # Decode compact level order; null entries consume child slots.
    tree = {'val': root[0], 'left': None, 'right': None}
    queue = deque([tree])
    cursor = 1
    while queue and cursor < len(root):
        node = queue.popleft()
        for side in ('left', 'right'):
            if cursor == len(root):
                break
            value = root[cursor]
            cursor += 1
            if value is not None:
                child = {'val': value, 'left': None, 'right': None}
                node[side] = child
                queue.append(child)
    paths = {}
    def visit(node, path):
        if node is None:
            return
        if node['val'] in (startValue, destValue):
            paths[node['val']] = path
        # step: visit
        visit(node['left'], path + 'L')
        visit(node['right'], path + 'R')
    visit(tree, '')
    start, destination = paths[startValue], paths[destValue]
    common = 0
    while common < min(len(start), len(destination)) and start[common] == destination[common]:
        common += 1
    answer = 'U' * (len(start) - common) + destination[common:]  # step: combine
    return answer  # step: return`,
2097:`def validArrangement(pairs):
    from collections import defaultdict
    graph, balance = defaultdict(list), defaultdict(int)
    for a, b in pairs:
        graph[a].append(b)
        balance[a] += 1
        balance[b] -= 1
    start = next((v for v, difference in balance.items() if difference == 1), pairs[0][0])
    stack, reverse = [start], []
    while stack:
        vertex = stack[-1]
        if graph[vertex]:
            stack.append(graph[vertex].pop())  # step: follow
        else:
            reverse.append(stack.pop())  # step: backtrack
    trail = reverse[::-1]
    return [[trail[i], trail[i + 1]] for i in range(len(trail) - 1)]  # step: return`,
2098:`def largestEvenSum(nums, k):
    ordered = sorted(nums, reverse=True)
    chosen, rest = ordered[:k], ordered[k:]
    total = sum(chosen)  # step: choose
    if total % 2 == 0:
        return total  # step: even
    best = -1
    for parity in (0, 1):
        removed = next((x for x in reversed(chosen) if x % 2 == parity), None)
        added = next((x for x in rest if x % 2 != parity), None)
        if removed is not None and added is not None:
            best = max(best, total - removed + added)
        # step: exchange
    return best  # step: return`,
2099:`def maxSubsequence(nums, k):
    indices = sorted(range(len(nums)), key=lambda i: (-nums[i], i))[:k]
    indices.sort()
    answer = []
    for index in indices:
        answer.append(nums[index])  # step: append
    return answer  # step: return`,
2100:`def goodDaysToRobBank(security, time):
    n = len(security)
    left, right = [0] * n, [0] * n
    for i in range(1, n):
        if security[i] <= security[i - 1]:
            left[i] = left[i - 1] + 1
        # step: left
    for i in range(n - 2, -1, -1):
        if security[i] <= security[i + 1]:
            right[i] = right[i + 1] + 1
        # step: right
    answer = []
    for i in range(n):
        if left[i] >= time and right[i] >= time:
            answer.append(i)
        # step: collect
    return answer  # step: return`,
2101:`def maximumDetonation(bombs):
    graph = [[] for _ in bombs]
    for i, (x, y, radius) in enumerate(bombs):
        for j, (a, b, _) in enumerate(bombs):
            if i != j and (a - x) ** 2 + (b - y) ** 2 <= radius ** 2:
                graph[i].append(j)
    best = 0
    for start in range(len(bombs)):
        queue, seen = [start], {start}
        for active in queue:
            for neighbor in graph[active]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    queue.append(neighbor)
            # step: expand
        best = max(best, len(seen))
    return best  # step: return`,
2102:`class SORTracker:
    def __init__(self):
        self.ranking = []
        self.gets = 0

    def add(self, name, score):
        from bisect import insort
        insort(self.ranking, (-score, name))  # step: add

    def get(self):
        self.gets += 1
        return self.ranking[self.gets - 1][1]  # step: get

def runTracker(operations):
    tracker = SORTracker()
    answer = []
    for operation in operations:
        if operation[0] == 'add':
            tracker.add(operation[1], operation[2])
            answer.append(None)
        else:
            answer.append(tracker.get())
    return answer  # step: return`,
};
const cases={
2093:[['Competing routes reward saving a discount for an expensive edge',{n:7,highways:[[0,1,3],[1,2,17],[2,6,8],[0,3,9],[3,4,4],[4,6,19],[1,4,6],[3,5,12],[5,6,2]],discounts:2}],['No discount reduces to ordinary shortest paths',{n:4,highways:[[0,1,7],[1,3,4],[0,2,3],[2,3,12]],discounts:0}],['An odd toll is halved with integer rounding',{n:2,highways:[[0,1,15]],discounts:3}],['Disconnected destination cannot be reached',{n:5,highways:[[0,1,4],[1,2,6],[3,4,2]],discounts:1}]],
2094:[['Repeated digits and zeros offer many valid arrangements',{digits:[7,0,4,4,2,9,0,6]}],['Zero cannot lead but may occupy both other slots',{digits:[0,0,8]}],['Repeated positions require separate digit occurrences',{digits:[6,6,6,6]}],['All odd digits leave no even ending',{digits:[1,3,5,7,9]}]],
2095:[['Fast and slow pointers cross a longer odd list',{head:[14,7,22,5,19,31,8,26,11]}],['An even list removes the later middle',{head:[9,4,17,2,13,6]}],['A singleton becomes empty',{head:[42]}],['Repeated values still have distinct node identities',{head:[5,5,5,5]}]],
2096:[['Targets lie beneath different branches of a deeper tree',{root:[40,18,65,9,27,52,81,null,12,23,31,47,59,74,90],startValue:12,destValue:59}],['Start is the root so no upward step is needed',{root:[8,3,14,null,6,11,19],startValue:8,destValue:11}],['Destination is an ancestor of the start',{root:[20,10,30,5,15,null,35],startValue:15,destValue:10}],['A skewed tree preserves missing child positions',{root:[4,null,9,null,16,null,25],startValue:9,destValue:25}]],
2097:[['Several excursions must be spliced into one trail',{pairs:[[10,20],[20,30],[30,10],[10,40],[40,50],[50,10],[10,60],[60,70]]}],['A balanced directed cycle can start at any origin',{pairs:[[4,9],[9,13],[13,4]]}],['One pair is already a complete arrangement',{pairs:[[21,34]]}],['Input order does not identify the required first edge',{pairs:[[8,12],[3,8],[12,19],[1,3]]}]],
2098:[['An odd unrestricted sum requires comparing two parity exchanges',{nums:[24,20,17,14,11,8,5,2],k:4}],['The unrestricted selection already has an even sum',{nums:[16,12,9,7,4],k:2}],['Selecting every value leaves no exchange available',{nums:[2,4,7],k:3}],['Zero is a valid even replacement',{nums:[9,0,0],k:1}]],
2099:[['Large values separated in the source must retain their order',{nums:[4,-8,17,3,12,-5,19,6,14,-2,11],k:5}],['Equal values break ties by earlier source position',{nums:[7,2,7,7,1],k:2}],['Negative values still require exactly k selections',{nums:[-9,-2,-7,-4,-12],k:3}],['Choosing the full length preserves every element',{nums:[6,-3,8,1],k:4}]],
2100:[['Long declines plateaus and later rises create several candidates',{security:[12,10,8,8,6,6,6,9,11,13,7,7,10],time:2}],['Zero neighboring days accepts every position',{security:[9,2,8,1],time:0}],['A requirement wider than the array accepts nothing',{security:[4,4,4],time:5}],['Equal counts extend both monotone runs',{security:[7,7,7,7,7,7,7],time:2}]],
2101:[['A directed chain connects clusters through different radii',{bombs:[[0,0,5],[4,0,3],[7,0,5],[11,2,4],[14,2,2],[30,8,1]]}],['Reach in one direction need not work in reverse',{bombs:[[0,0,9],[8,0,1]]}],['Isolated bombs only detonate themselves',{bombs:[[0,0,1],[10,0,2],[0,12,3]]}],['Coincident centers remain separate bombs',{bombs:[[6,6,1],[6,6,3],[8,6,1],[11,6,2]]}]],
2102:[['Better insertions change the location at future ordinal ranks',{operations:[['add','harbor',70],['add','cedar',85],['get'],['add','alpine',92],['get'],['add','brook',85],['add','dune',60],['get'],['get']]}],['Equal scores are ordered alphabetically',{operations:[['add','willow',40],['add','birch',40],['add','maple',40],['get'],['get'],['get']]}],['A previously returned name can appear at a later rank',{operations:[['add','delta',30],['get'],['add','alpha',50],['get']]}],['One added location supports one query',{operations:[['add','orchard',11],['get']]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2093){need(integer(input.n,2,20)&&integer(input.discounts,0,5)&&Array.isArray(input.highways)&&input.highways.length<=50&&input.highways.every(e=>Array.isArray(e)&&e.length===3&&integer(e[0],0,input.n-1)&&integer(e[1],0,input.n-1)&&e[0]!==e[1]&&integer(e[2])),'Use 2-20 cities, at most 50 [city,city,toll] edges, and 0-5 discounts.');need(new Set(input.highways.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(':'))).size===input.highways.length,'Use distinct undirected highways.');}
  if(id===2094)need(Array.isArray(input.digits)&&input.digits.length>=3&&input.digits.length<=12&&input.digits.every(v=>integer(v,0,9)),'Use 3-12 digits from zero through nine.');
  if(id===2095)need(vector(input.head,0,40),'Use 1-40 nonnegative linked-list values.');
  if(id===2096){need(Array.isArray(input.root)&&input.root.length>=2&&input.root.length<=63&&integer(input.root[0],1)&&input.root.every(v=>v===null||integer(v,1)),'Use a nonempty level-order tree of at most 63 entries with positive values and null gaps.');parseLevelOrderTree(JSON.stringify(input.root));const values=input.root.filter(v=>v!==null);need(new Set(values).size===values.length&&values.includes(input.startValue)&&values.includes(input.destValue)&&input.startValue!==input.destValue,'Use unique tree values and two different target values present in the tree.');}
  if(id===2097){need(Array.isArray(input.pairs)&&input.pairs.length>=1&&input.pairs.length<=60&&input.pairs.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>integer(v))&&p[0]!==p[1]),'Use 1-60 directed pairs of distinct endpoints.');need(new Set(input.pairs.map(p=>p.join(':'))).size===input.pairs.length,'Each directed pair must be unique.');const balance=new Map(),graph=new Map();for(const[a,b]of input.pairs){balance.set(a,(balance.get(a)||0)+1);balance.set(b,(balance.get(b)||0)-1);if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a);}const differences=[...balance.values()],queue=[input.pairs[0][0]],seen=new Set(queue);for(const v of queue)for(const next of graph.get(v))if(!seen.has(next)){seen.add(next);queue.push(next);}need(seen.size===graph.size&&differences.every(d=>Math.abs(d)<=1)&&differences.filter(d=>d===1).length<=1&&differences.filter(d=>d===-1).length<=1,'Pairs must form a connected directed Euler trail with balanced degrees except at most one start and end.');}
  if(id===2098||id===2099)need(vector(input.nums,id===2098?0:-10000)&&integer(input.k,1,input.nums?.length),'Use 1-60 values and k from one through the array length; even-sum values must be nonnegative.');
  if(id===2100)need(vector(input.security)&&integer(input.time,0,1000),'Use 1-60 nonnegative security counts and a time from zero through 1000.');
  if(id===2101)need(Array.isArray(input.bombs)&&input.bombs.length>=1&&input.bombs.length<=20&&input.bombs.every(b=>Array.isArray(b)&&b.length===3&&integer(b[0],-1000,1000)&&integer(b[1],-1000,1000)&&integer(b[2],1,1000)),'Use 1-20 [x,y,radius] bombs with coordinates within -1000..1000 and positive radius at most 1000.');
  if(id===2102){need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60,'Use 1-60 add/get operations.');const names=new Set();let gets=0;for(const op of input.operations){need(Array.isArray(op),'Each operation must be an array.');if(op[0]==='add'){need(op.length===3&&typeof op[1]==='string'&&/^[a-z]{1,20}$/.test(op[1])&&!names.has(op[1])&&integer(op[2],1),'Add a unique lowercase name and a positive score at most 10000.');names.add(op[1]);}else{need(op[0]==='get'&&op.length===1&&++gets<=names.size,'A get query must have no arguments and its ordinal rank must already exist.');}}}
  return input;
}
export default {specs,solvers,python,cases,validate,
  inputState:(id,input)=>id===2095?{linkedList:snapshotLinkedList(makeListNodes(input.head),0)}:id===2096?{treeDiagram:treeState(input.root)}:{},
  resultStage:(id,result,input)=>id===2093?(result===-1?'failed':'found'):id===2098&&[...input.nums].sort((a,b)=>b-a).slice(0,input.k).reduce((a,b)=>a+b,0)%2===0?'even':'return',
  pseudocodeStages:{2093:{settle:4,found:5,failed:5},2094:{accept:4},2095:{advance:2,remove:4},2096:{visit:1,combine:4},2097:{follow:3,backtrack:4},2098:{choose:1,exchange:4},2099:{append:4},2100:{left:1,right:2,collect:4},2101:{expand:3},2102:{add:2,get:4}},
  tags:{2093:['Graph','Dijkstra'],2094:['Enumeration'],2095:['Linked List','Two Pointers'],2096:['Tree','Depth-First Search'],2097:['Graph','Eulerian Circuit'],2098:['Greedy'],2099:['Sorting'],2100:['Dynamic Programming'],2101:['Graph','Breadth-First Search'],2102:['Design','Binary Search']},
};
