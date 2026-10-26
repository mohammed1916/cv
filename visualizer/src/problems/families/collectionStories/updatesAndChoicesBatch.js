const specs={
2212:['numArrows aliceArrows','Allocate Bob arrows to maximize the points won against Alice.','Winning a section requires exactly one more arrow than Alice used there. Enumerate subsets of won sections, keep the best affordable score, and place unused arrows in the zero-point section.','enumerate subsets of the twelve scoring sections|sum the arrows needed to beat Alice in selected sections|discard unaffordable subsets|maximize selected section scores and place leftover arrows at zero|return one optimal arrow allocation','O(12*2^12) time; O(12) allocation space.'],
2213:['s queryCharacters queryIndices','After each character replacement, report the longest run of one repeated character.','Each segment-tree node stores its boundary characters, equal-character prefix and suffix lengths, and best internal run. A replacement changes one leaf and only the ancestors that contain it.','build segment summaries for the initial string|replace the queried character leaf|merge changed ancestors using matching boundary characters|read the root longest-run value after each update|return all query answers','O(n+queries*log n) time; O(n) segment-tree space.'],
2214:['damage armor','Find the minimum starting health needed to survive every damage event.','Armor can prevent at most its capacity on one event, so spend it on a largest hit. Health must stay strictly positive; total unavoidable damage plus one is sufficient.','sum all damage values|find the largest single hit|save the smaller of armor and that largest hit|subtract the saved damage and add one survival point|return minimum initial health','O(n) time; O(1) auxiliary space.'],
2215:['nums1 nums2','Return distinct values present only in each of two arrays.','Membership sets remove duplicate occurrences. Check each distinct value against the opposite set; values shared by both appear in neither difference.','build distinct-value sets for both arrays|visit first-array values absent from the second set|visit second-array values absent from the first set|collect each exclusive value once|return the two difference lists','O(n+m) expected time and space.'],
2216:['nums','Delete the fewest values so the retained array has even length and unequal values in each adjacent pair.','Keep a first value for a pair, then discard equal candidates until a different second value arrives. Completed pairs never constrain the next pair; discard an unfinished last value if necessary.','scan values while building retained pairs|start a pair whenever retained length is even|discard a candidate equal to the unfinished pair first value|close pairs with different values and drop any final unmatched value|return the deletion count','O(n) time; O(n) retained-state space in this implementation.'],
2217:['queries intLength','Find the requested one-based palindromes of a fixed decimal length.','A palindrome is uniquely determined by its first half including the middle digit. Add query minus one to the smallest legal half, check its digit width, then mirror it.','compute the number of digits in the determining half|offset the smallest half by query minus one|reject halves exceeding that width|mirror the half while excluding an odd-length middle duplicate|return each palindrome or -1','O(query count*intLength) time and output space.'],
2218:['piles k','Take exactly k coins from pile tops with the greatest total value.','Each pile offers only its prefix sums, since deeper coins require taking those above. DP combines one prefix choice per pile while marking impossible exact coin counts as unreachable.','compute top-prefix sums for each pile|initialize only zero coins as reachable|try every prefix of the next pile for each exact coin budget|keep the largest reachable value|return the optimum for exactly k coins','O(k*total pile lengths) time; O(k) working DP space excluding displayed history.'],
2220:['start goal','Count bit positions that must flip to transform start into goal.','XOR marks exactly the differing positions. Count its set bits while scanning from the least significant position upward; matching positions require no flip.','xor the starting and target integers|inspect the lowest remaining bit|add one for each differing bit|shift to the next position|return the flip count','O(log(max(start,goal)+1)) time; O(1) counting space.'],
2221:['nums','Reduce adjacent digit sums modulo ten until one value remains.','Every new row is computed from neighboring pairs of the previous row. Build a fresh row before replacing the old one so earlier updates cannot contaminate later sums.','start with the input digit row|sum each adjacent pair modulo ten into a fresh shorter row|replace the current row after every pair is processed|repeat until one digit remains|return that final digit','O(n^2) time; O(n) working row space excluding display history.'],
2222:['s','Count three-building selections whose types alternate.','Choose each position as the middle building. Its two endpoints must both have the opposite type, so multiply opposite-type counts on its left and right.','count total zeros and ones|scan possible middle positions with prefix counts|count opposite-type endpoints on both sides|add the product of left and right choices|return the alternating triple count','O(n) time; O(1) counting space.'],
};
function combineRuns(a,b){const joined=a.last===b.first;return{length:a.length+b.length,first:a.first,last:b.last,prefix:a.prefix+(joined&&a.prefix===a.length?b.prefix:0),suffix:b.suffix+(joined&&b.suffix===b.length?a.suffix:0),best:Math.max(a.best,b.best,joined?a.suffix+b.prefix:0)};}
const solvers={
2212({numArrows,aliceArrows},emit){let best=-1,answer=null;for(let mask=0;mask<4096;mask++){let needed=0,score=0;const allocation=Array(12).fill(0);for(let section=0;section<12;section++)if(mask&(1<<section)){allocation[section]=aliceArrows[section]+1;needed+=allocation[section];score+=section;}if(needed<=numArrows&&score>best){best=score;allocation[0]+=numArrows-needed;answer=allocation;emit('This subset wins each selected section with the minimum required arrows and improves the best affordable score. Leftover arrows go to the zero-point section without reducing any win.',{sequence:aliceArrows,output:[...answer],table:answer.map((arrows,i)=>[i,aliceArrows[i],arrows,arrows>aliceArrows[i]?i:0]),tableHeaders:['Section points','Alice arrows','Bob arrows','Bob points'],codeStage:'improve',metrics:{mask:mask.toString(2).padStart(12,'0'),needed,leftover:numArrows-needed,score,best}},'update');}}return answer;},
2213({s,queryCharacters,queryIndices},emit){const letters=[...s],tree=Array(4*s.length),bounds=Array(4*s.length);const leaf=c=>({length:1,first:c,last:c,prefix:1,suffix:1,best:1});function build(node,left,right){bounds[node]=[left,right];if(left===right){tree[node]=leaf(letters[left]);return;}const middle=Math.floor((left+right)/2);build(node*2,left,middle);build(node*2+1,middle+1,right);tree[node]=combineRuns(tree[node*2],tree[node*2+1]);}build(1,0,s.length-1);const table=()=>tree.flatMap((value,node)=>value?[[node,...bounds[node],value.first,value.last,value.prefix,value.suffix,value.best]]:[]);function update(node,left,right,index,char){if(left===right){letters[index]=char;tree[node]=leaf(char);}else{const middle=Math.floor((left+right)/2);if(index<=middle)update(node*2,left,middle,index,char);else update(node*2+1,middle+1,right,index,char);tree[node]=combineRuns(tree[node*2],tree[node*2+1]);}emit('Merge the changed segment from its children. A cross-boundary run exists only when the left suffix letter equals the right prefix letter; full-length prefixes and suffixes may then extend.',{sequence:[...letters],index,window:[left,right],table:table(),tableHeaders:['Node','Left','Right','First','Last','Prefix','Suffix','Best run'],codeStage:left===right?'leaf':'merge',metrics:{node,left,right,replacement:char,bestInSegment:tree[node].best}},'update');}const answer=[];for(let q=0;q<queryIndices.length;q++){update(1,0,s.length-1,queryIndices[q],queryCharacters[q]);answer.push(tree[1].best);emit('The root now summarizes the entire updated string. Record its best run before applying the next query.',{sequence:[...letters],output:[...answer],codeStage:'answer',metrics:{query:q+1,index:queryIndices[q],character:queryCharacters[q],longestRun:tree[1].best}},'update');}return answer;},
2214({damage,armor},emit){let total=0,largest=0;for(let i=0;i<damage.length;i++){total+=damage[i];largest=Math.max(largest,damage[i]);emit('One armor use can save at most the chosen hit and at most the armor capacity. The largest hit therefore offers the greatest possible saving.',{index:i,codeStage:'scan',metrics:{damage:damage[i],totalDamage:total,largestHit:largest,armor,maximumSaving:Math.min(armor,largest)}},'update');}return total-Math.min(armor,largest)+1;},
2215({nums1,nums2},emit){const sets=[new Set(nums1),new Set(nums2)],answer=[[],[]];for(let side=0;side<2;side++)for(const value of sets[side]){const exclusive=!sets[1-side].has(value);if(exclusive)answer[side].push(value);emit('Check one distinct value against the other membership set. Repeated source occurrences never create duplicate difference entries.',{sequence:side===0?nums1:nums2,output:[...answer[side]],codeStage:'check',metrics:{side:side+1,value,exclusive,firstOnly:answer[0].join(', ')||'none',secondOnly:answer[1].join(', ')||'none'}},'update');}return answer;},
2216({nums},emit){const kept=[];let deleted=0;for(let i=0;i<nums.length;i++){const reject=kept.length%2===1&&kept.at(-1)===nums[i];if(reject)deleted++;else kept.push(nums[i]);emit(reject?'This candidate equals the first value of an unfinished pair, so keeping it would violate the pair rule. Delete it and keep waiting for a different value.':'Retain this value as a new pair start or as the different second value that completes the current pair.',{index:i,output:[...kept],codeStage:'pair',metrics:{value:nums[i],rejected:reject,retainedLength:kept.length,deleted}},'update');}if(kept.length%2){kept.pop();deleted++;emit('One unmatched value remains at the end. Delete it to make the final retained length even.',{output:kept,codeStage:'trim',metrics:{deleted}},'update');}return deleted;},
2217({queries,intLength},emit){const halfLength=Math.ceil(intLength/2),base=10**(halfLength-1),limit=10**halfLength,answer=[];for(let i=0;i<queries.length;i++){const half=base+queries[i]-1,valid=half<limit,text=String(half),value=valid?Number(text+[...(intLength%2?text.slice(0,-1):text)].reverse().join('')):-1;answer.push(value);emit('Increasing the determining half increases the full palindrome. An out-of-width half means the requested rank exceeds the available fixed-length palindromes.',{sequence:queries,index:i,output:[...answer],codeStage:'mirror',metrics:{query:queries[i],intLength,halfLength,half,valid,palindrome:value}},'update');}return answer;},
2218({piles,k},emit){let dp=Array(k+1).fill(-Infinity);dp[0]=0;const history=[dp.map(v=>Number.isFinite(v)?v:null)];for(let pile=0;pile<piles.length;pile++){const prefix=[0];for(const value of piles[pile])prefix.push(prefix.at(-1)+value);const next=Array(k+1).fill(-Infinity);for(let count=0;count<=k;count++){const choices=[];for(let take=0;take<=Math.min(count,piles[pile].length);take++){if(!Number.isFinite(dp[count-take]))continue;const candidate=dp[count-take]+prefix[take];next[count]=Math.max(next[count],candidate);choices.push([take,prefix[take],dp[count-take],candidate]);}emit('Taking a pile prefix respects access from the top. Combine it only with a reachable exact count from earlier piles; zero does not stand in for an impossible state.',{sequence:piles[pile],window:[0,Math.min(count,piles[pile].length)-1],outputMatrix:[...history,next.map(v=>Number.isFinite(v)?v:null)],outputMatrixLabel:'Best value by processed piles and exact coin count',outputCell:[history.length,count],table:choices,tableHeaders:['From this pile','Prefix value','Earlier-pile value','Candidate total'],codeStage:'choose',metrics:{pile,exactCoins:count,best:Number.isFinite(next[count])?next[count]:'unreachable'}},'update');}dp=next;history.push(dp.map(v=>Number.isFinite(v)?v:null));}return dp[k];},
2220({start,goal},emit){let difference=start^goal,count=0,bit=0;const width=Math.max(start.toString(2).length,goal.toString(2).length);while(difference){const needsFlip=difference&1;count+=needsFlip;emit('XOR has a one exactly where the starting and target bits disagree. Count that position once, then move to the next bit.',{sequence:[...((start^goal)>>>0).toString(2).padStart(width,'0')],index:width-1-bit,codeStage:'bit',metrics:{bit,startBit:(start>>>bit)&1,goalBit:(goal>>>bit)&1,needsFlip:Boolean(needsFlip),count}},'update');difference>>>=1;bit++;}return count;},
2221({nums},emit){let row=[...nums];const history=[[...row]];while(row.length>1){const next=row.slice(1).map((value,i)=>(row[i]+value)%10);history.push([...next]);emit('Every new cell uses two adjacent values from the unchanged previous row, then keeps only the final decimal digit.',{sequence:row,output:next,outputMatrix:history.map(values=>[...values,...Array(nums.length-values.length).fill(null)]),outputMatrixLabel:'Successive triangular-sum rows',codeStage:'row',metrics:{previousLength:row.length,nextLength:next.length}},'update');row=next;}return row[0];},
2222({s},emit){const total=[0,0],left=[0,0];for(const c of s)total[Number(c)]++;let ways=0;for(let i=0;i<s.length;i++){const type=Number(s[i]),opposite=1-type,right=total[opposite]-left[opposite],added=left[opposite]*right;ways+=added;emit('Fix this building as the middle. Both endpoints must have the opposite type, and every left choice can combine with every right choice.',{sequence:[...s],index:i,codeStage:'middle',metrics:{middleType:type,oppositeType:opposite,leftChoices:left[opposite],rightChoices:right,added,ways}},'update');left[type]++;}return ways;},
};
const python={
2212:`def maximumBobPoints(numArrows, aliceArrows):
    best, answer = -1, None
    for mask in range(1 << 12):
        needed = score = 0
        allocation = [0] * 12
        for section in range(12):
            if mask & (1 << section):
                allocation[section] = aliceArrows[section] + 1
                needed += allocation[section]
                score += section
        if needed <= numArrows and score > best:
            best = score
            allocation[0] += numArrows - needed
            answer = allocation  # step: improve
    return answer  # step: return`,
2213:`def longestRepeating(s, queryCharacters, queryIndices):
    letters, tree = list(s), [None] * (4 * len(s))
    def leaf(char):
        return (1, char, char, 1, 1, 1)
    def combine(a, b):
        length_a, first_a, last_a, prefix_a, suffix_a, best_a = a
        length_b, first_b, last_b, prefix_b, suffix_b, best_b = b
        joined = last_a == first_b
        prefix = prefix_a + (prefix_b if joined and prefix_a == length_a else 0)
        suffix = suffix_b + (suffix_a if joined and suffix_b == length_b else 0)
        best = max(best_a, best_b, suffix_a + prefix_b if joined else 0)
        return (length_a + length_b, first_a, last_b, prefix, suffix, best)
    def build(node, left, right):
        if left == right:
            tree[node] = leaf(letters[left])
            return
        middle = (left + right) // 2
        build(node * 2, left, middle)
        build(node * 2 + 1, middle + 1, right)
        tree[node] = combine(tree[node * 2], tree[node * 2 + 1])
    def update(node, left, right, index, char):
        if left == right:
            letters[index] = char
            tree[node] = leaf(char)  # step: leaf
            return
        middle = (left + right) // 2
        if index <= middle:
            update(node * 2, left, middle, index, char)
        else:
            update(node * 2 + 1, middle + 1, right, index, char)
        tree[node] = combine(tree[node * 2], tree[node * 2 + 1])  # step: merge
    build(1, 0, len(s) - 1)
    answer = []
    for index, char in zip(queryIndices, queryCharacters):
        update(1, 0, len(s) - 1, index, char)
        answer.append(tree[1][5])  # step: answer
    return answer  # step: return`,
2214:`def minimumHealth(damage, armor):
    total = largest = 0
    for hit in damage:
        total += hit
        largest = max(largest, hit)  # step: scan
    return total - min(armor, largest) + 1  # step: return`,
2215:`def findDifference(nums1, nums2):
    sets = [set(nums1), set(nums2)]
    answer = [[], []]
    for side, values in enumerate((nums1, nums2)):
        for value in dict.fromkeys(values):
            if value not in sets[1 - side]:
                answer[side].append(value)
            # step: check
    return answer  # step: return`,
2216:`def minDeletion(nums):
    kept, deleted = [], 0
    for value in nums:
        if len(kept) % 2 and kept[-1] == value:
            deleted += 1
        else:
            kept.append(value)
        # step: pair
    if len(kept) % 2:
        kept.pop()
        deleted += 1  # step: trim
    return deleted  # step: return`,
2217:`def kthPalindrome(queries, intLength):
    half_length = (intLength + 1) // 2
    base, limit = 10 ** (half_length - 1), 10 ** half_length
    answer = []
    for query in queries:
        half = base + query - 1
        if half >= limit:
            answer.append(-1)
        else:
            text = str(half)
            mirrored = (text[:-1] if intLength % 2 else text)[::-1]
            answer.append(int(text + mirrored))
        # step: mirror
    return answer  # step: return`,
2218:`def maxValueOfCoins(piles, k):
    dp = [float('-inf')] * (k + 1)
    dp[0] = 0
    for pile in piles:
        prefix = [0]
        for value in pile:
            prefix.append(prefix[-1] + value)
        next_dp = [float('-inf')] * (k + 1)
        for count in range(k + 1):
            for take in range(min(count, len(pile)) + 1):
                if dp[count - take] != float('-inf'):
                    next_dp[count] = max(next_dp[count], dp[count - take] + prefix[take])
            # step: choose
        dp = next_dp
    return dp[k]  # step: return`,
2220:`def minBitFlips(start, goal):
    difference, count = start ^ goal, 0
    while difference:
        count += difference & 1  # step: bit
        difference >>= 1
    return count  # step: return`,
2221:`def triangularSum(nums):
    row = list(nums)
    while len(row) > 1:
        row = [(row[i] + row[i + 1]) % 10 for i in range(len(row) - 1)]  # step: row
    return row[0]  # step: return`,
2222:`def numberOfWays(s):
    total = [s.count('0'), s.count('1')]
    left, ways = [0, 0], 0
    for char in s:
        kind = int(char)
        opposite = 1 - kind
        right = total[opposite] - left[opposite]
        ways += left[opposite] * right  # step: middle
        left[kind] += 1
    return ways  # step: return`,
};
const cases={
2212:[['Different section costs compete for a shared arrow budget',{numArrows:15,aliceArrows:[0,1,2,0,3,1,0,2,1,0,2,3]}],['One arrow can win the highest unguarded section',{numArrows:1,aliceArrows:[0,0,0,0,0,0,0,0,0,0,0,1]}],['Equal defense costs favor the highest scoring sections',{numArrows:12,aliceArrows:[1,1,1,1,1,1,1,1,1,1,1,1]}],['Alice places every arrow in the zero-point section',{numArrows:8,aliceArrows:[8,0,0,0,0,0,0,0,0,0,0,0]}]],
2213:[['Updates split old runs and join new runs across tree boundaries',{s:'aaabccddddeeff',queryCharacters:'dccccaaa',queryIndices:[3,4,5,6,7,8,0,1]}],['Updating a character to itself preserves the result',{s:'bbbbbb',queryCharacters:'bb',queryIndices:[0,5]}],['A one-character segment tree always reports one',{s:'x',queryCharacters:'abc',queryIndices:[0,0,0]}],['Replacing a separator joins two equal runs',{s:'aaaxaaa',queryCharacters:'ab',queryIndices:[3,2]}]],
2214:[['Only one of several hits can benefit from armor',{damage:[8,17,5,23,11,6,19],armor:14}],['Armor larger than every hit still applies only once',{damage:[4,7,3],armor:100}],['No armor leaves total damage plus one',{damage:[9,2,8],armor:0}],['A fully blocked single hit still requires positive health',{damage:[12],armor:12}]],
2215:[['Shared values and duplicates leave two distinct differences',{nums1:[4,7,4,12,18,7,25,3],nums2:[7,9,18,9,30,4,11]}],['Identical sets yield two empty differences',{nums1:[2,2,5,8],nums2:[8,5,2,8]}],['Disjoint sets keep all distinct values',{nums1:[1,3,5],nums2:[2,4,6]}],['Signed values follow ordinary set membership',{nums1:[-4,0,7,-4],nums2:[0,-9,7]}]],
2216:[['Runs of equal values force deletions inside unfinished pairs',{nums:[3,3,3,8,8,2,2,2,7,7,4,4,9]}],['An already beautiful even array needs no deletion',{nums:[1,4,4,7,7,2]}],['All equal values eventually leave no complete pair',{nums:[6,6,6,6,6]}],['One trailing unmatched value must be removed',{nums:[2,5,8]}]],
2217:[['Several odd-length ranks include a last valid and an invalid query',{queries:[1,7,28,90,900,901],intLength:5}],['Even-length palindromes mirror the entire half',{queries:[1,12,47,90,91],intLength:4}],['One-digit palindromes exclude zero',{queries:[1,5,9,10],intLength:1}],['Long fixed-length palindromes remain exact integers',{queries:[1,1234,90000000,90000001],intLength:15}]],
2218:[['Deep valuable coins compete with cheaper accessible prefixes',{piles:[[4,3,40,2],[15,1,2,18],[7,20,5],[9,6]],k:7}],['One pile requires taking its exact top prefix',{piles:[[8,2,19,4,11]],k:3}],['Taking every coin removes all choice',{piles:[[3,7],[11],[2,5]],k:5}],['A high buried coin is inaccessible with a one-coin budget',{piles:[[1,100],[9,2],[7]],k:1}]],
2220:[['Several separated binary positions differ',{start:173,goal:86}],['Equal values require no flips',{start:255,goal:255}],['Zero to a power of two changes one bit',{start:0,goal:1024}],['Many low bits differ simultaneously',{start:0,goal:63}]],
2221:[['Several modular reductions build a complete triangle',{nums:[8,3,7,9,2,6,4,1,5]}],['A singleton is already the result',{nums:[7]}],['Two digits wrap their sum modulo ten',{nums:[8,9]}],['All-zero rows remain zero',{nums:[0,0,0,0,0]}]],
2222:[['Interleaved runs supply many alternating endpoint choices',{s:'0010110011010100'}],['A single building type has no alternating triple',{s:'1111111'}],['Exactly one alternating triple exists',{s:'010'}],['Two buildings cannot form a triple',{s:'01'}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2212)need(integer(input.numArrows,1,100)&&Array.isArray(input.aliceArrows)&&input.aliceArrows.length===12&&input.aliceArrows.every(v=>integer(v,0,100))&&input.aliceArrows.reduce((a,b)=>a+b,0)===input.numArrows,'Use 1-100 arrows and twelve nonnegative Alice counts summing to that budget.');
  if(id===2213)need(typeof input.s==='string'&&/^[a-z]{1,40}$/.test(input.s)&&typeof input.queryCharacters==='string'&&/^[a-z]{1,40}$/.test(input.queryCharacters)&&Array.isArray(input.queryIndices)&&input.queryIndices.length===input.queryCharacters.length&&input.queryIndices.every(v=>integer(v,0,input.s.length-1)),'Use a 1-40 letter string and 1-40 replacement characters paired with valid query indices.');
  if(id===2214)need(vector(input.damage,1)&&integer(input.armor),'Use 1-80 positive damage values and nonnegative armor, each at most one million.');
  if(id===2215)need(vector(input.nums1,-1000000)&&vector(input.nums2,-1000000),'Use two nonempty arrays of at most 80 signed values.');
  if(id===2216)need(vector(input.nums),'Use 1-80 nonnegative values.');
  if(id===2217)need(Array.isArray(input.queries)&&input.queries.length>=1&&input.queries.length<=40&&input.queries.every(v=>integer(v,1,1000000000))&&integer(input.intLength,1,15),'Use 1-40 positive queries up to one billion and palindrome length 1-15.');
  if(id===2218)need(Array.isArray(input.piles)&&input.piles.length>=1&&input.piles.length<=10&&input.piles.every(p=>vector(p,1,30))&&input.piles.reduce((sum,p)=>sum+p.length,0)<=80&&integer(input.k,1,input.piles.reduce((sum,p)=>sum+p.length,0)),'Use 1-10 nonempty positive coin piles, at most 80 total coins, and a valid positive exact coin budget.');
  if(id===2220)need(integer(input.start,0,1000000000)&&integer(input.goal,0,1000000000),'Use two nonnegative integers at most one billion.');
  if(id===2221)need(vector(input.nums,0,30)&&input.nums.every(v=>v<=9),'Use 1-30 decimal digits.');
  if(id===2222)need(typeof input.s==='string'&&/^[01]{1,120}$/.test(input.s),'Use 1-120 binary building types.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2212:{improve:4},2213:{leaf:2,merge:3,answer:4},2214:{scan:3},2215:{check:4},2216:{pair:3,trim:4},2217:{mirror:4},2218:{choose:4},2220:{bit:3},2221:{row:3},2222:{middle:4}},tags:{2212:['Backtracking','Bit Manipulation'],2213:['Segment Tree'],2214:['Greedy'],2215:['Hash Table'],2216:['Greedy'],2217:['Math'],2218:['Dynamic Programming'],2220:['Bit Manipulation'],2221:['Simulation'],2222:['Prefix Sum']}};
