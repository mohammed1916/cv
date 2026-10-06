const specs={
2064:['n quantities','Distribute product types across stores while minimizing the largest store load.','For a proposed load cap, each product type needs ceil(quantity/cap) stores because a store holds only one type. Binary search the smallest cap whose total required stores fits n.','search caps from one through the largest quantity|test the middle cap|sum ceiling divisions for required stores|lower the cap when feasible and raise it otherwise|return the smallest feasible maximum load','O(types*log maximum quantity) time; O(1) counting space.'],
2065:['values edges maxTime','Maximize unique node value along a walk that starts and ends at node zero within the time budget.','Backtrack feasible walks while counting each node value only on its first visit in the current walk. Shortest return distances prune moves that cannot get back to zero in time.','compute shortest return distances to zero|start a walk at zero with visit counts|try edges that still allow a timely return|add newly visited values and update the best only at zero|return the highest valid closed-walk quality','O(V^2+E+number of feasible walk states) reference time; O(V+E+walk depth) space.'],
2067:['s count','Count substrings in which every present character occurs exactly count times.','A valid substring with d distinct letters has length d*count. For each possible d, slide that fixed-length window while tracking how many character frequencies equal count.','choose a possible number of distinct letters|slide a window of length distinct*count|update the number of frequencies equal to count|count full windows with exactly that many matching frequencies|return the total equal-count substrings','O(26*n) time; O(26) frequency space.'],
2068:['word1 word2','Check whether the frequency difference of every letter is at most three.','Count each word separately and compare all letter counts. Matching overall length does not guarantee that any individual letter stays within the allowed difference.','count letters in both words|inspect each lowercase letter|compute the absolute frequency difference|reject when a difference exceeds three|return whether all letters satisfy the bound','O(word length+alphabet) time; O(26) space.'],
2069:['width height operations','Simulate a robot moving counterclockwise around a rectangular boundary.','Represent its location by distance along the perimeter. Reduce large moves modulo the perimeter, while remembering whether it has moved so returning to the origin faces south rather than the initial east.','start at the origin facing east|apply step commands modulo the perimeter|decode the perimeter offset into coordinates|use the arrival direction at corners and distinguish the untouched origin|return query results with null for step commands','O(operations) time; O(1) robot state.'],
2070:['items queries','For each price budget return the greatest beauty of an affordable item.','Sort items and indexed queries by price. A forward sweep adds each newly affordable item once and retains the largest beauty, then places answers back in original query order.','sort items and queries by price|advance through queries from smallest budget|include all items priced at most this budget|record the best beauty at the query original index|return answers in original order','O(items log items+queries log queries) time; O(items+queries) copied space.'],
2071:['tasks workers pills strength','Assign the largest number of tasks using one optional strength pill per worker.','Binary search the count using easiest tasks and strongest workers. Process those workers from weakest upward: use an easy task without a pill when possible, otherwise spend a pill on the hardest currently reachable task.','sort tasks and workers and search an assignment count|check the easiest tasks against the strongest workers|queue tasks reachable with a pill for each worker|take the easiest unboosted task or hardest boosted task when a pill is needed|return the maximum feasible task count','O(n log n+m log m+min(n,m)*log min(n,m)) time; O(n+m) space.'],
};
const robotState=(width,height,offset,moved)=>{const perimeter=2*(width+height)-4;let x,y,direction;if(offset<=width-1){x=offset;y=0;direction=offset===0&&moved?'South':'East';}else if(offset<=width+height-2){x=width-1;y=offset-width+1;direction='North';}else if(offset<=2*width+height-3){x=2*width+height-3-offset;y=height-1;direction='West';}else{x=0;y=perimeter-offset;direction='South';}return{x,y,direction};};
const robotDiagram=(width,height,state)=>({points:[],query:{x:state.x,y:state.y},queryLabel:'robot',heading:state.direction,outlineLabel:'room boundary',square:[{x:0,y:0},{x:width-1,y:0},{x:width-1,y:height-1},{x:0,y:height-1}]});
const solvers={
2064({n,quantities},emit){let low=1,high=Math.max(...quantities);while(low<high){const cap=Math.floor((low+high)/2),stores=quantities.map(q=>Math.ceil(q/cap)),required=stores.reduce((a,b)=>a+b,0);emit('Each type occupies its own collection of stores, so round its required store count upward separately. More available stores make a smaller load cap possible.',{sequence:quantities,table:quantities.map((q,i)=>[i,q,stores[i]]),tableHeaders:['Product type','Quantity','Stores needed'],codeStage:'update',metrics:{low,high,cap,required,available:n,feasible:required<=n}},'update');if(required<=n)high=cap;else low=cap+1;}return low;},
2065({values,edges,maxTime},emit){const n=values.length,graph=values.map(()=>[]);for(const[a,b,cost]of edges){graph[a].push([b,cost]);graph[b].push([a,cost]);}const distance=Array(n).fill(Infinity),settled=Array(n).fill(false);distance[0]=0;for(let round=0;round<n;round++){let node=-1;for(let i=0;i<n;i++)if(!settled[i]&&(node<0||distance[i]<distance[node]))node=i;if(node<0||!Number.isFinite(distance[node]))break;settled[node]=true;for(const[next,cost]of graph[node])distance[next]=Math.min(distance[next],distance[node]+cost);}const visits=Array(n).fill(0),path=[];let best=0;function walk(node,elapsed,score){if(!visits[node])score+=values[node];visits[node]++;path.push(node);if(node===0)best=Math.max(best,score);emit('Repeated visits may help the route but do not add the same node value again. Only a return to zero certifies a completed walk; shortest return distances prevent exploring routes that cannot finish in time.',{sequence:values,index:node,marks:Object.fromEntries(visits.flatMap((count,i)=>count?[[i,'on current walk']]:[])),table:visits.map((count,i)=>[i,values[i],count,Number.isFinite(distance[i])?distance[i]:'unreachable']),tableHeaders:['Node','Value','Visits on walk','Shortest return time'],codeStage:'visit',metrics:{path:path.join(' -> '),elapsed,score,closed:node===0,best}},'update');for(const[next,cost]of graph[node])if(elapsed+cost+distance[next]<=maxTime)walk(next,elapsed+cost,score);path.pop();visits[node]--;}walk(0,0,0);return best;},
2067({s,count},emit){let total=0;for(let distinct=1;distinct<=26&&distinct*count<=s.length;distinct++){const width=distinct*count,frequency=Array(26).fill(0);let exact=0;const update=(character,delta)=>{const index=character.charCodeAt(0)-97;if(frequency[index]===count)exact--;frequency[index]+=delta;if(frequency[index]===count)exact++;};for(let right=0;right<s.length;right++){update(s[right],1);if(right>=width)update(s[right-width],-1);if(right+1>=width){const valid=exact===distinct;if(valid)total++;emit('The fixed window length is distinct times count. If that many character frequencies equal count, they already occupy every slot, leaving no extra unequal-frequency character.',{index:right,window:[right-width+1,right],table:frequency.flatMap((value,i)=>value?[[String.fromCharCode(97+i),value]]:[]),tableHeaders:['Letter','Window frequency'],codeStage:'update',metrics:{distinct,width,requiredFrequency:count,exactFrequencies:exact,valid,total}},'update');}}}return total;},
2068({word1,word2},emit){const a=Array(26).fill(0),b=Array(26).fill(0);for(const c of word1)a[c.charCodeAt(0)-97]++;for(const c of word2)b[c.charCodeAt(0)-97]++;let equivalent=true;for(let i=0;i<26;i++){if(!a[i]&&!b[i])continue;const difference=Math.abs(a[i]-b[i]);if(difference>3)equivalent=false;emit('Check each letter independently. A difference of exactly three is allowed, while four or more makes the words fail even if every other letter matches.',{sequence:[...word1],table:a.flatMap((count,j)=>count||b[j]?[[String.fromCharCode(97+j),count,b[j],Math.abs(count-b[j])]]:[]),tableHeaders:['Letter','First word','Second word','Difference'],codeStage:'update',metrics:{letter:String.fromCharCode(97+i),difference,equivalent}},'update');}return equivalent;},
2069({width,height,operations},emit){const perimeter=2*(width+height)-4,result=[];let offset=0,moved=false;for(let i=0;i<operations.length;i++){const[operation,steps]=operations[i];if(operation==='step'){offset=(offset+steps)%perimeter;if(steps>0)moved=true;}const state=robotState(width,height,offset,moved),answer=operation==='getPos'?[state.x,state.y]:operation==='getDir'?state.direction:null;result.push(answer);emit('Perimeter reduction handles long commands without simulating every step. Corner orientation is the direction of arrival; after a full circuit the origin faces south, unlike the untouched east-facing start.',{sequence:operations.map(op=>op.join(' ')),index:i,pointState:robotDiagram(width,height,state),output:[...result],codeStage:'update',metrics:{operation,steps:steps??'query',perimeter,offset,moved,...state}},'update');}return result;},
2070({items,queries},emit){const ordered=items.map(row=>[...row]).sort((a,b)=>a[0]-b[0]),indexed=queries.map((value,index)=>({value,index})).sort((a,b)=>a.value-b.value),answer=queries.map(()=>null);let item=0,best=0;for(const query of indexed){const added=[];while(item<ordered.length&&ordered[item][0]<=query.value){best=Math.max(best,ordered[item][1]);added.push(ordered[item]);item++;}answer[query.index]=best;emit('Budgets increase during the sweep, so previously affordable items stay eligible. Add only newly affordable items and store the answer at the query original index.',{sequence:queries,index:query.index,output:[...answer],outputIndex:query.index,table:ordered.map(([price,beauty],i)=>[price,beauty,i<item?'affordable':'too costly']),tableHeaders:['Price','Beauty','Status'],codeStage:'update',metrics:{budget:query.value,newItems:added.length,best}},'update');}return answer;},
2071({tasks,workers,pills,strength},emit){const jobs=[...tasks].sort((a,b)=>a-b),people=[...workers].sort((a,b)=>a-b);function feasible(count){const available=[],selected=people.slice(people.length-count);let front=0,next=0,remaining=pills;for(let i=0;i<selected.length;i++){const worker=selected[i];while(next<count&&jobs[next]<=worker+strength)available.push(jobs[next++]);let task=null,usedPill=false,success=true;if(front===available.length)success=false;else if(available[front]<=worker)task=available[front++];else if(remaining>0){task=available.pop();remaining--;usedPill=true;}else success=false;emit('A worker who can do the easiest available task should save a pill. When a pill is necessary, use its extra reach on the hardest queued task, preserving easier work for later workers.',{sequence:selected,index:i,output:available.slice(front),codeStage:'assign',metrics:{testedCount:count,worker,boostedStrength:worker+strength,task,usedPill,pillsLeft:remaining,success}},'update');if(!success)return false;}return true;}let low=0,high=Math.min(tasks.length,workers.length);while(low<high){const middle=Math.floor((low+high+1)/2);if(feasible(middle))low=middle;else high=middle-1;}return low;},
};
const python={
2064:`def minimizedMaximum(n, quantities):
    low, high = 1, max(quantities)
    while low < high:
        cap = (low + high) // 2
        required = sum((quantity + cap - 1) // cap for quantity in quantities)  # step: update
        if required <= n:
            high = cap
        else:
            low = cap + 1
    return low  # step: return`,
2065:`def maximalPathQuality(values, edges, maxTime):
    n = len(values)
    graph = [[] for _ in values]
    for a, b, cost in edges:
        graph[a].append((b, cost))
        graph[b].append((a, cost))
    distance, settled = [float('inf')] * n, [False] * n
    distance[0] = 0
    for _ in range(n):
        candidates = [i for i in range(n) if not settled[i]]
        if not candidates:
            break
        node = min(candidates, key=distance.__getitem__)
        if distance[node] == float('inf'):
            break
        settled[node] = True
        for neighbor, cost in graph[node]:
            distance[neighbor] = min(distance[neighbor], distance[node] + cost)
    visits, best = [0] * n, 0
    def walk(node, elapsed, score):
        nonlocal best
        if visits[node] == 0:
            score += values[node]
        visits[node] += 1
        if node == 0:
            best = max(best, score)
        # step: visit
        for neighbor, cost in graph[node]:
            if elapsed + cost + distance[neighbor] <= maxTime:
                walk(neighbor, elapsed + cost, score)
        visits[node] -= 1
    walk(0, 0, 0)
    return best  # step: return`,
2067:`def equalCountSubstrings(s, count):
    total = 0
    for distinct in range(1, min(26, len(s) // count) + 1):
        width = distinct * count
        frequency = [0] * 26
        exact = 0
        def update(character, delta):
            nonlocal exact
            index = ord(character) - ord('a')
            if frequency[index] == count:
                exact -= 1
            frequency[index] += delta
            if frequency[index] == count:
                exact += 1
        for right, character in enumerate(s):
            update(character, 1)
            if right >= width:
                update(s[right - width], -1)
            if right + 1 >= width:
                if exact == distinct:
                    total += 1
                # step: update
    return total  # step: return`,
2068:`def checkAlmostEquivalent(word1, word2):
    from collections import Counter
    first, second = Counter(word1), Counter(word2)
    equivalent = True
    for letter in sorted(first.keys() | second.keys()):
        if abs(first[letter] - second[letter]) > 3:
            equivalent = False
        # step: update
    return equivalent  # step: return`,
2069:`class Robot:
    def __init__(self, width, height):
        self.width, self.height = width, height
        self.perimeter = 2 * (width + height) - 4
        self.offset, self.moved = 0, False

    def step(self, num):
        self.offset = (self.offset + num) % self.perimeter
        self.moved = self.moved or num > 0

    def state(self):
        w, h, p = self.width, self.height, self.offset
        if p <= w - 1:
            return [p, 0], 'South' if p == 0 and self.moved else 'East'
        if p <= w + h - 2:
            return [w - 1, p - w + 1], 'North'
        if p <= 2 * w + h - 3:
            return [2 * w + h - 3 - p, h - 1], 'West'
        return [0, self.perimeter - p], 'South'

    def getPos(self):
        return self.state()[0]

    def getDir(self):
        return self.state()[1]

def runOperations(width, height, operations):
    robot = Robot(width, height)
    result = []
    for name, *arguments in operations:
        result.append(getattr(robot, name)(*arguments))  # step: update
    return result  # step: return`,
2070:`def maximumBeauty(items, queries):
    ordered = sorted(items)
    answer = [0] * len(queries)
    item = best = 0
    for budget, index in sorted((budget, i) for i, budget in enumerate(queries)):
        while item < len(ordered) and ordered[item][0] <= budget:
            best = max(best, ordered[item][1])
            item += 1
        answer[index] = best  # step: update
    return answer  # step: return`,
2071:`def maxTaskAssign(tasks, workers, pills, strength):
    from collections import deque
    jobs, people = sorted(tasks), sorted(workers)
    def feasible(count):
        available = deque()
        next_task, remaining = 0, pills
        for worker in people[len(people) - count:]:
            while next_task < count and jobs[next_task] <= worker + strength:
                available.append(jobs[next_task])
                next_task += 1
            success = True
            if not available:
                success = False
            elif available[0] <= worker:
                available.popleft()
            elif remaining:
                available.pop()
                remaining -= 1
            else:
                success = False
            # step: assign
            if not success:
                return False
        return True
    low, high = 0, min(len(jobs), len(people))
    while low < high:
        middle = (low + high + 1) // 2
        if feasible(middle):
            low = middle
        else:
            high = middle - 1
    return low  # step: return`,
};
const cases={
2064:[['Different product types require separately rounded store counts',{n:14,quantities:[23,17,41,8,29,12]}],['One store per type forces the largest quantity',{n:4,quantities:[9,24,15,6]}],['Enough stores allow one product per store',{n:20,quantities:[3,5,4]}],['One product type is split across many stores',{n:7,quantities:[38]}]],
2065:[['A valuable branch must still leave time to return',{values:[7,18,25,9,31,12],edges:[[0,1,10],[1,2,10],[2,0,20],[1,3,10],[3,4,10],[0,5,15]],maxTime:60}],['Repeated visits cannot collect the same value twice',{values:[5,17],edges:[[0,1,10]],maxTime:60}],['A distant high value cannot return before the deadline',{values:[4,11,99],edges:[[0,1,10],[1,2,25]],maxTime:40}],['No edge can be traversed and returned in time',{values:[13,27],edges:[[0,1,20]],maxTime:10}]],
2067:[['Different distinct-letter counts create different valid lengths',{s:'aabbccaabbbccddeedd',count:2}],['One repeated letter creates overlapping valid windows',{s:'aaaaaaa',count:3}],['Count one requires every present letter to be distinct',{s:'abacdefa',count:1}],['The required count exceeds the string length',{s:'cabin',count:8}]],
2068:[['Longer words redistribute a few occurrences per letter',{word1:'aabbccddeeffgg',word2:'abcdeffgabcdef'}],['A difference of exactly three remains allowed',{word1:'aaabbb',word2:'bbbccc'}],['A difference of four fails',{word1:'aaaabbbb',word2:'bbbbcccc'}],['Identical words trivially satisfy every bound',{word1:'lantern',word2:'lantern'}]],
2069:[['Commands visit corners and cross a full circuit',{width:6,height:4,operations:[['getPos'],['getDir'],['step',5],['getDir'],['step',3],['getPos'],['getDir'],['step',8],['getPos'],['getDir'],['step',19],['getPos'],['getDir']]}],['A full lap returns to the origin facing south',{width:4,height:3,operations:[['step',10],['getPos'],['getDir']]}],['Zero steps preserve the untouched initial direction',{width:3,height:3,operations:[['step',0],['getPos'],['getDir']]}],['Huge commands reduce modulo a small perimeter',{width:2,height:2,operations:[['step',1000000],['getPos'],['getDir'],['step',1],['getDir']]}]],
2070:[['Unsorted query budgets must keep their original output order',{items:[[8,17],[3,6],[12,24],[8,21],[5,13],[19,18],[14,31]],queries:[13,2,8,20,5,12]}],['Equal-price items compete by beauty',{items:[[7,3],[7,19],[7,11]],queries:[6,7,8]}],['Higher prices need not offer higher beauty',{items:[[2,40],[5,12],[9,6]],queries:[1,3,10]}],['One item and repeated budgets',{items:[[11,25]],queries:[11,11,10]}]],
2071:[['Pills and worker selection interact across several difficulty levels',{tasks:[6,11,4,15,9,18,7],workers:[3,8,12,5,16,9],pills:2,strength:5}],['No pills means only natural worker strength matters',{tasks:[5,9,14],workers:[4,8,13],pills:0,strength:20}],['One large boost should cover the hardest reachable task',{tasks:[4,10,12],workers:[3,9,10],pills:1,strength:9}],['Zero boost cannot change a failed assignment',{tasks:[8,13],workers:[6,7],pills:2,strength:0}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2064)need(vector(input.quantities,1,40)&&integer(input.n,input.quantities.length,10000),'Use 1-40 positive quantities and at least one available store per type.');
  if(id===2065){need(vector(input.values,0,20)&&Array.isArray(input.edges)&&input.edges.length<=40&&input.edges.every(e=>Array.isArray(e)&&e.length===3&&integer(e[0],0,input.values.length-1)&&integer(e[1],0,input.values.length-1)&&e[0]!==e[1]&&integer(e[2],10,60))&&new Set(input.edges.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size===input.edges.length&&integer(input.maxTime,0,60),'Use up to 20 nodes, distinct undirected edges of cost 10-60, and time budget at most 60 for bounded backtracking.');const degree=input.values.map(()=>0);for(const[a,b]of input.edges){degree[a]++;degree[b]++;}need(degree.every(d=>d<=4),'Each node may have at most four incident edges.');}
  if(id===2067)need(typeof input.s==='string'&&/^[a-z]{1,60}$/.test(input.s)&&integer(input.count,1,1000),'Use 1-60 lowercase letters and a positive required count up to 1000.');
  if(id===2068)need([input.word1,input.word2].every(s=>typeof s==='string'&&/^[a-z]{1,120}$/.test(s))&&input.word1.length===input.word2.length,'Use two equally long lowercase words of length 1-120.');
  if(id===2069)need(integer(input.width,2,20)&&integer(input.height,2,20)&&Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60&&input.operations.every(op=>Array.isArray(op)&&(op[0]==='step'?op.length===2&&integer(op[1],0,1000000):['getPos','getDir'].includes(op[0])&&op.length===1)),'Use dimensions 2-20 and step/getPos/getDir commands, with step sizes from zero to one million.');
  if(id===2070)need(Array.isArray(input.items)&&input.items.length>=1&&input.items.length<=50&&input.items.every(row=>Array.isArray(row)&&row.length===2&&row.every(v=>integer(v,1)))&&vector(input.queries,1,50),'Use positive [price,beauty] items and positive query budgets, at most 50 of each.');
  if(id===2071)need(vector(input.tasks,0,40)&&vector(input.workers,0,40)&&integer(input.pills,0,input.workers.length)&&integer(input.strength),'Use 1-40 nonnegative tasks and worker strengths, a valid pill count, and nonnegative boost.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===2069?{pointState:robotDiagram(input.width,input.height,{x:0,y:0,direction:'East'})}:{},pseudocodeStages:{2065:{visit:4},2071:{assign:4}},tags:{2064:['Binary Search'],2065:['Backtracking','Graph'],2067:['Sliding Window'],2068:['Counting'],2069:['Design','Simulation'],2070:['Sorting','Sweep Line'],2071:['Binary Search','Greedy']}};
