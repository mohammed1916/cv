import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
const specs={
2178:['finalSum','Split an even total into as many distinct positive even values as possible.','Choose the smallest unused even values while they fit. Any leftover even amount is smaller than the next candidate, so adding it to the last chosen value preserves distinctness without reducing the count.','reject odd totals|take consecutive even values starting at two while they fit|stop when the next value exceeds the remainder|add the leftover amount to the last chosen value|return the maximum-size distinct even split','O(sqrt(total)) time and output space.'],
2179:['nums1 nums2','Count value triples occurring in the same relative order in both permutations.','Map the first permutation into positions in the second. For each middle element, a Fenwick tree counts earlier smaller positions; the unused larger positions count valid right endpoints.','map values to positions in the second permutation|scan the first permutation in its own order|query prior positions smaller than the current one|multiply valid left endpoints by unused larger right endpoints|sum contributions and update the position tree','O(n log n) time and O(n) space.'],
2180:['num','Count positive integers up to num with an even digit sum.','Every complete ten-number block has five even digit sums. In the final partial block, the prefix digit-sum parity determines which last digits qualify; exclude zero from the count.','separate the completed tens blocks from the final digit|count five qualifying numbers per full block|compute the final block prefix digit-sum parity|count eligible final digits through the bound and exclude zero|return the positive qualifying count','O(log num) time; O(1) auxiliary arithmetic state.'],
2181:['head','Merge each run between zero delimiters into one sum node.','Walk the actual list while accumulating positive values. An ending zero commits the run sum to a new output node and resets the accumulator for the next run.','decode the zero-delimited linked list|advance through positive nodes and accumulate a run sum|append a result node when a zero closes the run|reset the accumulator and continue|return the merged list values','O(n) time; O(number of runs) result-node space.'],
2182:['s repeatLimit','Build the lexicographically largest string without exceeding consecutive-repeat limits.','Use the largest remaining letter up to its allowed run length. If more copies remain, insert the largest available smaller letter as one separator; stop if no separator exists.','count remaining letters|append the largest letter up to the repeat limit|when copies remain choose one smaller separator|resume the largest letter after breaking its run|return the constructed string even if some letters remain unused','O(n+alphabet*n) time with a fixed 26-letter scan; O(n) output space.'],
2183:['nums k','Count pairs whose value product is divisible by k.','Only each value gcd with k matters. A prior gcd category pairs with the current value exactly when the product of the two gcds is divisible by k.','maintain counts grouped by gcd with k|compute the current value gcd category|sum prior categories whose product supplies all factors of k|add the current category after counting pairs|return the pair count','O(n*(divisor count of k+log k)) time; O(divisor count of k) space.'],
2184:['height width bricks','Count brick walls with no aligned internal seams in adjacent rows.','Generate every row tiling as a mask of internal seams. Two row patterns are compatible when their seam masks do not overlap; DP stacks compatible rows modulo one billion plus seven.','enumerate exact-width row tilings and their internal seam masks|connect row masks with no shared seam|start one way for every possible first row|extend each height using compatible previous rows|return the total wall count modulo one billion plus seven','O(row patterns squared+height*compatible pairs) time and O(row patterns squared) space.'],
2185:['words pref','Count words beginning with the supplied prefix.','Compare only the leading prefix-length characters of each word. Words shorter than the prefix fail naturally, and duplicate words count as separate occurrences.','visit every word occurrence|compare its beginning with the requested prefix|count matching occurrences|continue through the full input|return the prefix-match count','O(word count*prefix length) time; O(1) auxiliary space.'],
2186:['s t','Append the fewest characters to make two strings anagrams.','For each letter, the deficient string needs exactly the difference between the two counts. Summing absolute frequency differences counts all necessary appends on both sides.','count letters in both strings|compare each letter frequency|append its deficit to the smaller side|sum all absolute differences|return the minimum append count','O(length of s+length of t) time; O(26) space.'],
2187:['time totalTrips','Find the earliest time at which all buses together complete enough trips.','At a proposed time, each bus completes floor(time divided by its trip duration) trips. This count is monotone, so binary search the first feasible time.','bound completion by the fastest bus doing all trips|try the midpoint time|sum completed whole trips across buses|keep the earliest half still able to reach the target|return the first feasible completion time','O(bus count*log(min duration*totalTrips)) time; O(1) auxiliary space.'],
};
const solvers={
2178({finalSum},emit){if(finalSum%2){emit('A sum of even integers is even, so this odd total cannot be split as requested.',{codeStage:'odd'});return[];}let remaining=finalSum;const answer=[];for(let next=2;next<=remaining;next+=2){answer.push(next);remaining-=next;emit('Taking the smallest unused even value leaves the most budget for additional distinct values.',{output:[...answer],codeStage:'take',metrics:{chosen:next,remaining,count:answer.length}},'update');}answer[answer.length-1]+=remaining;emit('No additional distinct even value fits. Absorb the remaining even amount into the last value, keeping the same maximal count and preserving distinctness.',{output:answer,codeStage:'finish',metrics:{leftover:remaining,count:answer.length}},'update');return answer;},
2179({nums1,nums2},emit){const n=nums1.length,positions=Array(n),tree=Array(n+1).fill(0);nums2.forEach((value,i)=>positions[value]=i);const query=index=>{let sum=0;for(let p=index;p>0;p-=p&-p)sum+=tree[p];return sum;};let total=0;for(let i=0;i<n;i++){const value=nums1[i],position=positions[value],left=query(position),priorGreater=i-left,right=n-1-position-priorGreater,added=left*right;total+=added;for(let p=position+1;p<=n;p+=p&-p)tree[p]++;emit('Choose this value as the middle of the triple. Earlier smaller mapped positions provide left endpoints, and larger mapped positions not yet visited provide right endpoints.',{sequence:nums1,index:i,output:[...tree],table:nums1.map(v=>[v,positions[v]]),tableHeaders:['Value','Position in second permutation'],codeStage:'middle',metrics:{value,position,leftChoices:left,rightChoices:right,added,total}},'update');}return total;},
2180({num},emit){const prefix=Math.floor(num/10),last=num%10,parity=[...String(prefix)].reduce((sum,c)=>sum+Number(c),0)%2;let count=prefix*5;for(let digit=0;digit<=last;digit++){const even=(parity+digit)%2===0;if(even)count++;emit('Complete tens blocks each contribute five values. In the final block, combine this last digit with the fixed prefix parity; zero is removed after counting.',{sequence:Array.from({length:last+1},(_,i)=>10*prefix+i),index:digit,codeStage:'digit',metrics:{prefix,prefixParity:parity,lastDigit:digit,evenDigitSum:even,countIncludingZero:count}},'update');}return count-1;},
2181({head},emit){const nodes=makeListNodes(head),answer=[];let sum=0;for(let node=nodes[0].next;node!==null;node=nodes[node].next){const value=nodes[node].val;if(value===0){answer.push(sum);emit('This delimiter closes one positive run. Append its accumulated sum as a result node, then begin a fresh run.',{linkedList:snapshotLinkedList(nodes,0,[{label:'delimiter',nodeId:node}],[node]),output:[...answer],codeStage:'close',metrics:{sourceNode:node,committedSum:sum,resultNodes:answer.length}},'update');sum=0;}else{sum+=value;emit('Add this positive node to the open run. Delimiters themselves never become output nodes.',{linkedList:snapshotLinkedList(nodes,0,[{label:'current',nodeId:node}],[node]),output:[...answer],codeStage:'accumulate',metrics:{sourceNode:node,value,runSum:sum}},'update');}}return answer;},
2182({s,repeatLimit},emit){const counts=Array(26).fill(0),answer=[];for(const c of s)counts[c.charCodeAt(0)-97]++;for(let letter=25;letter>=0;){if(!counts[letter]){letter--;continue;}const take=Math.min(repeatLimit,counts[letter]);answer.push(...String.fromCharCode(97+letter).repeat(take));counts[letter]-=take;emit('Append as many copies of the greatest available letter as this run permits. Lexicographic order prioritizes this prefix over preserving smaller letters for later.',{sequence:[...s],output:[...answer],table:counts.flatMap((count,i)=>count?[[String.fromCharCode(97+i),count]]:[]),tableHeaders:['Letter','Remaining'],codeStage:'run',metrics:{letter:String.fromCharCode(97+letter),take,remaining:counts[letter]}},'update');if(counts[letter]){let separator=letter-1;while(separator>=0&&!counts[separator])separator--;if(separator<0){emit('More copies remain, but no smaller letter can break the run. Leaving them unused is necessary to respect the limit.',{output:[...answer],codeStage:'blocked'});break;}answer.push(String.fromCharCode(97+separator));counts[separator]--;emit('One largest-possible smaller letter breaks the run, allowing the higher letter to be used again next.',{output:[...answer],codeStage:'separator',metrics:{separator:String.fromCharCode(97+separator)}},'update');}}return answer.join('');},
2183({nums,k},emit){const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a;},counts=new Map();let total=0;for(let i=0;i<nums.length;i++){const category=gcd(nums[i],k),partners=[];let added=0;for(const[g,count]of counts)if((g*category)%k===0){added+=count;partners.push(g);}total+=added;counts.set(category,(counts.get(category)||0)+1);emit('The gcd retains exactly the factors relevant to k. Count only previously seen categories before inserting this value, so each unordered pair appears once.',{index:i,table:[...counts],tableHeaders:['GCD category','Seen count'],codeStage:'category',metrics:{value:nums[i],k,gcd:category,compatibleCategories:partners.join(', ')||'none',added,total}},'update');}return total;},
2184({height,width,bricks},emit){const rows=[];function generate(position,mask,lengths){if(position===width){rows.push({mask,lengths});return;}for(const brick of bricks)if(position+brick<=width){const next=position+brick;generate(next,next<width?mask|(1<<next):mask,[...lengths,brick]);}}generate(0,0,[]);const compatible=rows.map(a=>rows.flatMap((b,i)=>(a.mask&b.mask)===0?[i]:[]));let dp=rows.map(()=>1);emit('Each mask marks internal brick boundaries only. Adjacent rows are compatible when they share no internal boundary.',{table:rows.map((row,i)=>[i,row.lengths.join('+'),row.mask.toString(2).padStart(width,'0'),compatible[i].join(', ')||'none',dp[i]]),tableHeaders:['Pattern','Brick lengths','Seam mask','Compatible patterns','Ways'],codeStage:'rows',metrics:{width,height,patterns:rows.length}});for(let level=2;level<=height;level++){dp=rows.map((_,i)=>compatible[i].reduce((sum,j)=>(sum+dp[j])%1000000007,0));emit('For each new top row, add the counts of walls whose previous top row is compatible. Earlier rows already satisfy their own adjacency constraints.',{table:rows.map((row,i)=>[i,row.lengths.join('+'),row.mask.toString(2).padStart(width,'0'),dp[i]]),tableHeaders:['Top pattern','Brick lengths','Seam mask','Ways'],output:[...dp],codeStage:'layer',metrics:{completedHeight:level,targetHeight:height,ways:dp.reduce((a,b)=>(a+b)%1000000007,0)}},'update');}return dp.reduce((a,b)=>(a+b)%1000000007,0);},
2185({words,pref},emit){let count=0;for(let i=0;i<words.length;i++){const match=words[i].startsWith(pref);count+=Number(match);emit('Compare the requested prefix only at the beginning. A matching fragment later in the word does not qualify.',{sequence:words,index:i,codeStage:'check',metrics:{word:words[i],prefix:pref,match,count}},'update');}return count;},
2186({s,t},emit){const a=Array(26).fill(0),b=Array(26).fill(0);for(const c of s)a[c.charCodeAt(0)-97]++;for(const c of t)b[c.charCodeAt(0)-97]++;let total=0;for(let i=0;i<26;i++){if(!a[i]&&!b[i])continue;const difference=Math.abs(a[i]-b[i]);total+=difference;emit('Append the missing copies to the string with fewer occurrences of this letter. Other letters cannot compensate for this deficit.',{sequence:[...s],table:a.flatMap((count,j)=>count||b[j]?[[String.fromCharCode(97+j),count,b[j],Math.abs(count-b[j])]]:[]),tableHeaders:['Letter','First count','Second count','Required appends'],codeStage:'letter',metrics:{letter:String.fromCharCode(97+i),first:a[i],second:b[i],appendTo:a[i]>b[i]?'second':a[i]<b[i]?'first':'neither',added:difference,total}},'update');}return total;},
2187({time,totalTrips},emit){let low=1,high=Math.min(...time)*totalTrips;while(low<high){const trial=Math.floor((low+high)/2),completed=time.map(duration=>Math.floor(trial/duration)),trips=completed.reduce((a,b)=>a+b,0),feasible=trips>=totalTrips;if(feasible)high=trial;else low=trial+1;emit('Only complete trips count. If this time is feasible, later times are also feasible, so retain the earlier half including this trial.',{sequence:time,output:completed,codeStage:'bound',metrics:{trial,completedTrips:trips,totalTrips,feasible,low,high}},'update');}return low;},
};
const python={
2178:`def maximumEvenSplit(finalSum):
    if finalSum % 2:
        return []  # step: odd
    remaining, next_even, answer = finalSum, 2, []
    while next_even <= remaining:
        answer.append(next_even)
        remaining -= next_even  # step: take
        next_even += 2
    answer[-1] += remaining  # step: finish
    return answer  # step: return`,
2179:`def goodTriplets(nums1, nums2):
    n = len(nums1)
    positions = {value: i for i, value in enumerate(nums2)}
    tree = [0] * (n + 1)
    def query(index):
        total = 0
        while index:
            total += tree[index]
            index -= index & -index
        return total
    total = 0
    for i, value in enumerate(nums1):
        position = positions[value]
        left = query(position)
        right = n - 1 - position - (i - left)
        total += left * right
        p = position + 1
        while p <= n:
            tree[p] += 1
            p += p & -p
        # step: middle
    return total  # step: return`,
2180:`def countEven(num):
    prefix, last = divmod(num, 10)
    parity = sum(map(int, str(prefix))) % 2
    count = prefix * 5
    for digit in range(last + 1):
        if (parity + digit) % 2 == 0:
            count += 1
        # step: digit
    return count - 1  # step: return`,
2181:`class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def mergeNodes(head):
    source_dummy = ListNode(0)
    tail = source_dummy
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    output_dummy = tail = ListNode(0)
    node, total = source_dummy.next.next, 0
    while node is not None:
        if node.val == 0:
            tail.next = ListNode(total)
            tail = tail.next  # step: close
            total = 0
        else:
            total += node.val  # step: accumulate
        node = node.next
    answer, node = [], output_dummy.next
    while node is not None:
        answer.append(node.val)
        node = node.next
    return answer  # step: return`,
2182:`def repeatLimitedString(s, repeatLimit):
    counts = [0] * 26
    for letter in s:
        counts[ord(letter) - ord('a')] += 1
    answer, letter = [], 25
    while letter >= 0:
        if counts[letter] == 0:
            letter -= 1
            continue
        take = min(repeatLimit, counts[letter])
        answer.append(chr(ord('a') + letter) * take)
        counts[letter] -= take  # step: run
        if counts[letter]:
            separator = letter - 1
            while separator >= 0 and counts[separator] == 0:
                separator -= 1
            if separator < 0:
                break  # step: blocked
            answer.append(chr(ord('a') + separator))
            counts[separator] -= 1  # step: separator
    return ''.join(answer)  # step: return`,
2183:`def countPairs(nums, k):
    from math import gcd
    counts, total = {}, 0
    for value in nums:
        category = gcd(value, k)
        for prior, count in counts.items():
            if prior * category % k == 0:
                total += count
        counts[category] = counts.get(category, 0) + 1  # step: category
    return total  # step: return`,
2184:`def buildWall(height, width, bricks):
    modulus, rows = 1_000_000_007, []
    def generate(position, mask):
        if position == width:
            rows.append(mask)
            return
        for brick in bricks:
            following = position + brick
            if following <= width:
                generate(following, mask | (1 << following) if following < width else mask)
    generate(0, 0)
    compatible = [[j for j, b in enumerate(rows) if a & b == 0] for a in rows]
    dp = [1] * len(rows)  # step: rows
    for level in range(2, height + 1):
        dp = [sum(dp[j] for j in compatible[i]) % modulus for i in range(len(rows))]  # step: layer
    return sum(dp) % modulus  # step: return`,
2185:`def prefixCount(words, pref):
    count = 0
    for word in words:
        count += int(word.startswith(pref))  # step: check
    return count  # step: return`,
2186:`def minSteps(s, t):
    from collections import Counter
    first, second = Counter(s), Counter(t)
    total = 0
    for letter in sorted(first.keys() | second.keys()):
        total += abs(first[letter] - second[letter])  # step: letter
    return total  # step: return`,
2187:`def minimumTime(time, totalTrips):
    low, high = 1, min(time) * totalTrips
    while low < high:
        trial = (low + high) // 2
        completed = sum(trial // duration for duration in time)
        if completed >= totalTrips:
            high = trial
        else:
            low = trial + 1
        # step: bound
    return low  # step: return`,
};
const cases={
2178:[['Several small even values leave a remainder for the final term',{finalSum:86}],['Odd totals cannot be split into even values',{finalSum:35}],['The smallest positive even total forms one term',{finalSum:2}],['An exact consecutive-even sum needs no remainder adjustment',{finalSum:42}]],
2179:[['Two longer permutations agree on some but not all triples',{nums1:[4,1,7,0,6,2,8,3,5],nums2:[1,4,0,7,2,6,3,8,5]}],['Identical order makes every triple good',{nums1:[0,1,2,3,4,5],nums2:[0,1,2,3,4,5]}],['Opposite orders have no common increasing triple',{nums1:[0,1,2,3,4],nums2:[4,3,2,1,0]}],['Only one possible triple must be checked',{nums1:[2,0,1],nums2:[2,0,1]}]],
2180:[['The final partial block depends on the prefix parity',{num:347}],['No positive even digit sum appears before two',{num:1}],['A full final block contributes its five matches',{num:99}],['Crossing a power of ten changes the prefix digit sum',{num:1000}]],
2181:[['Several differently sized runs become one sum node each',{head:[0,4,7,2,0,9,0,3,8,6,1,0,5,12,0]}],['One positive value between delimiters remains its own sum',{head:[0,17,0]}],['Single-node runs produce the same sequence of values',{head:[0,2,0,5,0,8,0]}],['A long run becomes one output node',{head:[0,1,3,5,7,9,11,0]}]],
2182:[['High-frequency large letters need several smaller separators',{s:'zzzzzyyyyxxwwvvaaa',repeatLimit:2}],['One distinct letter leaves excess copies unused',{s:'mmmmmmm',repeatLimit:3}],['A limit of one forbids all equal neighbors',{s:'dddddcccbbba',repeatLimit:1}],['A generous limit permits ordinary descending order',{s:'orchard',repeatLimit:10}]],
2183:[['Different gcd categories combine missing factors of twelve',{nums:[6,5,8,9,12,7,4,18,10,3],k:12}],['Divisor one accepts every pair',{nums:[3,7,11,16],k:1}],['Prime divisor requires a multiple in each qualifying pair',{nums:[2,5,14,9,21,4],k:7}],['No pair supplies the necessary factors',{nums:[1,3,5,7],k:8}]],
2184:[['Several row tilings can alternate without aligned seams',{height:4,width:7,bricks:[2,3]}],['A full-width brick has no internal seam',{height:6,width:5,bricks:[5]}],['A single row has no adjacent-row restriction',{height:1,width:6,bricks:[1,2,3]}],['No brick combination reaches the exact width',{height:3,width:5,bricks:[2,4]}]],
2185:[['Repeated prefix matches count separate word occurrences',{words:['harbor','hardwood','harmony','orchard','hare','harbor','hill','harvest'],pref:'har'}],['The prefix can be longer than every word',{words:['oak','elm','ash'],pref:'forest'}],['An exact word match also starts with the prefix',{words:['bay','bayside','bayou','clay'],pref:'bay'}],['An internal fragment does not count as a prefix',{words:['replant','upland','island'],pref:'land'}]],
2186:[['Several letters need appending on opposite sides',{s:'lanternriver',t:'winterharbor'}],['Existing anagrams need no appended letters',{s:'listen',t:'silent'}],['Disjoint alphabets require appending both full strings',{s:'aaaa',t:'zzzzz'}],['One repeated-letter deficit has a direct count',{s:'mmmmmm',t:'mm'}]],
2187:[['Different bus durations contribute at different rates',{time:[4,7,11,5,9],totalTrips:37}],['One bus must finish every requested trip',{time:[13],totalTrips:8}],['The first completed trip comes from the fastest bus',{time:[9,3,14,8],totalTrips:1}],['Equal-duration buses complete trips simultaneously',{time:[6,6,6,6],totalTrips:17}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2178)need(integer(input.finalSum,1,100000),'Use a positive total at most 100000 for bounded split playback.');
  if(id===2179)need(Array.isArray(input.nums1)&&input.nums1.length>=3&&input.nums1.length<=80&&Array.isArray(input.nums2)&&input.nums2.length===input.nums1.length&&[input.nums1,input.nums2].every(v=>new Set(v).size===v.length&&v.every(x=>integer(x,0,v.length-1))),'Use two permutations of 0 through n-1 with equal length 3-80.');
  if(id===2180)need(integer(input.num,1,1000000000),'Use a positive upper bound at most one billion.');
  if(id===2181)need(vector(input.head,0,60)&&input.head.length>=3&&input.head[0]===0&&input.head.at(-1)===0&&input.head.every((v,i)=>i===0||v!==0||input.head[i-1]!==0),'Use 3-60 nonnegative list values, zeros at both ends, and no consecutive zeros.');
  if(id===2182)need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s)&&integer(input.repeatLimit,1,120),'Use 1-120 lowercase letters and a positive repeat limit at most 120.');
  if(id===2183)need(vector(input.nums,1)&&integer(input.k,1),'Use 1-80 positive values and a positive divisor at most one million.');
  if(id===2184)need(integer(input.height,1,8)&&integer(input.width,1,8)&&vector(input.bricks,1,8)&&input.bricks.every(v=>v<=8)&&new Set(input.bricks).size===input.bricks.length,'Use wall height/width 1-8 and distinct brick widths from one through eight.');
  if(id===2185)need(Array.isArray(input.words)&&input.words.length>=1&&input.words.length<=50&&input.words.every(w=>typeof w==='string'&&/^[a-z]{1,30}$/.test(w))&&typeof input.pref==='string'&&/^[a-z]{1,30}$/.test(input.pref),'Use 1-50 lowercase words and a lowercase prefix, each length 1-30.');
  if(id===2186)need([input.s,input.t].every(s=>typeof s==='string'&&/^[a-z]{1,120}$/.test(s)),'Use two lowercase strings of length 1-120.');
  if(id===2187)need(vector(input.time,1)&&integer(input.totalTrips,1,100000000),'Use 1-80 positive bus durations up to one million and at most 100 million requested trips.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===2181?{linkedList:snapshotLinkedList(makeListNodes(input.head),0)}:{},resultState:(id,result)=>id===2181?{linkedList:snapshotLinkedList(makeListNodes(result),0)}:{},resultStage:(id,result,input)=>id===2178&&input.finalSum%2?'odd':'return',pseudocodeStages:{2178:{odd:1,take:2,finish:4},2179:{middle:4},2180:{digit:4},2181:{accumulate:2,close:3},2182:{run:2,separator:3,blocked:5},2183:{category:4},2184:{rows:2,layer:4},2185:{check:3},2186:{letter:4},2187:{bound:4}},tags:{2178:['Greedy'],2179:['Binary Indexed Tree'],2180:['Math'],2181:['Linked List'],2182:['Greedy'],2183:['Math','Hash Table'],2184:['Dynamic Programming','Bit Manipulation'],2185:['String'],2186:['Counting'],2187:['Binary Search']}};
