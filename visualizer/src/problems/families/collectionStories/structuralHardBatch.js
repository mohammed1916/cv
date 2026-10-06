const specs={
1938:['parents queries','Maximize each query value XOR an ancestor label, including the queried node.','Depth-first traversal keeps exactly the current root-to-node labels in a counted binary trie. Prefer the opposite bit during each query, then remove the node label when leaving its subtree.','build children and group queries by node|insert the current node label into the path trie|greedily choose opposite bits for each query|visit children then remove the current label|return answers in original query order','O((nodes+queries)*bit width) time; O(nodes*bit width+queries) space.'],
1948:['paths','Delete all folders having duplicate nonempty subtree structures in one simultaneous pass.','Canonical signatures describe each folder by sorted child names and child signatures. Mark every repeated nonempty signature before deleting anything, then collect paths whose ancestry contains no marked folder.','build a folder trie from paths|compute canonical child-structure signatures bottom-up|mark repeated nonempty signatures simultaneously|collect paths while skipping every marked subtree|return remaining folder paths','O(total path components plus serialized signature size and child sorting) time and space.'],
1960:['s','Maximize the product of lengths of two nonoverlapping odd-length palindromic substrings.','Manacher radii locate the longest odd palindrome at each center. Propagate nested lengths to every endpoint, then combine the best left and right palindrome at each split.','compute odd palindrome radii|record longest palindrome at each start and end|propagate nested lengths and prefix/suffix maxima|compare the product across every split|return the largest product','O(n) time and auxiliary space.'],
1977:['num','Count partitions into positive nondecreasing decimal integers without leading zeroes.','DP records a prefix and its final number length. All shorter previous lengths are automatically smaller; an equal-length predecessor needs a lexicographic comparison. Prefix sums combine shorter lengths efficiently.','initialize prefix-partition and length-prefix tables|choose a prefix end and final number length|reject leading zeroes and compare equal-length predecessors|combine shorter-length counts with allowed equal-length counts|return the full-prefix count modulo 1000000007','O(n^3) reference time for direct substring comparisons; O(n^2) DP space.'],
1982:['n sums','Recover an integer array from its multiset of subset sums.','The two smallest sums differ by the magnitude of one array element. Pair sums at that distance; the half containing zero determines whether to recover the positive or negative sign. Recurse on that half.','sort the subset-sum multiset|derive an element magnitude from the two smallest sums|pair each remaining sum with sum plus magnitude|choose the half containing zero and record the corresponding sign|return the recovered elements','O(n*2^n) time after sorting; O(2^n) working multiset space.'],
2002:['s','Maximize the product of lengths of two disjoint palindromic subsequences.','Enumerate palindromic index masks. Subset DP stores the best palindrome available inside any mask, so each palindrome can pair with the best one entirely inside its complement.','enumerate masks and record palindrome lengths|compute best palindromic submask for every mask|choose a palindromic first mask|pair it with the best palindrome in the complement|return the maximum length product','O(n*2^n) time; O(2^n) state space.'],
};

function recoverSubsetSums(n,sums,emit=()=>{}) {
  let remaining=[...sums].sort((a,b)=>a-b);const answer=[];
  for(let step=0;step<n;step++) {
    const magnitude=remaining[1]-remaining[0],counts=new Map(),low=[],high=[];
    for(const value of remaining)counts.set(value,(counts.get(value)||0)+1);
    for(const value of remaining)if(counts.get(value)>0){counts.set(value,counts.get(value)-1);const paired=value+magnitude;if(!(counts.get(paired)>0))throw new Error('These values do not form a valid subset-sum multiset.');counts.set(paired,counts.get(paired)-1);low.push(value);high.push(paired);}
    const positive=low.includes(0);if(!positive&&!high.includes(0))throw new Error('A recovered subset-sum half must contain the empty-subset sum zero.');
    const value=positive?magnitude:-magnitude;answer.push(value);
    emit('Pair the multiset at the inferred magnitude. The empty subset must remain in the recursive half; choosing the upper half corresponds to a negative recovered element.',{sequence:[...remaining],output:[...answer],table:low.map((v,i)=>[v,high[i]]),tableHeaders:['Lower half','Upper half'],codeStage:'update',metrics:{step,magnitude,recovered:value,keep:positive?'lower':'upper'}},'update');
    remaining=positive?low:high;
  }
  if(remaining.length!==1||remaining[0]!==0)throw new Error('Subset sums must reduce to the single empty-subset sum.');
  return answer;
}

const solvers={
1938({parents,queries},emit){const n=parents.length,children=parents.map(()=>[]),grouped=parents.map(()=>[]),answers=queries.map(()=>null);let root=-1;parents.forEach((p,i)=>{if(p===-1)root=i;else children[p].push(i);});queries.forEach(([node,value],i)=>grouped[node].push([value,i]));const width=Math.max(1,Math.ceil(Math.log2(Math.max(n-1,...queries.map(q=>q[1]))+1))),nodes=[{id:0,parent:null,char:'',prefix:'',children:[-1,-1],pass:0}],path=[];const snapshot=()=>nodes.map(({children,...node})=>({...node}));function change(value,delta){let node=0;nodes[node].pass+=delta;for(let bit=width-1;bit>=0;bit--){const digit=(value>>bit)&1;if(nodes[node].children[digit]===-1){const id=nodes.length;nodes[node].children[digit]=id;nodes.push({id,parent:node,char:String(digit),prefix:nodes[node].prefix+digit,children:[-1,-1],pass:0});}node=nodes[node].children[digit];nodes[node].pass+=delta;}return node;}function visit(vertex){path.push(vertex);let activeNode=change(vertex,1);emit('Insert this node label so the counted trie contains exactly the current ancestors, including this node. Zero-count branches left by earlier subtrees are inactive.',{sequence:parents,index:vertex,trieNodes:snapshot(),activeNode,output:[...answers],codeStage:'enter',metrics:{vertex,path:path.join(' -> ')}},'update');for(const[value,index]of grouped[vertex]){let node=0,answer=0;for(let bit=width-1;bit>=0;bit--){const digit=(value>>bit)&1,preferred=nodes[node].children[1-digit],opposite=preferred!==-1&&nodes[preferred].pass>0;node=nodes[node].children[opposite?1-digit:digit];if(opposite)answer|=1<<bit;emit('A one at the highest undecided XOR bit dominates every lower bit. Take the opposite input bit only when that trie branch still contains an active ancestor.',{sequence:parents,index:vertex,trieNodes:snapshot(),activeNode:node,output:[...answers],codeStage:'query',metrics:{query:index,value,bit,opposite,partialXor:answer,path:path.join(' -> ')}});}answers[index]=answer;}for(const child of children[vertex])visit(child);activeNode=change(vertex,-1);path.pop();emit('Remove this label before visiting a sibling subtree. Counts prevent a node from another branch being used as an ancestor.',{sequence:parents,index:vertex,trieNodes:snapshot(),activeNode,output:[...answers],codeStage:'leave',metrics:{vertex,remainingPath:path.join(' -> ')||'empty'}},'update');}visit(root);return answers;},
1948({paths},emit){const nodes=[{id:0,parent:null,char:'',prefix:'',children:new Map(),signature:''}];for(const path of paths){let current=0;for(const name of path){if(!nodes[current].children.has(name)){const id=nodes.length;nodes[current].children.set(name,id);nodes.push({id,parent:current,char:name,prefix:`${nodes[current].prefix}/${name}`,children:new Map(),signature:''});}current=nodes[current].children.get(name);}}const groups=new Map(),snapshot=()=>nodes.map(({children,signature,...node})=>({...node}));function sign(id){const entries=[...nodes[id].children].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([name,child])=>[name,sign(child)]),signature=JSON.stringify(entries);nodes[id].signature=signature;if(id!==0&&entries.length){if(!groups.has(signature))groups.set(signature,[]);groups.get(signature).push(id);}emit('A folder signature includes child names and their complete structures but not its own name. Empty folders are excluded from duplicate marking.',{sequence:paths.map(p=>p.join('/')),trieNodes:snapshot(),activeNode:id,codeStage:'signature',metrics:{folder:nodes[id].prefix||'root',children:entries.length,signature}});return signature;}sign(0);const deleted=new Set([...groups.values()].filter(ids=>ids.length>1).flat()),result=[];function collect(id,path){if(deleted.has(id)){emit('This nonempty structure was duplicated in the original tree. Remove this entire subtree; do not recompute duplicates created by the deletion.',{sequence:paths.map(p=>p.join('/')),trieNodes:snapshot(),activeNode:id,codeStage:'collect',metrics:{folder:path.join('/'),deleted:true}},'update');return;}if(id)result.push(path);for(const[name,child]of nodes[id].children)collect(child,[...path,name]);}collect(0,[]);emit('Collect every path whose ancestors survived the one simultaneous deletion pass.',{sequence:paths.map(p=>p.join('/')),trieNodes:snapshot(),output:result.map(p=>p.join('/')),codeStage:'collect',metrics:{markedFolders:deleted.size,remainingPaths:result.length}},'update');return result;},
1960({s},emit){const n=s.length,radii=Array(n).fill(0),ending=Array(n).fill(1),starting=Array(n).fill(1);let left=0,right=-1;for(let center=0;center<n;center++){let radius=center>right?1:Math.min(radii[left+right-center],right-center+1);while(center-radius>=0&&center+radius<n&&s[center-radius]===s[center+radius])radius++;radii[center]=radius;if(center+radius-1>right){left=center-radius+1;right=center+radius-1;}const length=2*radius-1;ending[center+radius-1]=Math.max(ending[center+radius-1],length);starting[center-radius+1]=Math.max(starting[center-radius+1],length);emit('Mirror a known radius inside the current palindrome, then expand only beyond what is already proved. Record the full odd palindrome at its actual endpoints.',{index:center,window:[center-radius+1,center+radius-1],codeStage:'radius',metrics:{center,radius,length,knownLeft:left,knownRight:right}});}for(let i=n-2;i>=0;i--)ending[i]=Math.max(ending[i],ending[i+1]-2);for(let i=1;i<n;i++)starting[i]=Math.max(starting[i],starting[i-1]-2);for(let i=1;i<n;i++)ending[i]=Math.max(ending[i],ending[i-1]);for(let i=n-2;i>=0;i--)starting[i]=Math.max(starting[i],starting[i+1]);let best=0;for(let split=0;split<n-1;split++){const product=ending[split]*starting[split+1];best=Math.max(best,product);emit('Nested odd palindromes fill shorter endpoint lengths. Prefix and suffix maxima now give two palindromes wholly on opposite sides of this split, guaranteeing no overlap.',{index:split,table:ending.map((v,i)=>[i,v,starting[i]]),tableHeaders:['Position','Best ending by here','Best starting from here'],codeStage:'split',metrics:{split,leftLength:ending[split],rightLength:starting[split+1],product,best}},'update');}return best;},
1977({num},emit){const n=num.length,dp=Array.from({length:n+1},()=>Array(n+1).fill(0)),prefix=dp.map(row=>[...row]),mod=1000000007;for(let end=1;end<=n;end++){for(let length=1;length<=end;length++){const start=end-length,current=num.slice(start,end);let count=0,equalAllowed=false;if(num[start]!=='0'){if(start===0)count=1;else{count=prefix[start][Math.min(length-1,start)];if(start>=length){equalAllowed=num.slice(start-length,start)<=current;if(equalAllowed)count=(count+dp[start][length])%mod;}}}dp[end][length]=count;prefix[end][length]=(prefix[end][length-1]+count)%mod;emit('Shorter previous numbers are smaller automatically because leading zeroes are forbidden. Equal-length numbers require a direct digit comparison; longer predecessors are excluded.',{index:start,window:[start,end-1],table:dp.slice(1,end+1).map((row,i)=>[i+1,...row.slice(1,end+1)]),tableHeaders:['Prefix length',...Array.from({length:end},(_,i)=>`Last length ${i+1}`)],codeStage:'update',metrics:{end,length,current,leadingZero:num[start]==='0',equalAllowed,count,prefixTotal:prefix[end][length]}},'update');}}return prefix[n][n];},
1982({n,sums},emit){return recoverSubsetSums(n,sums,emit);},
2002({s},emit){const n=s.length,size=1<<n,length=Array(size).fill(0);for(let mask=1;mask<size;mask++){const text=[...s].filter((_,i)=>mask&(1<<i)).join('');if(text===[...text].reverse().join(''))length[mask]=text.length;}const best=[...length],witness=length.map((v,mask)=>v?mask:0);for(let bit=0;bit<n;bit++)for(let mask=0;mask<size;mask++)if(mask&(1<<bit)){const smaller=mask^(1<<bit);if(best[smaller]>best[mask]){best[mask]=best[smaller];witness[mask]=witness[smaller];}}let answer=0;for(let mask=1;mask<size;mask++)if(length[mask]){const available=(size-1)^mask,other=witness[available],product=length[mask]*best[available];answer=Math.max(answer,product);emit('The second palindrome uses only indices outside the first mask. The subset-DP witness gives the longest palindrome available in that complement, so the pair is disjoint by construction.',{marks:Object.fromEntries([...s].flatMap((_,i)=>mask&(1<<i)?[[i,'first palindrome']]:other&(1<<i)?[[i,'second palindrome']]:[])),output:[[...s].filter((_,i)=>mask&(1<<i)).join(''),[...s].filter((_,i)=>other&(1<<i)).join('')],codeStage:'pair',metrics:{firstMask:mask.toString(2).padStart(n,'0'),secondMask:other.toString(2).padStart(n,'0'),firstLength:length[mask],secondLength:best[available],product,best:answer}},'update');}return answer;},
};

const python={
1938:`def maxGeneticDifference(parents, queries):
    children = [[] for _ in parents]
    grouped = [[] for _ in parents]
    root = -1
    for node, parent in enumerate(parents):
        if parent == -1:
            root = node
        else:
            children[parent].append(node)
    for index, (node, value) in enumerate(queries):
        grouped[node].append((value, index))
    width = max(1, max(len(parents) - 1, max(value for _, value in queries)).bit_length())
    trie = [{'children': [-1, -1], 'count': 0}]
    answers = [None] * len(queries)
    def change(value, delta):
        node = 0
        trie[node]['count'] += delta
        for bit in range(width - 1, -1, -1):
            digit = (value >> bit) & 1
            if trie[node]['children'][digit] == -1:
                trie[node]['children'][digit] = len(trie)
                trie.append({'children': [-1, -1], 'count': 0})
            node = trie[node]['children'][digit]
            trie[node]['count'] += delta
    # Explicit enter/leave events avoid recursion limits on a long tree chain.
    events = [(root, False)]
    while events:
        vertex, leaving = events.pop()
        if leaving:
            change(vertex, -1)  # step: leave
            continue
        change(vertex, 1)  # step: enter
        for value, index in grouped[vertex]:
            node = answer = 0
            for bit in range(width - 1, -1, -1):
                digit = (value >> bit) & 1
                preferred = trie[node]['children'][1 - digit]
                opposite = preferred != -1 and trie[preferred]['count'] > 0
                node = trie[node]['children'][1 - digit if opposite else digit]
                if opposite:
                    answer |= 1 << bit
                # step: query
            answers[index] = answer
        events.append((vertex, True))
        events.extend((child, False) for child in reversed(children[vertex]))
    return answers  # step: return`,
1948:`def deleteDuplicateFolder(paths):
    root = {}
    for path in paths:
        node = root
        for name in path:
            node = node.setdefault(name, {})
    groups = {}
    signatures = {}
    def sign(node, is_root=False):
        signature = tuple((name, sign(child)) for name, child in sorted(node.items()))
        signatures[id(node)] = signature
        if signature and not is_root:
            groups.setdefault(signature, []).append(id(node))
        # step: signature
        return signature
    sign(root, True)
    deleted = {node_id for group in groups.values() if len(group) > 1 for node_id in group}
    result = []
    def collect(node, path):
        if id(node) in deleted:
            return
        if path:
            result.append(path)
        # step: collect
        for name, child in node.items():
            collect(child, path + [name])
    collect(root, [])
    return result  # step: return`,
1960:`def maxProduct(s):
    n = len(s)
    radii, ending, starting = [0] * n, [1] * n, [1] * n
    left, right = 0, -1
    for center in range(n):
        radius = 1 if center > right else min(radii[left + right - center], right - center + 1)
        while center - radius >= 0 and center + radius < n and s[center - radius] == s[center + radius]:
            radius += 1
        radii[center] = radius
        if center + radius - 1 > right:
            left, right = center - radius + 1, center + radius - 1
        length = 2 * radius - 1
        ending[center + radius - 1] = max(ending[center + radius - 1], length)
        starting[center - radius + 1] = max(starting[center - radius + 1], length)  # step: radius
    for i in range(n - 2, -1, -1):
        ending[i] = max(ending[i], ending[i + 1] - 2)
    for i in range(1, n):
        starting[i] = max(starting[i], starting[i - 1] - 2)
    for i in range(1, n):
        ending[i] = max(ending[i], ending[i - 1])
    for i in range(n - 2, -1, -1):
        starting[i] = max(starting[i], starting[i + 1])
    best = 0
    for split in range(n - 1):
        best = max(best, ending[split] * starting[split + 1])  # step: split
    return best  # step: return`,
1977:`def numberOfCombinations(num):
    # Direct substring comparisons make this a cubic reference implementation.
    n, modulus = len(num), 1_000_000_007
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    prefix = [[0] * (n + 1) for _ in range(n + 1)]
    for end in range(1, n + 1):
        for length in range(1, end + 1):
            start = end - length
            count = 0
            if num[start] != '0':
                if start == 0:
                    count = 1
                else:
                    count = prefix[start][min(length - 1, start)]
                    if start >= length and num[start - length:start] <= num[start:end]:
                        count = (count + dp[start][length]) % modulus
            dp[end][length] = count
            prefix[end][length] = (prefix[end][length - 1] + count) % modulus  # step: update
    return prefix[n][n]  # step: return`,
1982:`def recoverArray(n, sums):
    from collections import Counter
    remaining = sorted(sums)
    answer = []
    for _ in range(n):
        magnitude = remaining[1] - remaining[0]
        counts, lower, upper = Counter(remaining), [], []
        for value in remaining:
            if counts[value] == 0:
                continue
            counts[value] -= 1
            paired = value + magnitude
            if counts[paired] == 0:
                raise ValueError('Invalid subset-sum multiset')
            counts[paired] -= 1
            lower.append(value)
            upper.append(paired)
        positive = 0 in lower
        if not positive and 0 not in upper:
            raise ValueError('No empty-subset sum in either half')
        answer.append(magnitude if positive else -magnitude)
        remaining = lower if positive else upper  # step: update
    if remaining != [0]:
        raise ValueError('Invalid final subset-sum state')
    return answer  # step: return`,
2002:`def maxProduct(s):
    n = len(s)
    size = 1 << n
    length = [0] * size
    for mask in range(1, size):
        text = ''.join(s[i] for i in range(n) if mask & (1 << i))
        if text == text[::-1]:
            length[mask] = len(text)
    best = length[:]
    for bit in range(n):
        for mask in range(size):
            if mask & (1 << bit):
                best[mask] = max(best[mask], best[mask ^ (1 << bit)])
    answer = 0
    for mask in range(1, size):
        if length[mask]:
            available = (size - 1) ^ mask
            answer = max(answer, length[mask] * best[available])  # step: pair
    return answer  # step: return`,
};
const cases={
1938:[['Queries follow different branches of a nonzero-root tree',{parents:[2,2,-1,0,0,1,1,3],queries:[[7,10],[4,13],[6,7],[2,31],[5,2]]}],['A sibling label must not leak into the active ancestor trie',{parents:[-1,0,0,1,2],queries:[[3,4],[4,3],[1,7],[2,7]]}],['The root is the only permitted ancestor',{parents:[-1],queries:[[0,0],[0,63]]}],['A chain allows every earlier label',{parents:[-1,0,1,2,3,4],queries:[[5,9],[4,2],[2,14]]}]],
1948:[['Two nested folder structures disappear while a third survives',{paths:[['oak'],['oak','bud'],['oak','bud','tip'],['pine'],['pine','bud'],['pine','bud','tip'],['reed'],['reed','seed']]}],['Empty leaves alone are not duplicate structures',{paths:[['east'],['west'],['east','leaf'],['west','stem']]}],['Deletion-created duplicates must survive the single pass',{paths:[['a'],['a','x'],['a','x','z'],['a','u'],['b'],['b','y'],['b','y','z'],['b','u']]}],['All top-level trees are duplicate',{paths:[['north'],['north','twig'],['south'],['south','twig']]}]],
1960:[['Separated odd palindromes have different lengths',{s:'abacdfgdcabayracecarz'}],['Nested palindromes must be split without overlap',{s:'aaaaaaaaaa'}],['An even palindrome cannot count as an odd one',{s:'abba'}],['Two singleton palindromes',{s:'xy'}]],
1977:[['Repeated and increasing chunks offer many partitions',{num:'121314151617'}],['A leading zero prevents every valid partition',{num:'012345'}],['Zeroes may occur inside a positive number',{num:'10102030'}],['Repeated digits allow equal consecutive numbers',{num:'777777'}]],
1982:[['Mixed signs, a zero, and repeated subset sums',{n:4,sums:[0,-2,3,1,5,3,8,6,0,-2,3,1,5,3,8,6]}],['Every recovered element is zero',{n:3,sums:[0,0,0,0,0,0,0,0]}],['Negative elements require selecting the upper half',{n:2,sums:[0,-3,-5,-8]}],['Repeated positive elements preserve multiplicities',{n:3,sums:[0,2,2,4,4,6,6,8]}]],
2002:[['Interleaved palindromes compete for the same positions',{s:'abacdcbead'}],['Equal characters can be split into two long subsequences',{s:'kkkkkkkk'}],['Distinct letters restrict both lengths to one',{s:'abcdefghi'}],['Two positions form the smallest valid pair',{s:'zz'}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  if(id===1938){const p=input.parents;need(Array.isArray(p)&&p.length>=1&&p.length<=24&&p.filter(v=>v===-1).length===1&&p.every((v,i)=>v===-1||integer(v,0,p.length-1)&&v!==i),'Use 1-24 parent entries with exactly one root and valid other parent indices.');for(let i=0;i<p.length;i++){const seen=new Set();let node=i;while(node!==-1){need(!seen.has(node),'Parent links must form one acyclic tree.');seen.add(node);node=p[node];}}need(Array.isArray(input.queries)&&input.queries.length>=1&&input.queries.length<=16&&input.queries.every(q=>Array.isArray(q)&&q.length===2&&integer(q[0],0,p.length-1)&&integer(q[1],0,1023)),'Use 1-16 [node,value] queries with values from zero to 1023.');}
  if(id===1948){const paths=input.paths;need(Array.isArray(paths)&&paths.length>=1&&paths.length<=30&&paths.every(path=>Array.isArray(path)&&path.length>=1&&path.length<=6&&path.every(name=>typeof name==='string'&&/^[a-z]{1,8}$/.test(name))),'Use 1-30 folder paths, depth at most six, with lowercase names of length 1-8.');const keys=new Set(paths.map(path=>path.join('/')));need(keys.size===paths.length,'Folder paths must be distinct.');need(paths.every(path=>path.slice(0,-1).every((_,i)=>keys.has(path.slice(0,i+1).join('/')))),'Include every parent path of each folder.');}
  if(id===1960)need(typeof input.s==='string'&&/^[a-z]{2,120}$/.test(input.s),'Use 2-120 lowercase characters.');
  if(id===1977)need(typeof input.num==='string'&&/^[0-9]{1,32}$/.test(input.num),'Use 1-32 digits for the direct-comparison DP trace.');
  if(id===1982){need(integer(input.n,1,8)&&Array.isArray(input.sums)&&input.sums.length===2**input.n&&input.sums.every(v=>integer(v,-10000,10000)),'Use n from 1 to 8 and exactly 2^n integer subset sums.');recoverSubsetSums(input.n,input.sums);}
  if(id===2002)need(typeof input.s==='string'&&/^[a-z]{2,10}$/.test(input.s),'Use 2-10 lowercase characters for subset-mask playback.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{1938:{enter:2,query:3,leave:4},1948:{signature:2,collect:4},1960:{radius:1,split:4},2002:{pair:4}},tags:{1938:['Trie','Tree','Bit Manipulation'],1948:['Trie','Hash Table'],1960:['String','Manacher'],1977:['Dynamic Programming','String'],1982:['Divide and Conquer'],2002:['Bitmask','Dynamic Programming']}};
