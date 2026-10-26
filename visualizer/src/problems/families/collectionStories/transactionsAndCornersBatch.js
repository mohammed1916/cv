const specs={
2237:['n lights requirement','Count street positions meeting their individual brightness requirements.','Each light adds one across a clipped interval. A difference array records only interval boundaries, and its prefix sum gives the brightness at every street position.','record each light interval as a start and end difference|prefix-sum differences along the street|compare brightness with the local requirement|count positions meeting their own threshold|return the compliant position count','O(n+lights) time and O(n) space.'],
2239:['nums','Find the value closest to zero, preferring the positive value on equal distance.','Compare absolute distance first. When distances tie, the numerically larger value is the positive one and wins the specified tie-break.','start with the first value as the candidate|compare each absolute distance with the best|replace the candidate for a smaller distance|on equal distance keep the larger signed value|return the chosen number','O(n) time; O(1) state.'],
2240:['total cost1 cost2','Count affordable combinations of two item types, including buying none.','Fix a count of the more expensive item to reduce the number of iterations. The remaining budget allows every count from zero through the affordable maximum of the other item.','choose the more expensive item as the outer count|enumerate each affordable count of that item|compute the remaining budget|add all affordable counts of the other item including zero|return the number of combinations','O(total/max(cost1,cost2)+1) time; O(1) space.'],
2241:['operations','Simulate ATM deposits and largest-denomination-first withdrawals without partial failed transactions.','Attempt a withdrawal using a temporary note selection from 500 down to 20. Commit inventory changes only when the whole amount is formed; the mandated greedy rule can fail even if a different combination exists.','maintain note counts for 20 50 100 200 and 500|add deposited note counts|try withdrawals greedily from the largest denomination|commit only a complete withdrawal and otherwise retain inventory|return null for deposits and selected counts or [-1] for withdrawals','O(5) per operation; O(5) inventory space.'],
2242:['scores edges','Find the highest-scoring sequence of four distinct adjacent vertices.','Treat each edge as the middle pair. Each endpoint needs one extra neighbor; retaining its top three neighbors is sufficient because at most two conflicting vertices are forbidden.','keep the three highest-scoring neighbors of each vertex|choose each edge as the middle pair|combine one retained outer neighbor from each side|reject repeated vertices and maximize the four-score sum|return the best score or -1 when no sequence exists','O(E log V) neighbor sorting time plus O(E) candidate checks; O(V+E) space.'],
2243:['s k','Repeatedly replace groups of k digits by their digit sums until the string is short enough.','Read each round from an unchanged source string. Each group sum may have more than one digit, so concatenate decimal sums before deciding whether another round is needed.','while the string is longer than k split it into groups|sum the digits of each group|append each sum decimal representation|join the round output and repeat|return the final string','O(total characters processed across rounds) time; O(maximum string length) space.'],
2244:['tasks','Finish tasks in the fewest rounds of two or three equal-difficulty tasks.','Each difficulty is independent. A single occurrence is impossible; every count at least two is representable by twos and threes, with minimum rounds equal to the count divided by three rounded up.','count tasks of each difficulty|reject a difficulty appearing once|use as many groups of three as possible|replace a remainder of one with two groups of two|return the total minimum rounds','O(n) expected time and O(distinct difficulties) space.'],
2245:['grid','Maximize trailing zeros in the product along a path with at most one corner.','Trailing zeros depend on the minimum of total factors of two and five. Row and column prefix sums evaluate four boundary-reaching L shapes at every corner, subtracting the corner factor once.','factor each cell into counts of twos and fives|build row and column prefix sums for those counts|combine each horizontal and vertical direction at every corner|subtract the duplicated corner and compare minimum factor totals|return the largest trailing-zero count','O(rows*columns*log(max cell)) factoring time plus O(rows*columns) scans; O(rows*columns) space.'],
};
const solvers={
2237({n,lights,requirement},emit){const difference=Array(n+1).fill(0);for(const[position,radius]of lights){const left=Math.max(0,position-radius),right=Math.min(n-1,position+radius);difference[left]++;difference[right+1]--;emit('One light adds brightness across its clipped interval. Boundary differences record this range contribution without visiting every covered position yet.',{sequence:difference,window:[left,right],codeStage:'light',metrics:{position,radius,left,right}},'update');}let brightness=0,count=0;const levels=[];for(let i=0;i<n;i++){brightness+=difference[i];levels.push(brightness);const meets=brightness>=requirement[i];count+=Number(meets);emit('The running prefix sum is the number of lights covering this position. Compare it with this position own requirement, which can differ from its neighbors.',{sequence:requirement,index:i,output:[...levels],codeStage:'position',metrics:{position:i,brightness,required:requirement[i],meets,count}},'update');}return count;},
2239({nums},emit){let best=nums[0];for(let i=0;i<nums.length;i++){const value=nums[i];if(Math.abs(value)<Math.abs(best)||(Math.abs(value)===Math.abs(best)&&value>best))best=value;emit('Use absolute value for distance, then prefer the larger signed value when distances tie. Zero, when present, cannot be improved.',{index:i,codeStage:'compare',metrics:{value,distance:Math.abs(value),best,bestDistance:Math.abs(best)}},'update');}return best;},
2240({total,cost1,cost2},emit){const expensive=Math.max(cost1,cost2),cheap=Math.min(cost1,cost2);let ways=0;for(let count=0;count*expensive<=total;count++){const remaining=total-count*expensive,other=Math.floor(remaining/cheap),added=other+1;ways+=added;emit('With this count of the expensive item fixed, every cheaper-item count from zero through the affordable maximum is a distinct valid combination.',{codeStage:'count',table:[[cost1>=cost2?'first':'second',count],[cost1>=cost2?'second':'first',`0..${other}`]],tableHeaders:['Item type','Possible count'],metrics:{expensiveCount:count,remaining,maxOtherCount:other,added,ways}},'update');}return ways;},
2241({operations},emit){const denominations=[20,50,100,200,500],inventory=Array(5).fill(0),answer=[];for(let operation=0;operation<operations.length;operation++){const[type,argument]=operations[operation];if(type==='deposit'){argument.forEach((count,i)=>inventory[i]+=count);answer.push(null);emit('Add every deposited note count to the corresponding denomination inventory.',{table:denominations.map((value,i)=>[value,inventory[i]]),tableHeaders:['Denomination','Available notes'],output:[...answer],codeStage:'deposit',metrics:{operation:operation+1}},'update');}else{let remaining=argument;const selected=Array(5).fill(0);for(let i=4;i>=0;i--){selected[i]=Math.min(inventory[i],Math.floor(remaining/denominations[i]));remaining-=selected[i]*denominations[i];emit('Choose as many notes as possible of this denomination before considering smaller notes. These are tentative counts; inventory is not changed until the entire amount is formed.',{table:denominations.map((value,j)=>[value,inventory[j],selected[j]]),tableHeaders:['Denomination','Inventory before attempt','Tentative selection'],codeStage:'choose',metrics:{operation:operation+1,requested:argument,denomination:denominations[i],selected:selected[i],remaining}},'update');}if(remaining===0){selected.forEach((count,i)=>inventory[i]-=count);answer.push([...selected]);}else answer.push([-1]);emit(remaining===0?'The whole amount was formed, so commit all selected-note deductions atomically.':'The greedy selection cannot form the amount. Reject the withdrawal and preserve every inventory count.',{table:denominations.map((value,i)=>[value,inventory[i]]),tableHeaders:['Denomination','Committed inventory'],output:[...answer],codeStage:'commit',metrics:{operation:operation+1,success:remaining===0,unfilled:remaining}},'update');}}return answer;},
2242({scores,edges},emit){const neighbors=scores.map(()=>[]);for(const[a,b]of edges){neighbors[a].push(b);neighbors[b].push(a);}neighbors.forEach(row=>row.sort((a,b)=>scores[b]-scores[a]||a-b));const top=neighbors.map(row=>row.slice(0,3));let best=-1;for(const[u,v]of edges){const candidates=[];for(const a of top[u])for(const b of top[v]){if(a===v||b===u||a===b)continue;const score=scores[a]+scores[u]+scores[v]+scores[b];best=Math.max(best,score);candidates.push([`${a}, ${u}, ${v}, ${b}`,score]);}emit('This edge is the middle of the four-node sequence. Exclude reused vertices; three top neighbors per endpoint suffice because only the opposite middle vertex and the other outer endpoint can be forbidden.',{sequence:scores,marks:{[u]:'middle left',[v]:'middle right'},table:candidates,tableHeaders:['Four distinct vertices','Score'],codeStage:'edge',metrics:{middleLeft:u,middleRight:v,leftCandidates:top[u].join(', '),rightCandidates:top[v].join(', '),best}},'update');}return best;},
2243({s,k},emit){let current=s,round=0;while(current.length>k){round++;const parts=[];for(let start=0;start<current.length;start+=k){const group=current.slice(start,start+k),sum=[...group].reduce((a,c)=>a+Number(c),0);parts.push(String(sum));emit('Sum this group from the unchanged round input. Append the full decimal sum, which may contain more than one digit.',{sequence:[...current],window:[start,Math.min(current.length-1,start+k-1)],output:[...parts],codeStage:'group',metrics:{round,group,sum}},'update');}current=parts.join('');emit('Concatenate all group sums to form the next round input. Stop only when its character length is at most k.',{sequence:[...current],codeStage:'round',metrics:{round,nextString:current,length:current.length,k}},'update');}return current;},
2244({tasks},emit){const counts=new Map();tasks.forEach(task=>counts.set(task,(counts.get(task)||0)+1));let total=0;for(const[difficulty,count]of counts){if(count===1){emit('One task of this difficulty cannot form a round of either two or three, so completing all tasks is impossible.',{codeStage:'failed',metrics:{difficulty,count}});return-1;}const twos=count%3===1?2:count%3===2?1:0,threes=(count-2*twos)/3,rounds=twos+threes;total+=rounds;emit('Favor triples. A remainder of one cannot stand alone, so convert one triple plus that remainder into two pairs.',{table:[...counts],tableHeaders:['Difficulty','Task count'],codeStage:'rounds',metrics:{difficulty,count,pairRounds:twos,tripleRounds:threes,rounds,total}},'update');}return total;},
2245({grid},emit){const rows=grid.length,cols=grid[0].length,factors=grid.map(row=>row.map(value=>{let two=0,five=0;while(value%2===0){two++;value/=2;}while(value%5===0){five++;value/=5;}return[two,five];})),rowPrefix=Array.from({length:rows},()=>Array.from({length:cols+1},()=>[0,0])),colPrefix=Array.from({length:rows+1},()=>Array.from({length:cols},()=>[0,0]));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)for(let f=0;f<2;f++){rowPrefix[r][c+1][f]=rowPrefix[r][c][f]+factors[r][c][f];colPrefix[r+1][c][f]=colPrefix[r][c][f]+factors[r][c][f];}let best=0;const bestAt=grid.map(row=>row.map(()=>null));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const left=rowPrefix[r][c+1],right=rowPrefix[r][cols].map((v,f)=>v-rowPrefix[r][c][f]),up=colPrefix[r+1][c],down=colPrefix[rows][c].map((v,f)=>v-colPrefix[r][c][f]),choices=[];for(const[h,hv]of [['left',left],['right',right]])for(const[v,vv]of [['up',up],['down',down]]){const twos=hv[0]+vv[0]-factors[r][c][0],fives=hv[1]+vv[1]-factors[r][c][1],zeros=Math.min(twos,fives);choices.push([`${h} + ${v}`,twos,fives,zeros]);best=Math.max(best,zeros);}bestAt[r][c]=Math.max(...choices.map(row=>row[3]));emit('Combine one horizontal ray and one vertical ray through this corner. Both include the corner cell, so subtract its factors once; each trailing zero consumes one factor two and one factor five.',{matrix:grid,cell:[r,c],outputMatrix:bestAt,outputMatrixLabel:'Best trailing zeros by corner',outputCell:[r,c],table:choices,tableHeaders:['Directions','Factors of two','Factors of five','Trailing zeros'],codeStage:'corner',metrics:{row:r,column:c,cellTwos:factors[r][c][0],cellFives:factors[r][c][1],best}},'update');}return best;},
};
const python={
2237:`def meetRequirement(n, lights, requirement):
    difference = [0] * (n + 1)
    for position, radius in lights:
        left, right = max(0, position - radius), min(n - 1, position + radius)
        difference[left] += 1
        difference[right + 1] -= 1  # step: light
    brightness = count = 0
    for i in range(n):
        brightness += difference[i]
        count += int(brightness >= requirement[i])  # step: position
    return count  # step: return`,
2239:`def findClosestNumber(nums):
    best = nums[0]
    for value in nums:
        if abs(value) < abs(best) or (abs(value) == abs(best) and value > best):
            best = value
        # step: compare
    return best  # step: return`,
2240:`def waysToBuyPensPencils(total, cost1, cost2):
    expensive, cheap = max(cost1, cost2), min(cost1, cost2)
    ways = 0
    for count in range(total // expensive + 1):
        remaining = total - count * expensive
        ways += remaining // cheap + 1  # step: count
    return ways  # step: return`,
2241:`class ATM:
    def __init__(self):
        self.denominations = [20, 50, 100, 200, 500]
        self.inventory = [0] * 5

    def deposit(self, banknotesCount):
        for i, count in enumerate(banknotesCount):
            self.inventory[i] += count
        # step: deposit

    def withdraw(self, amount):
        remaining, selected = amount, [0] * 5
        for i in range(4, -1, -1):
            selected[i] = min(self.inventory[i], remaining // self.denominations[i])
            remaining -= selected[i] * self.denominations[i]  # step: choose
        if remaining == 0:
            for i, count in enumerate(selected):
                self.inventory[i] -= count
            result = selected
        else:
            result = [-1]
        return result  # step: commit

def runATM(operations):
    atm, answer = ATM(), []
    for operation, argument in operations:
        answer.append(getattr(atm, operation)(argument))
    return answer  # step: return`,
2242:`def maximumScore(scores, edges):
    neighbors = [[] for _ in scores]
    for a, b in edges:
        neighbors[a].append(b)
        neighbors[b].append(a)
    top = [sorted(row, key=lambda v: (-scores[v], v))[:3] for row in neighbors]
    best = -1
    for u, v in edges:
        for a in top[u]:
            for b in top[v]:
                if a != v and b != u and a != b:
                    best = max(best, scores[a] + scores[u] + scores[v] + scores[b])
        # step: edge
    return best  # step: return`,
2243:`def digitSum(s, k):
    current = s
    while len(current) > k:
        parts = []
        for start in range(0, len(current), k):
            group = current[start:start + k]
            parts.append(str(sum(map(int, group))))  # step: group
        current = ''.join(parts)  # step: round
    return current  # step: return`,
2244:`def minimumRounds(tasks):
    from collections import Counter
    total = 0
    for difficulty, count in Counter(tasks).items():
        if count == 1:
            return -1  # step: failed
        twos = 2 if count % 3 == 1 else 1 if count % 3 == 2 else 0
        threes = (count - 2 * twos) // 3
        total += twos + threes  # step: rounds
    return total  # step: return`,
2245:`def maxTrailingZeros(grid):
    rows, cols = len(grid), len(grid[0])
    def factor(value):
        two = five = 0
        while value % 2 == 0:
            two += 1
            value //= 2
        while value % 5 == 0:
            five += 1
            value //= 5
        return [two, five]
    factors = [[factor(value) for value in row] for row in grid]
    row_prefix = [[[0, 0] for _ in range(cols + 1)] for _ in range(rows)]
    col_prefix = [[[0, 0] for _ in range(cols)] for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            for f in range(2):
                row_prefix[r][c + 1][f] = row_prefix[r][c][f] + factors[r][c][f]
                col_prefix[r + 1][c][f] = col_prefix[r][c][f] + factors[r][c][f]
    best = 0
    for r in range(rows):
        for c in range(cols):
            left = row_prefix[r][c + 1]
            right = [row_prefix[r][cols][f] - row_prefix[r][c][f] for f in range(2)]
            up = col_prefix[r + 1][c]
            down = [col_prefix[rows][c][f] - col_prefix[r][c][f] for f in range(2)]
            for horizontal in (left, right):
                for vertical in (up, down):
                    twos, fives = [horizontal[f] + vertical[f] - factors[r][c][f] for f in range(2)]
                    best = max(best, min(twos, fives))
            # step: corner
    return best  # step: return`,
};
const cases={
2237:[['Overlapping light intervals meet different local thresholds',{n:12,lights:[[1,2],[4,3],[7,2],[10,3],[5,0]],requirement:[1,1,2,2,3,3,2,2,3,2,1,1]}],['No lights still meets zero requirements',{n:5,lights:[],requirement:[0,1,0,2,0]}],['A large radius is clipped to both street ends',{n:4,lights:[[2,10]],requirement:[1,1,2,0]}],['A zero-radius light affects only its own position',{n:3,lights:[[1,0]],requirement:[1,1,1]}]],
2239:[['Signed candidates improve distance and later resolve a tie',{nums:[-18,9,-7,12,-3,8,3,-11,6]}],['Zero wins over every nonzero candidate',{nums:[-4,7,0,2]}],['Only negative values favor the least negative magnitude',{nums:[-15,-2,-9,-6]}],['A positive value wins an equal-distance tie',{nums:[-5,5]}]],
2240:[['Many expensive-item counts leave different cheaper-item ranges',{total:1234,cost1:19,cost2:31}],['A zero budget still permits buying nothing',{total:0,cost1:7,cost2:11}],['Both items cost more than the budget',{total:5,cost1:8,cost2:13}],['Equal prices still represent distinct item-count combinations',{total:24,cost1:6,cost2:6}]],
2241:[['Deposits and successful withdrawals change later availability',{operations:[['deposit',[4,2,3,1,2]],['withdraw',770],['withdraw',60],['withdraw',600],['deposit',[2,1,0,1,0]],['withdraw',250],['withdraw',85]]}],['Greedy preference may reject a non-greedy possible amount',{operations:[['deposit',[0,0,0,3,1]],['withdraw',600],['withdraw',500],['withdraw',600]]}],['An empty ATM cannot fulfill a withdrawal',{operations:[['withdraw',20],['deposit',[1,0,0,0,0]],['withdraw',20]]}],['A failed attempt must preserve notes for a later request',{operations:[['deposit',[1,1,0,0,0]],['withdraw',60],['withdraw',70]]}]],
2242:[['Several middle edges compete with conflicting outer candidates',{scores:[8,17,6,25,11,19,4],edges:[[0,1],[1,2],[1,3],[2,3],[3,4],[4,5],[2,5],[5,6],[0,6]]}],['A star has no four-distinct-vertex simple path',{scores:[20,9,8,7,6],edges:[[0,1],[0,2],[0,3],[0,4]]}],['One chain supplies exactly one four-node sequence',{scores:[3,11,7,18],edges:[[0,1],[1,2],[2,3]]}],['Disconnected short components cannot supply four vertices',{scores:[4,8,12,16,20,24],edges:[[0,1],[1,2],[3,4]]}]],
2243:[['Several rounds concatenate multi-digit group sums',{s:'987654321998877665544',k:3}],['A short enough input is returned unchanged',{s:'507',k:4}],['All-zero groups may shorten without gaining digits',{s:'0000000000',k:2}],['Two-digit group sums can initially preserve length',{s:'99999999',k:2}]],
2244:[['Different task counts use triples pairs and remainder repair',{tasks:[4,4,4,4,7,7,7,7,7,9,9,9,12,12]}],['A singleton difficulty makes all work impossible',{tasks:[3,3,8,8,8,11]}],['Four equal tasks require two pairs',{tasks:[6,6,6,6]}],['Six equal tasks use two triples',{tasks:[15,15,15,15,15,15]}]],
2245:[['Factors of two and five are spread across different rays',{grid:[[4,25,6,10],[15,8,20,3],[2,50,12,5],[40,7,16,125]]}],['A grid with no factor five has no trailing zero product',{grid:[[2,4,8],[16,32,64]]}],['One row is a degenerate cornered path',{grid:[[5,4,25,8,10]]}],['One cell contributes its own trailing zeros',{grid:[[1000]]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2237)need(integer(input.n,1,80)&&Array.isArray(input.lights)&&input.lights.length<=60&&input.lights.every(p=>Array.isArray(p)&&p.length===2&&integer(p[0],0,input.n-1)&&integer(p[1],0,1000))&&vector(input.requirement)&&input.requirement.length===input.n,'Use 1-80 street positions, at most 60 [position,radius] lights, and one nonnegative requirement per position.');
  if(id===2239)need(vector(input.nums,-1000000),'Use 1-80 signed values within one million in magnitude.');
  if(id===2240)need(integer(input.total,0,100000)&&integer(input.cost1,1)&&integer(input.cost2,1)&&Math.floor(input.total/Math.max(input.cost1,input.cost2))<=500,'Use budget 0-100000 and positive prices, with at most 500 affordable units of the more expensive item for bounded enumeration.');
  if(id===2241)need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60&&input.operations.every(op=>Array.isArray(op)&&op.length===2&&((op[0]==='deposit'&&Array.isArray(op[1])&&op[1].length===5&&op[1].every(v=>integer(v)))||(op[0]==='withdraw'&&integer(op[1],1,1000000000)))),'Use 1-60 deposits with five nonnegative note counts or withdrawals of a positive integer amount.');
  if(id===2242)need(vector(input.scores,1,30)&&input.scores.length>=4&&Array.isArray(input.edges)&&input.edges.length<=80&&input.edges.every(e=>Array.isArray(e)&&e.length===2&&e.every(v=>integer(v,0,input.scores.length-1))&&e[0]!==e[1])&&new Set(input.edges.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(':'))).size===input.edges.length,'Use 4-30 positive vertex scores and at most 80 distinct undirected edges without self-loops.');
  if(id===2243)need(typeof input.s==='string'&&/^[0-9]{1,120}$/.test(input.s)&&integer(input.k,2,30),'Use 1-120 digits and group size 2-30.');
  if(id===2244)need(vector(input.tasks,1),'Use 1-80 positive task difficulty values.');
  if(id===2245)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=8&&input.grid.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.grid[0].length&&row.every(v=>integer(v,1))),'Use a positive integer grid at most eight by eight, with values at most one million.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2244&&result===-1?'failed':'return',pseudocodeStages:{2237:{light:1,position:4},2239:{compare:4},2240:{count:4},2241:{deposit:2,choose:3,commit:4},2242:{edge:4},2243:{group:3,round:4},2244:{failed:2,rounds:4},2245:{corner:4}},tags:{2237:['Prefix Sum'],2239:['Array'],2240:['Enumeration'],2241:['Design','Greedy'],2242:['Graph'],2243:['Simulation'],2244:['Greedy','Counting'],2245:['Matrix','Prefix Sum']}};
