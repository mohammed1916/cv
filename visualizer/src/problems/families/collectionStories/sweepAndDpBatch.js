const specs = {
1936:['rungs dist','Bridge every ladder gap using the fewest added rungs.','A gap of g needs floor((g-1)/dist) intermediate rungs. Subtracting one avoids adding a rung when the upper endpoint is already reachable.','start from ground height zero|inspect the next existing rung|measure the gap from the previous rung|add floor((gap-1)/dist) and advance|return total added rungs','O(n) time; O(1) counting space.'],
1937:['points','Choose one cell per row while paying for horizontal movement between rows.','Two directional sweeps summarize the best previous score minus distance. Their maximum gives the best arrival score for each column before collecting its points.','initialize scores from the first row|sweep previous scores left to right|sweep previous scores right to left|add row points to the better arrival score|return the largest final score','O(rows*columns) time; O(columns) auxiliary space.'],
1940:['arrays','Find the longest common subsequence of strictly increasing arrays.','Sorted unique values have a shared order. Intersect the candidate values with each next array; the remaining sorted values are the full common subsequence.','take the first array as candidates|read the next sorted array|identify candidates present in this array|retain only those candidates|return the surviving sorted values','O(total input size plus repeated candidate scans) time; O(max row length) auxiliary space.'],
1941:['s','Check whether every distinct character occurs equally often.','Build a frequency table, then compare every count with the first character count. Characters absent from the input do not participate.','start an empty frequency table|read each character|find its current frequency|increment that frequency|return whether all stored counts are equal','O(n) time; O(26) frequency space.'],
1942:['times targetFriend','Find the smallest available chair assigned to the target arrival.','Process arrivals in time order. Release every chair whose owner leaves at or before the arrival, then choose the smallest free chair.','sort friends by arrival|release chairs with departure at or before arrival|find the smallest chair not occupied|assign that chair and record its departure|return the target friend chair','O(n^2) direct chair scan time; O(n) space.'],
1943:['segments','Describe each painted interval and its mixed color sum.','Record color additions at starts and removals at ends. Sweep every endpoint, outputting the preceding interval with its active sum; even net-zero events remain boundaries when color membership changes.','build endpoint color deltas|sort all distinct endpoints|read the active sum for the preceding interval|output painted intervals then apply this endpoint delta|return the nonempty painted pieces','O(n log n) time; O(n) event and output space.'],
1944:['heights','Count people visible to the right of every person.','Scan right to left with a decreasing-height stack. Every shorter popped person is visible, and the first remaining taller person is visible but blocks all people beyond it.','start an empty stack and zero counts|scan people from right to left|pop and count every shorter visible height|count one taller blocker then push current height|return visibility counts','O(n) time and stack/output space.'],
1945:['s k','Convert letters to alphabet positions and apply k digit-sum transformations.','Concatenate alphabet positions into a digit string. Repeatedly sum its digits, preserving multi-digit positions such as 26 before the first transformation.','convert every letter to its alphabet position|concatenate the decimal positions|read all current digits|replace the value with its digit sum for each round|return the final integer','O(n+k) time for bounded alphabet encoding; O(n) space.'],
1946:['num change','Maximize a number by mutating at most one contiguous substring.','Start at the first strict improvement. Continue across improvements and equal mappings; stop permanently at the first decrease after mutation starts.','keep the original digit list|scan digits from the left|compare each mapped digit with its original|start or extend beneficial mutation and stop at a decrease|return the resulting digit string','O(n) time and output space.'],
1947:['students mentors','Pair students and mentors to maximize agreement across answers.','A used-mentor bitmask determines the next student. Try each unused mentor and memoize the best remaining assignment score.','precompute student-mentor compatibility|use the number of set bits as the next student|try each unused mentor|record the best score for this mentor mask|return the score for the empty mask','O(m^2*q + m*2^m) time; O(m^2+2^m) space.'],
1950:['nums','For every window length, maximize the minimum value among all windows.','A monotonic stack finds the widest span for which each value can be a minimum. Store that value at its span length, then propagate larger-window answers backward to fill missing lengths.','initialize span answers and an increasing stack|scan values plus a smaller sentinel|pop minima whose right boundary is now known|record each span value and propagate answers backward|return answers for all lengths','O(n) time and auxiliary space.'],
1952:['n','Determine whether n has exactly three positive divisors.','Exactly three divisors occur only for the square of a prime: one, the prime, and its square. Verify the square, then check primality of its root.','compute the integer square root|check that the root squared equals n|try divisors of the root up to its square root|reject composite roots and roots below two|return whether n is a prime square','O(n^(1/4)) trial divisions; O(1) auxiliary space.'],
};

const solvers = {
1936({rungs,dist},emit){let previous=0,total=0;for(let i=0;i<rungs.length;i++){const gap=rungs[i]-previous,added=Math.floor((gap-1)/dist);total+=added;emit('Each inserted rung covers at most dist height. Count only intermediate rungs because the existing upper endpoint already supplies the final landing.',{index:i,codeStage:'update',metrics:{previous,next:rungs[i],gap,added,total}},'update');previous=rungs[i];}return total;},
1937({points},emit){let dp=[...points[0]];for(let r=1;r<points.length;r++){const n=dp.length,left=[...dp],right=[...dp];for(let c=1;c<n;c++)left[c]=Math.max(dp[c],left[c-1]-1);for(let c=n-2;c>=0;c--)right[c]=Math.max(dp[c],right[c+1]-1);const next=dp.map((_,c)=>points[r][c]+Math.max(left[c],right[c]));for(let c=0;c<n;c++)emit('The left and right sweeps summarize every previous column after movement cost. Add this cell only after choosing the better arrival score.',{matrix:points,cell:[r,c],table:dp.map((v,i)=>[i,v,left[i],right[i],next[i]]),tableHeaders:['Column','Previous score','From left','From right','New score'],codeStage:'update',metrics:{row:r,column:c,points:points[r][c],score:next[c]}},'update');dp=next;}return Math.max(...dp);},
1940({arrays},emit){let candidates=[...arrays[0]];for(let i=1;i<arrays.length;i++){const present=new Set(arrays[i]),before=candidates.length;candidates=candidates.filter(v=>present.has(v));emit('All arrays are strictly increasing, so common values already have a common order. Remove a candidate only when this array proves it cannot occur in the final subsequence.',{sequence:arrays[i],output:[...candidates],codeStage:'update',metrics:{array:i,before,remaining:candidates.length}},'update');}return candidates;},
1941({s},emit){const counts=new Map();for(let i=0;i<s.length;i++){counts.set(s[i],(counts.get(s[i])||0)+1);emit('Record this occurrence. The final comparison uses only letters that actually appear, so missing alphabet letters do not create zero-count mismatches.',{index:i,table:[...counts],tableHeaders:['Letter','Occurrences'],codeStage:'update',metrics:{letter:s[i],count:counts.get(s[i])}},'update');}return new Set(counts.values()).size===1;},
1942({times,targetFriend},emit){const arrivals=times.map(([arrival,departure],friend)=>({arrival,departure,friend})).sort((a,b)=>a.arrival-b.arrival),occupied=new Map();let answer=-1;for(const person of arrivals){const released=[];for(const[chair,owner]of occupied)if(owner.departure<=person.arrival){occupied.delete(chair);released.push(chair);}let chair=0;while(occupied.has(chair))chair++;occupied.set(chair,person);emit('Departures at this exact arrival time free their chairs first. The smallest unoccupied chair is then assigned, regardless of which friend used it previously.',{sequence:Array.from({length:times.length},(_,i)=>i),index:chair,table:[...occupied].sort((a,b)=>a[0]-b[0]).map(([c,o])=>[c,o.friend,o.departure]),tableHeaders:['Chair','Friend','Leaves at'],codeStage:'update',metrics:{friend:person.friend,arrival:person.arrival,released:released.join(', ')||'none',chair}},'update');if(person.friend===targetFriend){answer=chair;break;}}return answer;},
1943({segments},emit){const deltas=new Map();for(const[start,end,color]of segments){deltas.set(start,(deltas.get(start)||0)+color);deltas.set(end,(deltas.get(end)||0)-color);}const result=[];let previous=null,active=0;for(const x of [...deltas.keys()].sort((a,b)=>a-b)){if(previous!==null&&active!==0)result.push([previous,x,active]);const before=active;active+=deltas.get(x);emit('The old active sum paints the open span before this endpoint. Apply ending and starting colors here for the next span; preserve every endpoint even when its net delta is zero.',{sequence:[...deltas.keys()].sort((a,b)=>a-b),index:[...deltas.keys()].sort((a,b)=>a-b).indexOf(x),table:result.map(row=>[...row]),tableHeaders:['Start','End','Mixed color'],codeStage:'update',metrics:{endpoint:x,previousSum:before,delta:deltas.get(x),nextSum:active}},'update');previous=x;}return result;},
1944({heights},emit){const stack=[],answer=Array(heights.length).fill(0);for(let i=heights.length-1;i>=0;i--){const popped=[];while(stack.length&&heights[stack.at(-1)]<heights[i]){popped.push(stack.pop());answer[i]++;}const blocker=stack.at(-1);if(blocker!==undefined)answer[i]++;stack.push(i);emit('Every shorter person removed from the stack is visible. A remaining taller person contributes one more view and hides everyone beyond that blocker.',{index:i,output:[...answer],outputIndex:i,table:stack.map(j=>[j,heights[j]]),tableHeaders:['Stack index','Height'],codeStage:'update',metrics:{popped:popped.join(', ')||'none',blocker:blocker??'none',visible:answer[i]}},'update');}return answer;},
1945({s,k},emit){let digits=[...s].map(c=>c.charCodeAt(0)-96).join('');for(let round=1;round<=k;round++){const before=digits;digits=String([...digits].reduce((sum,c)=>sum+Number(c),0));emit('Sum decimal digits of the current value, not whole alphabet-position numbers. The result becomes the input to the next transformation.',{sequence:[...before],output:[...digits],codeStage:'update',metrics:{round,before,after:digits}},'update');}return Number(digits);},
1946({num,change},emit){const digits=[...num];let started=false;for(let i=0;i<digits.length;i++){const original=Number(digits[i]),mapped=change[original],stop=started&&mapped<original;if(mapped>original)started=true;if(started&&!stop)digits[i]=String(mapped);emit('An earlier larger digit dominates all later digits. Start at the first improvement, keep equal mappings inside the same interval, and stop permanently before a decrease.',{sequence:[...num],index:i,output:[...digits],outputIndex:i,codeStage:'update',metrics:{original,mapped,started,stop}},'update');if(stop)break;}return digits.join('');},
1947({students,mentors},emit){const n=students.length,score=students.map(s=>mentors.map(m=>s.reduce((sum,v,i)=>sum+Number(v===m[i]),0))),memo=new Map();function solve(mask){if(mask===(1<<n)-1)return 0;if(memo.has(mask))return memo.get(mask);const student=mask.toString(2).replaceAll('0','').length;let best=0;for(let mentor=0;mentor<n;mentor++)if(!(mask&(1<<mentor))){const candidate=score[student][mentor]+solve(mask|(1<<mentor));best=Math.max(best,candidate);emit('The mask fixes which mentors are unavailable and therefore which student is next. Try one unused mentor, combine its agreement score with the optimal remainder, and keep the best.',{matrix:score,cell:[student,mentor],matrixLabel:'Pairwise compatibility',codeStage:'update',metrics:{mask:mask.toString(2).padStart(n,'0'),student,mentor,pairScore:score[student][mentor],candidate,best}},'update');}memo.set(mask,best);return best;}return solve(0);},
1950({nums},emit){const n=nums.length,stack=[],answer=Array(n+1).fill(0);for(let right=0;right<=n;right++){while(stack.length&&(right===n||nums[stack.at(-1)]>=nums[right])){const index=stack.pop(),left=stack.at(-1)??-1,width=right-left-1;answer[width]=Math.max(answer[width],nums[index]);emit('The popped value is a minimum across this entire span. Store its contribution at the widest certified length; shorter lengths will inherit valid larger-window minima afterward.',{index,output:answer.slice(1),codeStage:'span',metrics:{leftBoundary:left,rightBoundary:right,width,value:nums[index]}},'update');}if(right<n)stack.push(right);}for(let length=n-1;length>=1;length--){answer[length]=Math.max(answer[length],answer[length+1]);emit('A window with a known minimum contains shorter windows whose minima are at least as large. Propagate this bound backward to fill lengths without their own popped span.',{output:answer.slice(1),outputIndex:length-1,codeStage:'propagate',metrics:{length,answer:answer[length]}},'update');}return answer.slice(1);},
1952({n},emit){const root=Math.floor(Math.sqrt(n));let prime=root>=2;emit('Only a perfect square of a prime has exactly three divisors. First separate the square requirement from the primality requirement.',{sequence:[1,root,n],codeStage:'square',metrics:{n,root,perfectSquare:root*root===n}});if(root*root!==n)return false;for(let d=2;d*d<=root;d++){const divides=root%d===0;emit('A divisor of the square root proves it is composite, which would give n additional divisors.',{codeStage:'inspect',metrics:{root,divisor:d,divides}});if(divides){prime=false;break;}}return prime;},
};

const python = {
1936:`def addRungs(rungs, dist):
    previous = total = 0
    for rung in rungs:
        gap = rung - previous
        total += (gap - 1) // dist  # step: update
        previous = rung
    return total  # step: return`,
1937:`def maxPoints(points):
    dp = points[0][:]
    for row in points[1:]:
        left, right = dp[:], dp[:]
        for c in range(1, len(dp)):
            left[c] = max(dp[c], left[c - 1] - 1)
        for c in range(len(dp) - 2, -1, -1):
            right[c] = max(dp[c], right[c + 1] - 1)
        dp = [value + max(left[c], right[c]) for c, value in enumerate(row)]  # step: update
    return max(dp)  # step: return`,
1940:`def longestCommonSubsequence(arrays):
    candidates = arrays[0][:]
    for row in arrays[1:]:
        present = set(row)
        candidates = [value for value in candidates if value in present]  # step: update
    return candidates  # step: return`,
1941:`def areOccurrencesEqual(s):
    counts = {}
    for letter in s:
        counts[letter] = counts.get(letter, 0) + 1  # step: update
    return len(set(counts.values())) == 1  # step: return`,
1942:`def smallestChair(times, targetFriend):
    arrivals = sorted((arrival, departure, friend) for friend, (arrival, departure) in enumerate(times))
    occupied = {}
    answer = -1
    for arrival, departure, friend in arrivals:
        for chair in list(occupied):
            if occupied[chair] <= arrival:
                del occupied[chair]
        chair = 0
        while chair in occupied:
            chair += 1
        occupied[chair] = departure  # step: update
        if friend == targetFriend:
            answer = chair
            break
    return answer  # step: return`,
1943:`def splitPainting(segments):
    deltas = {}
    for start, end, color in segments:
        deltas[start] = deltas.get(start, 0) + color
        deltas[end] = deltas.get(end, 0) - color
    result, previous, active = [], None, 0
    for endpoint in sorted(deltas):
        if previous is not None and active:
            result.append([previous, endpoint, active])
        active += deltas[endpoint]  # step: update
        previous = endpoint
    return result  # step: return`,
1944:`def canSeePersonsCount(heights):
    stack = []
    answer = [0] * len(heights)
    for i in range(len(heights) - 1, -1, -1):
        while stack and heights[stack[-1]] < heights[i]:
            stack.pop()
            answer[i] += 1
        if stack:
            answer[i] += 1
        stack.append(i)  # step: update
    return answer  # step: return`,
1945:`def getLucky(s, k):
    digits = ''.join(str(ord(letter) - ord('a') + 1) for letter in s)
    for _ in range(k):
        digits = str(sum(int(digit) for digit in digits))  # step: update
    return int(digits)  # step: return`,
1946:`def maximumNumber(num, change):
    digits = list(num)
    started = False
    for i, digit in enumerate(digits):
        original = int(digit)
        mapped = change[original]
        stop = started and mapped < original
        if mapped > original:
            started = True
        if started and not stop:
            digits[i] = str(mapped)
        # step: update
        if stop:
            break
    return ''.join(digits)  # step: return`,
1947:`def maxCompatibilitySum(students, mentors):
    from functools import lru_cache
    n = len(students)
    score = [[sum(a == b for a, b in zip(student, mentor)) for mentor in mentors] for student in students]
    @lru_cache(None)
    def solve(mask):
        if mask == (1 << n) - 1:
            return 0
        student = mask.bit_count()
        best = 0
        for mentor in range(n):
            if not mask & (1 << mentor):
                candidate = score[student][mentor] + solve(mask | (1 << mentor))
                best = max(best, candidate)  # step: update
        return best
    return solve(0)  # step: return`,
1950:`def findMaximums(nums):
    n = len(nums)
    stack, answer = [], [0] * (n + 1)
    for right in range(n + 1):
        while stack and (right == n or nums[stack[-1]] >= nums[right]):
            index = stack.pop()
            left = stack[-1] if stack else -1
            width = right - left - 1
            answer[width] = max(answer[width], nums[index])  # step: span
        if right < n:
            stack.append(right)
    for length in range(n - 1, 0, -1):
        answer[length] = max(answer[length], answer[length + 1])  # step: propagate
    return answer[1:]  # step: return`,
1952:`def isThree(n):
    from math import isqrt
    root = isqrt(n)  # step: square
    if root * root != n:
        return False  # step: failed
    prime = root >= 2
    for divisor in range(2, isqrt(root) + 1):
        divides = root % divisor == 0  # step: inspect
        if divides:
            prime = False
            break
    return prime  # step: return`,
};

const cases = {
1936:[['Different gaps need different numbers of intermediate rungs',{rungs:[3,8,17,21,35,42,58],dist:5}],['Exact multiples need no endpoint duplicates',{rungs:[4,8,12,16],dist:4}],['First rung is far above ground',{rungs:[29],dist:6}],['Every integer height is required',{rungs:[2,5,9],dist:1}]],
1937:[['Movement cost changes which peaks are worth collecting',{points:[[4,12,3,8,2],[10,1,7,2,13],[3,14,2,9,1],[11,4,8,2,12]]}],['One row needs no movement',{points:[[8,2,17,5]]}],['One column forces all choices',{points:[[4],[9],[2],[13]]}],['Tied zero rewards',{points:[[0,0,0],[0,0,0]]}]],
1940:[['Several intersections gradually remove candidate values',{arrays:[[2,4,7,9,12,16,21],[1,4,7,12,18,21],[4,6,7,12,20,21],[3,4,7,10,12,21]]}],['No value belongs to every row',{arrays:[[1,4,8],[2,5,9]]}],['Identical arrays retain every value',{arrays:[[3,8,14],[3,8,14]]}],['A single array is its own subsequence',{arrays:[[5,11,19,23]]}]],
1941:[['Equal groups are scattered throughout the input',{s:'cabddabcbdac'}],['One extra occurrence breaks equality',{s:'mmnnooppm'}],['Only one distinct character',{s:'rrrrrrr'}],['Every character appears once',{s:'harvest'}]],
1942:[['Departures release low chairs before later arrivals',{times:[[2,12],[5,9],[7,15],[9,14],[11,18],[14,20]],targetFriend:5}],['Departure equals another arrival',{times:[[3,8],[8,13]],targetFriend:1}],['Target is the first arrival despite its index',{times:[[9,14],[2,17],[6,11]],targetFriend:1}],['All earlier friends still occupy chairs',{times:[[1,20],[3,21],[5,22],[7,23]],targetFriend:3}]],
1943:[['Overlaps and a gap create several painted spans',{segments:[[2,9,4],[5,13,7],[8,11,12],[16,22,9],[19,25,15]]}],['Distinct color sets have equal sums across a boundary',{segments:[[1,4,2],[1,4,5],[4,8,7]]}],['One painted segment',{segments:[[6,15,11]]}],['Several colors share both endpoints',{segments:[[3,10,6],[3,10,13],[3,10,19]]}]],
1944:[['Peaks hide several shorter people behind them',{heights:[18,7,12,5,9,16,4,11,20]}],['Strictly increasing queue',{heights:[3,6,10,15,21]}],['Strictly decreasing queue',{heights:[22,17,13,8,2]}],['No person to the right',{heights:[14]}]],
1945:[['Two-digit alphabet positions survive the initial encoding',{s:'wintergarden',k:3}],['Only one transformation is requested',{s:'zebra',k:1}],['Repeated letters with two-digit positions',{s:'zzzzzz',k:2}],['A one-digit fixed point',{s:'a',k:10}]],
1946:[['Equal mappings bridge two strict improvements',{num:'314159265358',change:[0,7,2,3,4,9,6,7,8,9]}],['No digit can improve',{num:'987654',change:[0,1,2,3,4,5,6,7,8,9]}],['Stop before a decrease and ignore later improvements',{num:'15251',change:[0,8,2,3,4,0,6,7,8,9]}],['Mutation begins with a zero digit',{num:'100204',change:[9,1,2,3,4,5,6,7,8,9]}]],
1947:[['A locally attractive pair can restrict later students',{students:[[1,0,1,1],[0,1,0,1],[1,1,0,0],[0,0,1,0]],mentors:[[1,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,0]]}],['All pairings have equal scores',{students:[[1,1],[1,1]],mentors:[[0,0],[0,0]]}],['One student and one mentor',{students:[[1,0,1]],mentors:[[1,1,1]]}],['Perfect matches appear in reverse order',{students:[[1,0],[0,1],[1,1]],mentors:[[1,1],[0,1],[1,0]]}]],
1950:[['Nested low points determine different maximum minima',{nums:[8,3,11,6,9,2,10,7]}],['Equal values share overlapping spans',{nums:[5,5,5,5]}],['Monotone increasing input',{nums:[2,4,7,12,18]}],['One window exists',{nums:[16]}]],
1952:[['A larger prime square',{n:169}],['A composite square has extra divisors',{n:144}],['A nonsquare near a prime square',{n:168}],['One is not a prime square',{n:1}]],
};

function validate(id,input) {
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  const matrix=(m,min=0,maxRows=8,maxCols=8)=>Array.isArray(m)&&m.length>=1&&m.length<=maxRows&&m.every(r=>vector(r,min,maxCols)&&r.length===m[0].length);
  if(id===1936)need(vector(input.rungs,1)&&input.rungs.every((v,i,a)=>!i||v>a[i-1])&&integer(input.dist,1),'Use increasing positive rungs and a positive distance, each at most 10000.');
  if(id===1937)need(matrix(input.points),'Use a rectangular nonnegative points grid, at most eight by eight.');
  if(id===1940)need(Array.isArray(input.arrays)&&input.arrays.length>=1&&input.arrays.length<=8&&input.arrays.every(row=>vector(row,1)&&row.every((v,i)=>!i||v>row[i-1])),'Use 1-8 strictly increasing positive arrays of at most 60 values each.');
  if([1941,1945].includes(id))need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s),'Use 1-120 lowercase letters.');
  if(id===1945)need(integer(input.k,1,10),'Use 1-10 digit-sum transformations.');
  if(id===1942)need(matrix(input.times,1,30,2)&&input.times[0].length===2&&input.times.length>=2&&input.times.every(([a,b])=>a<b)&&new Set(input.times.map(r=>r[0])).size===input.times.length&&integer(input.targetFriend,0,input.times.length-1),'Use 2-30 arrival/departure pairs with distinct arrivals before departures, and a valid target index.');
  if(id===1943)need(matrix(input.segments,1,30,3)&&input.segments[0].length===3&&input.segments.every(([a,b])=>a<b)&&new Set(input.segments.map(r=>r[2])).size===input.segments.length,'Use 1-30 [start,end,color] segments with start < end and distinct positive colors.');
  if(id===1944)need(vector(input.heights,1)&&new Set(input.heights).size===input.heights.length,'Use distinct positive heights, at most 60.');
  if(id===1946)need(typeof input.num==='string'&&/^[1-9][0-9]{0,119}$/.test(input.num)&&Array.isArray(input.change)&&input.change.length===10&&input.change.every(v=>integer(v,0,9)),'Use a positive decimal string without leading zeros and exactly ten replacement digits.');
  if(id===1947)need(matrix(input.students,0,7,8)&&matrix(input.mentors,0,7,8)&&input.students.length===input.mentors.length&&input.students[0].length===input.mentors[0].length&&[...input.students,...input.mentors].every(r=>r.every(v=>v===0||v===1)),'Use equally sized binary student and mentor grids, at most seven people and eight questions.');
  if(id===1950)need(vector(input.nums),'Use 1-60 nonnegative integers no larger than 10000.');
  if(id===1952)need(integer(input.n,1,10000),'Use an integer from 1 to 10000.');
  return input;
}

export default {specs,solvers,python,cases,validate,
  resultStage:(id,result,input)=>id===1952&&Math.floor(Math.sqrt(input.n))**2!==input.n?'failed':'return',
  pseudocodeStages:{1950:{span:4,propagate:4},1952:{square:2,inspect:3}},
  tags:{1936:['Greedy'],1937:['Dynamic Programming','Matrix'],1940:['Array','Hash Table'],1941:['Counting'],1942:['Simulation','Sorting'],1943:['Sweep Line'],1944:['Monotonic Stack'],1945:['String','Simulation'],1946:['Greedy'],1947:['Bitmask','Dynamic Programming'],1950:['Monotonic Stack'],1952:['Math']},
};
