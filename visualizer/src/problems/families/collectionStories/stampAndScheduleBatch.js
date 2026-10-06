import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
const specs={
2130:['head','Find the largest sum of nodes equally far from opposite ends of an even list.','Locate the second half with fast and slow pointers, reverse that half, then walk both halves together. Each paired walk step visits one twin pair.','find the second-half boundary using fast and slow pointers|reverse the second half of the list|walk from the original head and reversed half head together|compare each twin sum with the best|return the maximum twin sum','O(n) time; O(1) pointer space excluding decoding and display snapshots.'],
2131:['words','Build the longest palindrome by arranging selected two-letter words.','A nonsymmetric word pairs with its reverse on the opposite side. Symmetric words pair with themselves, and at most one leftover symmetric word can occupy the center.','count occurrences of every two-letter word|match nonsymmetric words with their reverses|use pairs of identical symmetric words|reserve at most one leftover symmetric word for the center|return the total palindrome length','O(n) expected time; O(26^2) frequency space.'],
2132:['grid stampHeight stampWidth','Cover every empty grid cell with legal overlapping stamps.','A prefix sum identifies all obstacle-free stamp rectangles. Add all legal placements to a difference grid; since overlap is allowed, coverage by any legal placement is sufficient for each empty cell.','build an obstacle prefix-sum table|enumerate every stamp rectangle that fits|record obstacle-free placements in a two-dimensional difference grid|prefix-sum the difference grid into coverage counts|return whether every empty cell has positive coverage','O(rows*columns) time and space.'],
2133:['matrix','Check that every row and every column contains every value from one through n.','The input values are restricted to one through n. Therefore a row or column of length n has the required values exactly when its set has size n.','visit each row and corresponding column|collect their distinct values|compare both set sizes with the matrix dimension|reject the first incomplete row or column|return whether every line is valid','O(n^2) time; O(n) temporary set space.'],
2134:['nums','Group all ones into one circular block using the fewest arbitrary swaps.','The final block must have length equal to the number of ones. For each circular window of that length, every zero inside needs one swap with a one outside.','count all ones to determine the target block length|count ones in the first window|slide the window through every circular start|minimize window length minus contained ones|return the required swaps','O(n) time; O(1) auxiliary space.'],
2135:['startWords targetWords','Count target words obtainable by adding one letter and rearranging a start word.','With no repeated letter within a word, its character set is a bitmask. Remove one target letter at a time and check whether the remaining mask is a start-word mask.','encode all start-word letter sets as masks|encode each target word|remove each possible added letter from the target mask|count the target once when a remaining mask exists|return the count of obtainable targets','O(total input characters) expected time; O(start word count) space.'],
2136:['plantTime growTime','Finish planting and growing all flowers as early as possible.','Plant longer-growing flowers first so their growth overlaps later planting. Track elapsed planting time and the latest completion day; growth does not consume the planting resource.','order seeds by descending growth duration|accumulate planting time in that order|compute each seed completion as planting finish plus growth|track the latest completion|return the earliest possible full-bloom day','O(n log n) time; O(n) sorting space.'],
2137:['buckets loss','Find the highest common water level achievable when transfers lose a percentage.','For a proposed level, excess water above it becomes supply after loss, while deficits below it are demand. Binary search the boundary where effective supply can still fill every deficit.','bound the target between minimum and maximum bucket levels|sum excess supply and deficit demand for a trial level|apply the retained fraction to transferred excess|raise the feasible bound or lower the infeasible bound|return the final common level rounded to six decimals','O(n log(range/precision)) time; O(1) counting space.'],
2138:['s k fill','Split a string into groups of length k, padding only the final short group.','Read nonoverlapping blocks in original order. A block already of length k is unchanged; only missing positions in the last block use the fill character.','start at the next unread character|read up to k consecutive characters|pad missing positions with the fill character|append the full-sized group|return all groups','O(n+k) time and output space.'],
2139:['target maxDoubles','Reach the target from one with the fewest increments and limited doublings.','Work backward: an even target can be halved when a doubling remains, while an odd target must first lose one. When doublings run out, all remaining backward moves are decrements.','start from the target and remaining doubling budget|decrement an odd value once|halve an even value while budget remains|when no doubling remains count all remaining decrements at once|return the total reverse moves','O(log target) time; O(1) space.'],
2140:['questions','Earn the most points while respecting forced skips after answered questions.','A suffix DP compares skipping the current question with answering it and jumping beyond its brainpower cooldown. Both choices lead to already solved later suffixes.','fill suffix best scores from right to left|read the next suffix score for skipping|add current points to the suffix after its cooldown|store the better choice|return the best score starting at question zero','O(n) time and space.'],
2141:['n batteries','Run n computers simultaneously for as long as possible by swapping batteries.','For a target runtime, each battery contributes at most that runtime because it cannot power two computers at once. Feasibility is total capped energy at least n times the target.','bound runtime by total battery energy divided by computer count|try the upper midpoint runtime|sum each battery contribution capped at that runtime|raise the feasible lower bound or lower the upper bound|return the largest feasible integer runtime','O(battery count*log(total energy/n)) time; O(1) auxiliary space.'],
};
const solvers={
2130({head},emit){const nodes=makeListNodes(head);let slow=0,fast=0;while(fast!==null&&nodes[fast].next!==null){slow=nodes[slow].next;fast=nodes[nodes[fast].next].next;}let previous=null,current=slow;while(current!==null){const next=nodes[current].next;nodes[current].next=previous;previous=current;current=next;emit('Reverse one second-half link. The reversed head will expose twin partners in the opposite order from the original first half.',{linkedList:snapshotLinkedList(nodes,previous,[{label:'reversed',nodeId:previous}],[previous]),codeStage:'reverse',metrics:{secondHalfStart:slow,reversedHead:previous,next:current??'null'}},'update');}let a=0,b=previous,best=0;while(b!==null){const sum=nodes[a].val+nodes[b].val;best=Math.max(best,sum);emit('The two walkers are equally far from opposite ends of the original list, so these values form one twin pair.',{sequence:head,marks:{[a]:'left twin',[b]:'right twin'},linkedList:snapshotLinkedList(nodes,previous,[{label:'right twin',nodeId:b}],[b]),codeStage:'pair',metrics:{leftIndex:a,rightIndex:b,leftValue:nodes[a].val,rightValue:nodes[b].val,sum,best}},'update');a=nodes[a].next;b=nodes[b].next;}return best;},
2131({words},emit){const counts=new Map(),visited=new Set();words.forEach(w=>counts.set(w,(counts.get(w)||0)+1));let length=0,center=false;for(const[word,count]of counts){if(visited.has(word))continue;const reverse=[...word].reverse().join('');let pairs;if(word===reverse){pairs=Math.floor(count/2);center||=count%2===1;}else{pairs=Math.min(count,counts.get(reverse)||0);visited.add(reverse);}visited.add(word);length+=pairs*4;emit('Place each matched pair on opposite sides. Self-reversing words may leave one center candidate, but the palindrome has room for only one such center.',{sequence:words,table:[...counts],tableHeaders:['Word','Occurrences'],codeStage:'pair',metrics:{word,reverse,pairs,pairedLength:length,centerAvailable:center}},'update');}return length+(center?2:0);},
2132({grid,stampHeight,stampWidth},emit){const rows=grid.length,cols=grid[0].length,prefix=Array.from({length:rows+1},()=>Array(cols+1).fill(0)),difference=Array.from({length:rows+1},()=>Array(cols+1).fill(0));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)prefix[r+1][c+1]=grid[r][c]+prefix[r][c+1]+prefix[r+1][c]-prefix[r][c];for(let r=0;r+stampHeight<=rows;r++)for(let c=0;c+stampWidth<=cols;c++){const bottom=r+stampHeight,right=c+stampWidth,obstacles=prefix[bottom][right]-prefix[r][right]-prefix[bottom][c]+prefix[r][c];if(!obstacles){difference[r][c]++;difference[bottom][c]--;difference[r][right]--;difference[bottom][right]++;}emit('The rectangle prefix sum counts obstacles in constant time. Every obstacle-free placement is useful because stamps may overlap.',{matrix:grid,cell:[r,c],outputMatrix:difference,outputMatrixLabel:'Placement difference grid',codeStage:'place',metrics:{top:r,left:c,bottomExclusive:bottom,rightExclusive:right,obstacles,legal:obstacles===0}},'update');}let possible=true;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){difference[r][c]+=(r?difference[r-1][c]:0)+(c?difference[r][c-1]:0)-(r&&c?difference[r-1][c-1]:0);const covered=grid[r][c]===1||difference[r][c]>0;possible&&=covered;emit('Recover the number of legal stamps covering this cell. Obstacles need no stamp; every empty cell needs at least one covering placement.',{matrix:grid,cell:[r,c],outputMatrix:difference.slice(0,rows).map(row=>row.slice(0,cols)),outputMatrixLabel:'Coverage counts (processed cells)',outputCell:[r,c],codeStage:'cover',metrics:{row:r,column:c,obstacle:Boolean(grid[r][c]),coverCount:difference[r][c],covered,possibleSoFar:possible}},'update');}return possible;},
2133({matrix},emit){const n=matrix.length;for(let i=0;i<n;i++){const row=new Set(matrix[i]),column=new Set(matrix.map(r=>r[i])),valid=row.size===n&&column.size===n;emit('All entries are within one through n, so n distinct entries prove this row or column contains each required number exactly once.',{matrix,cell:[i,i],table:[['row',i,[...row].join(', '),row.size],['column',i,[...column].join(', '),column.size]],tableHeaders:['Line type','Index','Distinct values','Count'],codeStage:valid?'inspect':'failed',metrics:{n,valid}},'update');if(!valid)return false;}return true;},
2134({nums},emit){const width=nums.reduce((a,b)=>a+b,0);if(width===0)return 0;let ones=nums.slice(0,width).reduce((a,b)=>a+b,0),best=width-ones;for(let start=0;start<nums.length;start++){if(start)ones+=nums[(start+width-1)%nums.length]-nums[start-1];const zeros=width-ones;best=Math.min(best,zeros);emit('The candidate circular block has exactly as many slots as there are ones. Each zero inside exchanges with one outside, so its zero count is the swap cost.',{sequence:nums,marks:Object.fromEntries(Array.from({length:width},(_,j)=>[(start+j)%nums.length,'candidate block'])),codeStage:'window',metrics:{start,width,onesInside:ones,zerosInside:zeros,best}},'update');}return best;},
2135({startWords,targetWords},emit){const mask=word=>[...word].reduce((m,c)=>m|(1<<(c.charCodeAt(0)-97)),0),starts=new Set(startWords.map(mask));let total=0;for(let i=0;i<targetWords.length;i++){const word=targetWords[i],bits=mask(word);let added=null;for(const letter of word)if(starts.has(bits^(1<<(letter.charCodeAt(0)-97)))){added=letter;break;}if(added!==null)total++;emit('Removing one target letter models the letter added to a start word. Masks ignore rearrangement while preserving the distinct letter set.',{sequence:targetWords,index:i,table:startWords.map(w=>[w,mask(w).toString(2)]),tableHeaders:['Start word','Letter mask'],codeStage:'check',metrics:{target:word,mask:bits.toString(2),addedLetter:added??'none',obtainable:added!==null,total}},'update');}return total;},
2136({plantTime,growTime},emit){const order=plantTime.map((_,i)=>i).sort((a,b)=>growTime[b]-growTime[a]||a-b),schedule=[];let elapsed=0,bloom=0;for(const seed of order){const start=elapsed;elapsed+=plantTime[seed];const finish=elapsed+growTime[seed];bloom=Math.max(bloom,finish);schedule.push([seed,start,elapsed,growTime[seed],finish]);emit('Give long growth periods an early start so they overlap planting of later seeds. Only planting time occupies the shared worker.',{sequence:order,index:order.indexOf(seed),table:[...schedule],tableHeaders:['Seed','Plant start','Plant finish','Growth duration','Bloom day'],codeStage:'plant',metrics:{seed,elapsedPlanting:elapsed,latestBloom:bloom}},'update');}return bloom;},
2137({buckets,loss},emit){let low=Math.min(...buckets),high=Math.max(...buckets);const retained=1-loss/100;for(let iteration=0;iteration<60;iteration++){const target=(low+high)/2;let supply=0,demand=0;for(const amount of buckets)if(amount>target)supply+=(amount-target)*retained;else demand+=target-amount;const feasible=supply>=demand;if(feasible)low=target;else high=target;emit('Donors retain the target level and transfer only their excess. Apply loss to transferred water, then compare the surviving supply with deficits.',{sequence:buckets,table:buckets.map(amount=>[amount,Math.max(0,amount-target)*retained,Math.max(0,target-amount)]),tableHeaders:['Initial level','Effective donation','Required addition'],codeStage:'bound',metrics:{iteration:iteration+1,loss,target,supply,demand,feasible,low,high}},'update');}return Number(low.toFixed(6));},
2138({s,k,fill},emit){const groups=[];for(let start=0;start<s.length;start+=k){const raw=s.slice(start,start+k),group=raw+fill.repeat(k-raw.length);groups.push(group);emit('Copy the next source block, then fill only its missing trailing positions. Earlier complete groups never receive padding.',{sequence:[...s],window:[start,Math.min(s.length-1,start+k-1)],output:[...groups],codeStage:'group',metrics:{start,sourceLength:raw.length,padding:k-raw.length,group}},'update');}return groups;},
2139({target,maxDoubles},emit){let value=target,budget=maxDoubles,moves=0;while(value>1&&budget>0){const before=value,odd=value%2===1;if(odd)value--;else{value/=2;budget--;}moves++;emit(odd?'An odd value cannot be the result of doubling an integer, so undo one increment.':'Undo a doubling by halving the even value; this saves as many later decrements as possible.',{sequence:[before,value],codeStage:odd?'decrement':'halve',metrics:{before,value,remainingDoubles:budget,moves}},'update');}moves+=value-1;emit('With no useful doubling remaining, each remaining decrement costs one move. Count them directly instead of generating a huge trace.',{codeStage:'finish',metrics:{remainingValue:value,remainingDecrements:value-1,moves}},'update');return moves;},
2140({questions},emit){const best=Array(questions.length+1).fill(0);for(let i=questions.length-1;i>=0;i--){const[points,brainpower]=questions[i],next=Math.min(questions.length,i+brainpower+1),take=points+best[next],skip=best[i+1];best[i]=Math.max(take,skip);emit('Answering earns these points and jumps past the forced skipped questions. Skipping preserves access to the very next suffix.',{sequence:questions.map(q=>q[0]),index:i,output:[...best],outputIndex:i,codeStage:'choose',metrics:{question:i,points,brainpower,nextAllowed:next,take,skip,best:best[i]}},'update');}return best[0];},
2141({n,batteries},emit){let low=0,high=Math.floor(batteries.reduce((a,b)=>a+b,0)/n);while(low<high){const target=Math.floor((low+high+1)/2),energy=batteries.reduce((sum,b)=>sum+Math.min(b,target),0),required=n*target,feasible=energy>=required;if(feasible)low=target;else high=target-1;emit('A battery cannot contribute more than the target duration because it powers at most one computer at once. Swaps can distribute the remaining capped energy across computers.',{sequence:batteries,output:batteries.map(b=>Math.min(b,target)),codeStage:'bound',metrics:{target,availableCappedEnergy:energy,required,feasible,low,high}},'update');}return low;},
};
const python={
2130:`class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def pairSum(head):
    dummy = ListNode(0)
    tail = dummy
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    root = slow = fast = dummy.next
    while fast is not None and fast.next is not None:
        slow, fast = slow.next, fast.next.next
    previous, current = None, slow
    while current is not None:
        following = current.next
        current.next = previous
        previous, current = current, following  # step: reverse
    a, b, best = root, previous, 0
    while b is not None:
        best = max(best, a.val + b.val)  # step: pair
        a, b = a.next, b.next
    return best  # step: return`,
2131:`def longestPalindrome(words):
    from collections import Counter
    counts, visited = Counter(words), set()
    length, center = 0, False
    for word, count in counts.items():
        if word in visited:
            continue
        reverse = word[::-1]
        if word == reverse:
            pairs = count // 2
            center = center or count % 2 == 1
        else:
            pairs = min(count, counts[reverse])
            visited.add(reverse)
        visited.add(word)
        length += pairs * 4  # step: pair
    return length + (2 if center else 0)  # step: return`,
2132:`def possibleToStamp(grid, stampHeight, stampWidth):
    rows, cols = len(grid), len(grid[0])
    prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
    difference = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            prefix[r + 1][c + 1] = grid[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c]
    for r in range(rows - stampHeight + 1):
        for c in range(cols - stampWidth + 1):
            bottom, right = r + stampHeight, c + stampWidth
            obstacles = prefix[bottom][right] - prefix[r][right] - prefix[bottom][c] + prefix[r][c]
            if obstacles == 0:
                difference[r][c] += 1
                difference[bottom][c] -= 1
                difference[r][right] -= 1
                difference[bottom][right] += 1
            # step: place
    possible = True
    for r in range(rows):
        for c in range(cols):
            difference[r][c] += ((difference[r - 1][c] if r else 0)
                + (difference[r][c - 1] if c else 0)
                - (difference[r - 1][c - 1] if r and c else 0))
            possible = possible and (grid[r][c] == 1 or difference[r][c] > 0)  # step: cover
    return possible  # step: return`,
2133:`def checkValid(matrix):
    n = len(matrix)
    for i in range(n):
        row = set(matrix[i])
        column = {matrix[r][i] for r in range(n)}
        valid = len(row) == n and len(column) == n  # step: inspect
        if not valid:
            return False  # step: failed
    return True  # step: return`,
2134:`def minSwaps(nums):
    width = sum(nums)
    if width == 0:
        return 0  # step: empty
    ones = sum(nums[:width])
    best = width - ones
    for start in range(len(nums)):
        if start:
            ones += nums[(start + width - 1) % len(nums)] - nums[start - 1]
        best = min(best, width - ones)  # step: window
    return best  # step: return`,
2135:`def wordCount(startWords, targetWords):
    def mask(word):
        result = 0
        for letter in word:
            result |= 1 << (ord(letter) - ord('a'))
        return result
    starts = {mask(word) for word in startWords}
    total = 0
    for word in targetWords:
        bits = mask(word)
        if any((bits ^ (1 << (ord(letter) - ord('a')))) in starts for letter in word):
            total += 1
        # step: check
    return total  # step: return`,
2136:`def earliestFullBloom(plantTime, growTime):
    order = sorted(range(len(plantTime)), key=lambda i: (-growTime[i], i))
    elapsed = bloom = 0
    for seed in order:
        elapsed += plantTime[seed]
        bloom = max(bloom, elapsed + growTime[seed])  # step: plant
    return bloom  # step: return`,
2137:`def equalizeWater(buckets, loss):
    low, high = min(buckets), max(buckets)
    retained = 1 - loss / 100
    for _ in range(60):
        target = (low + high) / 2
        supply = sum(max(0, amount - target) * retained for amount in buckets)
        demand = sum(max(0, target - amount) for amount in buckets)
        if supply >= demand:
            low = target
        else:
            high = target
        # step: bound
    return round(low, 6)  # step: return`,
2138:`def divideString(s, k, fill):
    groups = []
    for start in range(0, len(s), k):
        raw = s[start:start + k]
        groups.append(raw + fill * (k - len(raw)))  # step: group
    return groups  # step: return`,
2139:`def minMoves(target, maxDoubles):
    value, budget, moves = target, maxDoubles, 0
    while value > 1 and budget > 0:
        if value % 2:
            value -= 1  # step: decrement
        else:
            value //= 2
            budget -= 1  # step: halve
        moves += 1
    moves += value - 1  # step: finish
    return moves  # step: return`,
2140:`def mostPoints(questions):
    best = [0] * (len(questions) + 1)
    for i in range(len(questions) - 1, -1, -1):
        points, brainpower = questions[i]
        following = min(len(questions), i + brainpower + 1)
        take, skip = points + best[following], best[i + 1]
        best[i] = max(take, skip)  # step: choose
    return best[0]  # step: return`,
2141:`def maxRunTime(n, batteries):
    low, high = 0, sum(batteries) // n
    while low < high:
        target = (low + high + 1) // 2
        energy = sum(min(battery, target) for battery in batteries)
        if energy >= n * target:
            low = target
        else:
            high = target - 1
        # step: bound
    return low  # step: return`,
};
const cases={
2130:[['Twin pairs span a longer list with an interior winning pair',{head:[12,4,25,8,17,21,6,30,9,14]}],['Two nodes form the only twin pair',{head:[7,18]}],['Repeated values retain separate twin identities',{head:[5,5,5,5,5,5]}],['The outermost pair wins',{head:[40,2,3,4,5,50]}]],
2131:[['Reverse pairs and several possible centers compete',{words:['ab','cd','ba','ee','dc','ab','ba','ff','ee','gg','ff','hh']}],['Unmatched nonsymmetric words contribute nothing',{words:['ab','cd','ef','gh']}],['Only one leftover symmetric word fits the center',{words:['aa','bb','cc','dd']}],['Repeated symmetric words form outer pairs plus a center',{words:['zz','zz','zz','zz','zz']}]],
2132:[['Overlapping stamps cover two open regions beside obstacles',{grid:[[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0]],stampHeight:2,stampWidth:2}],['An isolated empty cell cannot fit the requested stamp',{grid:[[1,1,1],[1,0,1],[1,1,1]],stampHeight:2,stampWidth:2}],['All obstacles need no covering even with an oversized stamp',{grid:[[1,1],[1,1]],stampHeight:4,stampWidth:3}],['A unit stamp covers every empty cell independently',{grid:[[0,1,0],[1,0,1],[0,0,0]],stampHeight:1,stampWidth:1}]],
2133:[['A larger cyclic Latin square satisfies every line',{matrix:[[1,2,3,4,5],[2,3,4,5,1],[3,4,5,1,2],[4,5,1,2,3],[5,1,2,3,4]]}],['Rows may be valid while columns repeat values',{matrix:[[1,2,3],[1,2,3],[1,2,3]]}],['A duplicated row value violates the condition',{matrix:[[1,1,3],[2,3,1],[3,2,2]]}],['A one-cell square has the full required set',{matrix:[[1]]}]],
2134:[['The best circular block may cross the array boundary',{nums:[1,1,0,1,0,0,1,0,1,1,0,1]}],['No ones need no swaps',{nums:[0,0,0,0]}],['An all-one circle is already grouped',{nums:[1,1,1,1,1]}],['A wraparound group is already contiguous',{nums:[1,1,0,0,0,1]}]],
2135:[['Different deleted letters reveal several source masks',{startWords:['fern','oak','redx','pine','ash','elm'],targetWords:['infer','koal','pines','flash','helms','bark']}],['A target with no matching reduced set is rejected',{startWords:['abc','def'],targetWords:['abxy','deyz']}],['A one-letter source can gain one distinct letter',{startWords:['q'],targetWords:['qt','tq','qx']}],['Rearrangement alone is insufficient without an added letter',{startWords:['abc'],targetWords:['bca','abcd']}]],
2136:[['Long-growth seeds should start before short-growth seeds',{plantTime:[3,1,5,2,4,2],growTime:[7,12,3,9,4,6]}],['One seed finishes after planting plus growth',{plantTime:[6],growTime:[8]}],['Equal growth durations permit any planting order',{plantTime:[2,5,1,4],growTime:[7,7,7,7]}],['A short planting task can have the longest growth',{plantTime:[9,1,7],growTime:[2,20,4]}]],
2137:[['Several donors and receivers balance after transfer loss',{buckets:[3,18,7,25,11,30],loss:20}],['No loss makes the common level the average',{buckets:[2,8,14,20],loss:0}],['Equal buckets need no transfer',{buckets:[9,9,9,9],loss:75}],['High transfer loss keeps the target near the lowest bucket',{buckets:[1,100],loss:99}]],
2138:[['A longer string ends in one padded group',{s:'lanternsbesidetheriver',k:6,fill:'x'}],['Exact division adds no fill characters',{s:'harborview',k:5,fill:'z'}],['Group size one preserves every character',{s:'moss',k:1,fill:'q'}],['The group is wider than the whole input',{s:'bay',k:8,fill:'t'}]],
2139:[['Limited halvings combine with forced odd decrements',{target:93,maxDoubles:4}],['No doubling permits only increments from one',{target:37,maxDoubles:0}],['The starting value needs no moves',{target:1,maxDoubles:8}],['A power of two uses repeated halving',{target:128,maxDoubles:10}]],
2140:[['Large rewards compete with long forced skips',{questions:[[7,2],[4,0],[13,3],[6,1],[9,0],[18,2],[5,1],[12,0],[8,0]]}],['Zero cooldown permits every positive reward',{questions:[[3,0],[8,0],[2,0],[7,0]]}],['A cooldown extending beyond the input still earns its points',{questions:[[20,10],[3,0],[4,0]]}],['One question is answered once',{questions:[[11,5]]}]],
2141:[['Uneven batteries require energy redistribution through swaps',{n:3,batteries:[4,11,7,18,6,9,3]}],['One computer can consume every battery in sequence',{n:1,batteries:[5,8,2,11]}],['Exactly one battery per computer is limited by the smallest',{n:3,batteries:[9,4,16]}],['A huge battery cannot power two computers simultaneously',{n:2,batteries:[100,1,1]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  const words=v=>Array.isArray(v)&&v.length>=1&&v.length<=40&&v.every(w=>typeof w==='string'&&/^[a-z]{1,26}$/.test(w)&&new Set(w).size===w.length);
  if(id===2130)need(vector(input.head,1,40)&&input.head.length%2===0,'Use an even-length list with 2-40 positive values.');
  if(id===2131)need(Array.isArray(input.words)&&input.words.length>=1&&input.words.length<=80&&input.words.every(w=>typeof w==='string'&&/^[a-z]{2}$/.test(w)),'Use 1-80 two-letter lowercase words.');
  if(id===2132)need(Array.isArray(input.grid)&&input.grid.length>=1&&input.grid.length<=10&&input.grid.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=10&&row.length===input.grid[0].length&&row.every(v=>v===0||v===1))&&integer(input.stampHeight,1,15)&&integer(input.stampWidth,1,15),'Use a binary grid at most ten by ten and stamp dimensions from one through fifteen.');
  if(id===2133)need(Array.isArray(input.matrix)&&input.matrix.length>=1&&input.matrix.length<=10&&input.matrix.every(row=>Array.isArray(row)&&row.length===input.matrix.length&&row.every(v=>integer(v,1,input.matrix.length))),'Use a square matrix at most ten by ten with values from one through its dimension.');
  if(id===2134)need(vector(input.nums)&&input.nums.every(v=>v===0||v===1),'Use 1-80 binary values.');
  if(id===2135)need(words(input.startWords)&&words(input.targetWords),'Use 1-40 lowercase words per array, each with distinct letters.');
  if(id===2136)need(vector(input.plantTime,1)&&vector(input.growTime,1)&&input.plantTime.length===input.growTime.length,'Use equal-length positive planting and growth arrays, at most 80 seeds.');
  if(id===2137)need(vector(input.buckets,0,40)&&integer(input.loss,0,99),'Use 1-40 nonnegative bucket levels and an integer percentage loss from zero through 99.');
  if(id===2138)need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s)&&integer(input.k,1,30)&&typeof input.fill==='string'&&/^[a-z]$/.test(input.fill),'Use 1-120 lowercase letters, group length 1-30, and one lowercase fill character.');
  if(id===2139)need(integer(input.target,1,1000000000)&&integer(input.maxDoubles,0,100),'Use target 1-1000000000 and a doubling budget from zero through 100.');
  if(id===2140)need(Array.isArray(input.questions)&&input.questions.length>=1&&input.questions.length<=80&&input.questions.every(q=>Array.isArray(q)&&q.length===2&&integer(q[0],1)&&integer(q[1],0,1000)),'Use 1-80 [positive points, nonnegative cooldown] questions.');
  if(id===2141)need(vector(input.batteries,1)&&integer(input.n,1,input.batteries?.length),'Use 1-80 positive battery capacities and no more computers than batteries.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===2130?{linkedList:snapshotLinkedList(makeListNodes(input.head),0)}:{},resultStage:(id,result,input)=>id===2133&&!result?'failed':id===2134&&!input.nums.some(Boolean)?'empty':'return',pseudocodeStages:{2130:{reverse:2,pair:4},2131:{pair:3},2132:{place:3,cover:4},2133:{failed:4},2134:{window:4},2135:{check:4},2136:{plant:4},2137:{bound:4},2138:{group:4},2139:{decrement:2,halve:3,finish:4},2140:{choose:4},2141:{bound:4}},tags:{2130:['Linked List','Two Pointers'],2131:['Hash Table','Greedy'],2132:['Matrix','Prefix Sum'],2133:['Matrix'],2134:['Sliding Window'],2135:['Bit Manipulation'],2136:['Greedy','Sorting'],2137:['Binary Search'],2138:['String'],2139:['Greedy'],2140:['Dynamic Programming'],2141:['Binary Search']}};
