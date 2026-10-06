import {AuthoredUnionFind as UF,unionState,unionPython} from './authoredUnionFind.js';
const specs={
685:['edges','Remove the latest eligible directed edge so the remaining graph becomes a rooted tree.','An extra edge creates a cycle, a node with two parents, or both. Skip the later parent edge temporarily; a remaining cycle requires removing the earlier parent edge, otherwise the skipped edge is the answer.','detect a node with two incoming parent edges|temporarily skip its later incoming edge|union other endpoints to detect a cycle|choose the cycle edge or appropriate conflicting parent edge|return the removable directed edge','O(nodes * inverse Ackermann) time and O(nodes) space.'],
827:['grid','Find the largest island obtainable by changing at most one water cell into land.','Union neighboring land, then consider each zero. Sum the sizes of its distinct adjacent island roots plus one; deduplication prevents counting one surrounding island repeatedly.','union adjacent land cells|record island component sizes|inspect each water cell distinct neighboring roots|sum their sizes plus the flipped cell|return the largest candidate including the all-land case','O(cells * inverse Ackermann) time and O(cells) space.'],
959:['grid','Count regions formed by slash boundaries inside a square grid.','Split each cell into top right bottom and left triangles. Join triangles across open internal space and shared neighboring cell edges. The remaining connected components are the regions.','create four triangle nodes per cell|join internal triangles according to the slash or blank|join triangles across neighboring cell boundaries|finish all connectivity unions|return the number of triangle components','O(cells * inverse Ackermann) time and O(cells) space.'],
1168:['n wells pipes','Supply every house with water at minimum total well and pipe cost.','A virtual water source turns each possible well into a source-to-house edge. A minimum spanning tree over wells and pipes chooses the cheapest connected supply system.','add a virtual source edge for each possible well|sort well and pipe edges by cost|accept edges joining different components|stop when all houses connect to the virtual source|return the total accepted cost','O((houses+pipes) log(houses+pipes)) time and O(houses+pipes) space.'],
};
const solvers={
685({edges},emit){const incoming=new Map();let earlier=-1,later=-1;for(let i=0;i<edges.length;i++){const child=edges[i][1];if(incoming.has(child)){earlier=incoming.get(child);later=i;}else incoming.set(child,i);}const dsu=new UF(edges.length);let cycle=-1;for(let i=0;i<edges.length;i++){if(i===later)continue;const[a,b]=edges[i],merged=dsu.union(a-1,b-1);emit(merged?'Keep this candidate edge while the later conflicting parent edge is omitted.':'Already-connected endpoints reveal a cycle in the temporary graph.',{...unionState(dsu,Array.from({length:edges.length},(_,k)=>k+1)),sequence:edges.map(e=>e.join(' → ')),index:i,codeStage:'scan',metrics:{skippedParentEdge:later,earlierParentEdge:earlier,cycle:!merged}},'update');if(!merged){cycle=i;break;}}const chosen=cycle<0?later:earlier>=0?earlier:cycle;emit(cycle<0?'Skipping the later parent edge leaves a tree, so remove that later edge.':earlier>=0?'A cycle remains after skipping the later parent edge. Remove the earlier conflicting parent edge.':'There is no two-parent conflict. Remove the latest cycle-closing edge.',{output:edges[chosen],codeStage:'choose',metrics:{chosenEdgeIndex:chosen}},'update');return [...edges[chosen]];},
827({grid},emit){const n=grid.length,dsu=new UF(n*n);let best=0;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(grid[r][c]){if(r&&grid[r-1][c])dsu.union(r*n+c,(r-1)*n+c);if(c&&grid[r][c-1])dsu.union(r*n+c,r*n+c-1);}const labels=grid.map((row,r)=>row.map((v,c)=>v?dsu.find(r*n+c):'water'));for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(grid[r][c]){best=Math.max(best,dsu.size[dsu.find(r*n+c)]);continue;}const roots=new Set();for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<n&&nc>=0&&nc<n&&grid[nr][nc])roots.add(dsu.find(nr*n+nc));}const area=1+[...roots].reduce((sum,root)=>sum+dsu.size[root],0);best=Math.max(best,area);emit('Count each neighboring island once, even if it touches this water cell on several sides. The flipped cell joins those distinct components.',{matrix:grid,cell:[r,c],outputMatrix:labels,outputMatrixLabel:'Existing land component representative',table:[...roots].map(root=>[root,dsu.size[root]]),tableHeaders:['Distinct adjacent island','Area'],codeStage:'flip',metrics:{row:r,column:c,candidateArea:area,best}},'update');}return best;},
959({grid},emit){const n=grid.length,dsu=new UF(4*n*n);for(let r=0;r<n;r++)for(let c=0;c<n;c++){const base=4*(r*n+c),character=grid[r][c];if(character!=='/'){dsu.union(base,base+1);dsu.union(base+2,base+3);}if(character!==String.fromCharCode(92)){dsu.union(base,base+3);dsu.union(base+1,base+2);}if(r+1<n)dsu.union(base+2,base+4*n);if(c+1<n)dsu.union(base+1,base+7);emit('Join triangles inside this cell across open space, then connect shared edges with the cells below and to the right.',{matrix:grid.map(row=>row.split('').map(v=>v===' '?'·':v)),cell:[r,c],table:[[base,'top',dsu.find(base)],[base+1,'right',dsu.find(base+1)],[base+2,'bottom',dsu.find(base+2)],[base+3,'left',dsu.find(base+3)]],tableHeaders:['Triangle node','Side','Representative'],codeStage:'cell',metrics:{row:r,column:c,symbol:character===' '?'blank':character,componentsStillSeparate:dsu.count}},'update');}return dsu.count;},
1168({n,wells,pipes},emit){const edges=[...wells.map((cost,i)=>[0,i+1,cost]),...pipes.map(edge=>[...edge])].sort((a,b)=>a[2]-b[2]),dsu=new UF(n+1),chosen=[];let total=0;for(const[a,b,cost]of edges){const merged=dsu.union(a,b);if(merged){chosen.push([a===0?'well':'pipe',a,b,cost]);total+=cost;}emit(merged?'This cheapest available edge joins separate supply components. Include it in the minimum spanning tree.':'This edge would create a cycle inside an already connected supply component, so skip its cost.',{...unionState(dsu,['source',...Array.from({length:n},(_,i)=>i+1)]),additionalSourceRecords:[{label:'Selected water infrastructure',columns:['kind','from','to','cost'],rows:chosen.map(([kind,from,to,cost])=>({kind,from,to,cost}))}],codeStage:'edge',metrics:{from:a,to:b,cost,accepted:merged,total,components:dsu.count}},'update');if(dsu.count===1)break;}return total;},
};
const python={685:unionPython+`def findRedundantDirectedConnection(edges):
    incoming, earlier, later = {}, -1, -1
    for index, (parent, child) in enumerate(edges):
        if child in incoming:
            earlier, later = incoming[child], index
        else:
            incoming[child] = index
    dsu, cycle = UnionFind(len(edges)), -1
    for index, (parent, child) in enumerate(edges):
        if index == later:
            continue
        if not dsu.union(parent - 1, child - 1):  # step: scan
            cycle = index
            break
    chosen = later if cycle < 0 else earlier if earlier >= 0 else cycle  # step: choose
    return edges[chosen]  # step: return`,
827:unionPython+`def largestIsland(grid):
    n = len(grid)
    dsu = UnionFind(n * n)
    for row in range(n):
        for col in range(n):
            if grid[row][col]:
                if row and grid[row - 1][col]:
                    dsu.union(row * n + col, (row - 1) * n + col)
                if col and grid[row][col - 1]:
                    dsu.union(row * n + col, row * n + col - 1)
    best = 0
    for row in range(n):
        for col in range(n):
            if grid[row][col]:
                best = max(best, dsu.size[dsu.find(row * n + col)])
                continue
            roots = set()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = row + dr, col + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc]:
                    roots.add(dsu.find(nr * n + nc))
            best = max(best, 1 + sum(dsu.size[root] for root in roots))  # step: flip
    return best  # step: return`,
959:unionPython+`def regionsBySlashes(grid):
    n = len(grid)
    dsu = UnionFind(4 * n * n)
    for row in range(n):
        for col in range(n):
            base = 4 * (row * n + col)
            if grid[row][col] != '/':
                dsu.union(base, base + 1)
                dsu.union(base + 2, base + 3)
            if grid[row][col] != chr(92):
                dsu.union(base, base + 3)
                dsu.union(base + 1, base + 2)
            if row + 1 < n:
                dsu.union(base + 2, base + 4 * n)
            if col + 1 < n:
                dsu.union(base + 1, base + 7)
            # step: cell
    return dsu.count  # step: return`,
1168:unionPython+`def minCostToSupplyWater(n, wells, pipes):
    edges = [(0, house + 1, cost) for house, cost in enumerate(wells)] + [tuple(edge) for edge in pipes]
    edges.sort(key=lambda edge: edge[2])
    dsu, total = UnionFind(n + 1), 0
    for first, second, cost in edges:
        if dsu.union(first, second):  # step: edge
            total += cost
        if dsu.count == 1:
            break
    return total  # step: return`};
const backslash=String.fromCharCode(92);
const cases={
685:[['A later parent conflicts with a larger rooted tree',{edges:[[1,2],[1,3],[2,4],[2,5],[3,6],[5,6]]}],['A pure directed cycle requires its latest cycle edge',{edges:[[1,2],[2,3],[3,4],[4,5],[5,1]]}],['A two-parent conflict and cycle require the earlier parent edge',{edges:[[2,1],[3,1],[4,2],[1,4]]}],['The later conflicting parent edge can itself close the cycle',{edges:[[1,2],[2,3],[3,4],[4,2]]}]],
827:[['One water cell can bridge differently sized islands',{grid:[[1,1,0,1,0],[1,0,0,1,1],[0,1,0,0,1],[0,1,1,0,0],[1,0,0,1,1]]}],['All land already occupies the full area',{grid:[[1,1,1],[1,1,1],[1,1,1]]}],['All water gains exactly one land cell',{grid:[[0,0],[0,0]]}],['The same surrounding island must not count four times',{grid:[[1,1,1],[1,0,1],[1,1,1]]}]],
959:[['Several slashes connect across a larger grid',{grid:[' /'+backslash,'/ /',backslash+'/ ']}],['A blank grid has one connected region',{grid:['   ','   ','   ']}],['A single slash splits one cell into two regions',{grid:['/']}],['Opposite slash corners enclose a central region',{grid:['/'+backslash,backslash+'/']}]],
1168:[['Cheap pipes combine houses while selected wells anchor supply',{n:6,wells:[8,3,9,7,2,10],pipes:[[1,2,2],[2,3,1],[3,4,4],[4,5,2],[5,6,3],[1,6,12],[2,5,8]]}],['Without pipes every house needs its own well',{n:3,wells:[4,7,5],pipes:[]}],['Expensive pipes lose to individual wells',{n:3,wells:[2,3,4],pipes:[[1,2,20],[2,3,30]]}],['A zero-cost well and pipes can supply everything for free',{n:4,wells:[0,8,9,6],pipes:[[1,2,0],[2,3,0],[3,4,0]]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if(id===685){const edges=input.edges;need(Array.isArray(edges)&&edges.length>=3&&edges.length<=40&&edges.every(e=>Array.isArray(e)&&e.length===2&&e.every(v=>integer(v,1,edges.length))&&e[0]!==e[1])&&new Set(edges.map(e=>e.join(','))).size===edges.length,'Use 3-40 distinct directed edges on nodes 1 through edge count without self edges.');const n=edges.length,treeAfter=skip=>{const incoming=Array(n+1).fill(0),children=Array.from({length:n+1},()=>[]);for(let i=0;i<n;i++)if(i!==skip){const[a,b]=edges[i];if(++incoming[b]>1)return false;children[a].push(b);}const roots=Array.from({length:n},(_,i)=>i+1).filter(v=>incoming[v]===0);if(roots.length!==1)return false;const seen=new Set(),stack=[roots[0]];while(stack.length){const node=stack.pop();if(seen.has(node))return false;seen.add(node);stack.push(...children[node]);}return seen.size===n;};need(edges.some((_,i)=>treeAfter(i)),'The graph must be a rooted directed tree plus one extra edge.');}if(id===827)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=8&&input.grid.every(row=>Array.isArray(row)&&row.length===input.grid.length&&row.every(v=>v===0||v===1)),'Use a binary square grid with side 1-8.');if(id===959)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=5&&input.grid.every(row=>typeof row==='string'&&row.length===input.grid.length&&[...row].every(c=>c===' '||c==='/'||c===backslash)),'Use a square grid of 1-5 strings containing spaces, slashes, or backslashes.');if(id===1168){need(integer(input.n,1,40)&&Array.isArray(input.wells)&&input.wells.length===input.n&&input.wells.every(v=>integer(v,0,10000)),'Use 1-40 houses with well costs from 0 to 10000.');need(Array.isArray(input.pipes)&&input.pipes.length<=100&&input.pipes.every(e=>Array.isArray(e)&&e.length===3&&integer(e[0],1,input.n)&&integer(e[1],1,input.n)&&e[0]!==e[1]&&integer(e[2],0,10000)),'Use up to 100 pipes with different house endpoints and costs from 0 to 10000.');}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{685:{scan:3,choose:4},827:{flip:4},959:{cell:3},1168:{edge:3}},tags:{685:['Union Find','Graph'],827:['Union Find','Matrix'],959:['Union Find','Matrix'],1168:['Union Find','Minimum Spanning Tree']}};
