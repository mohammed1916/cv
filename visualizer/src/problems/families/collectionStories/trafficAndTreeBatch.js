import {snapshotLinkedList as listState} from './authoredLinkedLists.js';
const specs={
2042:['s','Check whether numbers appear in strictly increasing order within a sentence.','Ignore word tokens and compare each numeric token with the previous number. Equality is a failure because the required ordering is strict.','start with no previous number|read each space-separated token|skip words and parse numeric tokens|reject a number no greater than the previous one|return whether all numbers increase','O(sentence length) time; O(tokens) split storage.'],
2043:['balance operations','Process bank transfers, deposits, and withdrawals with valid-account and sufficient-funds checks.','Accounts are one-based. Validate every requirement before changing balances so failed operations are atomic; a transfer requires both accounts and enough funds in its source.','copy the starting account balances|read the next banking operation|check account bounds and available funds|apply successful balance changes and record success|return all boolean operation results','O(accounts+operations) time; O(accounts) state.'],
2044:['nums','Count nonempty subsets achieving the maximum possible bitwise OR.','The OR of all values is the target. A frequency DP maps each attainable OR to the number of subsets producing it; each new value may be skipped or included.','compute the OR of all values|start the empty subset count at OR zero|for each value retain skipped states|add included-state counts at old OR combined with value|return the target count excluding the empty subset','O(n*distinct OR states) time; O(distinct OR states) space.'],
2045:['n edges time change','Find the second distinct travel time from vertex one to vertex n.','Uniform edge times and synchronized signals make arrival time depend only on hop count. BFS retains two distinct smallest hop counts per vertex, then simulates red-light waits for the second destination count.','build the graph and two-hop-distance states|BFS the two distinct best arrivals at each vertex|choose the second destination hop count|simulate every edge, waiting only when departure is red|return the second distinct arrival time','O(vertices+edges+second hop count) time; O(vertices+edges) space.'],
2046:['head','Sort a linked list whose absolute values are already nondecreasing.','Nonnegative nodes are already ordered. Each later negative value belongs before all earlier values, so detach it and prepend it to the head while retaining stable node identities.','build the linked list and initialize previous/current pointers|scan the next original node|check whether its value is negative|detach and prepend negatives, otherwise advance previous|return the reordered list values','O(n) pointer work; O(n) JSON input/output storage.'],
2047:['sentence','Count sentence tokens satisfying the valid-word rules.','A token may contain lowercase letters, one interior hyphen between letters, and at most one trailing punctuation mark. Digits, misplaced punctuation, and malformed hyphens invalidate it.','split on one or more spaces|inspect each token|separate optional final punctuation and check its body|count lowercase or properly hyphenated words, including punctuation-only tokens|return the valid-token count','O(sentence length) time; O(tokens) split storage.'],
2048:['n','Find the smallest integer greater than n whose digit frequencies equal the digit values.','Choose which nonzero digits occur; selected digit d must appear exactly d times. Enumerate unique permutations for feasible lengths in increasing length order and retain the smallest value above n.','consider feasible result lengths|choose digit sets whose required counts sum to that length|enumerate distinct permutations from their digit counts|retain the smallest completed number greater than n|return the best number at the first successful length','O(number of generated balanced permutations*digits) reference time; O(digits) recursion state.'],
2049:['parents','Count nodes whose removal yields the highest product of remaining component sizes.','Subtree sizes determine every component after removing a node: each child subtree and the remaining parent-side nodes. Multiply only nonempty components using exact integers.','build children and a postorder traversal|compute each subtree size|derive child and parent-side component sizes|multiply their sizes and maintain maximum-score frequency|return the number of highest-score nodes','O(n) tree work; O(n) auxiliary space.'],
2050:['n relations time','Finish all courses as early as possible with unlimited parallel enrollment after prerequisites.','Topological processing propagates the latest prerequisite finish time. Each course finish is its own duration plus the maximum finish among prerequisites, and the last finish determines completion.','build prerequisite edges and indegrees|queue courses with no prerequisites|propagate each completed course finish time|enqueue a course when all predecessors are processed|return the largest earliest finish time','O(courses+relations) time and graph/state space.'],
2052:['sentence k','Wrap whole words into rows with minimum squared unused-space cost, excluding the last row.','DP over suffixes tries every fitting next row. Its cost is unused columns squared plus the best remaining suffix cost, except the final row contributes zero.','split the sentence into words|solve suffixes from right to left|extend the next row while words and spaces fit|combine squared unused space with the solved suffix cost|return the minimum cost for all words','O(words^2) time; O(words) DP space.'],
};
const solvers={
2042({s},emit){const tokens=s.split(' ');let previous=-1,valid=true;for(let i=0;i<tokens.length;i++){const numeric=/^\d+$/.test(tokens[i]),value=numeric?Number(tokens[i]):null,increases=!numeric||value>previous;emit(numeric?'Compare this number with the previous numeric token, ignoring all intervening words. A repeated value is not a strict increase.':'This word does not change the previous numeric value.',{sequence:tokens,index:i,codeStage:'inspect',metrics:{token:tokens[i],previous:previous<0?'none':previous,numeric,value,increases}});if(!increases){valid=false;break;}if(numeric)previous=value;}return valid;},
2043({balance,operations},emit){const funds=[...balance],results=[],exists=a=>a>=1&&a<=funds.length;for(let i=0;i<operations.length;i++){const[operation,a,b,money]=operations[i],before=[...funds];let success=false;if(operation==='transfer'){success=exists(a)&&exists(b)&&funds[a-1]>=money;if(success){funds[a-1]-=money;funds[b-1]+=money;}}else if(operation==='deposit'){success=exists(a);if(success)funds[a-1]+=b;}else{success=exists(a)&&funds[a-1]>=b;if(success)funds[a-1]-=b;}results.push(success);emit('Account IDs are one-based. Check all required accounts and funds before applying any mutation, so a failed request cannot partially move money.',{sequence:funds,index:exists(a)?a-1:-1,output:[...results],table:funds.map((v,j)=>[j+1,before[j],v,v-before[j]]),tableHeaders:['Account','Before','After','Change'],codeStage:'update',metrics:{operation,request:operations[i].join(' '),success}},'update');}return results;},
2044({nums},emit){const target=nums.reduce((a,b)=>a|b,0);let counts=new Map([[0,1]]);for(let i=0;i<nums.length;i++){const next=new Map(counts);for(const[mask,count]of counts)next.set(mask|nums[i],(next.get(mask|nums[i])||0)+count);counts=next;emit('Every existing subset contributes once without this value and once with it. Different index choices may share the same OR, so accumulate their counts rather than keeping only reachability.',{index:i,table:[...counts].sort((a,b)=>a[0]-b[0]).map(([mask,count])=>[mask,mask.toString(2),count]),tableHeaders:['OR value','Binary','Subset count'],codeStage:'update',metrics:{value:nums[i],target,targetWays:counts.get(target)||0}},'update');}return counts.get(target)-Number(target===0);},
2045({n,edges,time,change},emit){const graph=Array.from({length:n},()=>[]);for(const[a,b]of edges){graph[a-1].push(b-1);graph[b-1].push(a-1);}const first=Array(n).fill(Infinity),second=Array(n).fill(Infinity),queue=[[0,0]];first[0]=0;for(let head=0;head<queue.length;head++){const[node,hops]=queue[head];if(node===n-1&&hops===second[node])break;for(const neighbor of graph[node]){const candidate=hops+1;if(candidate<first[neighbor]){first[neighbor]=candidate;queue.push([neighbor,candidate]);}else if(candidate>first[neighbor]&&candidate<second[neighbor]){second[neighbor]=candidate;queue.push([neighbor,candidate]);}}emit('Keep two different hop counts, not two different paths of the same length. Repeated vertices are allowed, so a detour may provide the second distinct arrival.',{sequence:Array.from({length:n},(_,i)=>i+1),index:node,table:first.map((v,i)=>[i+1,Number.isFinite(v)?v:'unknown',Number.isFinite(second[i])?second[i]:'unknown']),tableHeaders:['Vertex','Fewest hops','Second distinct hops'],codeStage:'bfs',metrics:{vertex:node+1,hops}});}let elapsed=0;for(let hop=0;hop<second[n-1];hop++){const before=elapsed,red=Math.floor(elapsed/change)%2===1;if(red)elapsed=(Math.floor(elapsed/change)+1)*change;const departure=elapsed;elapsed+=time;emit('All signals change together. Depart immediately on green; on red, wait until the next green interval. No waiting is required after reaching the destination.',{codeStage:'travel',metrics:{hop:hop+1,totalHops:second[n-1],arrivalBefore:before,red,departure,arrivalAfter:elapsed}},'update');}return elapsed;},
2046({head},emit){const nodes=head.map((val,i)=>({val,next:i+1<head.length?i+1:null}));let root=0,previous=0,current=nodes[0].next;while(current!==null){const inspected=current,moved=nodes[current].val<0;if(moved){nodes[previous].next=nodes[current].next;nodes[current].next=root;root=current;current=nodes[previous].next;}else{previous=current;current=nodes[current].next;}emit(moved?'Detach this negative node and prepend it. Nondecreasing absolute values make it no greater than every already processed value.':'Leave this nonnegative node in its existing relative order and advance the previous pointer.',{linkedList:listState(nodes,root,[{label:'previous',nodeId:previous},{label:'current',nodeId:current}],[inspected]),index:inspected,codeStage:'update',metrics:{value:nodes[inspected].val,moved}},'update');}const result=[];for(let node=root;node!==null;node=nodes[node].next)result.push(nodes[node].val);return result;},
2047({sentence},emit){const tokens=sentence.trim().split(/ +/).filter(Boolean);let count=0;for(let i=0;i<tokens.length;i++){const token=tokens[i],punctuation=/[!.,]$/.test(token),body=punctuation?token.slice(0,-1):token,valid=/^[a-z]+(?:-[a-z]+)?$/.test(body)||punctuation&&body==='';if(valid)count++;emit('Only one final punctuation mark may be removed for the body check. The remaining body must be lowercase letters with at most one hyphen strictly between letter groups.',{sequence:tokens,index:i,codeStage:'update',metrics:{token,body:body||'empty',trailingPunctuation:punctuation,containsDigit:/\d/.test(token),valid,count}},'update');}return count;},
2048({n},emit){let best=Infinity;for(let length=String(n).length;length<=7;length++){for(let mask=1;mask<1<<7;mask++){const counts=Array(8).fill(0);let size=0;for(let digit=1;digit<=7;digit++)if(mask&(1<<(digit-1))){counts[digit]=digit;size+=digit;}if(size!==length)continue;function permute(value,used){if(used===length){if(value>n)best=Math.min(best,value);emit('Every completed permutation uses digit d exactly d times for each selected digit. Compare only complete balanced numbers with the strict lower bound.',{sequence:[...String(value)],codeStage:'update',metrics:{candidate:value,n,greater:value>n,best:Number.isFinite(best)?best:'none'}});return;}for(let digit=1;digit<=7;digit++)if(counts[digit]){counts[digit]--;permute(value*10+digit,used+1);counts[digit]++;}}permute(0,0);}if(Number.isFinite(best))break;}return best;},
2049({parents},emit){const n=parents.length,children=parents.map(()=>[]),size=parents.map(()=>1),order=[0];for(let i=1;i<n;i++)children[parents[i]].push(i);for(let i=0;i<order.length;i++)order.push(...children[order[i]]);for(const node of [...order].reverse())for(const child of children[node])size[node]+=size[child];let best=0n,count=0;for(const node of order){const parts=children[node].map(child=>[child,size[child]]);if(n-size[node]>0)parts.push(['parent side',n-size[node]]);let score=1n;for(const[,part]of parts)score*=BigInt(part);if(score>best){best=score;count=1;}else if(score===best)count++;emit('Removing this node separates each child subtree and any remaining parent-side component. Ignore empty components and multiply the positive sizes using exact integers.',{sequence:parents,index:node,table:parts,tableHeaders:['Component','Nodes'],codeStage:'update',metrics:{node,subtreeSize:size[node],score:score.toString(),best:best.toString(),highestCount:count}},'update');}return count;},
2050({n,relations,time},emit){const graph=Array.from({length:n},()=>[]),degree=Array(n).fill(0),finish=[...time];for(const[a,b]of relations){graph[a-1].push(b-1);degree[b-1]++;}const queue=[];for(let i=0;i<n;i++)if(!degree[i])queue.push(i);for(let head=0;head<queue.length;head++){const course=queue[head];for(const next of graph[course]){finish[next]=Math.max(finish[next],finish[course]+time[next]);if(--degree[next]===0)queue.push(next);}emit('Parallel courses do not add their durations together. A successor waits only for its latest-finishing prerequisite, then spends its own duration.',{sequence:time,index:course,table:finish.map((value,i)=>[i+1,time[i],degree[i],value]),tableHeaders:['Course','Duration','Unprocessed prerequisites','Earliest finish bound'],codeStage:'update',metrics:{course:course+1,finish:finish[course]}},'update');}return Math.max(...finish);},
2052({sentence,k},emit){const words=sentence.split(' '),dp=Array(words.length+1).fill(Infinity);dp[words.length]=0;for(let start=words.length-1;start>=0;start--){let used=0;for(let end=start;end<words.length;end++){used+=words[end].length+Number(end>start);if(used>k)break;const cost=end===words.length-1?0:(k-used)**2,candidate=cost+dp[end+1];dp[start]=Math.min(dp[start],candidate);emit('Try ending the next row here. Squared unused space penalizes short nonfinal rows, while the final row contributes zero regardless of its trailing space.',{sequence:words,index:start,window:[start,end],table:dp.map((value,i)=>[i,Number.isFinite(value)?value:'unsolved']),tableHeaders:['Suffix start','Best remaining cost'],codeStage:'update',metrics:{start,end,used,width:k,rowCost:cost,suffixCost:dp[end+1],candidate,best:dp[start]}},'update');}}return dp[0];},
};
const python={
2042:`def areNumbersAscending(s):
    previous, valid = -1, True
    for token in s.split(' '):
        numeric = token.isdigit()
        value = int(token) if numeric else None
        increases = not numeric or value > previous  # step: inspect
        if not increases:
            valid = False
            break
        if numeric:
            previous = value
    return valid  # step: return`,
2043:`class Bank:
    def __init__(self, balance):
        self.balance = balance[:]

    def valid(self, account):
        return 1 <= account <= len(self.balance)

    def transfer(self, account1, account2, money):
        if not self.valid(account1) or not self.valid(account2) or self.balance[account1 - 1] < money:
            return False
        self.balance[account1 - 1] -= money
        self.balance[account2 - 1] += money
        return True

    def deposit(self, account, money):
        if not self.valid(account):
            return False
        self.balance[account - 1] += money
        return True

    def withdraw(self, account, money):
        if not self.valid(account) or self.balance[account - 1] < money:
            return False
        self.balance[account - 1] -= money
        return True

def runOperations(balance, operations):
    bank = Bank(balance)
    result = []
    for name, *arguments in operations:
        result.append(getattr(bank, name)(*arguments))  # step: update
    return result  # step: return`,
2044:`def countMaxOrSubsets(nums):
    target = 0
    for value in nums:
        target |= value
    counts = {0: 1}
    for value in nums:
        next_counts = counts.copy()
        for mask, count in counts.items():
            combined = mask | value
            next_counts[combined] = next_counts.get(combined, 0) + count
        counts = next_counts  # step: update
    return counts[target] - (target == 0)  # step: return`,
2045:`def secondMinimum(n, edges, time, change):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a - 1].append(b - 1)
        graph[b - 1].append(a - 1)
    first, second = [float('inf')] * n, [float('inf')] * n
    first[0] = 0
    queue = [(0, 0)]
    for node, hops in queue:
        if node == n - 1 and hops == second[node]:
            break
        for neighbor in graph[node]:
            candidate = hops + 1
            if candidate < first[neighbor]:
                first[neighbor] = candidate
                queue.append((neighbor, candidate))
            elif first[neighbor] < candidate < second[neighbor]:
                second[neighbor] = candidate
                queue.append((neighbor, candidate))
        # step: bfs
    elapsed = 0
    for _ in range(second[-1]):
        if elapsed // change % 2:
            elapsed = (elapsed // change + 1) * change
        elapsed += time  # step: travel
    return elapsed  # step: return`,
2046:`class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def sortLinkedList(head):
    # JSON input uses a value array; build nodes before doing pointer operations.
    dummy = ListNode()
    tail = dummy
    for value in head:
        tail.next = ListNode(value)
        tail = tail.next
    root = previous = dummy.next
    current = root.next
    while current is not None:
        if current.val < 0:
            previous.next = current.next
            current.next = root
            root = current
            current = previous.next
        else:
            previous = current
            current = current.next
        # step: update
    result = []
    while root is not None:
        result.append(root.val)
        root = root.next
    return result  # step: return`,
2047:`def countValidWords(sentence):
    import re
    count = 0
    for token in sentence.split():
        punctuation = token[-1] in '!.,'
        body = token[:-1] if punctuation else token
        valid = bool(re.fullmatch(r'[a-z]+(?:-[a-z]+)?', body)) or (punctuation and not body)
        if valid:
            count += 1
        # step: update
    return count  # step: return`,
2048:`def nextBeautifulNumber(n):
    best = float('inf')
    for length in range(len(str(n)), 8):
        for mask in range(1, 1 << 7):
            counts = [0] * 8
            for digit in range(1, 8):
                if mask & (1 << (digit - 1)):
                    counts[digit] = digit
            if sum(counts) != length:
                continue
            def permute(value, used):
                nonlocal best
                if used == length:
                    if value > n:
                        best = min(best, value)
                    # step: update
                    return
                for digit in range(1, 8):
                    if counts[digit]:
                        counts[digit] -= 1
                        permute(value * 10 + digit, used + 1)
                        counts[digit] += 1
            permute(0, 0)
        if best != float('inf'):
            break
    return best  # step: return`,
2049:`def countHighestScoreNodes(parents):
    n = len(parents)
    children = [[] for _ in parents]
    for node in range(1, n):
        children[parents[node]].append(node)
    order = [0]
    for node in order:
        order.extend(children[node])
    size = [1] * n
    for node in reversed(order):
        size[node] += sum(size[child] for child in children[node])
    best = count = 0
    for node in order:
        parts = [size[child] for child in children[node]]
        if n - size[node]:
            parts.append(n - size[node])
        score = 1
        for part in parts:
            score *= part
        if score > best:
            best, count = score, 1
        elif score == best:
            count += 1
        # step: update
    return count  # step: return`,
2050:`def minimumTime(n, relations, time):
    graph, degree = [[] for _ in range(n)], [0] * n
    for a, b in relations:
        graph[a - 1].append(b - 1)
        degree[b - 1] += 1
    finish = time[:]
    queue = [i for i in range(n) if degree[i] == 0]
    for course in queue:
        for next_course in graph[course]:
            finish[next_course] = max(finish[next_course], finish[course] + time[next_course])
            degree[next_course] -= 1
            if degree[next_course] == 0:
                queue.append(next_course)
        # step: update
    return max(finish)  # step: return`,
2052:`def minimumCost(sentence, k):
    words = sentence.split(' ')
    dp = [float('inf')] * (len(words) + 1)
    dp[-1] = 0
    for start in range(len(words) - 1, -1, -1):
        used = 0
        for end in range(start, len(words)):
            used += len(words[end]) + (end > start)
            if used > k:
                break
            row_cost = 0 if end == len(words) - 1 else (k - used) ** 2
            dp[start] = min(dp[start], row_cost + dp[end + 1])  # step: update
    return dp[0]  # step: return`,
};
const cases={
2042:[['Words separate a longer increasing sequence',{s:'harbor has 4 boats and 11 cranes beside 23 warehouses serving 58 ships'}],['An equal number breaks strict ordering',{s:'we packed 7 boxes then 7 crates'}],['A later smaller number is invalid',{s:'teams scored 12 points before 9 penalties'}],['Only one number needs no comparison',{s:'the observatory has 36 lenses'}]],
2043:[['Mixed transactions include insufficient funds and corrections',{balance:[120,45,300,80],operations:[['transfer',3,2,90],['withdraw',1,150],['deposit',1,60],['transfer',1,4,130],['withdraw',2,35],['transfer',4,4,20],['deposit',7,10]]}],['An invalid destination must not debit the source',{balance:[50,70],operations:[['transfer',1,9,20],['withdraw',1,50]]}],['Zero money still requires a valid account',{balance:[0],operations:[['withdraw',1,0],['deposit',1,0],['transfer',1,2,0]]}],['Exact balance may be withdrawn completely',{balance:[85,10],operations:[['withdraw',1,85],['withdraw',1,1],['transfer',2,1,10]]}]],
2044:[['Overlapping bit patterns produce many equivalent OR states',{nums:[5,10,3,12,6,9,7,8]}],['Repeated values still represent distinct subset choices',{nums:[11,11,11,11]}],['Every independent bit is required',{nums:[1,2,4,8,16]}],['A single value has one nonempty subset',{nums:[19]}]],
2045:[['Different route lengths encounter synchronized red intervals',{n:7,edges:[[1,2],[1,3],[2,4],[3,4],[4,5],[5,7],[3,6],[6,7],[2,6]],time:3,change:5}],['One edge requires a backtrack for the second arrival',{n:2,edges:[[1,2]],time:4,change:3}],['Equal-length paths do not count as distinct arrival times',{n:4,edges:[[1,2],[2,4],[1,3],[3,4]],time:2,change:7}],['Arriving on a red boundary forces a wait before continuing',{n:3,edges:[[1,2],[2,3],[1,3]],time:5,change:5}]],
2046:[['Negative nodes move forward while positive nodes keep order',{head:[0,-2,3,-5,7,-9,12,-14]}],['An all-negative absolute-sorted list reverses',{head:[-1,-4,-8,-13]}],['A nonnegative list is already sorted',{head:[0,2,6,11]}],['One node needs no rewiring',{head:[-7]}]],
2047:[['Words, hyphens, digits, and punctuation mix in one sentence',{sentence:'bright lanterns glow, near well-lit docks! 4boats drift a--b -end end- ok.'}],['Punctuation-only tokens are allowed',{sentence:'! , .'}],['A hyphen must have letters on both sides',{sentence:'oak-tree pine- -birch reed--bed elm-leaf'}],['Extra spaces do not create tokens',{sentence:'  calm   water  rests   '}]],
2048:[['Search beyond a six-digit lower bound',{n:765432}],['Zero is below the smallest balanced positive value',{n:0}],['An already balanced input still needs a strictly greater result',{n:122}],['The largest permitted input crosses into seven digits',{n:1000000}]],
2049:[['Removing different binary-tree nodes creates different products',{parents:[-1,0,0,1,1,2,2,3,4,6]}],['A chain emphasizes balanced middle cuts',{parents:[-1,0,1,2,3,4,5]}],['Symmetric branches create tied highest scores',{parents:[-1,0,0,1,1,2,2]}],['One root leaves no nonempty components',{parents:[-1]}]],
2050:[['Several parallel prerequisite chains merge',{n:7,relations:[[1,3],[2,3],[2,4],[3,5],[4,5],[4,6],[5,7],[6,7]],time:[4,7,3,6,5,2,8]}],['Independent courses run together',{n:4,relations:[],time:[5,11,3,8]}],['A chain forces durations to add',{n:4,relations:[[1,2],[2,3],[3,4]],time:[2,6,4,9]}],['One course needs its own duration',{n:1,relations:[],time:[13]}]],
2052:[['Row choices balance several word lengths',{sentence:'quiet river bends beyond the old stone bridge at dawn',k:16}],['The entire sentence fits in the free final row',{sentence:'blue sky',k:12}],['Each long word fills one row exactly',{sentence:'amber birch cedar',k:5}],['One short final word is not penalized',{sentence:'lantern garden oak',k:14}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2042)need(typeof input.s==='string'&&input.s.length<=300&&/^(?:[a-z]+|0|[1-9][0-9]{0,5})(?: (?:[a-z]+|0|[1-9][0-9]{0,5}))*$/.test(input.s),'Use lowercase words or bounded integer tokens separated by single spaces.');
  if(id===2043){need(Array.isArray(input.balance)&&input.balance.length>=1&&input.balance.length<=20&&input.balance.every(v=>integer(v,0,1000000)),'Use 1-20 nonnegative account balances no larger than one million.');need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=60&&input.operations.every(op=>Array.isArray(op)&&(['transfer'].includes(op[0])?op.length===4&&integer(op[1],1,100)&&integer(op[2],1,100)&&integer(op[3],0,1000000):['deposit','withdraw'].includes(op[0])&&op.length===3&&integer(op[1],1,100)&&integer(op[2],0,1000000))),'Use bounded transfer/deposit/withdraw requests with positive account IDs and nonnegative amounts. Missing accounts return false.');}
  if(id===2044)need(vector(input.nums,1,10),'Use 1-10 positive values for readable OR-state playback.');
  if(id===2045){need(integer(input.n,2,30)&&integer(input.time,1,100)&&integer(input.change,1,100)&&Array.isArray(input.edges)&&input.edges.length>=1&&input.edges.length<=100&&input.edges.every(e=>Array.isArray(e)&&e.length===2&&integer(e[0],1,input.n)&&integer(e[1],1,input.n)&&e[0]!==e[1])&&new Set(input.edges.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size===input.edges.length,'Use a 2-30 vertex simple graph with one-based endpoints and time/change from 1 to 100.');const graph=Array.from({length:input.n},()=>[]),queue=[0],seen=new Set([0]);for(const[a,b]of input.edges){graph[a-1].push(b-1);graph[b-1].push(a-1);}for(let i=0;i<queue.length;i++)for(const node of graph[queue[i]])if(!seen.has(node)){seen.add(node);queue.push(node);}need(seen.size===input.n,'The graph must be connected.');}
  if(id===2046)need(vector(input.head,-10000,40)&&input.head.every((v,i,a)=>!i||Math.abs(v)>=Math.abs(a[i-1])),'Use 1-40 signed node values in nondecreasing absolute-value order.');
  if(id===2047)need(typeof input.sentence==='string'&&/^[a-z0-9!., -]{1,300}$/.test(input.sentence)&&input.sentence.trim().length>0,'Use lowercase letters, digits, hyphens, !., punctuation, and spaces with at least one token.');
  if(id===2048)need(integer(input.n,0,1000000),'Use an integer from zero to one million.');
  if(id===2049){const p=input.parents;need(Array.isArray(p)&&p.length>=1&&p.length<=60&&p[0]===-1&&p.slice(1).every((v,i)=>integer(v,0,p.length-1)&&v!==i+1),'Use a rooted parent array with root zero and at most 60 nodes.');const childCount=Array(p.length).fill(0);for(let i=1;i<p.length;i++){childCount[p[i]]++;const seen=new Set();let node=i;while(node!==-1){need(!seen.has(node),'Parent links must be acyclic.');seen.add(node);node=p[node];}}need(childCount.every(v=>v<=2),'Each node may have at most two children.');}
  if(id===2050){need(integer(input.n,1,30)&&vector(input.time,1,30)&&input.time.length===input.n&&Array.isArray(input.relations)&&input.relations.length<=100&&input.relations.every(e=>Array.isArray(e)&&e.length===2&&integer(e[0],1,input.n)&&integer(e[1],1,input.n)&&e[0]!==e[1])&&new Set(input.relations.map(e=>e.join(','))).size===input.relations.length,'Use up to 30 course durations and distinct valid prerequisite edges.');const graph=Array.from({length:input.n},()=>[]),degree=Array(input.n).fill(0),queue=[];for(const[a,b]of input.relations){graph[a-1].push(b-1);degree[b-1]++;}for(let i=0;i<input.n;i++)if(!degree[i])queue.push(i);for(let i=0;i<queue.length;i++)for(const node of graph[queue[i]])if(--degree[node]===0)queue.push(node);need(queue.length===input.n,'Prerequisites must form an acyclic graph.');}
  if(id===2052)need(typeof input.sentence==='string'&&/^[a-z]+(?: [a-z]+)*$/.test(input.sentence)&&input.sentence.split(' ').length<=30&&integer(input.k,1,40)&&input.sentence.split(' ').every(word=>word.length<=input.k),'Use at most 30 lowercase words, each fitting a row width from 1 to 40.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===2046?{linkedList:listState(input.head.map((val,i)=>({val,next:i+1<input.head.length?i+1:null})),0)}:{},pseudocodeStages:{2045:{bfs:2,travel:4}},tags:{2042:['String'],2043:['Design'],2044:['Bitmask','Dynamic Programming'],2045:['Graph','Breadth-First Search'],2046:['Linked List'],2047:['String'],2048:['Backtracking'],2049:['Tree'],2050:['Topological Sort'],2052:['Dynamic Programming']}};
