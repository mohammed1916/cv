import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
const specs={
82:['head','Remove every value that occurs more than once in a sorted linked list.','Sorted duplicates form complete adjacent runs. Keep a run only when it contains one node; otherwise reconnect the last retained node directly to the following run.','scan one equal-value run at a time|find the first node after the run|retain singleton runs|bypass every node of repeated runs|return the surviving list','O(n) time; O(1) pointer space excluding JSON decoding and output.'],
127:['beginWord endWord wordList','Find the shortest one-letter-at-a-time transformation through allowed words.','Wildcard buckets connect words differing in one position. BFS explores transformations by distance, and consuming each bucket once avoids repeatedly scanning the same neighbor group.','build wildcard buckets for the allowed words and starting word|start BFS with distance one at the beginning word|visit unseen neighbors sharing one wildcard pattern|return when BFS settles the ending word|return zero when the ending word is unreachable','O(word count*word length^2) time and stored-pattern space.'],
255:['preorder','Verify that a sequence can be the preorder traversal of a binary search tree with distinct values.','A monotonic stack tracks unfinished ancestors. Popping smaller ancestors means entering their right subtrees, which establishes a lower bound that all later values must respect.','start with no lower bound and an empty ancestor stack|reject values below the current lower bound|pop smaller ancestors when entering a right subtree|push the current value as an unfinished ancestor|return whether the full sequence respects every boundary','O(n) time and O(n) stack space.'],
351:['m n','Count valid Android unlock patterns with lengths between m and n.','A move across a grid key is allowed only when that intermediate key has already been visited. Subset DP tracks the visited mask and final key, preserving all legal ordering counts without enumerating every full path.','initialize one-key patterns for all nine grid keys|extend each visited-set and final-key state to unused keys|reject jumps over an unvisited intermediate key|accumulate counts by pattern length through n|sum counts for lengths m through n','O(2^9*9^2) time and O(2^9*9) state space.'],
381:['operations','Maintain duplicate values with constant-time insert remove and occurrence-weighted random selection.','A dense occurrence array supports random indexing. A value-to-index-set map locates removals; swapping the last occurrence into a removed slot preserves density while repairing only the affected index sets.','store occurrences in a dense array and index sets by value|append insertions and report whether the value was previously absent|remove one indexed occurrence by swapping in the final array entry|select a random array position so duplicates receive proportional probability|return operation results with replayable supplied random draws','Expected O(1) per operation; O(number of stored occurrences) space.'],
};
const solvers={
82({head},emit){const nodes=makeListNodes(head);let root=head.length?0:null,previous=null,current=root;while(current!==null){const first=current,value=nodes[first].val;let count=0;while(current!==null&&nodes[current].val===value){count++;current=nodes[current].next;}if(count===1)previous=first;else if(previous===null)root=current;else nodes[previous].next=current;emit(count===1?'This value occurs in a singleton run, so retain its node and advance the retained-list tail.':'Every node in this repeated run must disappear. Reconnect the retained prefix directly to the next distinct run.',{linkedList:snapshotLinkedList(nodes,root,previous===null?[]:[{label:'retained tail',nodeId:previous}],count===1?[first]:[]),codeStage:count===1?'keep':'bypass',metrics:{value,runLength:count,nextRun:current??'null',retainedTail:previous??'dummy'}},'update');}const answer=[];for(let node=root;node!==null;node=nodes[node].next)answer.push(nodes[node].val);return answer;},
127({beginWord,endWord,wordList},emit){if(!wordList.includes(endWord)){emit('The ending word is not allowed, so no valid transformation can reach it.',{codeStage:'absent'});return 0;}const words=[...new Set([beginWord,...wordList])],buckets=new Map();for(const word of words)for(let i=0;i<word.length;i++){const pattern=word.slice(0,i)+'*'+word.slice(i+1);if(!buckets.has(pattern))buckets.set(pattern,[]);buckets.get(pattern).push(word);}const queue=[beginWord],distance=new Map([[beginWord,1]]),parent=new Map();for(let at=0;at<queue.length;at++){const word=queue[at],steps=distance.get(word);if(word===endWord){const path=[];for(let current=word;current!==undefined;current=parent.get(current))path.push(current);path.reverse();emit('BFS reaches words in increasing transformation length, so this first ending-word visit gives a shortest ladder.',{sequence:queue,index:at,output:path,codeStage:'found',metrics:{length:steps}},'update');return steps;}const added=[];for(let i=0;i<word.length;i++){const pattern=word.slice(0,i)+'*'+word.slice(i+1);for(const neighbor of buckets.get(pattern)||[])if(!distance.has(neighbor)){distance.set(neighbor,steps+1);parent.set(neighbor,word);queue.push(neighbor);added.push(neighbor);}buckets.delete(pattern);}emit('All words in a wildcard bucket differ at only that character position. Newly visited words join the next BFS layer; a consumed bucket never needs another full scan.',{sequence:queue,index:at,table:[...distance],tableHeaders:['Word','Shortest ladder length'],codeStage:'expand',metrics:{word,length:steps,newNeighbors:added.join(', ')||'none',queued:queue.length-at-1}},'update');}return 0;},
255({preorder},emit){const stack=[];let lower=-Infinity;for(let i=0;i<preorder.length;i++){const value=preorder[i];if(value<lower){emit('This value falls below an ancestor whose right subtree has already begun, so it cannot appear here in a valid BST preorder.',{sequence:preorder,index:i,output:[...stack],codeStage:'failed',metrics:{value,lowerBound:lower}});return false;}while(stack.length&&value>stack.at(-1)){lower=stack.pop();emit('A larger value leaves this ancestor left-side region and enters its right subtree. That ancestor becomes the new lower bound.',{sequence:preorder,index:i,output:[...stack],codeStage:'pop',metrics:{value,lowerBound:lower}},'update');}stack.push(value);emit('The value respects the lower bound and becomes the newest unfinished ancestor. Later smaller values may still belong in its left subtree.',{sequence:preorder,index:i,output:[...stack],codeStage:'push',metrics:{value,lowerBound:Number.isFinite(lower)?lower:'none'}},'update');}return true;},
351({m,n},emit){const skip=Array.from({length:10},()=>Array(10).fill(0));for(const[a,b,middle]of [[1,3,2],[1,7,4],[3,9,6],[7,9,8],[1,9,5],[3,7,5],[2,8,5],[4,6,5]])skip[a][b]=skip[b][a]=middle;let states=new Map(Array.from({length:9},(_,i)=>[`${1<<i}:${i+1}`,1])),answer=0;for(let length=1;length<=n;length++){const counts=Array(9).fill(0),next=new Map();let allowed=0,blocked=0;for(const[key,ways]of states){const[mask,last]=key.split(':').map(Number);counts[last-1]+=ways;if(length===n)continue;for(let end=1;end<=9;end++){if(mask&(1<<(end-1)))continue;const middle=skip[last][end];if(middle&&!(mask&(1<<(middle-1)))){blocked++;continue;}const nextKey=`${mask|(1<<(end-1))}:${end}`;next.set(nextKey,(next.get(nextKey)||0)+ways);allowed++;}}const layer=counts.reduce((a,b)=>a+b,0);if(length>=m)answer+=layer;emit('The state remembers every visited key, so a jump crossing a middle key is accepted exactly when that key is already in the mask. Counts aggregate different valid orders ending at the same key.',{matrix:[[1,2,3],[4,5,6],[7,8,9]],outputMatrix:[counts.slice(0,3),counts.slice(3,6),counts.slice(6,9)],outputMatrixLabel:'Patterns of this length ending at each key',table:[[1,3,2],[1,7,4],[3,9,6],[7,9,8],[1,9,5],[3,7,5],[2,8,5],[4,6,5]],tableHeaders:['Jump endpoint','Other endpoint','Required visited middle'],codeStage:'layer',metrics:{length,stateCount:states.size,patternsAtLength:layer,counted:length>=m,allowedStateTransitions:allowed,blockedStateTransitions:blocked,total:answer}},'update');states=next;}return answer;},
381({operations},emit){const values=[],indices=new Map(),answer=[];for(let operation=0;operation<operations.length;operation++){const[type,argument]=operations[operation];let result,details={};if(type==='insert'){result=!indices.has(argument);if(!indices.has(argument))indices.set(argument,new Set());indices.get(argument).add(values.length);values.push(argument);}else if(type==='remove'){result=indices.has(argument);if(result){const removed=indices.get(argument).values().next().value,lastIndex=values.length-1,lastValue=values[lastIndex];indices.get(argument).delete(removed);if(removed!==lastIndex){values[removed]=lastValue;indices.get(lastValue).delete(lastIndex);indices.get(lastValue).add(removed);}values.pop();if(indices.get(argument).size===0)indices.delete(argument);details={removedIndex:removed,lastIndex,movedValue:lastValue};}}else{const index=Math.floor(argument*values.length);result=values[index];details={uniformDraw:argument,selectedIndex:index};}answer.push(result);emit(type==='remove'?'Remove one occurrence only. If needed, fill its slot with the final occurrence and repair the moved value index set, including when both values are equal.':type==='insert'?'Append one occurrence even when the value already exists. The insertion result reports whether this value was previously absent.':'Map the supplied uniform draw to a dense occurrence-array index. A value stored multiple times occupies multiple equally likely positions.',{sequence:[...values],table:[...indices].map(([value,set])=>[value,[...set].sort((a,b)=>a-b).join(', ')]),tableHeaders:['Value','Occurrence indices'],output:[...answer],codeStage:type,metrics:{operation:operation+1,type,result,...details}},'update');}return answer;},
};
const python={
82:`class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def deleteDuplicates(head):
    dummy = tail = ListNode(0)
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    previous, current = dummy, dummy.next
    while current is not None:
        first, value, count = current, current.val, 0
        while current is not None and current.val == value:
            count += 1
            current = current.next
        if count == 1:
            previous = first  # step: keep
        else:
            previous.next = current  # step: bypass
    answer, current = [], dummy.next
    while current is not None:
        answer.append(current.val)
        current = current.next
    return answer  # step: return`,
127:`def ladderLength(beginWord, endWord, wordList):
    from collections import defaultdict, deque
    if endWord not in wordList:
        return 0  # step: absent
    buckets = defaultdict(list)
    for word in dict.fromkeys([beginWord] + wordList):
        for i in range(len(word)):
            buckets[word[:i] + '*' + word[i + 1:]].append(word)
    queue, distance = deque([beginWord]), {beginWord: 1}
    while queue:
        word = queue.popleft()
        if word == endWord:
            return distance[word]  # step: found
        for i in range(len(word)):
            pattern = word[:i] + '*' + word[i + 1:]
            for neighbor in buckets.pop(pattern, []):
                if neighbor not in distance:
                    distance[neighbor] = distance[word] + 1
                    queue.append(neighbor)
        # step: expand
    return 0  # step: return`,
255:`def verifyPreorder(preorder):
    lower, stack = float('-inf'), []
    for value in preorder:
        if value < lower:
            return False  # step: failed
        while stack and value > stack[-1]:
            lower = stack.pop()  # step: pop
        stack.append(value)  # step: push
    return True  # step: return`,
351:`def numberOfPatterns(m, n):
    skip = [[0] * 10 for _ in range(10)]
    for a, b, middle in ((1,3,2),(1,7,4),(3,9,6),(7,9,8),(1,9,5),(3,7,5),(2,8,5),(4,6,5)):
        skip[a][b] = skip[b][a] = middle
    states = {(1 << (key - 1), key): 1 for key in range(1, 10)}
    answer = 0
    for length in range(1, n + 1):
        following = {}
        if length >= m:
            answer += sum(states.values())
        if length < n:
            for (mask, last), ways in states.items():
                for end in range(1, 10):
                    if mask & (1 << (end - 1)):
                        continue
                    middle = skip[last][end]
                    if middle and not mask & (1 << (middle - 1)):
                        continue
                    state = (mask | (1 << (end - 1)), end)
                    following[state] = following.get(state, 0) + ways
        states = following  # step: layer
    return answer  # step: return`,
381:`class RandomizedCollection:
    def __init__(self):
        self.values, self.indices = [], {}

    def insert(self, val):
        absent = val not in self.indices
        self.indices.setdefault(val, {})[len(self.values)] = None
        self.values.append(val)
        return absent  # step: insert

    def remove(self, val):
        if val not in self.indices:
            return False
        removed = next(iter(self.indices[val]))
        last_index, last_value = len(self.values) - 1, self.values[-1]
        self.indices[val].pop(removed)
        if removed != last_index:
            self.values[removed] = last_value
            self.indices[last_value].pop(last_index)
            self.indices[last_value][removed] = None
        self.values.pop()
        if not self.indices[val]:
            del self.indices[val]
        return True  # step: remove

    def getRandom(self, draw=None):
        import random
        index = random.randrange(len(self.values)) if draw is None else int(draw * len(self.values))
        return self.values[index]  # step: getRandom

def runCollection(operations):
    collection, answer = RandomizedCollection(), []
    for operation, argument in operations:
        # Supplied uniform draws make random selections replayable in the visualizer.
        answer.append(getattr(collection, operation)(argument))
    return answer  # step: return`,
};
const cases={
82:[['Repeated runs at the beginning middle and end are removed entirely',{head:[1,1,2,4,4,4,7,9,9,12,15,15]}],['Every node belongs to one repeated run',{head:[6,6,6,6]}],['All distinct nodes retain their original links',{head:[-8,-3,0,5,11]}],['An empty list remains empty',{head:[]}]],
127:[['Several branching words lead to a multi-step shortest ladder',{beginWord:'cold',endWord:'warm',wordList:['cord','card','ward','warm','word','worm','wold','bold','bald','bard']}],['The destination is absent from the allowed dictionary',{beginWord:'map',endWord:'sun',wordList:['cap','cat','sat','sap']}],['The destination exists but belongs to a disconnected group',{beginWord:'red',endWord:'sky',wordList:['bed','bad','sad','sky','sly']}],['A direct neighbor needs the two endpoint words',{beginWord:'pine',endWord:'wine',wordList:['wine','fine','line']}]],
255:[['Several left subtrees finish before the traversal enters right subtrees',{preorder:[40,18,9,12,27,23,31,65,52,59,81]}],['A late value crosses an established lower bound',{preorder:[20,10,5,15,30,8]}],['Ascending preorder describes a right-only chain',{preorder:[2,6,11,17,24]}],['Descending preorder describes a left-only chain',{preorder:[25,19,13,8,3]}]],
351:[['Several lengths exercise intermediate-key restrictions',{m:2,n:5}],['Every one-key pattern is valid',{m:1,n:1}],['Only patterns visiting every key are counted',{m:9,n:9}],['A narrow longer-length range excludes shorter prefixes',{m:6,n:7}]],
381:[['Duplicate occurrences and swapped removals change selection weights',{operations:[['insert',7],['insert',4],['insert',7],['insert',9],['getRandom',0.62],['remove',7],['getRandom',0.1],['insert',4],['remove',9],['getRandom',0.95],['remove',12]]}],['Removing one duplicate does not erase the remaining occurrence',{operations:[['insert',5],['insert',5],['remove',5],['getRandom',0.7],['remove',5],['remove',5]]}],['Removing the last array slot requires no swap',{operations:[['insert',2],['insert',8],['remove',8],['getRandom',0.4]]}],['An absent removal leaves the collection unchanged',{operations:[['remove',13],['insert',13],['getRandom',0],['remove',21],['getRandom',0.999]]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  if(id===82)need(Array.isArray(input.head)&&input.head.length<=50&&input.head.every((v,i)=>integer(v,-10000,10000)&&(i===0||v>=input.head[i-1])),'Use an ascending sorted list of at most fifty signed integers.');
  if(id===127)need(typeof input.beginWord==='string'&&/^[a-z]{1,6}$/.test(input.beginWord)&&typeof input.endWord==='string'&&input.endWord.length===input.beginWord.length&&/^[a-z]+$/.test(input.endWord)&&input.beginWord!==input.endWord&&Array.isArray(input.wordList)&&input.wordList.length<=80&&input.wordList.every(w=>typeof w==='string'&&w.length===input.beginWord.length&&/^[a-z]+$/.test(w))&&new Set(input.wordList).size===input.wordList.length,'Use different lowercase endpoints of equal length 1-6 and at most eighty distinct dictionary words of that length.');
  if(id===255)need(Array.isArray(input.preorder)&&input.preorder.length>=1&&input.preorder.length<=80&&input.preorder.every(v=>integer(v,-10000,10000))&&new Set(input.preorder).size===input.preorder.length,'Use 1-80 distinct signed values.');
  if(id===351)need(integer(input.m,1,9)&&integer(input.n,input.m,9),'Use pattern-length bounds satisfying 1 <= m <= n <= 9.');
  if(id===381){need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80,'Use 1-80 insert/remove/getRandom operations.');const counts=new Map();let size=0;for(const op of input.operations){need(Array.isArray(op)&&op.length===2,'Each operation needs its argument.');if(op[0]==='insert'||op[0]==='remove'){need(integer(op[1],-1000000),'Insert/remove arguments must be signed integers within one million.');if(op[0]==='insert'){counts.set(op[1],(counts.get(op[1])||0)+1);size++;}else if(counts.get(op[1])){counts.set(op[1],counts.get(op[1])-1);size--;}}else need(op[0]==='getRandom'&&typeof op[1]==='number'&&Number.isFinite(op[1])&&op[1]>=0&&op[1]<1&&size>0,'getRandom needs a replay draw in [0,1) and a nonempty collection.');}}
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===82?{linkedList:snapshotLinkedList(makeListNodes(input.head),input.head.length?0:null)}:{},resultStage:(id,result,input)=>id===127?(result?'found':input.wordList.includes(input.endWord)?'return':'absent'):id===255&&!result?'failed':'return',pseudocodeStages:{82:{keep:3,bypass:4},127:{absent:5,expand:3,found:4},255:{failed:2,pop:3,push:4},351:{layer:4},381:{insert:2,remove:3,getRandom:4}},tags:{82:['Linked List','Two Pointers'],127:['Breadth-First Search'],255:['Stack','Tree'],351:['Dynamic Programming','Bit Manipulation'],381:['Design','Hash Table']}};
