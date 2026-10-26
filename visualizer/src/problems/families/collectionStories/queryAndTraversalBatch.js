import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
const specs={
2053:['arr k','Return the kth string that appears exactly once, preserving input order.','Count all occurrences before selecting anything. Then scan the original order, advancing the distinct-string rank only for frequency-one entries.','count every string occurrence|scan the original array order|check whether its total frequency is one|advance the distinct rank and stop at k|return that string or empty string if too few exist','O(total input characters) expected time; O(distinct strings) space.'],
2054:['events','Maximize the total value of at most two nonoverlapping events.','Sort by start time and prepare suffix maximum values. For each first event, binary-search the first start strictly after its inclusive end, then combine with the best eligible suffix event.','sort events and compute suffix best values|choose each possible first event|search for the first start strictly greater than its end|combine its value with the eligible suffix best|return the largest one-event or two-event value','O(n log n) time; O(n) suffix space.'],
2055:['s queries','Count plates strictly between the outermost candles inside each query range.','Prefix plate counts answer distances, while nearest-candle arrays find the first candle at or after the left bound and the last candle at or before the right bound.','build plate prefixes and nearest candles in both directions|read a query range|move both bounds inward to candles|subtract plate prefixes when two ordered candles remain|return all query counts','O(string length+queries) time; O(string length) auxiliary space.'],
2057:['nums','Find the smallest index whose last decimal digit equals its value.','Scan indices in order and compare i modulo ten with nums[i]. Stop at the first equality to preserve the smallest-index requirement.','start at index zero|inspect each value in order|compare i modulo ten with the value|stop at the first equality|return that index or -1','O(n) time; O(1) auxiliary space.'],
2058:['head','Find minimum and maximum index distances between linked-list critical points.','A critical point is a strict local peak or valley. Adjacent critical positions give the minimum distance, while the first and last give the maximum.','walk the list with previous/current/next nodes|inspect interior nodes only|classify strict peaks and valleys|update the previous gap and first/last critical positions|return minimum and maximum distances or [-1,-1]','O(n) time; O(1) counting state beyond JSON list storage.'],
2059:['nums start goal','Reach goal using additions, subtractions, and XOR with the fewest operations.','BFS explores reachable values between zero and one thousand. A generated goal counts immediately even outside that interval, but an out-of-range value cannot become an intermediate state.','enqueue start at distance zero|process one BFS distance layer|generate plus, minus, and XOR neighbors|accept goal immediately and queue only unseen in-range intermediates|return the first goal distance or -1','O(1001*operation values) time; O(1001) visited space.'],
2061:['room','Count cells cleaned by a robot that moves forward or turns clockwise when blocked.','A full robot state includes row, column, and direction. Once that state repeats, future behavior repeats too; count distinct visited cells separately from the state set.','start at the top-left facing east|record the current position and direction|inspect the next forward cell|move if clear, otherwise turn clockwise, stopping on a repeated full state|return the number of distinct cleaned cells','O(rows*columns) time and visited-state space.'],
2062:['word','Count substrings made only of vowels and containing all five vowel types.','Track the last occurrence of each vowel and the most recent consonant. At each endpoint, valid starts lie after that consonant and no later than the earliest of the five last occurrences.','initialize last vowel positions and consonant boundary|read the next character|update its vowel position or move the consonant boundary|add max(0, minimum last-vowel position minus boundary)|return the vowel-substring count','O(n) time; O(1) vowel-position space.'],
2063:['word','Sum vowel counts across every substring of a word.','A vowel at position i belongs to (i+1)*(n-i) substrings. Count its choices of left and right boundaries instead of enumerating substrings.','start the total at zero|inspect each character|check whether it is a vowel|add (i+1)*(n-i) for vowel positions|return the total contribution','O(n) time; O(1) auxiliary space.'],
2074:['head','Reverse each linked-list group whose actual length is even.','Groups request lengths one, two, three, and so on, but the last group may be shorter. Count its actual nodes before deciding whether to reverse its pointers.','start before the list with requested group size one|collect the next available group|check the actual group length parity|reverse even groups and reconnect both boundaries|return the final linked-list values','O(n) pointer work; O(n) JSON input/output storage.'],
};
const solvers={
2053({arr,k},emit){const counts=new Map();for(let i=0;i<arr.length;i++){counts.set(arr[i],(counts.get(arr[i])||0)+1);emit('Count the entire input before deciding distinctness. A string seen once now may appear again later.',{index:i,table:[...counts],tableHeaders:['String','Total seen'],codeStage:'count',metrics:{value:arr[i] }},'update');}let rank=0,answer='';for(let i=0;i<arr.length;i++){const unique=counts.get(arr[i])===1;if(unique)rank++;emit('Keep the original order and advance the rank only for strings whose final frequency is exactly one.',{index:i,codeStage:'choose',metrics:{value:arr[i],frequency:counts.get(arr[i]),unique,rank,k}});if(unique&&rank===k){answer=arr[i];break;}}return answer;},
2054({events},emit){const ordered=events.map(row=>[...row]).sort((a,b)=>a[0]-b[0]),suffix=Array(events.length+1).fill(0);for(let i=events.length-1;i>=0;i--)suffix[i]=Math.max(suffix[i+1],ordered[i][2]);let best=0;for(let i=0;i<ordered.length;i++){const[start,end,value]=ordered[i];let left=0,right=ordered.length;while(left<right){const middle=Math.floor((left+right)/2);if(ordered[middle][0]<=end)left=middle+1;else right=middle;}const candidate=value+suffix[left];best=Math.max(best,candidate);emit('Event endpoints are inclusive, so an event starting exactly at this end still overlaps. Search strictly beyond the end and use the highest-valued event anywhere in the remaining suffix.',{sequence:ordered.map(([a,b,v])=>`${a}-${b}: ${v}`),index:i,table:ordered.map((row,j)=>[j,...row,suffix[j]]),tableHeaders:['Index','Start','End','Value','Suffix best'],codeStage:'update',metrics:{start,end,nextEligible:left<ordered.length?left:'none',candidate,best}},'update');}return best;},
2055({s,queries},emit){const n=s.length,prefix=Array(n+1).fill(0),before=Array(n).fill(-1),after=Array(n).fill(-1);let candle=-1;for(let i=0;i<n;i++){prefix[i+1]=prefix[i]+Number(s[i]==='*');if(s[i]==='|')candle=i;before[i]=candle;}candle=-1;for(let i=n-1;i>=0;i--){if(s[i]==='|')candle=i;after[i]=candle;}const result=[],table=[];for(const[left,right]of queries){const start=after[left],end=before[right],count=start!==-1&&end!==-1&&start<end?prefix[end]-prefix[start]:0;result.push(count);table.push([left,right,start,end,count]);emit('Trim the requested interval inward to actual candles. With fewer than two ordered candles, no plate is enclosed; otherwise one prefix subtraction counts all enclosed plates.',{index:start,window:[left,right],marks:end>=0?{[end]:'closing candle'}:{},output:[...result],table:[...table],tableHeaders:['Query left','Query right','First candle','Last candle','Plates'],codeStage:'update',metrics:{left,right,start,end,count}},'update');}return result;},
2057({nums},emit){let answer=-1;for(let i=0;i<nums.length;i++){const match=i%10===nums[i];emit('Compare this index last digit with the stored value. The first successful comparison is automatically the smallest matching index.',{index:i,codeStage:'inspect',metrics:{index:i,indexModuloTen:i%10,value:nums[i],match}});if(match){answer=i;break;}}return answer;},
2058({head},emit){const nodes=makeListNodes(head),critical=[];let minimum=Infinity;for(let i=1;i<head.length-1;i++){const peak=head[i]>head[i-1]&&head[i]>head[i+1],valley=head[i]<head[i-1]&&head[i]<head[i+1];if(peak||valley){if(critical.length)minimum=Math.min(minimum,i-critical.at(-1));critical.push(i);}emit('Only strict comparisons identify a peak or valley. Equal neighboring values do not qualify; each new critical point updates the adjacent minimum gap and the first-to-last maximum.',{linkedList:snapshotLinkedList(nodes,0,[{label:'previous',nodeId:i-1},{label:'current',nodeId:i},{label:'next',nodeId:i+1}],critical),index:i,table:critical.map(index=>[index,head[index]]),tableHeaders:['Critical index','Value'],codeStage:'update',metrics:{peak,valley,minimum:Number.isFinite(minimum)?minimum:'needs two',maximum:critical.length>=2?critical.at(-1)-critical[0]:'needs two'}},'update');}return critical.length<2?[-1,-1]:[minimum,critical.at(-1)-critical[0]];},
2059({nums,start,goal},emit){if(start===goal){emit('The starting value is already the goal, so no operation is needed.',{codeStage:'already',metrics:{start,goal}});return 0;}const seen=new Set([start]);let frontier=[start],distance=0;while(frontier.length){const next=[],transitions=[];for(const value of frontier)for(const operand of nums)for(const[operation,candidate]of [['+',value+operand],['-',value-operand],['xor',value^operand]]){if(candidate===goal){emit('This generated value reaches the goal immediately. A final goal may be outside the intermediate range; it does not need to be queued.',{sequence:frontier,codeStage:'found',metrics:{from:value,operation,operand,goal,distance:distance+1}},'update');return distance+1;}if(candidate>=0&&candidate<=1000&&!seen.has(candidate)){seen.add(candidate);next.push(candidate);transitions.push([value,`${operation} ${operand}`,candidate]);}}distance++;emit('All newly queued values are one operation farther away. Ignore out-of-range intermediates and values already reached at a shorter distance.',{sequence:frontier,table:transitions,tableHeaders:['Previous value','Operation','New value'],codeStage:'layer',metrics:{distance,frontier:frontier.length,newStates:next.length,visited:seen.size}},'update');frontier=next;}return-1;},
2061({room},emit){const directions=[[0,1],[1,0],[0,-1],[-1,0]],names=['east','south','west','north'],seen=new Set(),cleaned=new Set();let r=0,c=0,direction=0;while(!seen.has(`${r},${c},${direction}`)){seen.add(`${r},${c},${direction}`);cleaned.add(`${r},${c}`);const[dr,dc]=directions[direction],nr=r+dr,nc=c+dc,blocked=nr<0||nr>=room.length||nc<0||nc>=room[0].length||room[nr][nc]===1;emit('Position alone does not determine the future: the facing direction matters too. Count cleaned cells once, and stop only when the complete position-direction state repeats.',{matrix:room,cell:[r,c],outputMatrix:room.map((row,i)=>row.map((v,j)=>v?'wall':cleaned.has(`${i},${j}`)?'clean':'unvisited')),outputMatrixLabel:'Cleaning progress',codeStage:'update',metrics:{row:r,column:c,direction:names[direction],blocked,action:blocked?'turn clockwise':'move forward',cleaned:cleaned.size,states:seen.size}},'update');if(blocked)direction=(direction+1)%4;else{r=nr;c=nc;}}return cleaned.size;},
2062({word},emit){const last={a:-1,e:-1,i:-1,o:-1,u:-1};let boundary=-1,total=0;for(let i=0;i<word.length;i++){if(word[i] in last)last[word[i]]=i;else boundary=i;const earliest=Math.min(...Object.values(last)),added=Math.max(0,earliest-boundary);total+=added;emit('A valid start must be after the last consonant and include the most distant required vowel occurrence. Their gap counts every valid vowel-only substring ending here.',{index:i,table:Object.entries(last),tableHeaders:['Vowel','Last index'],codeStage:'update',metrics:{lastConsonant:boundary,earliestRequiredVowel:earliest,added,total}},'update');}return total;},
2063({word},emit){let total=0;for(let i=0;i<word.length;i++){const vowel='aeiou'.includes(word[i]),left=i+1,right=word.length-i,contribution=vowel?left*right:0;total+=contribution;emit('Choose any left boundary at or before this position and any right boundary at or after it. Their product counts all substrings containing this vowel, including contributions from other vowels independently.',{index:i,codeStage:'update',metrics:{letter:word[i],vowel,leftChoices:left,rightChoices:right,contribution,total}},'update');}return total;},
2074({head},emit){const nodes=makeListNodes(head),dummy={next:0},getNext=id=>id===-1?dummy.next:nodes[id].next,setNext=(id,next)=>{if(id===-1)dummy.next=next;else nodes[id].next=next;};let before=-1,requested=1;while(getNext(before)!==null){const start=getNext(before),group=[];let current=start;while(current!==null&&group.length<requested){group.push(current);current=nodes[current].next;}const after=current,even=group.length%2===0;if(even){let previous=after;current=start;for(let i=0;i<group.length;i++){const next=nodes[current].next;nodes[current].next=previous;previous=current;current=next;}setNext(before,previous);before=start;}else before=group.at(-1);emit('Use the actual available group length, not the requested length. For an even group, reverse its pointers and reconnect both the preceding boundary and the following remainder.',{linkedList:snapshotLinkedList(nodes,dummy.next,[{label:'group tail',nodeId:before},{label:'next group',nodeId:after}],group),codeStage:'update',metrics:{requested,actual:group.length,reversed:even}},'update');requested++;}const result=[];for(let node=dummy.next;node!==null;node=nodes[node].next)result.push(nodes[node].val);return result;},
};
const python={
2053:`def kthDistinct(arr, k):
    counts = {}
    for value in arr:
        counts[value] = counts.get(value, 0) + 1  # step: count
    rank, answer = 0, ''
    for value in arr:
        unique = counts[value] == 1
        if unique:
            rank += 1
        # step: choose
        if unique and rank == k:
            answer = value
            break
    return answer  # step: return`,
2054:`def maxTwoEvents(events):
    from bisect import bisect_right
    ordered = sorted(events)
    starts = [event[0] for event in ordered]
    suffix = [0] * (len(events) + 1)
    for i in range(len(events) - 1, -1, -1):
        suffix[i] = max(suffix[i + 1], ordered[i][2])
    best = 0
    for start, end, value in ordered:
        next_index = bisect_right(starts, end)
        best = max(best, value + suffix[next_index])  # step: update
    return best  # step: return`,
2055:`def platesBetweenCandles(s, queries):
    n = len(s)
    prefix, before, after = [0] * (n + 1), [-1] * n, [-1] * n
    candle = -1
    for i, character in enumerate(s):
        prefix[i + 1] = prefix[i] + (character == '*')
        if character == '|':
            candle = i
        before[i] = candle
    candle = -1
    for i in range(n - 1, -1, -1):
        if s[i] == '|':
            candle = i
        after[i] = candle
    result = []
    for left, right in queries:
        first, last = after[left], before[right]
        count = prefix[last] - prefix[first] if first != -1 and last != -1 and first < last else 0
        result.append(count)  # step: update
    return result  # step: return`,
2057:`def smallestEqual(nums):
    answer = -1
    for i, value in enumerate(nums):
        match = i % 10 == value  # step: inspect
        if match:
            answer = i
            break
    return answer  # step: return`,
2058:`def nodesBetweenCriticalPoints(head):
    # JSON head contains the linked-list values in next-pointer order.
    first = previous = -1
    minimum = float('inf')
    for i in range(1, len(head) - 1):
        peak = head[i] > head[i - 1] and head[i] > head[i + 1]
        valley = head[i] < head[i - 1] and head[i] < head[i + 1]
        if peak or valley:
            if previous != -1:
                minimum = min(minimum, i - previous)
            else:
                first = i
            previous = i
        # step: update
    return [-1, -1] if minimum == float('inf') else [minimum, previous - first]  # step: return`,
2059:`def minimumOperations(nums, start, goal):
    if start == goal:
        return 0  # step: already
    seen, frontier, distance = {start}, [start], 0
    while frontier:
        next_frontier = []
        for value in frontier:
            for operand in nums:
                for candidate in (value + operand, value - operand, value ^ operand):
                    if candidate == goal:
                        return distance + 1  # step: found
                    if 0 <= candidate <= 1000 and candidate not in seen:
                        seen.add(candidate)
                        next_frontier.append(candidate)
        distance += 1
        frontier = next_frontier  # step: layer
    return -1  # step: failed`,
2061:`def numberOfCleanRooms(room):
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    row = col = direction = 0
    seen, cleaned = set(), set()
    while (row, col, direction) not in seen:
        seen.add((row, col, direction))
        cleaned.add((row, col))
        dr, dc = directions[direction]
        nr, nc = row + dr, col + dc
        blocked = not (0 <= nr < len(room) and 0 <= nc < len(room[0])) or room[nr][nc] == 1  # step: update
        if blocked:
            direction = (direction + 1) % 4
        else:
            row, col = nr, nc
    return len(cleaned)  # step: return`,
2062:`def countVowelSubstrings(word):
    last = dict.fromkeys('aeiou', -1)
    boundary, total = -1, 0
    for i, letter in enumerate(word):
        if letter in last:
            last[letter] = i
        else:
            boundary = i
        total += max(0, min(last.values()) - boundary)  # step: update
    return total  # step: return`,
2063:`def countVowels(word):
    total = 0
    for i, letter in enumerate(word):
        if letter in 'aeiou':
            total += (i + 1) * (len(word) - i)
        # step: update
    return total  # step: return`,
2074:`class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def reverseEvenLengthGroups(head):
    # Build linked nodes from the JSON value array.
    dummy = ListNode()
    tail = dummy
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    before, requested = dummy, 1
    while before.next is not None:
        start = before.next
        tail, count = before, 0
        while tail.next is not None and count < requested:
            tail = tail.next
            count += 1
        after = tail.next
        if count % 2 == 0:
            previous, current = after, start
            for _ in range(count):
                next_node = current.next
                current.next = previous
                previous, current = current, next_node
            before.next = previous
            before = start
        else:
            before = tail
        # step: update
        requested += 1
    result, current = [], dummy.next
    while current is not None:
        result.append(current.val)
        current = current.next
    return result  # step: return`,
};
const cases={
2053:[['Repeated strings are removed from ranking without reordering',{arr:['moss','reed','fern','moss','oak','reed','pine','elm','oak','ash'],k:3}],['Too few distinct strings yield an empty result',{arr:['bay','bay','cedar'],k:2}],['All values distinct preserve original order',{arr:['violet','amber','indigo'],k:2}],['Every value repeats',{arr:['a','b','a','b'],k:1}]],
2054:[['Several overlapping intervals compete with separated high values',{events:[[2,6,12],[5,9,18],[10,13,11],[7,8,7],[14,18,16],[3,17,31],[19,22,10]]}],['Touching inclusive endpoints still overlap',{events:[[1,4,10],[4,7,20],[8,9,6]]}],['The best answer may use only one event',{events:[[2,8,30],[3,6,12],[4,7,19]]}],['One event is allowed',{events:[[5,11,23]]}]],
2055:[['Queries use different outermost enclosed candles',{s:'**|***|*||****|**|*',queries:[[0,17],[3,12],[7,16],[0,4],[8,9],[10,17]]}],['No candle can enclose a plate',{s:'*******',queries:[[0,6],[2,4]]}],['Candle-only intervals contain no plates',{s:'|||||',queries:[[0,4],[1,3]]}],['One candle is insufficient',{s:'***|***',queries:[[0,6],[3,3]]}]],
2057:[['A match appears after several failed positions',{nums:[9,8,7,6,5,5,4,3,2,1,0,1]}],['Modulo ten wraps at later indices',{nums:[8,8,8,8,8,8,8,8,9,8,0]}],['No stored digit matches its index',{nums:[2,3,4,5,6]}],['Index zero can be the first match',{nums:[0,7,3]}]],
2058:[['Several peaks and valleys have different gaps',{head:[4,9,3,3,7,12,5,8,2,6,10]}],['Equal neighboring values do not create critical points',{head:[2,5,5,2,2,7]}],['One critical point is insufficient',{head:[3,8,4]}],['Two nodes have no interior positions',{head:[7,2]}]],
2059:[['Different arithmetic operations cooperate across layers',{nums:[4,7,13],start:6,goal:31}],['An out-of-range final goal may be reached directly',{nums:[9],start:2,goal:-7}],['Even operations cannot reach an odd goal from an even start',{nums:[2,6],start:4,goal:999}],['The start already equals the goal',{nums:[3,8],start:17,goal:17}]],
2061:[['Walls redirect the robot through a larger room',{room:[[0,0,0,1,0],[0,1,0,0,0],[0,0,0,1,0],[1,0,0,0,0]]}],['One open cell repeats four facing directions',{room:[[0]]}],['Walls box the start into one cell',{room:[[0,1],[1,0]]}],['An open rectangle repeats its perimeter route',{room:[[0,0,0,0],[0,0,0,0],[0,0,0,0]]}]],
2062:[['Consonants split multiple vowel-only regions',{word:'aaeiouueixouaieaao'}],['A missing vowel prevents every match',{word:'aaeeiioo'}],['Exactly one complete vowel window',{word:'uoiea'}],['Repeated vowels create many start choices',{word:'aaeeiioouu'}]],
2063:[['Several vowel positions contribute across a longer word',{word:'riverlantern'}],['No vowel contributes anything',{word:'rhythms'}],['Every position is a vowel',{word:'aeiouae'}],['One vowel belongs to one substring',{word:'u'}]],
2074:[['A shortened final group is even despite its requested odd size',{head:[8,3,14,6,11,2,19,7,5,16,4,12,9,20]}],['The final actual length is two rather than requested three',{head:[4,9,2,7,13]}],['A final singleton remains unchanged',{head:[6,1,8,3]}],['One node forms only the first group',{head:[21]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=1,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2053)need(Array.isArray(input.arr)&&input.arr.length>=1&&input.arr.length<=60&&input.arr.every(s=>typeof s==='string'&&/^[a-z]{1,20}$/.test(s))&&integer(input.k,1,input.arr.length),'Use 1-60 lowercase strings and a positive rank within the input count.');
  if(id===2054)need(Array.isArray(input.events)&&input.events.length>=1&&input.events.length<=40&&input.events.every(e=>Array.isArray(e)&&e.length===3&&integer(e[0],1)&&integer(e[1],e[0])&&integer(e[2],1)),'Use 1-40 [start,end,value] events with positive values and start <= end.');
  if(id===2055)need(typeof input.s==='string'&&/^[*|]{1,120}$/.test(input.s)&&Array.isArray(input.queries)&&input.queries.length>=1&&input.queries.length<=40&&input.queries.every(q=>Array.isArray(q)&&q.length===2&&integer(q[0],0,input.s.length-1)&&integer(q[1],q[0],input.s.length-1)),'Use 1-120 plate/candle characters and valid inclusive query ranges.');
  if(id===2057)need(vector(input.nums,0,100)&&input.nums.every(v=>v<=9),'Use 1-100 single-digit values.');
  if(id===2058)need(vector(input.head,1,40)&&input.head.length>=2,'Use 2-40 positive linked-list values.');
  if(id===2059)need(vector(input.nums,-10000,16)&&new Set(input.nums).size===input.nums.length&&integer(input.start,0,1000)&&integer(input.goal,-10000,10000),'Use 1-16 distinct bounded signed operands, a start from zero to 1000, and a bounded signed goal.');
  if(id===2061)need(Array.isArray(input.room)&&input.room.length>=1&&input.room.length<=8&&input.room.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.room[0].length&&row.every(v=>v===0||v===1))&&input.room[0][0]===0,'Use an at-most-eight-by-eight binary room with an open top-left starting cell.');
  if([2062,2063].includes(id))need(typeof input.word==='string'&&/^[a-z]{1,120}$/.test(input.word),'Use 1-120 lowercase letters.');
  if(id===2074)need(vector(input.head,1,40),'Use 1-40 positive linked-list values.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>[2058,2074].includes(id)?{linkedList:snapshotLinkedList(makeListNodes(input.head),0)}:{},resultStage:(id,result)=>id===2059?result===0?'already':result<0?'failed':'found':'return',pseudocodeStages:{2053:{count:1,choose:4},2059:{already:1,found:4,layer:4}},tags:{2053:['Hash Table'],2054:['Binary Search','Sorting'],2055:['Prefix Sum'],2057:['Array'],2058:['Linked List'],2059:['Breadth-First Search'],2061:['Simulation','Matrix'],2062:['Sliding Window'],2063:['Contribution Counting'],2074:['Linked List']}};
