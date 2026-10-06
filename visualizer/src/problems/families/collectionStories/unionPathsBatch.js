import {AuthoredUnionFind as UF,unionState,unionPython} from './authoredUnionFind.js';
const specs={
2421:['vals edges','Count tree paths with equal endpoint values and no larger value between them.','Activate connectivity in increasing value order. After processing one value, nodes of that value sharing a component can be paired; a group of k contributes k singleton paths and k choose two endpoint pairs.','process node values in increasing order|union each current node with neighbors of no greater value|count current-value nodes by component|add k times k plus one divided by two for each count|return the total good paths','O(nodes log nodes + nodes * inverse Ackermann) time and O(nodes) space.'],
2492:['n roads','Minimize the smallest road weight encountered on a walk from city one to city n.','Walks may repeat roads and vertices, so any edge in city one connected component can be visited as a detour before reaching city n. The smallest weight anywhere in that component is attainable.','union all road endpoints|identify the component containing city one|inspect every road in that component|keep the smallest road weight even on a detour|return the minimum attainable path score','O((cities+roads) * inverse Ackermann) time and O(cities) space.'],
2685:['n edges','Count connected components in which every pair of different vertices has an edge.','Union graph endpoints, then count vertices and edges in each completed component. A simple component of size k is complete exactly when it has k times k minus one divided by two edges; an isolated vertex qualifies.','union every graph edge|count vertices and edges by final representative|compute k times k minus one divided by two for each component|count components matching that required edge count|return the number of complete components','O((nodes+edges) * inverse Ackermann) time and O(nodes) space.'],
2709:['nums','Determine whether every array index can reach every other using pairs with gcd greater than one.','Prime factors connect indices rather than distinct numeric values. Join each index to the first owner of its factors; repeated values remain separate nodes, and a value of one has no connecting factor.','start one component per array index|extract each value distinct prime factors|union all indices sharing each factor|inspect the final component count|return whether exactly one component remains','O(length * sqrt(max value)) factorization time plus near-linear unions; O(length and factors) space.'],
2948:['nums limit','Produce the lexicographically smallest array using swaps of values differing by at most limit.','Sort value-index pairs. Consecutive values separated by at most limit form a swappable component through a chain; larger gaps split components. Assign each component sorted values to its sorted original indices.','sort values while retaining their original indices|union adjacent sorted values whose difference is at most limit|collect original indices in each component|assign ascending component values to ascending indices|return the lexicographically smallest array','O(length log length) time and O(length) space.'],
3108:['n edges query','Answer minimum bitwise-AND walk costs between queried vertices.','Repeated-edge walks can detour through every edge in a connected component. AND never increases when another weight is included, so the minimum cost is the AND of all component edge weights; disconnected endpoints return minus one.','union all graph endpoints|AND every edge weight into its final component aggregate|inspect each query pair representatives|return the component AND when connected or minus one otherwise|return every query answer','O((nodes+edges+queries) * inverse Ackermann) time and O(nodes) space.'],
};
const solvers={
2421({vals,edges},emit){const n=vals.length,dsu=new UF(n),adj=Array.from({length:n},()=>[]),groups=new Map();for(const[a,b]of edges){adj[a].push(b);adj[b].push(a);}vals.forEach((value,node)=>{if(!groups.has(value))groups.set(value,[]);groups.get(value).push(node);});let answer=0;for(const value of [...groups.keys()].sort((a,b)=>a-b)){const nodes=groups.get(value);for(const node of nodes)for(const neighbor of adj[node])if(vals[neighbor]<=value)dsu.union(node,neighbor);const counts=new Map();for(const node of nodes){const root=dsu.find(node);counts.set(root,(counts.get(root)||0)+1);}let added=0;for(const k of counts.values())added+=k*(k+1)/2;answer+=added;emit('After all nodes at this value have joined eligible neighbors, equal-valued endpoints in one component have a path containing no larger value. Include singleton paths once.',{sequence:vals,...unionState(dsu),additionalSourceRecords:[{label:'Current-value endpoint counts',columns:['component','endpoints','goodPaths'],rows:[...counts].map(([component,k])=>({component,endpoints:k,goodPaths:k*(k+1)/2}))}],codeStage:'count',metrics:{value,added,total:answer}},'update');}return answer;},
2492({n,roads},emit){const dsu=new UF(n);for(const[a,b]of roads)dsu.union(a-1,b-1);const root=dsu.find(0);let best=Infinity;for(const[a,b,weight]of roads){const reachable=dsu.find(a-1)===root;if(reachable)best=Math.min(best,weight);emit(reachable?'This road lies in city one component. A walk can detour through it and still reach the destination, so its weight can lower the score.':'This road belongs to a disconnected component and cannot appear on a walk from city one.',{...unionState(dsu,Array.from({length:n},(_,i)=>i+1)),codeStage:'edge',metrics:{from:a,to:b,weight,reachable,best:Number.isFinite(best)?best:'not found'}},'update');}return best;},
2685({n,edges},emit){const dsu=new UF(n);for(const[a,b]of edges)dsu.union(a,b);const edgeCounts=new Map();for(const[a]of edges){const root=dsu.find(a);edgeCounts.set(root,(edgeCounts.get(root)||0)+1);}let answer=0;const table=[];for(let root=0;root<n;root++)if(dsu.find(root)===root){const size=dsu.size[root],actual=edgeCounts.get(root)||0,required=size*(size-1)/2,complete=actual===required;if(complete)answer++;table.push([root,size,actual,required,complete]);emit('A simple component is complete when its edge count equals the number of unordered vertex pairs. Size-one components require zero edges and qualify.',{table:[...table],tableHeaders:['Root','Vertices','Edges','Required','Complete?'],codeStage:'complete',metrics:{completeComponents:answer}},'update');}return answer;},
2709({nums},emit){const dsu=new UF(nums.length),owner=new Map();for(let i=0;i<nums.length;i++){let value=nums[i];const factors=[];for(let p=2;p*p<=value;p++)if(value%p===0){factors.push(p);while(value%p===0)value/=p;}if(value>1)factors.push(value);for(const p of factors){if(owner.has(p))dsu.union(i,owner.get(p));else owner.set(p,i);}emit('Each shared prime creates connectivity between indices. Duplicates greater than one connect normally, while one contributes no prime and remains isolated.',{sequence:nums,index:i,...unionState(dsu,nums.map((v,k)=>`${k}:${v}`)),codeStage:'factor',metrics:{index:i,value:nums[i],factors:factors.join(', ')||'none',components:dsu.count}},'update');}return dsu.count===1;},
2948({nums,limit},emit){const pairs=nums.map((value,index)=>[value,index]).sort((a,b)=>a[0]-b[0]),dsu=new UF(nums.length);for(let i=1;i<pairs.length;i++)if(pairs[i][0]-pairs[i-1][0]<=limit)dsu.union(pairs[i][1],pairs[i-1][1]);const groups=new Map();for(let i=0;i<nums.length;i++){const root=dsu.find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(i);}const answer=[...nums];for(const indices of groups.values()){const values=indices.map(i=>nums[i]).sort((a,b)=>a-b);indices.sort((a,b)=>a-b);indices.forEach((index,i)=>{answer[index]=values[i];});emit('Swap chains permit arbitrary rearrangement inside this value-connected component. Put its smallest available value at its earliest original index.',{sequence:nums,output:[...answer],table:indices.map((index,i)=>[index,nums[index],values[i]]),tableHeaders:['Original index','Original value','Assigned value'],codeStage:'assign',metrics:{limit,componentSize:indices.length}},'update');}return answer;},
3108({n,edges,query},emit){const dsu=new UF(n),cost=new Map();for(const[a,b]of edges)dsu.union(a,b);for(const[a,b,weight]of edges){const root=dsu.find(a);cost.set(root,(cost.get(root)??131071)&weight);emit('Include every edge in the component AND, including cycles and parallel edges. A repeated-edge detour can collect its bits before reaching the target.',{...unionState(dsu),codeStage:'and',metrics:{from:a,to:b,weight,component:root,componentAND:cost.get(root),binary:cost.get(root).toString(2)}},'update');}const answer=[];for(const[a,b]of query){const root=dsu.find(a),connected=root===dsu.find(b),value=connected?cost.get(root):-1;answer.push(value);emit(connected?'Both endpoints share a component, so an optimal walk can attain that component complete edge-weight AND.':'The endpoints are disconnected, so no walk exists.',{...unionState(dsu),output:[...answer],codeStage:'query',metrics:{from:a,to:b,connected,minimumCost:value}},'inspect');}return answer;},
};
const implementations={
2421:`def numberOfGoodPaths(vals, edges):
    n = len(vals)
    dsu, adjacent, groups = UnionFind(n), [[] for _ in vals], {}
    for first, second in edges:
        adjacent[first].append(second)
        adjacent[second].append(first)
    for node, value in enumerate(vals):
        groups.setdefault(value, []).append(node)
    answer = 0
    for value in sorted(groups):
        for node in groups[value]:
            for neighbor in adjacent[node]:
                if vals[neighbor] <= value:
                    dsu.union(node, neighbor)
        counts = {}
        for node in groups[value]:
            root = dsu.find(node)
            counts[root] = counts.get(root, 0) + 1
        answer += sum(count * (count + 1) // 2 for count in counts.values())  # step: count
    return answer  # step: return`,
2492:`def minScore(n, roads):
    dsu = UnionFind(n)
    for first, second, weight in roads:
        dsu.union(first - 1, second - 1)
    root, best = dsu.find(0), float('inf')
    for first, second, weight in roads:
        if dsu.find(first - 1) == root:
            best = min(best, weight)  # step: edge
    return best  # step: return`,
2685:`def countCompleteComponents(n, edges):
    dsu = UnionFind(n)
    for first, second in edges:
        dsu.union(first, second)
    counts = {}
    for first, second in edges:
        root = dsu.find(first)
        counts[root] = counts.get(root, 0) + 1
    answer = 0
    for root in range(n):
        if dsu.find(root) == root:
            size = dsu.size[root]
            answer += counts.get(root, 0) == size * (size - 1) // 2  # step: complete
    return answer  # step: return`,
2709:`def canTraverseAllPairs(nums):
    dsu, owner = UnionFind(len(nums)), {}
    for index, number in enumerate(nums):
        value, prime, factors = number, 2, []
        while prime * prime <= value:
            if value % prime == 0:
                factors.append(prime)
                while value % prime == 0:
                    value //= prime
            prime += 1
        if value > 1:
            factors.append(value)
        for prime in factors:  # step: factor
            if prime in owner:
                dsu.union(index, owner[prime])
            else:
                owner[prime] = index
    return dsu.count == 1  # step: return`,
2948:`def lexicographicallySmallestArray(nums, limit):
    pairs = sorted((value, index) for index, value in enumerate(nums))
    dsu = UnionFind(len(nums))
    for index in range(1, len(pairs)):
        if pairs[index][0] - pairs[index - 1][0] <= limit:
            dsu.union(pairs[index][1], pairs[index - 1][1])
    groups = {}
    for index in range(len(nums)):
        groups.setdefault(dsu.find(index), []).append(index)
    answer = list(nums)
    for indices in groups.values():
        values = sorted(nums[index] for index in indices)
        for index, value in zip(sorted(indices), values):
            answer[index] = value  # step: assign
    return answer  # step: return`,
3108:`def minimumCost(n, edges, query):
    dsu, costs = UnionFind(n), {}
    for first, second, weight in edges:
        dsu.union(first, second)
    for first, second, weight in edges:
        root = dsu.find(first)
        costs[root] = costs.get(root, (1 << 17) - 1) & weight  # step: and
    answer = []
    for first, second in query:
        root = dsu.find(first)
        answer.append(costs[root] if root == dsu.find(second) else -1)  # step: query
    return answer  # step: return`,
};
const python=Object.fromEntries(Object.entries(implementations).map(([id,source])=>[id,unionPython+source]));
const cases={
2421:[['Equal-valued endpoints become eligible at different activation levels',{vals:[4,2,4,1,2,4,3,3],edges:[[0,1],[1,2],[1,3],[3,4],[4,5],[4,6],[6,7]]}],['All equal values make every endpoint pair good',{vals:[7,7,7,7],edges:[[0,1],[1,2],[1,3]]}],['Distinct values leave only singleton good paths',{vals:[2,5,8,11],edges:[[0,1],[1,2],[2,3]]}],['One node contributes one path',{vals:[9],edges:[]}]],
2492:[['A low-weight detour improves the route score',{n:7,roads:[[1,2,18],[2,7,14],[2,3,9],[3,4,2],[4,5,11],[5,6,16]]}],['A smaller edge in another component is irrelevant',{n:5,roads:[[1,2,8],[2,5,12],[3,4,1]]}],['One road is the complete path',{n:2,roads:[[1,2,23]]}],['Cycles allow repeated visits without changing the minimum rule',{n:4,roads:[[1,2,15],[2,3,7],[3,1,10],[3,4,19]]}]],
2685:[['A triangle a noncomplete path and isolated vertices coexist',{n:9,edges:[[0,1],[1,2],[0,2],[3,4],[4,5],[6,7]]}],['All isolated vertices are complete components',{n:5,edges:[]}],['A four-node clique is one complete component',{n:4,edges:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]}],['One missing clique edge prevents completeness',{n:4,edges:[[0,1],[0,2],[0,3],[1,2],[1,3]]}]],
2709:[['Several prime bridges connect every index',{nums:[6,35,10,77,143,26]}],['One in a larger array has no usable gcd link',{nums:[6,10,1,15]}],['A singleton one is trivially connected to itself',{nums:[1]}],['Repeated values connect indices but a coprime value stays separate',{nums:[14,14,21,25]}]],
2948:[['Value chains permit swaps across distant original indices',{nums:[18,4,13,7,21,10,30,16],limit:3}],['A gap beyond the limit separates reorderable components',{nums:[9,1,8,2,20],limit:2}],['Equal values do not require a positive limit',{nums:[5,3,5,3],limit:0}],['A sufficiently large limit permits complete sorting',{nums:[12,4,19,7,2],limit:30}]],
3108:[['Detours clear bits beyond a direct route',{n:7,edges:[[0,1,31],[1,2,27],[2,3,23],[1,4,15],[5,6,12]],query:[[0,3],[4,2],[0,6],[5,6]]}],['A zero-weight edge reduces every same-component query to zero',{n:4,edges:[[0,1,22],[1,2,0],[2,3,18]],query:[[0,3],[1,3]]}],['Parallel edges both contribute to the component AND',{n:3,edges:[[0,1,14],[0,1,11],[1,2,15]],query:[[0,2],[1,2]]}],['Without edges every distinct-endpoint query is unreachable',{n:3,edges:[],query:[[0,1],[1,2]]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===2709||id===2948){need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=60&&input.nums.every(v=>integer(v,1,10000)),'Use 1-60 positive integers no greater than 10000.');if(id===2948)need(integer(input.limit,0,10000),'Limit must be from zero to 10000.');return input;}if(id===2421)need(Array.isArray(input.vals)&&input.vals.length>=1&&input.vals.length<=60&&input.vals.every(v=>integer(v,0,100000)),'Use 1-60 nonnegative node values up to 100000.');const n=id===2421?input.vals.length:input.n;need(integer(n,id===2492||id===3108?2:1,60),'Use at most sixty nodes.');const edges=id===2492?input.roads:input.edges,offset=id===2492?1:0,weighted=id===2492||id===3108;need(Array.isArray(edges)&&edges.length<=120&&edges.every(e=>Array.isArray(e)&&e.length===(weighted?3:2)&&integer(e[0],offset,n-1+offset)&&integer(e[1],offset,n-1+offset)&&e[0]!==e[1]&&(!weighted||integer(e[2],id===2492?1:0,id===2492?10000:100000))),'Use up to 120 valid graph edges with bounded weights when applicable.');if(id!==3108)need(new Set(edges.map(e=>e.slice(0,2).sort((a,b)=>a-b).join(','))).size===edges.length,'This graph must not contain repeated undirected edges.');const dsu=new UF(n);for(const[a,b]of edges)dsu.union(a-offset,b-offset);if(id===2421)need(edges.length===n-1&&dsu.count===1,'Edges must form one tree.');if(id===2492)need(dsu.find(0)===dsu.find(n-1),'City one and city n must be connected.');if(id===3108)need(Array.isArray(input.query)&&input.query.length>=1&&input.query.length<=60&&input.query.every(q=>Array.isArray(q)&&q.length===2&&q.every(v=>integer(v,0,n-1))&&q[0]!==q[1]),'Use 1-60 queries with distinct valid endpoints.');return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2421:{count:4},2492:{edge:4},2685:{complete:4},2709:{factor:3},2948:{assign:4},3108:{and:2,query:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Union Find']]))};
