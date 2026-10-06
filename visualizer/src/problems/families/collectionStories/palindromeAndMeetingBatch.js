const specs={
2081:['k n','Sum the first n positive numbers palindromic in decimal and base k.','Generate decimal palindromes directly by mirroring their first half, in increasing numeric order. Convert each to base k and keep only representations that are also palindromes.','enumerate increasing decimal palindrome lengths|mirror each possible first half|convert the candidate to base k|accept palindromic base-k representations until n are found|return the accepted-number sum','O(decimal palindrome candidates*digit length) generation time; O(digit length) working space.'],
2083:['s','Count substrings whose first and last characters match.','When a new character becomes the endpoint, every earlier equal character can be its start, and the one-character substring is one more choice.','start an empty character-frequency table|read the next endpoint character|count prior matching starts plus the current position|add that count and record this occurrence|return the total matching-endpoint substrings','O(n) time; O(26) frequency space.'],
2085:['words1 words2','Count words appearing exactly once in each of two arrays.','Build separate frequency tables. A word qualifies only when both final counts are one, so repetition in either source disqualifies it.','count words independently in both arrays|visit each distinct word from the first array|compare its two source frequencies|count the word only when both equal one|return the number of qualifying words','O(total input characters) expected time; O(distinct words) space.'],
2086:['hamsters','Place the fewest food buckets so every hamster has an adjacent bucket.','Reuse a bucket immediately to the left when possible. Otherwise prefer placing one on the right, where it may also serve the next hamster; use the left empty cell only as a fallback.','scan hamster positions from left to right|reuse an existing bucket on the left|otherwise prefer an empty right neighbor|fall back to an empty left neighbor or declare impossibility|return the bucket count or -1','O(n) time; O(n) displayed placement space.'],
2087:['startPos homePos rowCosts colCosts','Return a robot home with minimum entered-row and entered-column cost.','Any route must cross every intervening row and column. With nonnegative entry costs, a monotone route pays each required crossing once and avoids unnecessary detours.','start at the current row and column|move toward the home row|charge each entered row exactly once|move toward the home column and charge each entered column|return total entry cost','O(row distance+column distance) time; O(1) counting state.'],
2088:['grid','Count upright and inverted fertile pyramids of height at least two.','Directional DP stores the largest fertile pyramid height at each apex. The minimum supported height of the three cells in the next row determines how far the apex can extend; height h contributes h-1 pyramids.','run one height DP for each vertical direction|process rows from the base direction toward the apex|extend fertile cells using three neighboring support heights|add height minus one for each possible apex|return the total in both orientations','O(rows*columns) time and DP space.'],
2089:['nums target','Return target positions after sorting the array.','Sorting is unnecessary: count values smaller than target and values equal to it. Those counts define the consecutive block of target indices in sorted order.','initialize smaller and equal counts|scan every input value|compare it with target|update counts and construct the target index block|return all sorted target positions','O(n) time plus output space.'],
2090:['nums k','Compute integer averages for all complete radius-k neighborhoods.','Maintain a window of 2*k+1 values. Only full windows have a center with enough neighbors on both sides; leave other answers at -1.','fill the answer array with -1|extend a running sum across the next value|remove the value that leaves a full-width window|write the floored average at each complete window center|return all radius averages','O(n) time; O(n) output space.'],
2091:['nums','Remove both the minimum and maximum using the fewest deletions from array ends.','Only three plans matter: remove through the farther extreme from the left, from the right, or remove one extreme from each end. Compare their exact counts.','locate the two extreme-value indices|order their positions from left to right|compute prefix-only, suffix-only, and split-end deletion counts|choose the smallest plan|return the minimum deletions','O(n) time; O(1) auxiliary space.'],
2092:['n meetings firstPerson','Find everyone who learns a secret through time-ordered meetings.','At each timestamp, form the meeting graph and spread from every attendee who already knows the secret. Finish the entire same-time connected propagation before advancing time.','mark zero and firstPerson as knowing the secret|group meetings by timestamp|build that timestamp meeting graph and seed known attendees|propagate through the entire same-time graph|return all informed people','O(meetings log meetings+people) time; O(people+meetings) space.'],
};
const solvers={
2081({k,n},emit){let total=0n,found=0;const accepted=[];for(let length=1;;length++){const half=Math.ceil(length/2),begin=10**(half-1),end=10**half;let tested=0;for(let prefix=begin;prefix<end;prefix++){const text=String(prefix),decimal=text+[...(length%2?text.slice(0,-1):text)].reverse().join(''),value=BigInt(decimal),digits=value.toString(k);tested++;if(digits===[...digits].reverse().join('')){total+=value;found++;accepted.push([decimal,digits,total.toString()]);emit('Mirroring guarantees decimal symmetry. This candidate also reads identically backward in the other base, so it is the next accepted number in increasing order.',{sequence:[...digits],table:[...accepted],tableHeaders:['Decimal','Base-k digits','Running sum'],codeStage:'accept',metrics:{base:k,decimal,found,required:n,testedAtThisLength:tested,sum:total.toString()}},'update');if(found===n)return Number(total);}}emit('All decimal palindromes of this length have been considered. Longer lengths are numerically larger, so continue without skipping any smaller qualifying value.',{codeStage:'length',metrics:{length,tested,found,sum:total.toString()}});}},
2083({s},emit){const counts=new Map();let total=0;for(let i=0;i<s.length;i++){const prior=counts.get(s[i])||0,added=prior+1;total+=added;counts.set(s[i],added);emit('Each earlier occurrence supplies a different starting index for a substring ending here. Include this character itself as a one-character substring.',{index:i,table:[...counts],tableHeaders:['Character','Occurrences so far'],codeStage:'update',metrics:{character:s[i],earlierMatchingStarts:prior,added,total}},'update');}return total;},
2085({words1,words2},emit){const a=new Map(),b=new Map();for(const word of words1)a.set(word,(a.get(word)||0)+1);for(const word of words2)b.set(word,(b.get(word)||0)+1);let total=0;for(const[word,count]of a){const other=b.get(word)||0,qualifies=count===1&&other===1;if(qualifies)total++;emit('Check final frequencies in both inputs. A repeated word in either source cannot qualify even when it appears once in the other.',{sequence:words1,index:words1.indexOf(word),table:[...new Set([...a.keys(),...b.keys()])].map(w=>[w,a.get(w)||0,b.get(w)||0]),tableHeaders:['Word','First source count','Second source count'],codeStage:'update',metrics:{word,count,other,qualifies,total}},'update');}return total;},
2086({hamsters},emit){const cells=[...hamsters];let buckets=0;for(let i=0;i<cells.length;i++){if(cells[i]!=='H')continue;let action='reuse left bucket',placed=null;if(i>0&&cells[i-1]==='B'){}else if(i+1<cells.length&&cells[i+1]==='.'){cells[i+1]='B';buckets++;placed=i+1;action='place right';}else if(i>0&&cells[i-1]==='.'){cells[i-1]='B';buckets++;placed=i-1;action='place left';}else{emit('Neither adjacent cell can supply a bucket, so this hamster cannot be fed under any placement.',{index:i,output:[...cells],codeStage:'failed',metrics:{hamster:i,buckets}});return-1;}emit('A right-side bucket may feed this hamster and a later one, so prefer it when no existing left bucket already works.',{index:i,output:[...cells],outputIndex:placed??i-1,codeStage:'update',metrics:{hamster:i,action,placed,buckets}},'update');}return buckets;},
2087({startPos,homePos,rowCosts,colCosts},emit){let[row,col]=startPos,total=0;const path=[`(${row},${col})`];while(row!==homePos[0]){row+=Math.sign(homePos[0]-row);total+=rowCosts[row];path.push(`(${row},${col})`);emit('Cross this necessary row boundary once and pay only the entered row cost. The starting row itself is not charged.',{sequence:rowCosts,index:row,output:[...path],codeStage:'row',metrics:{row,column:col,enteredRowCost:rowCosts[row],total}},'update');}while(col!==homePos[1]){col+=Math.sign(homePos[1]-col);total+=colCosts[col];path.push(`(${row},${col})`);emit('Cross this necessary column boundary once. Nonnegative costs make extra detours unable to improve on the required row and column crossings.',{sequence:colCosts,index:col,output:[...path],codeStage:'column',metrics:{row,column:col,enteredColumnCost:colCosts[col],total}},'update');}return total;},
2088({grid},emit){let total=0;for(const direction of [1,-1]){const rows=grid.length,cols=grid[0].length,heights=grid.map(row=>row.map(()=>0)),order=Array.from({length:rows},(_,i)=>direction===1?rows-1-i:i);for(const r of order)for(let c=0;c<cols;c++){if(grid[r][c]){heights[r][c]=1;const next=r+direction;if(next>=0&&next<rows&&c>0&&c+1<cols)heights[r][c]+=Math.min(heights[next][c-1],heights[next][c],heights[next][c+1]);}const added=Math.max(0,heights[r][c]-1);total+=added;emit('The shortest of the three supporting heights limits this apex. A maximum height h contains one pyramid of every height from two through h, contributing h-1.',{matrix:grid,cell:[r,c],outputMatrix:heights,outputMatrixLabel:direction===1?'Downward-base pyramid heights':'Upward-base pyramid heights',outputCell:[r,c],codeStage:'update',metrics:{orientation:direction===1?'upright':'inverted',height:heights[r][c],added,total}},'update');}}return total;},
2089({nums,target},emit){let smaller=0,equal=0;for(let i=0;i<nums.length;i++){smaller+=Number(nums[i]<target);equal+=Number(nums[i]===target);emit('Values smaller than target determine its starting sorted index, and equal values determine the block length. Their original positions do not matter.',{index:i,codeStage:'update',metrics:{value:nums[i],target,smaller,equal}},'update');}return Array.from({length:equal},(_,i)=>smaller+i);},
2090({nums,k},emit){const width=2*k+1,answer=nums.map(()=>-1);let sum=0;for(let right=0;right<nums.length;right++){sum+=nums[right];if(right>=width)sum-=nums[right-width];const complete=right>=width-1,center=right-k;if(complete)answer[center]=Math.floor(sum/width);emit(complete?'This complete window supplies exactly k neighbors on each side of its center. Store the integer quotient at that center.':'The window has not yet reached its required width, so no center can receive an average.',{index:right,window:[Math.max(0,right-width+1),right],output:[...answer],outputIndex:complete?center:right,codeStage:'update',metrics:{width,sum,complete,center:complete?center:'none',average:complete?answer[center]:'not available'}},'update');}return answer;},
2091({nums},emit){const minimum=nums.indexOf(Math.min(...nums)),maximum=nums.indexOf(Math.max(...nums)),left=Math.min(minimum,maximum),right=Math.max(minimum,maximum),plans=[['left only',right+1],['right only',nums.length-left],['both ends',left+1+nums.length-right]];let best=Infinity;for(const[plan,cost]of plans){best=Math.min(best,cost);emit('Deleting from ends leaves one middle interval. These three plans cover removing both extremes from one side or one extreme from each side.',{marks:{[minimum]:'minimum',[maximum]:'maximum'},table:plans,tableHeaders:['Deletion plan','Count'],codeStage:'update',metrics:{minimumIndex:minimum,maximumIndex:maximum,plan,cost,best}},'update');}return best;},
2092({n,meetings,firstPerson},emit){const known=new Set([0,firstPerson]),ordered=meetings.map(row=>[...row]).sort((a,b)=>a[2]-b[2]);for(let at=0;at<ordered.length;){const time=ordered[at][2],graph=new Map(),before=new Set(known);while(at<ordered.length&&ordered[at][2]===time){const[a,b]=ordered[at++];if(!graph.has(a))graph.set(a,new Set());if(!graph.has(b))graph.set(b,new Set());graph.get(a).add(b);graph.get(b).add(a);}const queue=[...graph.keys()].filter(person=>known.has(person)),seen=new Set(queue);for(let i=0;i<queue.length;i++)for(const neighbor of graph.get(queue[i]))if(!seen.has(neighbor)){seen.add(neighbor);known.add(neighbor);queue.push(neighbor);}emit('All meetings at this timestamp happen together. Propagate through the entire meeting component from any prior secret holder before advancing to the next time.',{sequence:Array.from({length:n},(_,i)=>i),marks:Object.fromEntries([...known].map(person=>[person,'knows secret'])),table:[...graph].map(([person,neighbors])=>[person,[...neighbors].join(', '),before.has(person),known.has(person)]),tableHeaders:['Person','Same-time neighbors','Knew before','Knows after'],output:[...known].sort((a,b)=>a-b),codeStage:'update',metrics:{time,newlyInformed:[...known].filter(person=>!before.has(person)).join(', ')||'none'}},'update');}return[...known].sort((a,b)=>a-b);},
};
const python={
2081:`def kMirror(k, n):
    def base_digits(value):
        digits = []
        while value:
            value, digit = divmod(value, k)
            digits.append(str(digit))
        return ''.join(reversed(digits))
    total = found = 0
    length = 1
    while True:
        half = (length + 1) // 2
        for prefix in range(10 ** (half - 1), 10 ** half):
            text = str(prefix)
            value = int(text + (text[:-1] if length % 2 else text)[::-1])
            digits = base_digits(value)
            if digits == digits[::-1]:
                total += value
                found += 1  # step: accept
                if found == n:
                    return total  # step: return
        length += 1  # step: length`,
2083:`def numberOfSubstrings(s):
    counts = {}
    total = 0
    for letter in s:
        added = counts.get(letter, 0) + 1
        total += added
        counts[letter] = added  # step: update
    return total  # step: return`,
2085:`def countWords(words1, words2):
    from collections import Counter
    first, second = Counter(words1), Counter(words2)
    total = 0
    for word, count in first.items():
        if count == 1 and second[word] == 1:
            total += 1
        # step: update
    return total  # step: return`,
2086:`def minimumBuckets(hamsters):
    cells = list(hamsters)
    buckets = 0
    for i, cell in enumerate(cells):
        if cell != 'H':
            continue
        if i > 0 and cells[i - 1] == 'B':
            pass
        elif i + 1 < len(cells) and cells[i + 1] == '.':
            cells[i + 1] = 'B'
            buckets += 1
        elif i > 0 and cells[i - 1] == '.':
            cells[i - 1] = 'B'
            buckets += 1
        else:
            return -1  # step: failed
        # step: update
    return buckets  # step: return`,
2087:`def minCost(startPos, homePos, rowCosts, colCosts):
    row, col = startPos
    total = 0
    while row != homePos[0]:
        row += 1 if homePos[0] > row else -1
        total += rowCosts[row]  # step: row
    while col != homePos[1]:
        col += 1 if homePos[1] > col else -1
        total += colCosts[col]  # step: column
    return total  # step: return`,
2088:`def countPyramids(grid):
    rows, cols = len(grid), len(grid[0])
    total = 0
    for direction in (1, -1):
        heights = [[0] * cols for _ in range(rows)]
        order = range(rows - 1, -1, -1) if direction == 1 else range(rows)
        for row in order:
            for col in range(cols):
                if grid[row][col]:
                    heights[row][col] = 1
                    next_row = row + direction
                    if 0 <= next_row < rows and 0 < col < cols - 1:
                        heights[row][col] += min(heights[next_row][col - 1:col + 2])
                total += max(0, heights[row][col] - 1)  # step: update
    return total  # step: return`,
2089:`def targetIndices(nums, target):
    smaller = equal = 0
    for value in nums:
        smaller += value < target
        equal += value == target  # step: update
    return list(range(smaller, smaller + equal))  # step: return`,
2090:`def getAverages(nums, k):
    width = 2 * k + 1
    answer = [-1] * len(nums)
    total = 0
    for right, value in enumerate(nums):
        total += value
        if right >= width:
            total -= nums[right - width]
        if right >= width - 1:
            answer[right - k] = total // width
        # step: update
    return answer  # step: return`,
2091:`def minimumDeletions(nums):
    minimum, maximum = nums.index(min(nums)), nums.index(max(nums))
    left, right = sorted((minimum, maximum))
    best = float('inf')
    for cost in (right + 1, len(nums) - left, left + 1 + len(nums) - right):
        best = min(best, cost)  # step: update
    return best  # step: return`,
2092:`def findAllPeople(n, meetings, firstPerson):
    from collections import defaultdict
    from itertools import groupby
    known = {0, firstPerson}
    ordered = sorted(meetings, key=lambda meeting: meeting[2])
    for timestamp, group in groupby(ordered, key=lambda meeting: meeting[2]):
        graph = defaultdict(set)
        for a, b, _ in group:
            graph[a].add(b)
            graph[b].add(a)
        queue = [person for person in graph if person in known]
        seen = set(queue)
        for person in queue:
            for neighbor in graph[person]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    known.add(neighbor)
                    queue.append(neighbor)
        # step: update
    return sorted(known)  # step: return`,
};
const cases={
2081:[['Several decimal lengths are needed for eight base-three matches',{k:3,n:8}],['Only the first qualifying value is requested',{k:8,n:1}],['Binary symmetry filters decimal palindromes',{k:2,n:10}],['A larger base has several single-digit matches',{k:9,n:12}]],
2083:[['Repeated letters create multiple endpoint choices',{s:'riverlanternriver'}],['Every character matches all earlier positions',{s:'aaaaaaaaa'}],['Distinct letters permit only singleton substrings',{s:'abcdefghijk'}],['One character is one substring',{s:'z'}]],
2085:[['Words repeated in either source must be excluded',{words1:['fern','oak','moss','reed','oak','pine','ash'],words2:['moss','pine','reed','reed','ash','elm','fern']}],['A word repeated only in the first source does not qualify',{words1:['bay','bay'],words2:['bay']}],['The sources have no common word',{words1:['cedar','birch'],words2:['maple','willow']}],['One shared singleton word',{words1:['harbor'],words2:['harbor']}]],
2086:[['Shared buckets and adjacent hamsters require different choices',{hamsters:'H.H..HH...H.H.'}],['An interior hamster trapped by neighbors is impossible',{hamsters:'.HHH.'}],['A final hamster must use its left neighbor',{hamsters:'.H'}],['No hamster needs a bucket',{hamsters:'.......'}]],
2087:[['Home lies across several required rows and columns',{startPos:[4,1],homePos:[1,5],rowCosts:[8,3,11,6,9,4],colCosts:[7,5,2,13,4,10,6]}],['Starting at home costs nothing',{startPos:[1,2],homePos:[1,2],rowCosts:[5,8,3],colCosts:[4,9,6,2]}],['Only row costs are needed',{startPos:[0,1],homePos:[3,1],rowCosts:[100,2,7,4],colCosts:[9,11]}],['Zero-cost required crossings remain free',{startPos:[1,0],homePos:[0,2],rowCosts:[0,7],colCosts:[5,0,0]}]],
2088:[['A large upright pyramid contains many smaller apices',{grid:[[0,0,0,1,0,0,0],[0,0,1,1,1,0,0],[0,1,1,1,1,1,0],[1,1,1,1,1,1,1]]}],['A fully fertile rectangle supports both orientations',{grid:[[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]]}],['A single row has no height-two pyramid',{grid:[[1,1,1,1,1]]}],['No fertile cell means no pyramid',{grid:[[0,0,0],[0,0,0]]}]],
2089:[['Repeated targets form one sorted index interval',{nums:[8,3,5,8,2,11,8,6,1,8],target:8}],['An absent target has no indices',{nums:[2,7,11,16],target:9}],['All values equal the target',{nums:[4,4,4,4],target:4}],['The target is the smallest value',{nums:[12,3,8,3,6],target:3}]],
2090:[['A moving five-value window produces many centered averages',{nums:[8,3,14,6,11,2,19,7,5,16,4,12,9,20,1],k:2}],['Radius zero preserves each value',{nums:[7,2,11,4],k:0}],['The required window is wider than the input',{nums:[3,8,5],k:4}],['Integer division drops the fractional part',{nums:[1,2,2,4,6],k:1}]],
2091:[['Extreme values are separated inside a longer array',{nums:[14,8,2,19,11,6,25,4,17,9]}],['Extremes already occupy opposite ends',{nums:[1,5,8,12,20]}],['Adjacent interior extremes favor deleting one prefix or suffix',{nums:[8,11,2,19,6,9]}],['One value is both minimum and maximum',{nums:[13]}]],
2092:[['A same-time chain spreads before the next timestamp',{n:9,meetings:[[3,4,5],[2,3,5],[1,2,5],[4,5,8],[6,7,3],[5,6,10],[7,8,12]],firstPerson:1}],['Earlier uninformed meetings do not reconnect retroactively',{n:5,meetings:[[2,3,2],[1,2,4],[3,4,6]],firstPerson:1}],['Separate same-time components propagate independently',{n:7,meetings:[[1,2,7],[2,3,7],[4,5,7],[5,6,7]],firstPerson:1}],['A meeting directly with zero shares the secret',{n:4,meetings:[[0,3,9]],firstPerson:2}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  const words=v=>Array.isArray(v)&&v.length>=1&&v.length<=50&&v.every(s=>typeof s==='string'&&/^[a-z]{1,20}$/.test(s));
  if(id===2081)need(integer(input.k,2,9)&&integer(input.n,1,12),'Use base 2-9 and 1-12 requested matches for bounded palindrome generation.');
  if(id===2083)need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s),'Use 1-120 lowercase characters.');
  if(id===2085)need(words(input.words1)&&words(input.words2),'Use two nonempty arrays of at most 50 lowercase words.');
  if(id===2086)need(typeof input.hamsters==='string'&&/^[H.]{1,120}$/.test(input.hamsters),'Use 1-120 H/empty-cell characters.');
  if(id===2087)need(vector(input.rowCosts,0,30)&&vector(input.colCosts,0,30)&&[input.startPos,input.homePos].every(p=>Array.isArray(p)&&p.length===2&&integer(p[0],0,input.rowCosts.length-1)&&integer(p[1],0,input.colCosts.length-1)),'Use up to 30 nonnegative row/column costs and valid [row,column] endpoints.');
  if(id===2088)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=8&&input.grid.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.grid[0].length&&row.every(v=>v===0||v===1)),'Use a binary rectangular grid at most eight by eight.');
  if(id===2089)need(vector(input.nums,1)&&integer(input.target,1),'Use positive values and a positive target, at most 80 values.');
  if(id===2090)need(vector(input.nums)&&integer(input.k,0,1000),'Use 1-80 nonnegative values and radius zero through 1000.');
  if(id===2091)need(vector(input.nums,-10000)&&new Set(input.nums).size===input.nums.length,'Use 1-80 distinct signed values.');
  if(id===2092)need(integer(input.n,2,30)&&integer(input.firstPerson,1,input.n-1)&&Array.isArray(input.meetings)&&input.meetings.length>=1&&input.meetings.length<=60&&input.meetings.every(m=>Array.isArray(m)&&m.length===3&&integer(m[0],0,input.n-1)&&integer(m[1],0,input.n-1)&&m[0]!==m[1]&&integer(m[2],1)),'Use 2-30 people and valid [person,person,time] meetings with positive timestamps.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2086&&result===-1?'failed':'return',pseudocodeStages:{2081:{accept:4,length:1},2086:{failed:4},2087:{row:3,column:4}},tags:{2081:['Math','Enumeration'],2083:['Counting'],2085:['Hash Table'],2086:['Greedy'],2087:['Greedy','Matrix'],2088:['Dynamic Programming','Matrix'],2089:['Counting'],2090:['Sliding Window'],2091:['Greedy'],2092:['Graph','Breadth-First Search']}};
