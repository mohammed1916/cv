const specs={
2144:['cost','Buy every candy at minimum cost when each paid pair can cover one no-more-expensive free candy.','Sort prices descending and process triples. Pay for the two most expensive remaining candies and make the third free, which uses each discount on the most valuable eligible candy.','sort candy costs from largest to smallest|visit candies in consecutive groups of three|pay for the first two positions in each group|make the third position free|return the paid total','O(n log n) time; O(n) sorting space.'],
2145:['differences lower upper','Count integer sequences within bounds having the supplied adjacent differences.','Every sequence is a translation of the prefix sums starting at zero. The prefix range consumes part of the allowed value range; the remaining room counts possible starting values.','start a zero-based prefix walk|track its minimum and maximum displacement|derive the allowed starting interval from both bounds|count integers in that interval if nonempty|return the number of valid sequences','O(n) time; O(1) auxiliary state.'],
2146:['grid pricing start k','Return the highest-ranked reachable items by distance price row and column.','BFS assigns shortest walking distances through non-wall cells. Gather in-range items, then order the candidates by the full ranking tuple before taking k.','start BFS at the given walkable cell|visit reachable neighbors once to establish shortest distances|collect item cells inside the price range|sort candidates by distance price row and column|return the first k item coordinates','O(rows*columns log(rows*columns)) time and O(rows*columns) space.'],
2147:['corridor','Count divider placements that give every corridor section exactly two seats.','Seat pairs determine the sections. Between the second seat of one pair and the first seat of the next pair, every boundary is a possible divider; multiply these independent gap counts.','record all seat positions|reject zero or odd seat counts|group seats into consecutive pairs|multiply boundary choices between neighboring pairs|return the product modulo one billion plus seven','O(n) time and O(seat count) space.'],
2148:['nums','Count elements having both a strictly smaller and a strictly larger value somewhere in the array.','An element qualifies exactly when it lies strictly between the global minimum and maximum. Equal copies of either extreme remain excluded.','find the global minimum and maximum|visit each occurrence|compare it strictly against both extremes|count qualifying occurrences|return the total','O(n) time; O(1) auxiliary space.'],
2149:['nums','Alternate positive and negative values while preserving each sign order.','Positive values occupy even output indices and negative values odd indices. Separate write pointers preserve encounter order within each sign group.','allocate the output and two sign-specific write positions|scan values in input order|write positives to the next even index|write negatives to the next odd index|return the alternating array','O(n) time and O(n) output space.'],
2150:['nums','Find values appearing once with neither neighboring integer present.','A frequency map separates uniqueness from adjacency. A value is lonely only when its count is one and both value-minus-one and value-plus-one are absent.','count every value|visit each distinct value|require a single occurrence|reject values with either adjacent integer present|return all lonely values','O(n) expected time and O(n) space.'],
2151:['statements','Find the largest group that can consistently be considered good.','Enumerate who is good. Only statements made by assumed-good people constrain the assignment; each known statement must agree with the target person status.','enumerate all good-person masks|inspect statements only from people marked good|reject a mask when a known statement contradicts it|maximize the good count among consistent masks|return the largest possible number of good people','O(2^n*n^2) time; O(1) auxiliary state excluding trace.'],
};
const solvers={
2144({cost},emit){const ordered=[...cost].sort((a,b)=>b-a);let total=0;for(let i=0;i<ordered.length;i++){const free=i%3===2;if(!free)total+=ordered[i];emit(free?'The two earlier candies in this triple are at least this expensive, so this candy is eligible to be free.':'Pay for this candy as one of the first two in its descending-price triple.',{sequence:ordered,index:i,marks:Object.fromEntries(ordered.map((_,j)=>[j,j%3===2?'free':'paid'])),codeStage:'buy',metrics:{price:ordered[i],free,total}},'update');}return total;},
2145({differences,lower,upper},emit){let prefix=0,min=0,max=0;for(let i=0;i<differences.length;i++){prefix+=differences[i];min=Math.min(min,prefix);max=Math.max(max,prefix);emit('All valid sequences shift this same prefix walk by their starting value. Its lowest and highest displacements constrain that shift from opposite sides.',{index:i,codeStage:'walk',metrics:{difference:differences[i],prefix,min,max,smallestStart:lower-min,largestStart:upper-max}},'update');}return Math.max(0,(upper-max)-(lower-min)+1);},
2146({grid,pricing,start,k},emit){const rows=grid.length,cols=grid[0].length,distance=grid.map(row=>row.map(()=>-1)),queue=[[...start]],items=[];distance[start[0]][start[1]]=0;for(let at=0;at<queue.length;at++){const[r,c]=queue[at],price=grid[r][c],d=distance[r][c];if(price>=pricing[0]&&price<=pricing[1]&&price>1)items.push([d,price,r,c]);for(const[dr,dc]of [[-1,0],[0,-1],[0,1],[1,0]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&grid[nr][nc]!==0&&distance[nr][nc]===-1){distance[nr][nc]=d+1;queue.push([nr,nc]);}}emit('BFS visits each walkable cell at its shortest distance. Price affects item ranking, not walking cost; out-of-range item cells remain traversable.',{matrix:grid,cell:[r,c],outputMatrix:distance,outputMatrixLabel:'Shortest distance (-1 means not reached)',outputCell:[r,c],table:[...items],tableHeaders:['Distance','Price','Row','Column'],codeStage:'visit',metrics:{row:r,column:c,distance:d,price,candidates:items.length}},'update');}items.sort((a,b)=>{for(let i=0;i<4;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;});const answer=items.slice(0,k).map(([, ,r,c])=>[r,c]);emit('Apply the full ranking tuple: shortest distance first, then lower price, then row, then column. Return at most k reachable candidates.',{table:items,tableHeaders:['Distance','Price','Row','Column'],codeStage:'rank',metrics:{requested:k,returned:answer.length}},'update');return answer;},
2147({corridor},emit){const seats=[...corridor].flatMap((c,i)=>c==='S'?[i]:[]);if(seats.length===0||seats.length%2){emit('A section requires exactly two seats, so zero seats or an odd total cannot form a valid partition.',{codeStage:'failed',metrics:{seats:seats.length}});return 0;}let ways=1;for(let i=2;i<seats.length;i+=2){const choices=seats[i]-seats[i-1];ways=ways*choices%1000000007;emit('The previous pair ends at its second seat and the next pair starts at its first seat. Any boundary in this gap separates those pairs, independently of other gaps.',{sequence:[...corridor],window:[seats[i-1],seats[i]],codeStage:'gap',metrics:{previousPairEnd:seats[i-1],nextPairStart:seats[i],dividerChoices:choices,ways}},'update');}return ways;},
2148({nums},emit){const min=Math.min(...nums),max=Math.max(...nums);let count=0;for(let i=0;i<nums.length;i++){const qualifies=nums[i]>min&&nums[i]<max;if(qualifies)count++;emit('Strict comparison excludes every copy of either global extreme. Each interior-valued occurrence has witnesses on both sides of its value.',{index:i,codeStage:'count',metrics:{value:nums[i],minimum:min,maximum:max,qualifies,count}},'update');}return count;},
2149({nums},emit){const answer=Array(nums.length).fill(null);let positive=0,negative=1;for(let i=0;i<nums.length;i++){const value=nums[i],position=value>0?positive:negative;answer[position]=value;if(value>0)positive+=2;else negative+=2;emit('Each sign writes to its own alternating positions. Scanning once in source order preserves the relative order of all positive values and all negative values.',{index:i,output:[...answer],outputIndex:position,codeStage:'write',metrics:{value,position,nextPositive:positive,nextNegative:negative}},'update');}return answer;},
2150({nums},emit){const counts=new Map(),answer=[];for(const value of nums)counts.set(value,(counts.get(value)||0)+1);for(const[value,count]of counts){const below=counts.has(value-1),above=counts.has(value+1),lonely=count===1&&!below&&!above;if(lonely)answer.push(value);emit('Uniqueness alone is insufficient: neighboring integer values also disqualify this candidate, regardless of where they occur.',{sequence:nums,index:nums.indexOf(value),table:[...counts],tableHeaders:['Value','Frequency'],output:[...answer],codeStage:'check',metrics:{value,count,hasPredecessor:below,hasSuccessor:above,lonely}},'update');}return answer;},
2151({statements},emit){const n=statements.length;let best=0;for(let mask=0;mask<2**n;mask++){let conflict=null;for(let speaker=0;speaker<n&&!conflict;speaker++)if(mask&(1<<speaker))for(let target=0;target<n;target++){const claim=statements[speaker][target];if(claim!==2&&claim!==Number(Boolean(mask&(1<<target)))){conflict=[speaker,target];break;}}const count=Array.from({length:n},(_,i)=>Number(Boolean(mask&(1<<i)))).reduce((a,b)=>a+b,0);if(!conflict)best=Math.max(best,count);emit(conflict?'A person assumed good makes a known statement that contradicts this assignment, so reject the whole mask.':'Every known statement from an assumed-good person agrees with this assignment. Statements from assumed-bad people impose no restriction.',{matrix:statements,cell:conflict,sequence:Array.from({length:n},(_,i)=>i),marks:Object.fromEntries(Array.from({length:n},(_,i)=>[i,mask&(1<<i)?'assumed good':'assumed bad'])),codeStage:'assignment',metrics:{mask:mask.toString(2).padStart(n,'0'),goodCount:count,consistent:!conflict,conflict:conflict?`${conflict[0]} about ${conflict[1]}`:'none',best}},'update');}return best;},
};
const python={
2144:`def minimumCost(cost):
    ordered = sorted(cost, reverse=True)
    total = 0
    for i, price in enumerate(ordered):
        if i % 3 != 2:
            total += price
        # step: buy
    return total  # step: return`,
2145:`def numberOfArrays(differences, lower, upper):
    prefix = minimum = maximum = 0
    for difference in differences:
        prefix += difference
        minimum = min(minimum, prefix)
        maximum = max(maximum, prefix)  # step: walk
    smallest_start, largest_start = lower - minimum, upper - maximum
    return max(0, largest_start - smallest_start + 1)  # step: return`,
2146:`def highestRankedKItems(grid, pricing, start, k):
    from collections import deque
    rows, cols = len(grid), len(grid[0])
    distance = [[-1] * cols for _ in range(rows)]
    distance[start[0]][start[1]] = 0
    queue, items = deque([tuple(start)]), []
    while queue:
        r, c = queue.popleft()
        price, d = grid[r][c], distance[r][c]
        if price > 1 and pricing[0] <= price <= pricing[1]:
            items.append((d, price, r, c))
        for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != 0 and distance[nr][nc] == -1:
                distance[nr][nc] = d + 1
                queue.append((nr, nc))
        # step: visit
    items.sort()  # step: rank
    return [[r, c] for _, _, r, c in items[:k]]  # step: return`,
2147:`def numberOfWays(corridor):
    seats = [i for i, char in enumerate(corridor) if char == 'S']
    if not seats or len(seats) % 2:
        return 0  # step: failed
    ways = 1
    for i in range(2, len(seats), 2):
        ways = ways * (seats[i] - seats[i - 1]) % 1_000_000_007  # step: gap
    return ways  # step: return`,
2148:`def countElements(nums):
    minimum, maximum = min(nums), max(nums)
    count = 0
    for value in nums:
        if minimum < value < maximum:
            count += 1
        # step: count
    return count  # step: return`,
2149:`def rearrangeArray(nums):
    answer = [None] * len(nums)
    positive, negative = 0, 1
    for value in nums:
        if value > 0:
            answer[positive] = value
            positive += 2
        else:
            answer[negative] = value
            negative += 2
        # step: write
    return answer  # step: return`,
2150:`def findLonely(nums):
    from collections import Counter
    counts = Counter(nums)
    answer = []
    for value, count in counts.items():
        if count == 1 and value - 1 not in counts and value + 1 not in counts:
            answer.append(value)
        # step: check
    return answer  # step: return`,
2151:`def maximumGood(statements):
    n, best = len(statements), 0
    for mask in range(1 << n):
        consistent = True
        for speaker in range(n):
            if not (mask & (1 << speaker)):
                continue
            for target, claim in enumerate(statements[speaker]):
                if claim != 2 and claim != int(bool(mask & (1 << target))):
                    consistent = False
                    break
            if not consistent:
                break
        if consistent:
            best = max(best, mask.bit_count())
        # step: assignment
    return best  # step: return`,
};
const cases={
2144:[['Several descending triples leave a final paid remainder',{cost:[17,4,12,9,3,21,8,6,14,5]}],['One candy cannot earn a free item',{cost:[13]}],['Two candies are both paid',{cost:[8,19]}],['Equal costs still allow every third candy free',{cost:[7,7,7,7,7,7]}]],
2145:[['A wandering prefix constrains both ends of the starting interval',{differences:[3,-5,4,2,-6,1,5,-2],lower:-4,upper:9}],['A prefix range wider than the bounds is impossible',{differences:[8,-2,5],lower:0,upper:6}],['Zero differences allow every bounded starting value',{differences:[0,0,0,0],lower:-3,upper:4}],['Exactly one translation fits',{differences:[2,-5,3],lower:-3,upper:2}]],
2146:[['Walls and price ties require every ranking field',{grid:[[1,4,0,8,2],[3,1,1,1,7],[0,5,0,6,1],[9,1,4,1,2]],pricing:[2,7],start:[1,1],k:6}],['The starting cell itself can be the first ranked item',{grid:[[6,1],[3,5]],pricing:[3,6],start:[0,0],k:3}],['Unreachable items do not enter the ranking',{grid:[[1,0,4],[1,0,3],[2,0,5]],pricing:[2,5],start:[0,0],k:5}],['No reachable item lies inside the requested price range',{grid:[[1,2],[3,1]],pricing:[7,9],start:[0,0],k:2}]],
2147:[['Several plant-filled gaps multiply independent divider choices',{corridor:'PSSPPPSPSPPSSPPSSP'}],['No seats cannot make a valid section',{corridor:'PPPPPP'}],['An odd seat count cannot split into pairs',{corridor:'SPPSPS'}],['Exactly two seats need no internal divider',{corridor:'PPPSPPPPSPP'}]],
2148:[['Repeated interior values count as separate qualifying elements',{nums:[-4,7,2,7,15,-4,9,3,15,6]}],['Equal values have no strict witnesses',{nums:[8,8,8,8]}],['Two distinct extremes leave no interior value',{nums:[3,12]}],['Negative interior values qualify normally',{nums:[-15,-9,-2,-7,-15,-2]}]],
2149:[['Signs arrive in irregular groups but each order must survive',{nums:[9,4,-7,-2,-11,6,15,-3,8,-5]}],['An already alternating array remains in the same order',{nums:[3,-8,7,-2]}],['All negatives arrive before all positives',{nums:[-9,-4,-6,2,8,5]}],['The smallest balanced input starts with the positive',{nums:[-12,19]}]],
2150:[['Duplicates and adjacent values disqualify different candidates',{nums:[4,9,4,12,17,18,25,31,30,40,12,7]}],['Every unique value is adjacent to another',{nums:[5,6,9,10]}],['Widely separated singleton values are all lonely',{nums:[2,8,15,23]}],['One isolated occurrence is lonely',{nums:[0]}]],
2151:[['Several statements constrain an interdependent good group',{statements:[[2,1,2,0,2],[1,2,1,2,2],[2,1,2,0,2],[0,2,0,2,1],[2,2,2,1,2]]}],['Unknown statements allow everyone to be good',{statements:[[2,2,2],[2,2,2],[2,2,2]]}],['Two people accusing each other allow at most one good person',{statements:[[2,0],[0,2]]}],['One person with no statement can be good',{statements:[[2]]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2144)need(vector(input.cost,1),'Use 1-80 positive candy costs.');
  if(id===2145)need(vector(input.differences,-1000000)&&integer(input.lower,-1000000)&&integer(input.upper,input.lower),'Use 1-80 signed differences and ordered integer bounds within -1000000..1000000.');
  if(id===2146)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=8&&input.grid.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.grid[0].length&&row.every(v=>integer(v,0,1000)))&&Array.isArray(input.pricing)&&input.pricing.length===2&&integer(input.pricing[0],2,1000)&&integer(input.pricing[1],input.pricing[0],1000)&&Array.isArray(input.start)&&input.start.length===2&&integer(input.start[0],0,input.grid.length-1)&&integer(input.start[1],0,input.grid[0].length-1)&&input.grid[input.start[0]][input.start[1]]!==0&&integer(input.k,1,64),'Use an at-most-eight-by-eight nonnegative grid, walkable start, price range from two through 1000, and k from one through 64.');
  if(id===2147)need(typeof input.corridor==='string'&&/^[SP]{1,150}$/.test(input.corridor),'Use 1-150 seat/plant letters S and P.');
  if(id===2148)need(vector(input.nums,-1000000),'Use 1-80 signed integer values.');
  if(id===2149)need(vector(input.nums,-1000000)&&input.nums.every(v=>v!==0)&&input.nums.filter(v=>v>0).length*2===input.nums.length,'Use at most 80 nonzero values with equal positive and negative counts.');
  if(id===2150)need(vector(input.nums),'Use 1-80 nonnegative integer values.');
  if(id===2151)need(Array.isArray(input.statements)&&input.statements.length>=1&&input.statements.length<=8&&input.statements.every((row,i)=>Array.isArray(row)&&row.length===input.statements.length&&row.every(v=>v===0||v===1||v===2)&&row[i]===2),'Use a square statement matrix for 1-8 people, values 0/1/2, and unknown diagonal entries (2).');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2147&&result===0?'failed':'return',pseudocodeStages:{2144:{buy:4},2145:{walk:2},2146:{visit:3,rank:4},2147:{failed:2,gap:4},2148:{count:4},2149:{write:4},2150:{check:4},2151:{assignment:4}},tags:{2144:['Greedy','Sorting'],2145:['Prefix Sum'],2146:['Breadth-First Search','Matrix'],2147:['Math'],2148:['Array'],2149:['Two Pointers'],2150:['Hash Table'],2151:['Bit Manipulation','Backtracking']}};
