const specs={
1968:['nums','Rearrange distinct values so no interior value equals the average of its neighbors.','Place the smaller half at even positions and the larger half at odd positions. Every interior position becomes a strict local minimum or maximum, ruling out equality with the neighbor average.','sort a copy of the distinct values|split into smaller and larger halves|visit even and odd output positions|interleave the smaller and larger halves|return the alternating arrangement','O(n log n) time; O(n) output space.'],
1969:['p','Minimize the nonzero product of values from one through 2^p-1 after allowed bit swaps.','The minimum has one maximum value, many ones, and pairs contributing maximum minus one. Evaluate maximum times (maximum minus one) to the power 2^(p-1)-1 modulo 1000000007.','derive maximum and pair count with exact integers|initialize modular power accumulator|read the next exponent bit|multiply when set then square the base and halve the exponent|return maximum times the modular power','O(p) time; O(1) integer state for p at most sixty.'],
1970:['row col cells','Find the last day a land path connects the top row to the bottom row.','Reverse the flooding process. Reopen cells and union adjacent land components with virtual top and bottom nodes; the first reverse connection identifies the latest feasible day.','start with every cell flooded|reopen cells in reverse flooding order|join the opened cell with neighboring land and boundary nodes|check whether top and bottom are connected|return the corresponding forward day','O(rows*columns*inverse Ackermann) time; O(rows*columns) space.'],
1973:['root','Count tree nodes whose value equals the sum of all descendants.','Decode the level-order input, then visit children before their parent. Each returned subtree total lets a parent obtain its descendant sum by adding its child totals.','decode the level-order tree|visit each node after its children|sum child subtree totals|count equality with the node value and return its subtree total|return the total number of matching nodes','O(n) time and decoded-tree space.'],
1974:['word','Type a word on a circular alphabet with minimum movement and keypress time.','For each requested letter choose the shorter clockwise or counterclockwise distance from the current pointer, then add one second to type.','start at letter a with zero time|read the next requested letter|compute clockwise and counterclockwise distance|add the shorter distance plus one keypress and move the pointer|return total time','O(n) time; O(1) auxiliary space.'],
1975:['matrix','Maximize the matrix sum using adjacent pair sign flips.','Pair flips preserve the parity of the number of negatives. Make all magnitudes positive when parity is even; otherwise leave the smallest magnitude negative, unless a zero absorbs the sign.','start absolute sum and negative count at zero|inspect every matrix cell|track its magnitude and sign|accumulate magnitudes and remember the smallest|return absolute sum minus twice the minimum when parity is odd','O(rows*columns) time; O(1) auxiliary space.'],
1979:['nums','Find the greatest common divisor of the smallest and largest array values.','Only the two extrema affect the requested answer. Repeatedly replace the larger Euclidean argument by its remainder until the other argument becomes zero.','find the minimum and maximum values|start Euclid with the two extrema|compute the remainder|replace the pair with divisor and remainder|return the last nonzero value','O(n + log maximum) time; O(1) auxiliary space.'],
1980:['nums','Construct a binary string absent from the supplied equal-length strings.','Flip the ith bit of the ith string. The resulting string differs from every input string at its own diagonal position, so no membership search is necessary.','start an empty answer|visit each input row i|read its diagonal bit at column i|append the opposite bit|return the constructed binary string','O(n) construction time and output space.'],
1981:['mat target','Choose one value from each row with total closest to target.','Keep the set of all reachable sums after each row. Combining each existing sum with each value in the next row covers every legal selection while merging duplicate totals.','start reachable sums with zero|read the next row|combine every previous sum with every row value|deduplicate the resulting totals|return the minimum distance to target','O(rows*columns*reachable sums) time; O(reachable sums) space.'],
1983:['nums1 nums2','Find the widest interval whose sums match in two binary arrays.','Equal range sums mean equal prefix-sum differences at the two boundaries. Record the earliest index for each difference to maximize the later matching interval.','record difference zero before the arrays|advance both prefix sums together|compute their current difference|reuse its earliest index or record its first occurrence|return the greatest matching interval width','O(n) time and prefix-difference map space.'],
1984:['nums k','Choose k scores with the smallest difference between highest and lowest.','In sorted order an optimal selection can be a consecutive block. Compare the endpoints of every length-k window.','sort a copy of the scores|slide a window containing k scores|subtract its first score from its last|keep the smallest endpoint gap|return the best score difference','O(n log n) time; O(n) sorted copy space.'],
1985:['nums k','Find the kth largest nonnegative integer represented as a decimal string.','Compare lengths first, then lexicographic order for equal lengths. This matches integer order without converting potentially huge values into imprecise machine numbers.','copy the decimal strings|order by length then lexicographic value|preserve duplicate entries as separate ranks|select the kth entry in descending order|return that exact decimal string','O(n log n * maximum digits) comparison time; O(n) copied references.'],
};

const solvers={
1968({nums},emit){const ordered=[...nums].sort((a,b)=>a-b),mid=Math.ceil(nums.length/2),result=[];for(let i=0;i<nums.length;i++){const source=i%2?mid+Math.floor(i/2):Math.floor(i/2);result.push(ordered[source]);emit('Small values occupy valleys and large values occupy peaks. Since all values are distinct, an interior value is strictly on one side of both neighbors and cannot equal their average.',{sequence:ordered,index:source,output:[...result],codeStage:'update',metrics:{position:i,source,half:i%2?'larger':'smaller'}},'update');}return result;},
1969({p},emit){const mod=1000000007n,maximum=(1n<<BigInt(p))-1n;let base=(maximum-1n)%mod,exponent=(1n<<BigInt(p-1))-1n,power=1n;while(exponent){const bit=exponent&1n,old=exponent;if(bit)power=power*base%mod;emit('The extremal arrangement reduces the product to one modular power. A set exponent bit contributes this base power; exact integers avoid losing large bit counts.',{sequence:[...old.toString(2)],codeStage:'update',metrics:{maximum:maximum.toString(),exponent:old.toString(),base:base.toString(),bit:Number(bit),power:power.toString()}},'update');base=base*base%mod;exponent>>=1n;}return Number(maximum%mod*power%mod);},
1970({row,col,cells},emit){const n=row*col,top=n,bottom=n+1,parent=Array.from({length:n+2},(_,i)=>i),size=Array(n+2).fill(1),land=Array.from({length:row},()=>Array(col).fill(false));const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};const union=(a,b)=>{a=find(a);b=find(b);if(a===b)return;if(size[a]<size[b])[a,b]=[b,a];parent[b]=a;size[a]+=size[b];};let answer=0;for(let day=cells.length-1;day>=0;day--){const[r,c]=cells[day].map(v=>v-1),id=r*col+c;land[r][c]=true;if(r===0)union(id,top);if(r===row-1)union(id,bottom);for(const[dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<row&&nc>=0&&nc<col&&land[nr][nc])union(id,nr*col+nc);}const connected=find(top)===find(bottom);emit('Undo this day of flooding and join only neighboring open land. A virtual top and bottom connection certifies a complete crossing without searching every possible path again.',{matrix:land.map(line=>line.map(v=>v?'land':'water')),cell:[r,c],matrixLabel:'Reverse reopening state',table:land.flatMap((line,r)=>line.flatMap((open,c)=>open?[[`${r+1},${c+1}`,find(r*col+c),find(r*col+c)===find(top)?'yes':'no',find(r*col+c)===find(bottom)?'yes':'no']]:[])),tableHeaders:['Land cell','Component','Reaches top','Reaches bottom'],codeStage:'update',metrics:{forwardDay:day,reopened:`${r+1},${c+1}`,connected}},'update');if(connected){answer=day;break;}}return answer;},
1973({root},emit){const nodes=[{value:root[0],children:[]}];let cursor=1;for(let head=0;head<nodes.length&&cursor<root.length;head++)for(let side=0;side<2&&cursor<root.length;side++){const value=root[cursor++];if(value!==null){nodes[head].children.push(nodes.length);nodes.push({value,children:[]});}}const sums=Array(nodes.length).fill(null);let count=0;function visit(id){const descendants=nodes[id].children.reduce((sum,child)=>sum+visit(child),0),matches=nodes[id].value===descendants;if(matches)count++;sums[id]=descendants+nodes[id].value;emit('Children report their entire subtree totals. Their sum excludes the current node, giving exactly the descendants to compare against its value; a leaf has descendant sum zero.',{sequence:nodes.map(n=>n.value),index:id,table:nodes.map((n,i)=>[i,n.value,n.children.join(', ')||'leaf',sums[i]??'pending']),tableHeaders:['Node','Value','Children','Subtree sum'],codeStage:'update',metrics:{descendants,matches,count}},'update');return sums[id];}visit(0);return count;},
1974({word},emit){let current=0,total=0;for(let i=0;i<word.length;i++){const next=word.charCodeAt(i)-97,distance=Math.abs(next-current),movement=Math.min(distance,26-distance);total+=movement+1;emit('The alphabet wraps from z to a. Choose the shorter arc, then spend one additional second pressing the key, even when the pointer does not move.',{index:i,codeStage:'update',metrics:{from:String.fromCharCode(97+current),to:word[i],direct:distance,wrapped:26-distance,movement,total}},'update');current=next;}return total;},
1975({matrix},emit){let total=0,negative=0,minimum=Infinity;for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++){const value=matrix[r][c];total+=Math.abs(value);minimum=Math.min(minimum,Math.abs(value));negative+=Number(value<0);emit('Adjacent pair flips can move negative signs while preserving their parity. Track the absolute total and the cheapest magnitude on which to leave an unavoidable negative sign.',{matrix,cell:[r,c],codeStage:'update',metrics:{value,total,negative,minimum}},'update');}return total-(negative%2?2*minimum:0);},
1979({nums},emit){let a=Math.min(...nums),b=Math.max(...nums);while(b){const remainder=a%b;emit('A number divides both arguments exactly when it divides the divisor and this remainder. Euclid repeatedly reduces the pair without changing the common divisors.',{sequence:[a,b,remainder],codeStage:'update',metrics:{a,b,remainder}},'update');[a,b]=[b,remainder];}return a;},
1980({nums},emit){let result='';for(let i=0;i<nums.length;i++){const bit=nums[i][i]==='0'?'1':'0';result+=bit;emit('Flipping this diagonal bit makes the answer differ from this specific input row. Earlier differences remain intact, so after all rows the answer is absent from the entire input.',{matrix:nums.map(s=>[...s]),cell:[i,i],output:[...result],codeStage:'update',metrics:{row:i,inputBit:nums[i][i],chosenBit:bit}},'update');}return result;},
1981({mat,target},emit){let reachable=new Set([0]);for(let r=0;r<mat.length;r++){const next=new Set();for(const sum of reachable)for(const value of mat[r])next.add(sum+value);const previous=reachable.size;reachable=next;emit('Choose exactly one value from this row for every previously reachable total. Equal totals from different paths need only one state because future rows depend on the total, not the path.',{matrix:mat,cell:[r,0],table:[...reachable].sort((a,b)=>a-b).map(sum=>[sum,Math.abs(sum-target)]),tableHeaders:['Reachable total','Distance to target'],codeStage:'update',metrics:{row:r,previousStates:previous,states:reachable.size,target}},'update');}return Math.min(...[...reachable].map(sum=>Math.abs(sum-target)));},
1983({nums1,nums2},emit){const earliest=new Map([[0,-1]]);let difference=0,best=0;for(let i=0;i<nums1.length;i++){difference+=nums1[i]-nums2[i];const start=earliest.get(difference);if(start!==undefined)best=Math.max(best,i-start);else earliest.set(difference,i);emit('A repeated prefix difference means both arrays gained the same sum since the first occurrence. Keep the earliest occurrence to make every later matching interval as wide as possible.',{sequence:nums1,index:i,table:[...earliest].map(([d,j])=>[d,j]),tableHeaders:['Prefix difference','Earliest index'],codeStage:'update',metrics:{otherValue:nums2[i],difference,matchingPrefix:start??'new',best}},'update');}return best;},
1984({nums,k},emit){const sorted=[...nums].sort((a,b)=>a-b);let best=Infinity;for(let left=0;left+k<=sorted.length;left++){const right=left+k-1,gap=sorted[right]-sorted[left];best=Math.min(best,gap);emit('Every length-k sorted window is a candidate group. Only its endpoints determine its spread; skipping an interior score cannot improve the same pair of extremes.',{sequence:sorted,index:left,marks:{[left]:'lowest',[right]:'highest'},codeStage:'update',metrics:{left,right,gap,best}},'update');}return best;},
1985({nums,k},emit){const sorted=[...nums].sort((a,b)=>b.length-a.length||(a===b?0:a>b?-1:1));for(let i=0;i<sorted.length;i++)emit('More digits means a larger integer when there are no leading zeros. Equal-length strings compare digit by digit; duplicates occupy separate rank positions.',{sequence:sorted,index:i,codeStage:'update',metrics:{rank:i+1,digits:sorted[i].length,value:sorted[i],selected:i===k-1}},'update');return sorted[k-1];},
};

const python={
1968:`def rearrangeArray(nums):
    ordered = sorted(nums)
    middle = (len(nums) + 1) // 2
    result = []
    for i in range(len(nums)):
        source = middle + i // 2 if i % 2 else i // 2
        result.append(ordered[source])  # step: update
    return result  # step: return`,
1969:`def minNonZeroProduct(p):
    modulus = 1_000_000_007
    maximum = (1 << p) - 1
    base = (maximum - 1) % modulus
    exponent = (1 << (p - 1)) - 1
    power = 1
    while exponent:
        if exponent & 1:
            power = power * base % modulus
        # step: update
        base = base * base % modulus
        exponent >>= 1
    return maximum % modulus * power % modulus  # step: return`,
1970:`def latestDayToCross(row, col, cells):
    n = row * col
    top, bottom = n, n + 1
    parent, size = list(range(n + 2)), [1] * (n + 2)
    land = [[False] * col for _ in range(row)]
    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node
    def union(a, b):
        a, b = find(a), find(b)
        if a == b:
            return
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
    answer = 0
    for day in range(len(cells) - 1, -1, -1):
        r, c = cells[day][0] - 1, cells[day][1] - 1
        land[r][c] = True
        node = r * col + c
        if r == 0:
            union(node, top)
        if r == row - 1:
            union(node, bottom)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < row and 0 <= nc < col and land[nr][nc]:
                union(node, nr * col + nc)
        connected = find(top) == find(bottom)  # step: update
        if connected:
            answer = day
            break
    return answer  # step: return`,
1973:`def equalToDescendants(root):
    # root is the JSON level-order array; null slots are represented by None.
    nodes = [[root[0], []]]
    cursor = 1
    for value, children in nodes:
        for _ in range(2):
            if cursor >= len(root):
                break
            child_value = root[cursor]
            cursor += 1
            if child_value is not None:
                children.append(len(nodes))
                nodes.append([child_value, []])
    count = 0
    def visit(index):
        nonlocal count
        value, children = nodes[index]
        descendants = sum(visit(child) for child in children)
        if value == descendants:
            count += 1
        # step: update
        return value + descendants
    visit(0)
    return count  # step: return`,
1974:`def minTimeToType(word):
    current = total = 0
    for letter in word:
        target = ord(letter) - ord('a')
        distance = abs(target - current)
        total += min(distance, 26 - distance) + 1  # step: update
        current = target
    return total  # step: return`,
1975:`def maxMatrixSum(matrix):
    total, negative, minimum = 0, 0, float('inf')
    for row in matrix:
        for value in row:
            total += abs(value)
            negative += value < 0
            minimum = min(minimum, abs(value))  # step: update
    return total - (2 * minimum if negative % 2 else 0)  # step: return`,
1979:`def findGCD(nums):
    a, b = min(nums), max(nums)
    while b:
        remainder = a % b  # step: update
        a, b = b, remainder
    return a  # step: return`,
1980:`def findDifferentBinaryString(nums):
    result = []
    for i, value in enumerate(nums):
        result.append('1' if value[i] == '0' else '0')  # step: update
    return ''.join(result)  # step: return`,
1981:`def minimizeTheDifference(mat, target):
    reachable = {0}
    for row in mat:
        reachable = {total + value for total in reachable for value in row}  # step: update
    return min(abs(total - target) for total in reachable)  # step: return`,
1983:`def widestPairOfIndices(nums1, nums2):
    earliest = {0: -1}
    difference = best = 0
    for i, (a, b) in enumerate(zip(nums1, nums2)):
        difference += a - b
        if difference in earliest:
            best = max(best, i - earliest[difference])
        else:
            earliest[difference] = i
        # step: update
    return best  # step: return`,
1984:`def minimumDifference(nums, k):
    ordered = sorted(nums)
    best = float('inf')
    for left in range(len(nums) - k + 1):
        gap = ordered[left + k - 1] - ordered[left]
        best = min(best, gap)  # step: update
    return best  # step: return`,
1985:`def kthLargestNumber(nums, k):
    ordered = sorted(nums, key=lambda value: (len(value), value), reverse=True)  # step: update
    return ordered[k - 1]  # step: return`,
};

const cases={
1968:[['An uneven split creates alternating valleys and peaks',{nums:[17,4,23,9,31,2,15,28,6]}],['Three values require a strict middle extreme',{nums:[4,8,12]}],['The smallest valid input has one interior position',{nums:[13,5,9]}],['A longer already sorted input',{nums:[1,3,5,7,9,11,13,15]}]],
1969:[['A larger bit width uses many power steps',{p:19}],['One-bit range contains only one',{p:1}],['Two-bit range provides the first pair',{p:2}],['Largest allowed bit width',{p:60}]],
1970:[['Alternating flooded cells gradually cut a wide board',{row:3,col:4,cells:[[2,2],[1,3],[3,1],[2,4],[1,1],[3,3],[2,1],[1,4],[3,4],[2,3],[1,2],[3,2]]}],['An entire top row floods first',{row:2,col:3,cells:[[1,1],[1,2],[1,3],[2,3],[2,2],[2,1]]}],['A single column stays open late',{row:3,col:2,cells:[[1,1],[2,1],[3,1],[3,2],[2,2],[1,2]]}],['Smallest two-by-two board',{row:2,col:2,cells:[[2,1],[1,2],[1,1],[2,2]]}]],
1973:[['Several subtrees satisfy the descendant sum rule',{root:[18,3,6,1,2,0,6]}],['A zero leaf equals its empty descendant sum',{root:[0]}],['An ordinary nonzero leaf does not match',{root:[9]}],['Missing children preserve level-order positions',{root:[12,5,7,null,5,0,7]}]],
1974:[['Repeated wraparound and long jumps',{word:'zebrazigzagmoon'}],['Repeated letters need only keypresses',{word:'aaaaaa'}],['A wraparound step is shorter',{word:'za'}],['Opposite alphabet positions tie',{word:'nan'}]],
1975:[['Odd negative parity leaves the smallest magnitude negative',{matrix:[[-8,4,11],[6,-13,2],[7,5,-9]]}],['Zero absorbs an otherwise odd negative sign',{matrix:[[-5,0],[7,12]]}],['Even negative parity permits all positive magnitudes',{matrix:[[-4,9],[6,-3]]}],['All values are already nonnegative',{matrix:[[2,8,4],[7,3,10],[5,6,1]]}]],
1979:[['Interior values do not change the extrema gcd',{nums:[84,42,65,28,70,56,98]}],['Coprime extrema',{nums:[17,23,19]}],['Equal values give that same gcd',{nums:[24,24,24]}],['One is the smallest value',{nums:[13,1,27,8]}]],
1980:[['Diagonal construction defeats each of six rows',{nums:['001101','111000','010010','100111','011100','110011']}],['A one-bit input has one opposite answer',{nums:['1']}],['Two different rows',{nums:['00','11']}],['A four-row collection sharing prefixes',{nums:['0000','0001','0010','0011']}]],
1981:[['Many row combinations merge into shared totals',{mat:[[3,8,14,19],[2,7,11,18],[5,9,16,22],[1,6,12,17]],target:47}],['Every possible total exceeds the target',{mat:[[8,10],[9,12],[7,11]],target:5}],['Every possible total is below the target',{mat:[[1,2],[2,3]],target:40}],['Duplicate row values produce one state',{mat:[[6,6,6],[4,4,4],[9,9,9]],target:19}]],
1983:[['Repeated differences reveal a wide internal interval',{nums1:[1,0,1,1,0,0,1,0,1,1],nums2:[0,1,1,0,1,0,0,1,1,0]}],['The full arrays have equal sums',{nums1:[1,0,0,1],nums2:[0,1,1,0]}],['No nonempty interval can match',{nums1:[1,1,1,1],nums2:[0,0,0,0]}],['One equal position',{nums1:[0],nums2:[0]}]],
1984:[['Sorting reveals a compact middle score group',{nums:[41,8,27,19,33,25,52,29,11],k:4}],['One selected score has zero spread',{nums:[18,7,31],k:1}],['All scores must be chosen',{nums:[6,23,14,9],k:4}],['Repeated scores offer a zero-spread group',{nums:[12,5,12,21,12],k:3}]],
1985:[['Values beyond machine precision keep their exact order',{nums:['9007199254740993','27','9007199254740992','123456789012345678901234','999','1000','123456789012345678901233'],k:3}],['Duplicates occupy different ranks',{nums:['83','83','7','106','83'],k:3}],['Zero is a valid decimal value',{nums:['0','12','3'],k:3}],['One exact large value',{nums:['987654321098765432109876543210'],k:1}]],
};

function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===1968)need(vector(input.nums)&&input.nums.length>=3&&new Set(input.nums).size===input.nums.length,'Use 3-60 distinct nonnegative values.');
  if(id===1969)need(integer(input.p,1,60),'Use a bit width from 1 to 60.');
  if(id===1970)need(integer(input.row,2,6)&&integer(input.col,2,6)&&Array.isArray(input.cells)&&input.cells.length===input.row*input.col&&input.cells.every(pair=>Array.isArray(pair)&&pair.length===2&&integer(pair[0],1,input.row)&&integer(pair[1],1,input.col))&&new Set(input.cells.map(pair=>pair.join(','))).size===input.cells.length,'Use a 2-6 by 2-6 board and a permutation of every one-based [row,column] cell.');
  if(id===1973){need(Array.isArray(input.root)&&input.root.length>=1&&input.root.length<=63&&integer(input.root[0])&&input.root.every(v=>v===null||integer(v)),'Use a nonempty level-order tree with nonnegative values and null child slots, at most 63 entries.');let available=1;for(const value of input.root){need(available>0,'Tree entries cannot appear after every parent slot is exhausted.');available--;if(value!==null)available+=2;}}
  if(id===1974)need(typeof input.word==='string'&&/^[a-z]{1,120}$/.test(input.word),'Use 1-120 lowercase letters.');
  if(id===1975)need(Array.isArray(input.matrix)&&input.matrix.length>=2&&input.matrix.length<=8&&input.matrix.every(row=>Array.isArray(row)&&row.length===input.matrix.length&&row.every(v=>integer(v,-10000,10000))),'Use a square integer matrix of side 2-8.');
  if(id===1979)need(vector(input.nums,1)&&input.nums.length>=2,'Use 2-60 positive values.');
  if(id===1980)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=16&&input.nums.every(s=>typeof s==='string'&&/^[01]+$/.test(s)&&s.length===input.nums.length)&&new Set(input.nums).size===input.nums.length,'Use n distinct binary strings of length n, with n from 1 to 16.');
  if(id===1981)need(Array.isArray(input.mat)&&input.mat.length>=1&&input.mat.length<=8&&input.mat.every(row=>Array.isArray(row)&&row.length>=1&&row.length<=8&&row.length===input.mat[0].length&&row.every(v=>integer(v,1,70)))&&integer(input.target,1,800),'Use a positive 1-70 matrix up to eight by eight and a target from 1 to 800.');
  if(id===1983)need(Array.isArray(input.nums1)&&Array.isArray(input.nums2)&&input.nums1.length>=1&&input.nums1.length<=120&&input.nums1.length===input.nums2.length&&[...input.nums1,...input.nums2].every(v=>v===0||v===1),'Use equal-length binary arrays with 1-120 entries.');
  if(id===1984)need(vector(input.nums)&&integer(input.k,1,input.nums.length),'Use 1-60 nonnegative scores and k within that count.');
  if(id===1985)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=40&&input.nums.every(s=>typeof s==='string'&&/^(0|[1-9][0-9]{0,99})$/.test(s))&&integer(input.k,1,input.nums.length),'Use 1-40 decimal strings with at most 100 digits, no extra leading zeros, and a valid k.');
  return input;
}
export default {specs,solvers,python,cases,validate,tags:{1968:['Sorting','Greedy'],1969:['Math'],1970:['Union Find','Matrix'],1973:['Tree'],1974:['String','Greedy'],1975:['Matrix','Greedy'],1979:['Math'],1980:['String'],1981:['Dynamic Programming','Matrix'],1983:['Prefix Sum'],1984:['Sliding Window','Sorting'],1985:['Sorting','String']}};
