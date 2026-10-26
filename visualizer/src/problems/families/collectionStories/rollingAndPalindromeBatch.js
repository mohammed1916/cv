import {AuthoredMinHeap as MinHeap} from './authoredMinHeap.js';

const specs={
505:['maze start destination','Find the shortest rolling distance that stops exactly at the destination.','The ball cannot brake in a corridor. Each wall-to-wall roll is one weighted edge; Dijkstra settles stopping positions in increasing total distance. Passing over the target does not finish the journey.','initialize the start distance and a minimum heap|settle the nearest unprocessed stopping position|roll in each direction until the next cell is a wall|relax the stopping distance and remember its predecessor|return the settled destination distance or minus one','O(rows*columns*(rows+columns+log(rows*columns))) time; O(rows*columns) space.'],
564:['n','Find the nearest different decimal palindrome, choosing the smaller number on a tie.','Only mirrors of the current leading half and its immediate neighbors can be closest within this digit length. The all-nines and one-zero-one boundaries cover changes in digit count. Compare candidates with exact integers.','extract the leading half of the decimal input|add the shorter all-nines and longer one-zero-one boundaries|mirror the leading half and its two neighbors|exclude the original and minimize distance then numeric value|return the winning palindrome as a string','O(d) decimal-digit work for a constant number of candidates; O(d) space.'],
};
const solvers={
505({maze,start,destination},emit){
 const rows=maze.length,cols=maze[0].length,dist=Array.from({length:rows},()=>Array(cols).fill(Infinity)),parent=new Map(),heap=new MinHeap();
 dist[start[0]][start[1]]=0;heap.push([0,...start]);
 const display=()=>dist.map(row=>row.map(v=>Number.isFinite(v)?v:'∞'));
 while(heap.size){const[d,r,c]=heap.pop();if(d!==dist[r][c])continue;
  emit('This stopping position has the smallest remaining travel distance. Nonnegative roll lengths make its distance final.',{matrix:maze,outputMatrix:display(),outputMatrixLabel:'Shortest known distance to each stopping cell',cell:[r,c],codeStage:'settle',metrics:{row:r,column:c,distance:d}},'inspect');
  if(r===destination[0]&&c===destination[1]){const path=[];for(let key=`${r},${c}`;key!==undefined;key=parent.get(key))path.push(key);emit('The target is a settled stopping cell. These wall-to-wall endpoints reconstruct a shortest route.',{matrix:maze,outputMatrix:display(),output:path.reverse(),codeStage:'found',metrics:{distance:d}},'update');return d;}
  for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){let nr=r,nc=c,length=0;while(nr+dr>=0&&nr+dr<rows&&nc+dc>=0&&nc+dc<cols&&maze[nr+dr][nc+dc]===0){nr+=dr;nc+=dc;length++;}if(!length)continue;const improved=d+length<dist[nr][nc];if(improved){dist[nr][nc]=d+length;parent.set(`${nr},${nc}`,`${r},${c}`);heap.push([d+length,nr,nc]);}emit(improved?'This complete roll improves the endpoint distance. Queue that endpoint; intermediate cells are not places where the ball may choose a new direction.':'This complete roll reaches an endpoint with an equal or shorter known route, so keep its existing distance.',{matrix:maze,cell:[nr,nc],outputMatrix:display(),outputMatrixLabel:'Shortest known stopping distances',codeStage:'relax',metrics:{from:`${r},${c}`,to:`${nr},${nc}`,rollLength:length,candidate:d+length,improved}},'update');}
 }return -1;
},
564({n},emit){const value=BigInt(n),length=n.length,half=BigInt(n.slice(0,Math.ceil(length/2))),candidates=new Set([10n**BigInt(length-1)-1n,10n**BigInt(length)+1n]);for(const delta of [-1n,0n,1n]){const prefix=String(half+delta);const mirror=prefix+(length%2?prefix.slice(0,-1):prefix).split('').reverse().join('');candidates.add(BigInt(mirror));emit('Mirror a neighboring leading half. This supplies the closest possible palindrome on either side without scanning intervening integers.',{sequence:n.split(''),output:[...candidates].map(String),codeStage:'mirror',metrics:{prefix,mirrored:mirror}},'update');}let best=null;const table=[];for(const candidate of candidates){if(candidate===value||candidate<0n)continue;const distance=candidate>value?candidate-value:value-candidate;const bestDistance=best===null?null:(best>value?best-value:value-best);if(best===null||distance<bestDistance||(distance===bestDistance&&candidate<best))best=candidate;table.push([String(candidate),String(distance),String(best)]);emit('Compare exact distances. Equal distance favors the smaller palindrome; the input itself is excluded even if already palindromic.',{sequence:n.split(''),table:[...table],tableHeaders:['Candidate','Distance','Best so far'],codeStage:'compare',metrics:{best:String(best)}},'update');}return String(best);},
};
const python={
505:`def shortestDistance(maze, start, destination):
    from heapq import heappush, heappop
    rows, cols = len(maze), len(maze[0])
    distance = [[float('inf')] * cols for _ in range(rows)]
    distance[start[0]][start[1]] = 0
    heap = [(0, start[0], start[1])]
    while heap:
        travelled, row, col = heappop(heap)  # step: settle
        if travelled != distance[row][col]:
            continue
        if [row, col] == destination:
            return travelled  # step: found
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc, length = row, col, 0
            while (0 <= nr + dr < rows and 0 <= nc + dc < cols
                   and maze[nr + dr][nc + dc] == 0):
                nr, nc, length = nr + dr, nc + dc, length + 1
            if travelled + length < distance[nr][nc]:  # step: relax
                distance[nr][nc] = travelled + length
                heappush(heap, (travelled + length, nr, nc))
    return -1  # step: return`,
564:`def nearestPalindromic(n):
    value, length = int(n), len(n)
    half = int(n[:(length + 1) // 2])
    candidates = {10 ** (length - 1) - 1, 10 ** length + 1}
    for delta in (-1, 0, 1):
        prefix = str(half + delta)
        suffix = prefix[:-1] if length % 2 else prefix
        candidates.add(int(prefix + suffix[::-1]))  # step: mirror
    candidates.discard(value)
    best = None
    for candidate in candidates:
        if candidate < 0:
            continue
        if best is None or (abs(candidate - value), candidate) < (abs(best - value), best):
            best = candidate  # step: compare
    return str(best)  # step: return`,
};
const cases={
505:[['Several long rolls compete around staggered walls',{maze:[[0,0,0,0,0,0,0],[0,1,1,0,1,1,0],[0,0,0,0,0,0,0],[1,0,1,1,1,0,1],[0,0,0,0,0,0,0],[0,1,0,1,0,1,0]],start:[0,0],destination:[5,6]}],['The ball passes the target but cannot stop there',{maze:[[0,0,0,0,0,0]],start:[0,0],destination:[0,3]}],['Separated chambers have no route',{maze:[[0,0,1,0],[0,0,1,0],[0,0,1,0]],start:[0,0],destination:[2,3]}],['A single corridor counts every traversed cell',{maze:[[0],[0],[0],[0],[0]],start:[0,0],destination:[4,0]}]],
564:[['A long value requires exact candidate distances',{n:'783426195284617239'}],['A power of ten ties with the shorter all-nines boundary',{n:'1000000'}],['An existing palindrome must choose a different value',{n:'4567654'}],['The smallest positive input can choose zero',{n:'1'}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);};if(id===564)need(typeof input.n==='string'&&/^[1-9][0-9]{0,17}$/.test(input.n),'Use a positive decimal string of at most 18 digits, without leading zeros.');else{const m=input.maze;need(Array.isArray(m)&&m.length>=1&&m.length<=12&&Array.isArray(m[0])&&m[0].length>=1&&m[0].length<=12&&m.every(row=>Array.isArray(row)&&row.length===m[0].length&&row.every(v=>v===0||v===1)),'Use a rectangular binary maze of at most 12 by 12 cells.');for(const key of ['start','destination']){const p=input[key];need(Array.isArray(p)&&p.length===2&&p.every(Number.isInteger)&&p[0]>=0&&p[0]<m.length&&p[1]>=0&&p[1]<m[0].length&&m[p[0]][p[1]]===0,'Start and destination must be row/column coordinates of open cells.');}need(input.start.some((v,i)=>v!==input.destination[i]),'Use distinct start and destination cells.');}return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{505:{settle:2,relax:4,found:5},564:{mirror:3,compare:4}},resultStage:(id,result)=>id===505&&result>=0?'found':'return',tags:{505:['Graph','Shortest Path','Matrix'],564:['String','Math']}};
