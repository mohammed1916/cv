import {AuthoredMinHeap} from './authoredMinHeap.js';
const specs={
2201:['n artifacts dig','Count artifacts whose every covered cell has been excavated.','Store dug cells as a set, then inspect each artifact rectangle. Duplicate excavation coordinates add no coverage; an artifact is extractable only when none of its cells is missing.','record excavated coordinates|visit each artifact rectangle|inspect every covered cell|count rectangles with all cells excavated|return the extractable artifact count','O(total artifact area+dig count) time; O(dig count) space.'],
2202:['nums k','Maximize the stack top after exactly k remove-or-restore moves.','A final restored item can come from the first k-1 removals, while removing exactly k original items exposes index k. A singleton is special because its stack alternates between empty and occupied.','handle zero moves and singleton parity|consider values removable before a final restore|consider the original item exposed by k removals|choose the largest attainable top|return that value or -1 if the stack must be empty','O(min(n,k)) time; O(1) auxiliary space.'],
2203:['n edges src1 src2 dest','Find the minimum-weight directed subgraph letting both sources reach the destination.','The two routes may share a suffix after a meeting vertex. Compute shortest distances from both sources and to the destination, then minimize their sum at every possible meeting vertex.','run Dijkstra from each source|run Dijkstra from the destination on reversed edges|consider each vertex as the start of a shared suffix|sum the two arrival distances and one suffix distance|return the minimum finite sum or -1','O((V+E) log V) time; O(V+E) space.'],
2204:['n edges','Find each vertex distance to the unique cycle of a connected undirected graph.','Repeatedly peel degree-one leaves; only cycle vertices survive. Seed a multi-source BFS with those vertices to measure the shortest distance outward into attached trees.','build degrees and enqueue leaves|peel leaves until only the cycle core remains|initialize surviving cycle vertices at distance zero|BFS outward to assign distances to removed tree vertices|return every vertex distance to the cycle','O(V+E) time and space.'],
2206:['nums','Decide whether all elements can be partitioned into equal-value pairs.','Pairing never mixes values, so each distinct value must appear an even number of times. Checking frequency parity is both necessary and sufficient.','count every value occurrence|inspect each frequency|reject any odd frequency|accept when all counts can split into pairs|return the pairing decision','O(n) expected time and O(distinct values) space.'],
2207:['text pattern','Insert one character to maximize occurrences of a two-character subsequence.','Count existing pattern subsequences in one pass. Inserting the first pattern character at the front adds every second-character occurrence; inserting the second at the end adds every first-character occurrence.','count existing subsequences while scanning the text|track occurrences of each pattern character|compare the gain from a first-character prefix and second-character suffix|add the larger gain to the existing count|return the maximum subsequence count','O(n) time; O(1) space.'],
2208:['nums','Halve the total array sum using the fewest individual halving operations.','Halving the current largest value gives the largest immediate reduction. Keep a max-heap, repeatedly halve its maximum, and stop when accumulated reduction reaches half the original sum.','build a max-heap and the required total reduction|remove the current largest value|halve it and add that amount to the reduction|reinsert the halved value and continue until the target is reached|return the operation count','O(n log n+operations log n) time with heap insertion; O(n) space.'],
2209:['floor numCarpets carpetLen','Cover the most white tiles using a limited number of fixed-length carpets.','Prefix DP compares leaving the last tile uncovered with ending a carpet there. Overlap is allowed, so a carpet transition can jump to the prefix before its length without tracking previous carpet positions.','initialize uncovered white counts with no carpets|add carpet budgets one at a time|compare exposing the next tile with covering the ending segment|store the smaller uncovered count for each prefix|return uncovered white tiles for the full floor and budget','O(numCarpets*floor length) time and DP space.'],
2210:['nums','Count hills and valleys while treating adjacent equal values as one plateau.','Compress each equal run to one height. Only interior compressed values can have both neighbors, and strict comparisons identify hill and valley plateaus once each.','collapse consecutive equal values|visit interior compressed positions|compare the height strictly with both neighbors|count local maxima and local minima|return the total hills and valleys','O(n) time; O(n) compressed space.'],
2211:['directions','Count collisions among cars moving left right or staying still.','Leading left-moving cars and trailing right-moving cars escape forever. Within the remaining interval, every moving car eventually collides and contributes one, while stationary cars contribute zero.','discard the leading left-moving escape group|discard the trailing right-moving escape group|scan the remaining trapped interval|count its moving cars|return the total collision contribution','O(n) time; O(1) auxiliary space.'],
};
const solvers={
2201({n,artifacts,dig},emit){const dug=new Set(dig.map(([r,c])=>`${r},${c}`)),grid=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>dug.has(`${r},${c}`)?'dug':'covered'));let total=0;for(let i=0;i<artifacts.length;i++){const[r1,c1,r2,c2]=artifacts[i],missing=[];for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(!dug.has(`${r},${c}`))missing.push([r,c]);const complete=missing.length===0;if(complete)total++;emit('An artifact is one whole rectangle. Every cell must appear in the excavation set before the artifact can be extracted.',{matrix:grid,cell:[r1,c1],otherCell:[r2,c2],table:missing,tableHeaders:['Missing row','Missing column'],codeStage:'artifact',metrics:{artifact:i,top:r1,left:c1,bottom:r2,right:c2,complete,total}},'update');}return total;},
2202({nums,k},emit){if(k===0)return nums[0];if(nums.length===1){const result=k%2===0?nums[0]:-1;emit('With only one item, each legal move alternates the stack between occupied and empty. Exact move parity determines whether a top exists.',{codeStage:'singleton',metrics:{k,result}},'update');return result;}let best=-1;for(let i=0;i<Math.min(nums.length,k-1);i++){best=Math.max(best,nums[i]);emit('This item can be removed early enough to restore it on the final move. Consider its value as a possible final top.',{index:i,codeStage:'restore',metrics:{index:i,value:nums[i],moves:k,best}},'update');}if(k<nums.length){best=Math.max(best,nums[k]);emit('Removing exactly k original top items exposes this untouched item without a final restore.',{index:k,codeStage:'expose',metrics:{index:k,value:nums[k],best}},'update');}return best;},
2203({n,edges,src1,src2,dest},emit){const graph=Array.from({length:n},()=>[]),reverse=Array.from({length:n},()=>[]);for(const[a,b,w]of edges){graph[a].push([b,w]);reverse[b].push([a,w]);}function dijkstra(start,adj,label){const dist=Array(n).fill(Infinity),heap=new AuthoredMinHeap((a,b)=>a[0]-b[0]||a[1]-b[1]);dist[start]=0;heap.push([0,start]);while(heap.size){const[cost,node]=heap.pop();if(cost!==dist[node])continue;for(const[next,weight]of adj[node])if(cost+weight<dist[next]){dist[next]=cost+weight;heap.push([dist[next],next]);}emit('Settle the cheapest remaining vertex and relax its directed outgoing edges. The destination run uses reversed edges to measure original routes toward the destination.',{sequence:Array.from({length:n},(_,i)=>i),index:node,output:dist.map(d=>Number.isFinite(d)?d:null),codeStage:'search',metrics:{search:label,node,cost,queued:heap.size}},'update');}return dist;}const a=dijkstra(src1,graph,'first source'),b=dijkstra(src2,graph,'second source'),to=dijkstra(dest,reverse,'toward destination');let best=Infinity;for(let node=0;node<n;node++){const total=a[node]+b[node]+to[node];best=Math.min(best,total);emit('If both sources meet here, the route from this vertex to the destination is paid once. Ignore candidates missing any of the three required routes.',{sequence:Array.from({length:n},(_,i)=>i),index:node,table:Array.from({length:n},(_,i)=>[i,...[a[i],b[i],to[i]].map(v=>Number.isFinite(v)?v:'unreachable')]),tableHeaders:['Meeting vertex','From source one','From source two','To destination'],codeStage:'meeting',metrics:{meeting:node,candidate:Number.isFinite(total)?total:'unreachable',best:Number.isFinite(best)?best:'none'}},'update');}return Number.isFinite(best)?best:-1;},
2204({n,edges},emit){const graph=Array.from({length:n},()=>[]);for(const[a,b]of edges){graph[a].push(b);graph[b].push(a);}const degree=graph.map(row=>row.length),removed=Array(n).fill(false),leaves=degree.flatMap((d,i)=>d===1?[i]:[]);for(let at=0;at<leaves.length;at++){const node=leaves[at];removed[node]=true;for(const next of graph[node])if(!removed[next]&&--degree[next]===1)leaves.push(next);emit('A degree-one vertex cannot lie on a cycle. Removing it may reveal another tree leaf, while the cycle core retains degree two.',{sequence:Array.from({length:n},(_,i)=>i),index:node,table:degree.map((d,i)=>[i,d,removed[i]]),tableHeaders:['Vertex','Remaining degree','Peeled'],codeStage:'peel',metrics:{removed:node,pending:leaves.length-at-1}},'update');}const queue=removed.flatMap((v,i)=>!v?[i]:[]),distance=removed.map(v=>v?-1:0);for(let at=0;at<queue.length;at++){const node=queue[at];for(const next of graph[node])if(distance[next]===-1){distance[next]=distance[node]+1;queue.push(next);}emit('Starting from every cycle vertex at once, BFS assigns the nearest-cycle distance to each attached tree vertex.',{sequence:Array.from({length:n},(_,i)=>i),index:node,output:[...distance],codeStage:'distance',metrics:{node,distance:distance[node],cycleVertices:removed.flatMap((v,i)=>!v?[i]:[]).join(', ')}},'update');}return distance;},
2206({nums},emit){const counts=new Map();for(const value of nums)counts.set(value,(counts.get(value)||0)+1);for(const[value,count]of counts){const even=count%2===0;emit('Each pair consumes two equal occurrences, so this value count must be even independently of all other values.',{table:[...counts],tableHeaders:['Value','Frequency'],codeStage:even?'check':'failed',metrics:{value,count,even}},'update');if(!even)return false;}return true;},
2207({text,pattern},emit){const[a,b]=pattern;let first=0,second=0,pairs=0;for(let i=0;i<text.length;i++){if(text[i]===b){pairs+=first;second++;}if(text[i]===a)first++;emit('Each second-pattern character closes one subsequence for every earlier first-pattern character. Count before updating the first-character total so equal pattern letters still use distinct positions.',{sequence:[...text],index:i,codeStage:'scan',metrics:{character:text[i],firstCount:first,secondCount:second,existingPairs:pairs}},'update');}const gain=Math.max(first,second);emit('A new first character at the front can pair with every second character; a new second character at the end can pair with every first character. Choose the larger gain.',{codeStage:'insert',metrics:{existingPairs:pairs,frontGain:second,endGain:first,chosenGain:gain,total:pairs+gain}},'update');return pairs+gain;},
2208({nums},emit){const heap=new AuthoredMinHeap((a,b)=>b[0]-a[0]),target=nums.reduce((a,b)=>a+b,0)/2;nums.forEach(value=>heap.push([value]));let reduction=0,operations=0;while(reduction<target){const value=heap.pop()[0],half=value/2;reduction+=half;operations++;heap.push([half]);emit('Halving the largest current value gives the greatest available reduction for one operation. The halved value remains eligible for later operations.',{sequence:heap.data.map(([v])=>v),index:0,codeStage:'halve',metrics:{removedMaximum:value,newValue:half,reduction,target,operations}},'update');}return operations;},
2209({floor,numCarpets,carpetLen},emit){const n=floor.length,dp=Array.from({length:numCarpets+1},()=>Array(n+1).fill(0));for(let i=1;i<=n;i++)dp[0][i]=dp[0][i-1]+Number(floor[i-1]);for(let carpets=1;carpets<=numCarpets;carpets++)for(let length=1;length<=n;length++){const expose=dp[carpets][length-1]+Number(floor[length-1]),cover=dp[carpets-1][Math.max(0,length-carpetLen)];dp[carpets][length]=Math.min(expose,cover);emit('Either leave the last tile visible or spend one carpet ending here and reuse the best shorter prefix with one fewer carpet. Black tiles contribute zero when exposed.',{sequence:[...floor],index:length-1,outputMatrix:dp,outputMatrixLabel:'Uncovered white tiles by carpet budget and prefix length',outputCell:[carpets,length],codeStage:'choose',metrics:{carpets,prefixLength:length,expose,cover,best:dp[carpets][length]}},'update');}return dp[numCarpets][n];},
2210({nums},emit){const heights=[];for(const value of nums)if(heights.at(-1)!==value)heights.push(value);let count=0;for(let i=1;i+1<heights.length;i++){const hill=heights[i]>heights[i-1]&&heights[i]>heights[i+1],valley=heights[i]<heights[i-1]&&heights[i]<heights[i+1];if(hill||valley)count++;emit('Consecutive equal values have been collapsed into one plateau. Compare only distinct neighboring plateau heights, and exclude the two endpoints.',{sequence:heights,index:i,window:[i-1,i+1],codeStage:'compare',metrics:{height:heights[i],left:heights[i-1],right:heights[i+1],hill,valley,count}},'update');}return count;},
2211({directions},emit){let left=0,right=directions.length-1;while(left<=right&&directions[left]==='L')left++;while(right>=left&&directions[right]==='R')right--;let collisions=0;for(let i=left;i<=right;i++){const moving=directions[i]!=='S';collisions+=Number(moving);emit('This car lies outside the two escaping edge groups. Every moving car in this trapped interval eventually stops in a collision and contributes exactly one.',{sequence:[...directions],index:i,window:[left,right],codeStage:'count',metrics:{leftBoundary:left,rightBoundary:right,direction:directions[i],moving,collisions}},'update');}return collisions;},
};
const python={
2201:`def digArtifacts(n, artifacts, dig):
    dug = {tuple(cell) for cell in dig}
    total = 0
    for r1, c1, r2, c2 in artifacts:
        complete = all((r, c) in dug for r in range(r1, r2 + 1) for c in range(c1, c2 + 1))
        total += int(complete)  # step: artifact
    return total  # step: return`,
2202:`def maximumTop(nums, k):
    if k == 0:
        return nums[0]  # step: unchanged
    if len(nums) == 1:
        return nums[0] if k % 2 == 0 else -1  # step: singleton
    best = -1
    for i in range(min(len(nums), k - 1)):
        best = max(best, nums[i])  # step: restore
    if k < len(nums):
        best = max(best, nums[k])  # step: expose
    return best  # step: return`,
2203:`def minimumWeight(n, edges, src1, src2, dest):
    from heapq import heappush, heappop
    graph, reverse = [[] for _ in range(n)], [[] for _ in range(n)]
    for a, b, weight in edges:
        graph[a].append((b, weight))
        reverse[b].append((a, weight))
    def dijkstra(start, adjacency):
        distance = [float('inf')] * n
        distance[start] = 0
        heap = [(0, start)]
        while heap:
            cost, node = heappop(heap)
            if cost != distance[node]:
                continue
            for neighbor, weight in adjacency[node]:
                if cost + weight < distance[neighbor]:
                    distance[neighbor] = cost + weight
                    heappush(heap, (distance[neighbor], neighbor))
            # step: search
        return distance
    first = dijkstra(src1, graph)
    second = dijkstra(src2, graph)
    suffix = dijkstra(dest, reverse)
    best = float('inf')
    for meeting in range(n):
        best = min(best, first[meeting] + second[meeting] + suffix[meeting])  # step: meeting
    return -1 if best == float('inf') else best  # step: return`,
2204:`def distanceToCycle(n, edges):
    from collections import deque
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    degree, removed = [len(row) for row in graph], [False] * n
    leaves = deque(i for i in range(n) if degree[i] == 1)
    while leaves:
        node = leaves.popleft()
        removed[node] = True
        for neighbor in graph[node]:
            if not removed[neighbor]:
                degree[neighbor] -= 1
                if degree[neighbor] == 1:
                    leaves.append(neighbor)
        # step: peel
    queue = deque(i for i in range(n) if not removed[i])
    distance = [-1 if removed[i] else 0 for i in range(n)]
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if distance[neighbor] == -1:
                distance[neighbor] = distance[node] + 1
                queue.append(neighbor)
        # step: distance
    return distance  # step: return`,
2206:`def divideArray(nums):
    from collections import Counter
    for value, count in Counter(nums).items():
        if count % 2:
            return False  # step: failed
        # step: check
    return True  # step: return`,
2207:`def maximumSubsequenceCount(text, pattern):
    a, b = pattern
    first = second = pairs = 0
    for letter in text:
        if letter == b:
            pairs += first
            second += 1
        if letter == a:
            first += 1
        # step: scan
    gain = max(first, second)  # step: insert
    return pairs + gain  # step: return`,
2208:`def halveArray(nums):
    from heapq import heappush, heappop
    heap = []
    for value in nums:
        heappush(heap, -value)
    target, reduction, operations = sum(nums) / 2, 0, 0
    while reduction < target:
        value = -heappop(heap)
        half = value / 2
        reduction += half
        operations += 1
        heappush(heap, -half)  # step: halve
    return operations  # step: return`,
2209:`def minimumWhiteTiles(floor, numCarpets, carpetLen):
    n = len(floor)
    dp = [[0] * (n + 1) for _ in range(numCarpets + 1)]
    for i in range(1, n + 1):
        dp[0][i] = dp[0][i - 1] + int(floor[i - 1])
    for carpets in range(1, numCarpets + 1):
        for length in range(1, n + 1):
            expose = dp[carpets][length - 1] + int(floor[length - 1])
            cover = dp[carpets - 1][max(0, length - carpetLen)]
            dp[carpets][length] = min(expose, cover)  # step: choose
    return dp[numCarpets][n]  # step: return`,
2210:`def countHillValley(nums):
    heights = []
    for value in nums:
        if not heights or heights[-1] != value:
            heights.append(value)
    count = 0
    for i in range(1, len(heights) - 1):
        hill = heights[i] > heights[i - 1] and heights[i] > heights[i + 1]
        valley = heights[i] < heights[i - 1] and heights[i] < heights[i + 1]
        count += int(hill or valley)  # step: compare
    return count  # step: return`,
2211:`def countCollisions(directions):
    left, right = 0, len(directions) - 1
    while left <= right and directions[left] == 'L':
        left += 1
    while right >= left and directions[right] == 'R':
        right -= 1
    collisions = 0
    for i in range(left, right + 1):
        collisions += int(directions[i] != 'S')  # step: count
    return collisions  # step: return`,
};
const cases={
2201:[['Several nonoverlapping artifacts have different missing cells',{n:6,artifacts:[[0,0,0,2],[1,3,2,4],[3,0,4,0],[4,3,5,4]],dig:[[0,0],[0,1],[0,2],[1,3],[1,4],[2,3],[3,0],[4,0],[4,3],[4,4],[5,3],[5,4]]}],['One remaining covered cell prevents extraction',{n:2,artifacts:[[0,0,1,1]],dig:[[0,0],[0,1],[1,0]]}],['A single-cell artifact needs one excavation',{n:3,artifacts:[[2,1,2,1]],dig:[[2,1]]}],['Digging elsewhere does not uncover the artifact',{n:4,artifacts:[[0,0,0,1]],dig:[[3,2],[3,3]]}]],
2202:[['Restore candidates compete with the item exposed by removals',{nums:[8,21,4,17,6,30,9,12],k:5}],['Zero moves preserves the original top',{nums:[14,3,22],k:0}],['An odd number of moves empties a singleton stack',{nums:[19],k:7}],['More moves than items can still restore the largest value',{nums:[4,16,7],k:8}]],
2203:[['The cheapest joint subgraph shares a suffix after an intermediate merge',{n:8,edges:[[0,2,4],[1,2,3],[0,3,2],[1,4,2],[3,5,5],[4,5,4],[2,5,1],[5,6,3],[6,7,2],[2,7,12],[4,7,15]],src1:0,src2:1,dest:7}],['One source can join the other source before traveling onward',{n:4,edges:[[0,1,2],[1,2,3],[2,3,4],[0,3,20]],src1:0,src2:1,dest:3}],['A source with no route makes the joint subgraph impossible',{n:5,edges:[[0,2,1],[2,4,2],[1,3,3]],src1:0,src2:1,dest:4}],['Independent routes may meet only at the destination',{n:5,edges:[[0,2,4],[2,4,5],[1,3,2],[3,4,6]],src1:0,src2:1,dest:4}]],
2204:[['Tree branches of different depths attach to one cycle',{n:10,edges:[[0,1],[1,2],[2,3],[3,0],[1,4],[4,5],[5,6],[2,7],[7,8],[3,9]]}],['Every vertex already lies on the cycle',{n:5,edges:[[0,1],[1,2],[2,3],[3,4],[4,0]]}],['A triangle has one long attached branch',{n:7,edges:[[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,6]]}],['Several leaves can peel simultaneously',{n:6,edges:[[0,1],[1,2],[2,0],[0,3],[1,4],[2,5]]}]],
2206:[['Interleaved frequencies can all split into equal pairs',{nums:[4,9,4,7,9,12,7,12,4,4]}],['An even total length does not guarantee even individual counts',{nums:[3,3,3,8]}],['One repeated value forms several pairs',{nums:[6,6,6,6,6,6]}],['The smallest valid input is one equal pair',{nums:[11,11]}]],
2207:[['Both insertion choices compete in a longer text',{text:'abxbacbbaacbbac',pattern:'ab'}],['Equal pattern letters require distinct source positions',{text:'aaaaa',pattern:'aa'}],['No pattern characters means one insertion still cannot form a pair',{text:'xyzxyz',pattern:'ab'}],['Only first-pattern letters favor insertion at the end',{text:'aaaaaa',pattern:'ab'}]],
2208:[['Large values may be halved repeatedly before smaller ones',{nums:[45,7,19,3,28,11,6]}],['One value needs exactly one halving',{nums:[17]}],['Equal values share the reduction work',{nums:[8,8,8,8]}],['One dominant value is not always enough for a single operation',{nums:[100,1,1,1]}]],
2209:[['White clusters and black gaps compete for short carpets',{floor:'11010111100101101',numCarpets:3,carpetLen:3}],['An all-black floor has no uncovered white cost',{floor:'00000000',numCarpets:2,carpetLen:3}],['A long carpet can cover the entire floor',{floor:'1011101',numCarpets:1,carpetLen:10}],['No carpet leaves every white tile visible',{floor:'11001101',numCarpets:0,carpetLen:2}]],
2210:[['Equal plateaus should each count as one extremum',{nums:[3,7,7,4,4,9,2,2,6,6,1,5]}],['A constant plateau has no two distinct neighboring heights',{nums:[8,8,8,8]}],['Monotone heights have no hill or valley',{nums:[1,3,5,7,9]}],['One interior plateau is one hill',{nums:[2,6,6,6,3]}]],
2211:[['Escaping edge groups surround several trapped moving cars',{directions:'LLRRSRLLSRRLLRR'}],['All cars moving outward escape',{directions:'LLLLRRRR'}],['Stationary cars contribute no moving-car collisions',{directions:'SSSSS'}],['Cars on both sides eventually meet a stationary barrier',{directions:'RRRSLLL'}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2201){need(integer(input.n,1,8)&&Array.isArray(input.artifacts)&&input.artifacts.length>=1&&input.artifacts.length<=30&&input.artifacts.every(a=>Array.isArray(a)&&a.length===4&&a.every(v=>integer(v,0,input.n-1))&&a[0]<=a[2]&&a[1]<=a[3])&&Array.isArray(input.dig)&&input.dig.length<=64&&input.dig.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>integer(v,0,input.n-1))),'Use a 1-8 grid, valid inclusive artifact rectangles, and excavation coordinates.');const occupied=new Set();for(const[r1,c1,r2,c2]of input.artifacts)for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){need(!occupied.has(`${r},${c}`),'Artifact rectangles must not overlap.');occupied.add(`${r},${c}`);}}
  if(id===2202)need(vector(input.nums)&&integer(input.k,0,1000000000),'Use 1-80 nonnegative stack values and 0-1000000000 exact moves.');
  if(id===2203)need(integer(input.n,3,20)&&Array.isArray(input.edges)&&input.edges.length<=60&&input.edges.every(e=>Array.isArray(e)&&e.length===3&&integer(e[0],0,input.n-1)&&integer(e[1],0,input.n-1)&&e[0]!==e[1]&&integer(e[2],1))&&[input.src1,input.src2,input.dest].every(v=>integer(v,0,input.n-1))&&new Set([input.src1,input.src2,input.dest]).size===3,'Use 3-20 vertices, at most 60 positively weighted directed edges, and three distinct source/destination vertices.');
  if(id===2204){need(integer(input.n,3,30)&&Array.isArray(input.edges)&&input.edges.length===input.n&&input.edges.every(e=>Array.isArray(e)&&e.length===2&&e.every(v=>integer(v,0,input.n-1))&&e[0]!==e[1])&&new Set(input.edges.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(':'))).size===input.n,'Use a simple undirected graph with 3-30 vertices and exactly n distinct edges.');const graph=Array.from({length:input.n},()=>[]);for(const[a,b]of input.edges){graph[a].push(b);graph[b].push(a);}const queue=[0],seen=new Set(queue);for(const v of queue)for(const next of graph[v])if(!seen.has(next)){seen.add(next);queue.push(next);}need(seen.size===input.n,'The graph must be connected, giving exactly one cycle.');}
  if(id===2206)need(vector(input.nums,1)&&input.nums.length%2===0,'Use an even number of positive values, at most 80.');
  if(id===2207)need(typeof input.text==='string'&&/^[a-z]{1,120}$/.test(input.text)&&typeof input.pattern==='string'&&/^[a-z]{2}$/.test(input.pattern),'Use 1-120 lowercase text characters and exactly two pattern characters.');
  if(id===2208)need(vector(input.nums,1),'Use 1-80 positive values at most one million.');
  if(id===2209)need(typeof input.floor==='string'&&/^[01]{1,60}$/.test(input.floor)&&integer(input.numCarpets,0,10)&&integer(input.carpetLen,1,80),'Use 1-60 binary tiles, 0-10 carpets, and carpet length 1-80.');
  if(id===2210)need(vector(input.nums,1),'Use 1-80 positive heights.');
  if(id===2211)need(typeof input.directions==='string'&&/^[LRS]{1,120}$/.test(input.directions),'Use 1-120 direction letters L, R, or S.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===2202?(input.k===0?'unchanged':input.nums.length===1?'singleton':'return'):id===2206&&!result?'failed':'return',pseudocodeStages:{2201:{artifact:4},2202:{singleton:1,restore:2,expose:3},2203:{search:1,meeting:4},2204:{peel:2,distance:4},2206:{check:2,failed:3},2207:{scan:1,insert:4},2208:{halve:4},2209:{choose:4},2210:{compare:4},2211:{count:4}},tags:{2201:['Matrix'],2202:['Greedy'],2203:['Graph','Dijkstra'],2204:['Graph','Breadth-First Search'],2206:['Counting'],2207:['Greedy'],2208:['Heap','Greedy'],2209:['Dynamic Programming'],2210:['Array'],2211:['Greedy']}};
