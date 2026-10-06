const specs={
2073:['tickets k','Count seconds until person k finishes buying tickets one at a time.','Before and including k, a person can participate in the final target round; after k, they can participate in only one fewer round. Sum each person capped contribution.','read the target ticket count|inspect every person|choose the target-round cap based on queue position|add the smaller of requested tickets and that cap|return the total service time','O(n) time; O(1) auxiliary space.'],
2075:['encodedText rows','Decode text written diagonally and read row by row.','Recover the rectangular character grid. Read down-right diagonals starting at successive columns of the top row, then remove only trailing padding spaces.','reshape the encoded text into rows|start at each top-row column|walk diagonally down and right|append encountered characters while preserving internal spaces|return the text with trailing spaces removed','O(encoded length) time and decoded output space.'],
2076:['n restrictions requests','Accept friendship requests only when no restricted pair becomes connected.','Before joining two components, check whether any restricted pair has endpoints in those two components. Failed requests leave the disjoint sets unchanged; requests inside one component are already safe.','initialize one component per user|read each requested friendship|compare all restricted-pair roots with the requested roots|merge only when no restriction would be violated|return request acceptance results','O((requests*restrictions+users)*inverse Ackermann) reference time; O(users) disjoint-set space.'],
2077:['n corridors','Count three-room cycles in an undirected maze.','Orient each candidate triple by increasing room number. For every edge a<b, find common neighbors c>b, so each triangle is counted once rather than once per starting room or direction.','build undirected neighbor sets|choose each edge with increasing endpoints|find shared neighbors greater than both endpoints|add those uniquely oriented triangles|return the total three-room cycles','O(edges*maximum degree) reference time; O(vertices+edges) adjacency space.'],
2078:['colors','Find the greatest distance between two houses with different colors.','An optimal differing pair can use the first or last house. Compare every house against both endpoints and retain the farthest eligible distance.','record the first and last colors|scan every house|check its color against each endpoint|update distances for differing colors|return the greatest distance','O(n) time; O(1) auxiliary space.'],
2079:['plants capacity','Count walking steps needed to water plants in order from the river.','Walk one step to each next plant. If the remaining water is insufficient before plant i, returning to the river and back adds 2*i steps before the normal forward step.','start at the river with a full watering can|inspect the next plant need|return and refill when remaining water is insufficient|add refill travel plus the forward step and water the plant|return total walking steps','O(n) time; O(1) auxiliary space.'],
2080:['arr queries','Answer how often a value appears within each inclusive array range.','Store sorted occurrence indices for every value. Two binary searches isolate the occurrence positions between left and right; their index difference is the frequency.','index every value by its sorted occurrence positions|read a left/right/value query|find the first position at least left and first position greater than right|subtract those two insertion indices|return all range frequencies','O(n+queries*log n) time; O(n) occurrence-index space.'],
};
const solvers={
2073({tickets,k},emit){const rounds=tickets[k],table=[];let total=0;for(let i=0;i<tickets.length;i++){const cap=rounds-Number(i>k),contribution=Math.min(tickets[i],cap);total+=contribution;table.push([i,tickets[i],cap,contribution]);emit('People ahead of the target, including the target, can buy in its final round. People behind it do not get another turn after the target finishes.',{index:i,table:[...table],tableHeaders:['Person','Requested','Round cap','Seconds contributed'],codeStage:'update',metrics:{target:k,targetRounds:rounds,contribution,total}},'update');}return total;},
2075({encodedText,rows},emit){const columns=encodedText.length/rows,grid=Array.from({length:rows},(_,r)=>[...encodedText.slice(r*columns,(r+1)*columns)]),output=[];for(let start=0;start<columns;start++)for(let r=0,c=start;r<rows&&c<columns;r++,c++){output.push(grid[r][c]);emit('Read the next down-right diagonal from this top-row start. Internal spaces are real message content; only spaces at the very end are padding.',{matrix:grid,cell:[r,c],output:[...output],codeStage:'update',metrics:{startColumn:start,row:r,column:c,flatIndex:r*columns+c,character:grid[r][c]===' '?'space':grid[r][c]}},'update');}return output.join('').trimEnd();},
2076({n,restrictions,requests},emit){const parent=Array.from({length:n},(_,i)=>i),size=Array(n).fill(1),find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;},result=[];for(let i=0;i<requests.length;i++){const[a,b]=requests[i];let rootA=find(a),rootB=find(b),blocked=null;if(rootA!==rootB)for(const[x,y]of restrictions){const rx=find(x),ry=find(y);if(rx===rootA&&ry===rootB||rx===rootB&&ry===rootA){blocked=[x,y];break;}}const accepted=blocked===null;if(accepted&&rootA!==rootB){if(size[rootA]<size[rootB])[rootA,rootB]=[rootB,rootA];parent[rootB]=rootA;size[rootA]+=size[rootB];}result.push(accepted);emit('A restriction applies to entire friendship components, not only the two requested users. Check all forbidden pairs before merging; an existing same-component friendship changes nothing.',{sequence:Array.from({length:n},(_,j)=>j),index:a,marks:{[b]:'requested partner'},table:parent.map((_,user)=>[user,find(user)]),tableHeaders:['User','Component'],output:[...result],codeStage:'update',metrics:{request:i,pair:`${a},${b}`,blockedBy:blocked?blocked.join(', '):'none',accepted}},'update');}return result;},
2077({n,corridors},emit){const graph=Array.from({length:n+1},()=>new Set());for(const[a,b]of corridors){graph[a].add(b);graph[b].add(a);}let count=0;const triangles=[];for(let a=1;a<=n;a++)for(const b of [...graph[a]].sort((x,y)=>x-y)){if(b<=a)continue;const common=[...graph[b]].filter(c=>c>b&&graph[a].has(c));for(const c of common)triangles.push([a,b,c]);count+=common.length;emit('Require a<b<c so rotations and reverse traversal do not recount the same three-room cycle. The third room must connect to both endpoints of this edge.',{sequence:Array.from({length:n},(_,i)=>i+1),index:a-1,marks:{[b-1]:'second room'},table:[...triangles],tableHeaders:['Smallest room','Middle room','Largest room'],codeStage:'update',metrics:{a,b,newThirdRooms:common.join(', ')||'none',count}},'update');}return count;},
2078({colors},emit){let best=0;for(let i=0;i<colors.length;i++){const fromLeft=colors[i]!==colors[0]?i:0,fromRight=colors[i]!==colors.at(-1)?colors.length-1-i:0;best=Math.max(best,fromLeft,fromRight);emit('For a differing-color pair, extending one endpoint to the first or last house can preserve a color difference and cannot shorten the best attainable distance.',{index:i,marks:{0:'first house',[colors.length-1]:'last house'},codeStage:'update',metrics:{color:colors[i],fromLeft,fromRight,best}},'update');}return best;},
2079({plants,capacity},emit){let water=capacity,steps=0;for(let i=0;i<plants.length;i++){const before=water,refill=water<plants[i],extra=refill?2*i:0;if(refill){steps+=extra;water=capacity;}steps++;water-=plants[i];emit(refill?'Return from the previous plant to the river and back, adding twice the current index, then take the usual one forward step.':'The remaining water is sufficient, so take only the next forward step and water this plant.',{index:i,codeStage:'update',metrics:{plant:i,need:plants[i],waterBefore:before,refill,extraTravel:extra,waterAfter:water,steps}},'update');}return steps;},
2080({arr,queries},emit){const positions=new Map();arr.forEach((v,i)=>{if(!positions.has(v))positions.set(v,[]);positions.get(v).push(i);});const result=[];const bound=(list,value,upper)=>{let left=0,right=list.length;while(left<right){const middle=Math.floor((left+right)/2);if(list[middle]<value||upper&&list[middle]===value)left=middle+1;else right=middle;}return left;};for(const[left,right,value]of queries){const list=positions.get(value)||[],first=bound(list,left,false),after=bound(list,right,true),count=after-first;result.push(count);emit('Occurrence positions are already sorted because indexing scanned left to right. The lower bound includes positions equal to left, while the upper bound stops after positions equal to right.',{window:[left,right],output:[...result],table:list.map((position,i)=>[i,position,i>=first&&i<after?'included':'outside']),tableHeaders:['Occurrence rank','Array position','Range status'],codeStage:'update',metrics:{left,right,value,firstOccurrence:first,afterLastOccurrence:after,count}},'update');}return result;},
};
const python={
2073:`def timeRequiredToBuy(tickets, k):
    rounds = tickets[k]
    total = 0
    for i, requested in enumerate(tickets):
        cap = rounds - (i > k)
        total += min(requested, cap)  # step: update
    return total  # step: return`,
2075:`def decodeCiphertext(encodedText, rows):
    columns = len(encodedText) // rows
    output = []
    for start in range(columns):
        row, col = 0, start
        while row < rows and col < columns:
            output.append(encodedText[row * columns + col])  # step: update
            row += 1
            col += 1
    return ''.join(output).rstrip(' ')  # step: return`,
2076:`def friendRequests(n, restrictions, requests):
    parent, size = list(range(n)), [1] * n
    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node
    result = []
    for a, b in requests:
        root_a, root_b = find(a), find(b)
        accepted = True
        if root_a != root_b:
            for x, y in restrictions:
                rx, ry = find(x), find(y)
                if (rx == root_a and ry == root_b) or (rx == root_b and ry == root_a):
                    accepted = False
                    break
        if accepted and root_a != root_b:
            if size[root_a] < size[root_b]:
                root_a, root_b = root_b, root_a
            parent[root_b] = root_a
            size[root_a] += size[root_b]
        result.append(accepted)  # step: update
    return result  # step: return`,
2077:`def numberOfPaths(n, corridors):
    graph = [set() for _ in range(n + 1)]
    for a, b in corridors:
        graph[a].add(b)
        graph[b].add(a)
    count = 0
    for a in range(1, n + 1):
        for b in sorted(graph[a]):
            if b <= a:
                continue
            count += sum(c > b and c in graph[a] for c in graph[b])  # step: update
    return count  # step: return`,
2078:`def maxDistance(colors):
    best = 0
    for i, color in enumerate(colors):
        if color != colors[0]:
            best = max(best, i)
        if color != colors[-1]:
            best = max(best, len(colors) - 1 - i)
        # step: update
    return best  # step: return`,
2079:`def wateringPlants(plants, capacity):
    water, steps = capacity, 0
    for i, need in enumerate(plants):
        if water < need:
            steps += 2 * i
            water = capacity
        steps += 1
        water -= need  # step: update
    return steps  # step: return`,
2080:`class RangeFreqQuery:
    def __init__(self, arr):
        self.positions = {}
        for index, value in enumerate(arr):
            self.positions.setdefault(value, []).append(index)

    def query(self, left, right, value):
        from bisect import bisect_left, bisect_right
        positions = self.positions.get(value, [])
        return bisect_right(positions, right) - bisect_left(positions, left)

def runQueries(arr, queries):
    index = RangeFreqQuery(arr)
    result = []
    for left, right, value in queries:
        result.append(index.query(left, right, value))  # step: update
    return result  # step: return`,
};
const cases={
2073:[['Earlier and later customers leave in different rounds',{tickets:[4,2,7,3,6,1,5,2],k:4}],['The target needs only its first ticket',{tickets:[8,3,1,9,4],k:2}],['Target at the very front',{tickets:[3,7,2,5],k:0}],['Target at the very back',{tickets:[5,1,4,2],k:3}]],
2075:[['A longer message contains internal spaces and trailing padding',{encodedText:['reltnl  ',' irae o ','  v nrgw'].join(''),rows:3}],['One row preserves internal spaces',{encodedText:'quiet harbor  ',rows:1}],['Only padding decodes to an empty message',{encodedText:'        ',rows:2}],['A diagonal stops at the right edge before the last row',{encodedText:['ab',' c','  ','  '].join(''),rows:4}]],
2076:[['Indirect components make later requests invalid',{n:8,restrictions:[[0,5],[2,6],[3,7]],requests:[[0,1],[1,2],[4,5],[2,4],[3,6],[1,6],[5,7],[0,2]]}],['A direct restricted pair is rejected',{n:3,restrictions:[[0,2]],requests:[[0,2],[0,1],[1,2]]}],['Repeated friendships inside one component are accepted',{n:4,restrictions:[],requests:[[0,1],[1,2],[0,2],[2,3],[0,3]]}],['A rejected request must not partially merge components',{n:4,restrictions:[[0,3]],requests:[[0,1],[2,3],[1,2],[0,2]]}]],
2077:[['Several triangles share corridors',{n:7,corridors:[[1,2],[2,3],[1,3],[2,4],[3,4],[4,5],[5,6],[4,6],[6,7],[5,7]]}],['A four-room cycle is not a three-room cycle',{n:4,corridors:[[1,2],[2,3],[3,4],[4,1]]}],['A complete four-room graph has overlapping triples',{n:4,corridors:[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]}],['Disconnected edges form no cycle',{n:6,corridors:[[1,2],[3,4],[5,6]]}]],
2078:[['Matching endpoint colors require an interior different color',{colors:[4,4,2,7,4,1,4,4,4]}],['Different endpoint colors give the full span',{colors:[3,5,5,8,9]}],['Only one interior house differs',{colors:[6,6,6,2,6,6]}],['Two different houses form the smallest input',{colors:[8,1]}]],
2079:[['Different water needs trigger several river returns',{plants:[3,5,2,6,4,1,7,3],capacity:9}],['Exact remaining water does not require a refill',{plants:[4,3,2],capacity:9}],['Every plant requires a full can',{plants:[6,6,6,6],capacity:6}],['One plant is one step away',{plants:[5],capacity:8}]],
2080:[['Occurrence positions answer overlapping ranges',{arr:[7,3,7,11,5,3,7,9,11,3,5,7,3,9,11,7],queries:[[0,15,7],[3,10,3],[4,12,5],[6,6,7],[0,5,13],[8,15,11]]}],['An absent value has an empty position list',{arr:[2,4,6,8],queries:[[0,3,5],[1,2,9]]}],['Equal inclusive endpoints inspect one position',{arr:[12,8,12],queries:[[0,0,12],[1,1,12],[2,2,12]]}],['All values equal create a dense occurrence list',{arr:[6,6,6,6,6],queries:[[0,4,6],[1,3,6],[2,2,6]]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2073)need(vector(input.tickets)&&integer(input.k,0,input.tickets.length-1),'Use 1-80 positive ticket requests and a valid zero-based target index.');
  if(id===2075)need(typeof input.encodedText==='string'&&/^[a-z ]{1,160}$/.test(input.encodedText)&&integer(input.rows,1,8)&&input.encodedText.length%input.rows===0&&input.encodedText.length/input.rows<=20,'Use lowercase letters and spaces filling 1-8 rows with at most 20 columns.');
  if(id===2076){need(integer(input.n,2,30),'Use 2-30 users.');for(const key of ['restrictions','requests'])need(Array.isArray(input[key])&&input[key].length<=80&&input[key].every(pair=>Array.isArray(pair)&&pair.length===2&&integer(pair[0],0,input.n-1)&&integer(pair[1],0,input.n-1)&&pair[0]!==pair[1]),'Use bounded pairs of distinct valid user IDs.');need(input.requests.length>=1,'Provide at least one friendship request.');need(new Set(input.restrictions.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size===input.restrictions.length,'Do not repeat a restricted pair.');}
  if(id===2077)need(integer(input.n,3,30)&&Array.isArray(input.corridors)&&input.corridors.length>=1&&input.corridors.length<=100&&input.corridors.every(pair=>Array.isArray(pair)&&pair.length===2&&integer(pair[0],1,input.n)&&integer(pair[1],1,input.n)&&pair[0]!==pair[1])&&new Set(input.corridors.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size===input.corridors.length,'Use 3-30 rooms and distinct undirected corridors with one-based endpoints.');
  if(id===2078)need(vector(input.colors,0)&&input.colors.length>=2&&new Set(input.colors).size>=2,'Use 2-80 nonnegative color labels with at least two distinct colors.');
  if(id===2079)need(vector(input.plants)&&integer(input.capacity,Math.max(...input.plants)),'Use 1-80 positive plant needs and capacity at least the largest need, at most 10000.');
  if(id===2080)need(vector(input.arr)&&Array.isArray(input.queries)&&input.queries.length>=1&&input.queries.length<=60&&input.queries.every(q=>Array.isArray(q)&&q.length===3&&integer(q[0],0,input.arr.length-1)&&integer(q[1],q[0],input.arr.length-1)&&integer(q[2],1)),'Use a positive array and 1-60 valid inclusive [left,right,value] queries.');
  return input;
}
export default {specs,solvers,python,cases,validate,tags:{2073:['Counting'],2075:['Matrix','String'],2076:['Union Find'],2077:['Graph'],2078:['Array'],2079:['Simulation'],2080:['Design','Binary Search']}};
