const specs={
1986:['tasks sessionTime','Finish every task using the fewest bounded work sessions.','For each completed-task mask keep the lexicographically smallest pair of session count and current-session load. Fewer sessions is better; for a tie, less load leaves more room.','initialize the empty mask with one empty session|consider each nonempty task mask|try removing each possible final task|append it to the previous session or start a new one and minimize the state pair|return the full-mask session count','O(n*2^n) time; O(2^n) space.'],
1987:['binary','Count distinct good binary subsequences without leading zeroes except the single zero.','Track distinct valid subsequences ending in zero and one. Appending the current bit replaces that ending count with all prior valid endings; one additionally starts a new subsequence. Count the single zero separately.','start ending counts and zero-presence flag at zero|read the next bit|combine the previous ending counts|replace the current ending count and record a seen zero|return both ending counts plus the single-zero case','O(n) time; O(1) auxiliary space.'],
1989:['team dist','Match as many people as possible to distinct taggers within reach.','List taggers and people in index order. Match the earliest pair when reachable; otherwise discard only the earlier index that is too far away to reach any remaining partner.','list tagger and untagged-person indices|inspect the earliest remaining pair|compare their index distance with dist|match them or discard the unreachable earlier participant|return the number of matches','O(n) time and index-list space.'],
1991:['nums','Find the leftmost index with equal sums strictly to its left and right.','Maintain the running left sum and derive the right sum from the total after excluding the current value. Return the first equality.','sum the array|scan from left to right|compute right = total - left - current|stop on equality or add current to left|return the first balanced index or -1','O(n) time; O(1) auxiliary space.'],
1992:['land','Find the corners of each rectangular farmland group.','An unvisited farmland cell encountered row by row is the upper-left corner of its rectangle. Extend down and right to its boundary, then mark the whole rectangle visited.','scan cells in row order|start a rectangle at unvisited farmland|extend its bottom and right boundaries|record its corners and mark its cells visited|return all rectangle coordinates','O(rows*columns) time and visited space.'],
1993:['parent operations','Apply lock, unlock, and upgrade operations on a rooted tree.','Locks store their owner. Upgrade requires an unlocked node, no locked ancestor, and at least one locked descendant; only after all checks pass does it clear descendant locks and lock the node.','build children and empty owner slots|read the next operation|check ownership or all upgrade preconditions|apply successful changes atomically and record the boolean result|return all operation results','O(nodes*operations) direct traversal time; O(nodes) lock and tree space.'],
1994:['nums','Count subsets whose product is a product of distinct primes.','Reject values containing squared prime factors. A prime-mask DP combines only disjoint factor sets; duplicate values multiply the choice count, and any subset of ones may accompany a nonempty prime product.','count values and initialize empty prime mask|factor each distinct value from two through thirty|reject squared factors and overlapping prime masks|add compatible choices and account for optional ones|return the count excluding subsets made only of ones','O(30*2^10 + n) time; O(2^10) space.'],
1995:['nums','Count ordered index quadruplets with three earlier values summing to the fourth.','Sweep the second index backward. Maintain counts of nums[d]-nums[c] for all eligible later pairs; every earlier nums[a]+nums[b] lookup then counts valid completions.','start an empty later-pair difference table|move the second index backward|add pairs whose third index is newly eligible|look up every earlier first-plus-second sum|return the accumulated quadruplet count','O(n^2) time; O(number of distinct differences) space.'],
1996:['properties','Count characters dominated in both attack and defense.','Sort by decreasing attack and increasing defense for ties. A running maximum defense then represents stronger-attack candidates without allowing equal-attack characters to falsely dominate each other.','sort attack descending and tied defense ascending|visit each character in that order|compare defense with the maximum seen|count strictly lower defense and update the maximum|return the weak-character count','O(n log n) time; O(n) sorted copy space.'],
1997:['nextVisit','Find the first day every room has been visited.','The first arrival at a new room is on an odd visit, forcing a return to its prescribed earlier room. Replaying the known segment and then moving forward gives a recurrence for first-visit days.','set first visit of room zero to day zero|advance through new rooms|find the earlier room prescribed by the previous room|compute twice previous day minus earlier day plus two|return the final room first-visit day modulo 1000000007','O(n) time and first-visit-day space.'],
1998:['nums','Decide whether swaps between values sharing a factor greater than one can sort the array.','Connect positions through their prime factors. Values can move within each connected component; compare the component values with the values required at those positions in global sorted order.','initialize disjoint position components|factor each value|union positions sharing a prime factor|compare each component multiset with its sorted-target requirements|return whether every component can supply its target values','O(n*sqrt(max value) + n log n) time; O(n + distinct factors) space.'],
2000:['word ch','Reverse the prefix ending at the first occurrence of ch.','Only the earliest occurrence defines the reversal boundary. Swap symmetric positions within that prefix; leave later characters in place.','find the first occurrence of ch|place pointers at start and that occurrence|inspect the two pointer characters|swap and move inward while left is before right|return the resulting word','O(n) time and copied character space.'],
2001:['rectangles','Count pairs of rectangles with the same width-to-height ratio.','Reduce each width and height by their greatest common divisor. Every earlier rectangle with the same reduced pair forms one new interchangeable pair.','start an empty reduced-ratio frequency table|read each rectangle|divide width and height by their gcd|add the prior ratio frequency then increment it|return the total interchangeable pairs','O(n*log maximum side) time; O(n) ratio space.'],
};

const solvers={
1986({tasks,sessionTime},emit){const n=tasks.length,dp=Array.from({length:1<<n},()=>[n+1,0]);dp[0]=[1,0];for(let mask=1;mask<1<<n;mask++){const options=[];for(let i=0;i<n;i++)if(mask&(1<<i)){const[sessions,used]=dp[mask^(1<<i)],fits=used+tasks[i]<=sessionTime,candidate=fits?[sessions,used+tasks[i]]:[sessions+1,tasks[i]];if(candidate[0]<dp[mask][0]||(candidate[0]===dp[mask][0]&&candidate[1]<dp[mask][1]))dp[mask]=candidate;options.push([i,...candidate]);}emit('Try each possible last task. Retain fewer sessions first, then the least loaded final session; this state leaves the best options for tasks added later.',{marks:Object.fromEntries(tasks.flatMap((_,i)=>mask&(1<<i)?[[i,'completed']]:[])),table:options,tableHeaders:['Last task','Sessions','Last-session load'],codeStage:'update',metrics:{mask:mask.toString(2).padStart(n,'0'),sessions:dp[mask][0],load:dp[mask][1]}},'update');}return dp.at(-1)[0];},
1987({binary},emit){let end0=0,end1=0,hasZero=0;const mod=1000000007;for(let i=0;i<binary.length;i++){const before0=end0,before1=end1;if(binary[i]==='0'){end0=(end0+end1)%mod;hasZero=1;}else end1=(end0+end1+1)%mod;emit('Replace the current ending count instead of adding another copy of the same strings. Endings tracked here start with one; the valid single zero is counted separately.',{index:i,codeStage:'update',table:[['Ends in 0',before0,end0],['Ends in 1',before1,end1]],tableHeaders:['Good subsequences','Before','After'],metrics:{bit:binary[i],hasZero}},'update');}return(end0+end1+hasZero)%mod;},
1989({team,dist},emit){const taggers=[],people=[];team.forEach((v,i)=>(v?taggers:people).push(i));let a=0,b=0,count=0;while(a<taggers.length&&b<people.length){const tagger=taggers[a],person=people[b],reachable=Math.abs(tagger-person)<=dist;emit(reachable?'Match these earliest reachable participants. Delaying either cannot create a better ordered matching.':'The earlier participant cannot reach this or any later remaining partner, so discard only that participant.',{index:tagger,marks:{[person]:'candidate person'},codeStage:'update',metrics:{tagger,person,distance:Math.abs(tagger-person),reachable,count:count+Number(reachable)}},'update');if(reachable){a++;b++;count++;}else if(tagger<person)a++;else b++;}return count;},
1991({nums},emit){const total=nums.reduce((a,b)=>a+b,0);let left=0,answer=-1;for(let i=0;i<nums.length;i++){const right=total-left-nums[i],equal=left===right;emit('Exclude the current value from both sides. Scanning left to right makes the first equality the required leftmost middle index.',{index:i,codeStage:'inspect',metrics:{left,current:nums[i],right,equal}});if(equal){answer=i;break;}left+=nums[i];}return answer;},
1992({land},emit){const seen=land.map(row=>row.map(()=>false)),result=[];for(let r=0;r<land.length;r++)for(let c=0;c<land[0].length;c++){if(!land[r][c]||seen[r][c])continue;let bottom=r,right=c;while(bottom+1<land.length&&land[bottom+1][c])bottom++;while(right+1<land[0].length&&land[r][right+1])right++;for(let a=r;a<=bottom;a++)for(let b=c;b<=right;b++)seen[a][b]=true;result.push([r,c,bottom,right]);emit('The input guarantees rectangular non-touching groups. This first unvisited farmland cell is a top-left corner, and its downward and rightward runs locate the opposite corner.',{matrix:land,cell:[r,c],otherCell:[bottom,right],table:result.map(row=>[...row]),tableHeaders:['Top','Left','Bottom','Right'],codeStage:'update',metrics:{area:(bottom-r+1)*(right-c+1),groups:result.length}},'update');}return result;},
1993({parent,operations},emit){const children=parent.map(()=>[]),owners=parent.map(()=>0),result=[];for(let i=1;i<parent.length;i++)children[parent[i]].push(i);for(let i=0;i<operations.length;i++){const[operation,node,user]=operations[i];let success=false,reason='',descendants=[];if(operation==='lock'){success=owners[node]===0;reason=success?'unlocked node accepts this owner':'node already locked';if(success)owners[node]=user;}else if(operation==='unlock'){success=owners[node]===user;reason=success?'owner matches':'only the owner may unlock';if(success)owners[node]=0;}else{let ancestor=parent[node],blocked=false;while(ancestor!==-1){blocked||=owners[ancestor]!==0;ancestor=parent[ancestor];}const queue=[...children[node]];for(let j=0;j<queue.length;j++){const child=queue[j];if(owners[child])descendants.push(child);queue.push(...children[child]);}success=owners[node]===0&&!blocked&&descendants.length>0;reason=owners[node]?'node already locked':blocked?'locked ancestor':!descendants.length?'no locked descendants':'all upgrade conditions pass';if(success){for(const child of descendants)owners[child]=0;owners[node]=user;}}result.push(success);emit('Check every precondition before changing lock ownership. A failed operation leaves the entire lock table unchanged; an upgrade clears all descendant owners regardless of user.',{sequence:parent,index:node,output:[...result],table:parent.map((p,j)=>[j,p,owners[j]||'unlocked']),tableHeaders:['Node','Parent','Owner'],codeStage:'update',metrics:{operation,user,success,reason,lockedDescendants:descendants.join(', ')||'none'}},'update');}return result;},
1994({nums},emit){const primes=[2,3,5,7,11,13,17,19,23,29],frequency=Array(31).fill(0),dp=Array(1024).fill(0),mod=1000000007;for(const v of nums)frequency[v]++;dp[0]=1;for(let value=2;value<=30;value++){if(!frequency[value])continue;let mask=0,valid=true;for(let i=0;i<primes.length;i++){if(value%(primes[i]*primes[i])===0)valid=false;if(value%primes[i]===0)mask|=1<<i;}if(valid)for(let state=1023;state>=0;state--)if(!(state&mask))dp[state|mask]=(dp[state|mask]+dp[state]*frequency[value])%mod;emit(valid?'This square-free value contributes one copy chosen from its frequency. Combine it only with masks that share no prime factors.':'A repeated prime factor makes every subset containing this value invalid, so skip the value entirely.',{sequence:Array.from({length:30},(_,i)=>i+1),index:value-1,table:dp.flatMap((ways,state)=>ways?[[state.toString(2).padStart(10,'0'),ways]]:[]),tableHeaders:['Prime mask','Subset count'],codeStage:'update',metrics:{value,frequency:frequency[value],valid,mask:mask.toString(2).padStart(10,'0')}},'update');}let answer=dp.slice(1).reduce((sum,v)=>(sum+v)%mod,0);for(let i=0;i<frequency[1];i++)answer=answer*2%mod;return answer;},
1995({nums},emit){const differences=new Map();let count=0;for(let b=nums.length-3;b>=1;b--){const c=b+1;for(let d=c+1;d<nums.length;d++){const difference=nums[d]-nums[c];differences.set(difference,(differences.get(difference)||0)+1);}let added=0;for(let a=0;a<b;a++)added+=differences.get(nums[a]+nums[b])||0;count+=added;emit('The table contains only later pairs c,d with b<c<d. Matching an earlier a,b sum therefore counts valid quadruplets without checking all four indices independently.',{index:b,table:[...differences],tableHeaders:['Later difference d-c','Pair count'],codeStage:'update',metrics:{secondIndex:b,newThirdIndex:c,added,count}},'update');}return count;},
1996({properties},emit){const sorted=properties.map(row=>[...row]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]);let defense=-Infinity,count=0;for(let i=0;i<sorted.length;i++){const[attack,value]=sorted[i],weak=value<defense;if(weak)count++;emit('Equal-attack characters arrive in increasing defense order, so they cannot falsely dominate each other. A larger previous defense that beats this value must come from a strictly stronger attack.',{sequence:sorted.map(([a,d])=>`${a}/${d}`),index:i,codeStage:'update',metrics:{attack,defense:value,previousMax:Number.isFinite(defense)?defense:'none',weak,count}},'update');defense=Math.max(defense,value);}return count;},
1997({nextVisit},emit){const days=Array(nextVisit.length).fill(null),mod=1000000007;days[0]=0;for(let room=1;room<days.length;room++){const back=nextVisit[room-1];days[room]=(2*days[room-1]-days[back]+2+mod)%mod;emit('After the first visit to the previous room, return to its prescribed room and replay the already known segment. The next visit to the previous room then permits moving forward.',{index:room,output:[...days],outputIndex:room,codeStage:'update',metrics:{room,back,previousDay:days[room-1],backDay:days[back],firstDay:days[room]}},'update');}return days.at(-1);},
1998({nums},emit){const parent=nums.map((_,i)=>i),first=new Map(),find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;},union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};for(let i=0;i<nums.length;i++){let value=nums[i];const factors=[];for(let p=2;p*p<=value;p++)if(value%p===0){factors.push(p);while(value%p===0)value/=p;}if(value>1)factors.push(value);for(const prime of factors){if(first.has(prime))union(i,first.get(prime));else first.set(prime,i);}emit('Sharing a prime factor permits a swap and joins the corresponding positions. Transitive chains allow values to move through the whole component, even when two endpoint values have gcd one.',{index:i,table:nums.map((v,j)=>[j,v,find(j)]),tableHeaders:['Position','Value','Component'],codeStage:'union',metrics:{value:nums[i],primeFactors:factors.join(', ')||'none'}},'update');}const target=[...nums].sort((a,b)=>a-b),groups=new Map();for(let i=0;i<nums.length;i++){const root=find(i);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(i);}let possible=true;for(const indices of groups.values()){const actual=indices.map(i=>nums[i]).sort((a,b)=>a-b),required=indices.map(i=>target[i]),matches=actual.every((v,i)=>v===required[i]);possible&&=matches;emit('A component can reorder only the values it already owns. Compare that multiset with the globally sorted values required at its positions.',{output:target,table:indices.map((index,i)=>[index,actual[i],required[i]]),tableHeaders:['Component position','Available sorted value','Required value'],codeStage:'compare',metrics:{matches,possible}},'update');}return possible;},
2000({word,ch},emit){const result=[...word],end=word.indexOf(ch);let left=0,right=end;emit('Use the first occurrence as the boundary. If the character is absent, the whole word stays unchanged.',{sequence:[...word],index:end,codeStage:'locate',metrics:{ch,end}});while(left<right){[result[left],result[right]]=[result[right],result[left]];emit('Swap symmetric characters only within the chosen prefix. Characters beyond the first occurrence remain at their original positions.',{sequence:[...result],index:left,marks:{[right]:'other pointer'},codeStage:'update',metrics:{left,right}},'update');left++;right--;}return result.join('');},
2001({rectangles},emit){const counts=new Map();let pairs=0;const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;};for(let i=0;i<rectangles.length;i++){const[w,h]=rectangles[i],divisor=gcd(w,h),ratio=`${w/divisor}:${h/divisor}`,prior=counts.get(ratio)||0;pairs+=prior;counts.set(ratio,prior+1);emit('Reduce the ratio exactly rather than comparing rounded decimals. Each earlier rectangle with this same reduced ratio forms one new pair with the current rectangle.',{sequence:rectangles.map(([w,h])=>`${w} x ${h}`),index:i,table:[...counts],tableHeaders:['Reduced ratio','Rectangles seen'],codeStage:'update',metrics:{ratio,prior,newPairs:prior,pairs}},'update');}return pairs;},
};

const python={
1986:`def minSessions(tasks, sessionTime):
    n = len(tasks)
    dp = [(n + 1, 0)] * (1 << n)
    dp[0] = (1, 0)
    for mask in range(1, 1 << n):
        for i, duration in enumerate(tasks):
            if mask & (1 << i):
                sessions, used = dp[mask ^ (1 << i)]
                candidate = (sessions, used + duration) if used + duration <= sessionTime else (sessions + 1, duration)
                dp[mask] = min(dp[mask], candidate)
        # step: update
    return dp[-1][0]  # step: return`,
1987:`def numberOfUniqueGoodSubsequences(binary):
    end0 = end1 = has_zero = 0
    modulus = 1_000_000_007
    for bit in binary:
        if bit == '0':
            end0 = (end0 + end1) % modulus
            has_zero = 1
        else:
            end1 = (end0 + end1 + 1) % modulus
        # step: update
    return (end0 + end1 + has_zero) % modulus  # step: return`,
1989:`def catchMaximumAmountofPeople(team, dist):
    taggers = [i for i, value in enumerate(team) if value == 1]
    people = [i for i, value in enumerate(team) if value == 0]
    a = b = count = 0
    while a < len(taggers) and b < len(people):
        reachable = abs(taggers[a] - people[b]) <= dist  # step: update
        if reachable:
            a += 1
            b += 1
            count += 1
        elif taggers[a] < people[b]:
            a += 1
        else:
            b += 1
    return count  # step: return`,
1991:`def findMiddleIndex(nums):
    total = sum(nums)
    left, answer = 0, -1
    for i, value in enumerate(nums):
        right = total - left - value  # step: inspect
        if left == right:
            answer = i
            break
        left += value
    return answer  # step: return`,
1992:`def findFarmland(land):
    rows, cols = len(land), len(land[0])
    seen = [[False] * cols for _ in range(rows)]
    result = []
    for row in range(rows):
        for col in range(cols):
            if not land[row][col] or seen[row][col]:
                continue
            bottom, right = row, col
            while bottom + 1 < rows and land[bottom + 1][col]:
                bottom += 1
            while right + 1 < cols and land[row][right + 1]:
                right += 1
            for r in range(row, bottom + 1):
                for c in range(col, right + 1):
                    seen[r][c] = True
            result.append([row, col, bottom, right])  # step: update
    return result  # step: return`,
1993:`class LockingTree:
    def __init__(self, parent):
        self.parent = parent
        self.children = [[] for _ in parent]
        self.owner = [0] * len(parent)
        for node in range(1, len(parent)):
            self.children[parent[node]].append(node)

    def lock(self, num, user):
        if self.owner[num]:
            return False
        self.owner[num] = user
        return True

    def unlock(self, num, user):
        if self.owner[num] != user:
            return False
        self.owner[num] = 0
        return True

    def upgrade(self, num, user):
        if self.owner[num]:
            return False
        ancestor = self.parent[num]
        while ancestor != -1:
            if self.owner[ancestor]:
                return False
            ancestor = self.parent[ancestor]
        descendants = self.children[num][:]
        locked = []
        for node in descendants:
            if self.owner[node]:
                locked.append(node)
            descendants.extend(self.children[node])
        if not locked:
            return False
        for node in locked:
            self.owner[node] = 0
        self.owner[num] = user
        return True

def runOperations(parent, operations):
    tree = LockingTree(parent)
    result = []
    for operation, node, user in operations:
        result.append(getattr(tree, operation)(node, user))  # step: update
    return result  # step: return`,
1994:`def numberOfGoodSubsets(nums):
    from collections import Counter
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    frequency = Counter(nums)
    modulus = 1_000_000_007
    dp = [0] * 1024
    dp[0] = 1
    for value in range(2, 31):
        if not frequency[value]:
            continue
        valid, mask = True, 0
        for i, prime in enumerate(primes):
            if value % (prime * prime) == 0:
                valid = False
            if value % prime == 0:
                mask |= 1 << i
        if valid:
            for state in range(1023, -1, -1):
                if not state & mask:
                    dp[state | mask] = (dp[state | mask] + dp[state] * frequency[value]) % modulus
        # step: update
    return sum(dp[1:]) * pow(2, frequency[1], modulus) % modulus  # step: return`,
1995:`def countQuadruplets(nums):
    differences = {}
    count = 0
    for b in range(len(nums) - 3, 0, -1):
        c = b + 1
        for d in range(c + 1, len(nums)):
            difference = nums[d] - nums[c]
            differences[difference] = differences.get(difference, 0) + 1
        for a in range(b):
            count += differences.get(nums[a] + nums[b], 0)
        # step: update
    return count  # step: return`,
1996:`def numberOfWeakCharacters(properties):
    ordered = sorted(properties, key=lambda pair: (-pair[0], pair[1]))
    defense, count = float('-inf'), 0
    for attack, value in ordered:
        if value < defense:
            count += 1
        # step: update
        defense = max(defense, value)
    return count  # step: return`,
1997:`def firstDayBeenInAllRooms(nextVisit):
    days = [None] * len(nextVisit)
    days[0] = 0
    modulus = 1_000_000_007
    for room in range(1, len(nextVisit)):
        back = nextVisit[room - 1]
        days[room] = (2 * days[room - 1] - days[back] + 2) % modulus  # step: update
    return days[-1]  # step: return`,
1998:`def gcdSort(nums):
    parent = list(range(len(nums)))
    first = {}
    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node
    def union(a, b):
        a, b = find(a), find(b)
        if a != b:
            parent[b] = a
    for i, original in enumerate(nums):
        value, prime, factors = original, 2, []
        while prime * prime <= value:
            if value % prime == 0:
                factors.append(prime)
                while value % prime == 0:
                    value //= prime
            prime += 1
        if value > 1:
            factors.append(value)
        for prime in factors:
            if prime in first:
                union(i, first[prime])
            else:
                first[prime] = i
        # step: union
    target = sorted(nums)
    groups = {}
    for i in range(len(nums)):
        groups.setdefault(find(i), []).append(i)
    possible = True
    for indices in groups.values():
        actual = sorted(nums[i] for i in indices)
        required = [target[i] for i in indices]
        possible = possible and actual == required  # step: compare
    return possible  # step: return`,
2000:`def reversePrefix(word, ch):
    result = list(word)
    left, right = 0, word.find(ch)  # step: locate
    while left < right:
        result[left], result[right] = result[right], result[left]  # step: update
        left += 1
        right -= 1
    return ''.join(result)  # step: return`,
2001:`def interchangeableRectangles(rectangles):
    from math import gcd
    counts = {}
    pairs = 0
    for width, height in rectangles:
        divisor = gcd(width, height)
        ratio = (width // divisor, height // divisor)
        prior = counts.get(ratio, 0)
        pairs += prior
        counts[ratio] = prior + 1  # step: update
    return pairs  # step: return`,
};
const cases={
1986:[['Several ways to pack the same remaining capacity',{tasks:[4,7,3,6,2,5,4,1],sessionTime:10}],['Every task fills a whole session',{tasks:[6,6,6,6],sessionTime:6}],['All tasks fit together exactly',{tasks:[2,3,4],sessionTime:9}],['A single task needs one session',{tasks:[5],sessionTime:8}]],
1987:[['Repeated prefixes create duplicate subsequences',{binary:'0010110011010'}],['All zeroes contribute only the single zero',{binary:'00000000'}],['All ones contribute one string per length',{binary:'1111111'}],['Only one leading-one subsequence exists',{binary:'00001'}]],
1989:[['Taggers and people alternate with uneven gaps',{team:[1,1,0,0,0,1,0,1,1,0,0,1],dist:2}],['Earlier unreachable people must be skipped',{team:[0,0,0,0,1,1],dist:1}],['No tagger is present',{team:[0,0,0,0],dist:2}],['One tagger can catch only one person',{team:[0,0,1,0,0],dist:4}]],
1991:[['Mixed signs balance an interior position',{nums:[8,-3,4,11,2,5,2]}],['Multiple balanced positions choose the first',{nums:[0,0,0,0]}],['No position balances',{nums:[2,4,8,16]}],['A singleton has two empty sides',{nums:[-9]}]],
1992:[['Several separated rectangles have different shapes',{land:[[1,1,0,0,1,1,1],[1,1,0,0,1,1,1],[0,0,0,0,0,0,0],[0,1,1,1,0,1,0],[0,1,1,1,0,1,0]]}],['An all-zero field has no groups',{land:[[0,0,0],[0,0,0]]}],['The entire field is one rectangle',{land:[[1,1,1,1],[1,1,1,1]]}],['Single cells can touch diagonally',{land:[[1,0,1],[0,1,0],[1,0,1]]}]],
1993:[['Upgrade consolidates several descendant owners',{parent:[-1,0,0,1,1,2,2,3,3],operations:[['lock',7,11],['lock',4,22],['unlock',7,22],['upgrade',1,33],['lock',8,44],['upgrade',3,55],['unlock',1,33],['upgrade',0,66]]}],['Upgrade fails when no descendant is locked',{parent:[-1,0,0],operations:[['upgrade',0,7],['lock',1,8],['unlock',1,8],['upgrade',0,7]]}],['A locked ancestor blocks upgrade but not ordinary lock',{parent:[-1,0,1,2],operations:[['lock',0,9],['lock',3,10],['upgrade',1,11],['unlock',0,9],['upgrade',1,11]]}],['Only the owner may unlock an already locked node',{parent:[-1,0],operations:[['lock',1,4],['lock',1,5],['unlock',1,5],['unlock',1,4]]}]],
1994:[['Ones and repeated square-free values multiply valid choices',{nums:[1,1,2,2,3,5,6,7,10,15,30,4,9]}],['Only ones never create a nonempty prime product',{nums:[1,1,1,1,1]}],['Squared prime factors disqualify every value',{nums:[4,8,9,12,16,18,20,25,27,28]}],['Repeated prime values are alternative choices',{nums:[7,7,7,7]}]],
1995:[['Several later differences complete earlier sums',{nums:[2,3,1,6,4,9,7,12,5,16]}],['The smallest valid input has one candidate',{nums:[2,4,7,13]}],['Repeated values count distinct index choices',{nums:[2,2,2,2,6,6]}],['No earlier triple reaches a later value',{nums:[9,8,7,6,5]}]],
1996:[['Equal attacks mix with genuinely stronger characters',{properties:[[7,3],[7,9],[4,8],[9,7],[5,2],[9,4],[3,10],[11,6]]}],['Equal attack alone never dominates',{properties:[[6,2],[6,5],[6,9]]}],['Equal defense alone never dominates',{properties:[[2,7],[5,7],[9,7]]}],['One character has no dominator',{properties:[[12,4]]}]],
1997:[['Different return rooms reuse different earlier segments',{nextVisit:[0,0,1,0,2,4,1,6]}],['Every odd visit returns to the same room',{nextVisit:[0,1,2,3,4,5]}],['Every return goes back to room zero',{nextVisit:[0,0,0,0,0,0]}],['Only two rooms',{nextVisit:[0,0]}]],
1998:[['Prime-factor chains connect values with different endpoint gcds',{nums:[35,14,15,6,10,21]}],['Isolated primes cannot swap to their target positions',{nums:[11,7,5,3]}],['Already sorted disconnected values need no swaps',{nums:[3,5,7,11,13]}],['Duplicates remain valid multiset members',{nums:[18,6,18,12,6]}]],
2000:[['The first repeated boundary character controls the reversal',{word:'lanternrivertrail',ch:'r'}],['Boundary already at the first character',{word:'meadow',ch:'m'}],['The requested character is absent',{word:'orchard',ch:'z'}],['Boundary at the last character reverses the entire word',{word:'clouds',ch:'s'}]],
2001:[['Several independent ratio groups accumulate pairs',{rectangles:[[8,12],[10,15],[9,6],[14,21],[15,10],[4,7],[20,30],[6,4]]}],['All equal rectangles still occupy distinct positions',{rectangles:[[7,11],[7,11],[7,11],[7,11]]}],['Reciprocal ratios are different',{rectangles:[[3,5],[5,3],[6,10],[10,6]]}],['One rectangle has no partner',{rectangles:[[17,23]]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  const pairs=v=>Array.isArray(v)&&v.length>=1&&v.length<=60&&v.every(pair=>Array.isArray(pair)&&pair.length===2&&pair.every(x=>integer(x,1)));
  const word=s=>typeof s==='string'&&/^[a-z]{1,120}$/.test(s);
  if(id===1986)need(vector(input.tasks,1,10)&&integer(input.sessionTime,1,15)&&input.tasks.every(v=>v<=input.sessionTime),'Use 1-10 tasks, each fitting within a session of 1-15 time units.');
  if(id===1987)need(typeof input.binary==='string'&&/^[01]{1,120}$/.test(input.binary),'Use a binary string of length 1-120.');
  if(id===1989)need(Array.isArray(input.team)&&input.team.length>=2&&input.team.length<=120&&input.team.every(v=>v===0||v===1)&&integer(input.dist,1,input.team.length),'Use 2-120 binary team entries and a positive reach no larger than the array length.');
  if(id===1991)need(vector(input.nums,-10000),'Use 1-60 integers between -10000 and 10000.');
  if(id===1992){const g=input.land;need(Array.isArray(g)&&g.length>=1&&g.length<=8&&g.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===g[0].length&&row.every(v=>v===0||v===1)),'Use a rectangular binary grid at most eight by eight.');const seen=new Set();for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(g[r][c]&&!seen.has(`${r},${c}`)){const queue=[[r,c]];seen.add(`${r},${c}`);let minR=r,maxR=r,minC=c,maxC=c;for(let i=0;i<queue.length;i++){const[a,b]=queue[i];minR=Math.min(minR,a);maxR=Math.max(maxR,a);minC=Math.min(minC,b);maxC=Math.max(maxC,b);for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=a+dr,nc=b+dc,key=`${nr},${nc}`;if(nr>=0&&nr<g.length&&nc>=0&&nc<g[0].length&&g[nr][nc]&&!seen.has(key)){seen.add(key);queue.push([nr,nc]);}}}need(queue.length===(maxR-minR+1)*(maxC-minC+1),'Every orthogonally connected farmland group must be a complete rectangle.');}}
  if(id===1993){const p=input.parent;need(Array.isArray(p)&&p.length>=2&&p.length<=40&&p[0]===-1&&p.slice(1).every((v,i)=>integer(v,0,p.length-1)&&v!==i+1),'Use 2-40 parent entries with node zero as root.');for(let i=1;i<p.length;i++){const seen=new Set();let node=i;while(node!==-1){need(!seen.has(node),'Parents must form an acyclic rooted tree.');seen.add(node);node=p[node];}}need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60&&input.operations.every(op=>Array.isArray(op)&&op.length===3&&['lock','unlock','upgrade'].includes(op[0])&&integer(op[1],0,p.length-1)&&integer(op[2],1)),'Use 1-60 lock/unlock/upgrade operations with valid node and positive user IDs.');}
  if(id===1994)need(vector(input.nums)&&input.nums.every(v=>v<=30),'Use 1-60 values between 1 and 30.');
  if(id===1995)need(vector(input.nums,1,50)&&input.nums.length>=4&&input.nums.every(v=>v<=100),'Use 4-50 positive values no larger than 100.');
  if(id===1996)need(pairs(input.properties),'Use 1-60 positive [attack,defense] pairs.');
  if(id===1997)need(Array.isArray(input.nextVisit)&&input.nextVisit.length>=2&&input.nextVisit.length<=60&&input.nextVisit.every((v,i)=>integer(v,0,i)),'Use 2-60 return-room indices with nextVisit[i] between zero and i.');
  if(id===1998)need(vector(input.nums,2),'Use 1-60 values between 2 and 10000.');
  if(id===2000)need(word(input.word)&&typeof input.ch==='string'&&/^[a-z]$/.test(input.ch),'Use a lowercase word and one lowercase boundary character.');
  if(id===2001)need(pairs(input.rectangles),'Use 1-60 positive [width,height] pairs.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{1998:{union:3,compare:4},2000:{locate:1}},tags:{1986:['Bitmask','Dynamic Programming'],1987:['Dynamic Programming','String'],1989:['Greedy','Two Pointers'],1991:['Prefix Sum'],1992:['Matrix'],1993:['Tree','Design'],1994:['Bitmask','Dynamic Programming'],1995:['Hash Table'],1996:['Sorting','Greedy'],1997:['Dynamic Programming'],1998:['Union Find'],2000:['Two Pointers','String'],2001:['Math','Hash Table']}};
