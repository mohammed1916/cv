const specs={
1953:['milestones','Work as many weeks as possible without repeating a project in consecutive weeks.','All projects other than the largest provide separators. The dominant project can occupy at most one more week than all other projects combined.','sum all project milestones|find the largest project|count milestones in all other projects|limit the largest project to other plus one|return the achievable week count','O(n) time; O(1) auxiliary space.'],
1954:['neededApples','Find the smallest square garden perimeter yielding enough apples.','A centered square with coordinate radius r contains 2*r*(r+1)*(2*r+1) apples. Binary search the smallest sufficient integer radius and multiply it by eight.','start a radius search interval|inspect the middle radius|evaluate its exact apple count|keep the lower sufficient half or raise the lower bound|return eight times the minimum radius','O(log required radius) time; O(1) auxiliary space.'],
1955:['nums','Count subsequences consisting of nonempty runs of zeroes, ones, then twos.','Three counters represent subsequences ending in each phase. A matching digit can extend or duplicate an existing phase, or start it from the previous phase.','initialize zero, zero-one, and zero-one-two counters|read the next digit|select its subsequence phase|double that phase and add its permitted predecessor count|return the third counter modulo 1000000007','O(n) time; O(1) auxiliary space.'],
1957:['s','Delete the fewest characters so no three adjacent characters are equal.','Only the last two kept characters matter. Discard the next character exactly when keeping it would complete a forbidden triple.','start an empty result|read the next character|compare with the last two kept characters|keep unless both equal this character|return the longest valid retained string','O(n) time and output space.'],
1958:['board rMove cMove color','Determine whether placing a piece captures at least one straight line.','In any of eight directions, a valid capture contains one or more opponent pieces immediately followed by a same-color piece, without crossing an empty square or board edge.','define the eight directions|start just beyond the proposed move|advance across opponent pieces|accept a direction only when a same-color piece closes a nonempty run|return whether any direction captures','O(rows+columns) directional scan time; O(1) auxiliary space.'],
1959:['nums k','Minimize wasted capacity with at most k resizing operations.','Partition demand into at most k+1 contiguous segments. Each segment needs its maximum demand as capacity, giving waste maximum times length minus segment sum.','set zero cost for an empty prefix with zero segments|consider each allowed segment count and prefix end|extend the final segment backward and compute its waste|combine with the best cost for the earlier prefix|return the smallest full-prefix cost','O((k+1)*n^2) time; O((k+1)*n) space.'],
1961:['s words','Determine whether s equals the concatenation of a nonempty prefix of words.','Append whole words in order. Stop once the built text is at least as long as s; a match that ends inside a word is insufficient.','start with empty concatenation|append the next complete word|compare the accumulated length with s|stop once enough characters have been collected|return whether the accumulated text equals s','O(total visited characters) time and accumulated string space.'],
1962:['piles k','Minimize remaining stones after exactly k removals.','Each operation removes floor(pile/2). A largest pile offers the greatest immediate reduction, so repeatedly select a maximum and replace it with ceil(pile/2).','copy the piles|find a largest current pile|compute floor(size/2)|remove that amount and repeat k times|return the sum of remaining piles','O(k*n) direct-selection time; O(n) copied storage.'],
1963:['s','Minimize arbitrary swaps needed to balance equal numbers of opening and closing brackets.','Greedily match each closing bracket with a preceding unmatched opening. The unmatched pattern consists of closings followed by openings; each swap repairs two such mismatches.','start with no unmatched opening brackets|scan the next bracket|match a closing bracket when possible|count unmatched openings remaining after matching|return ceil(unmatched openings/2)','O(n) time; O(1) auxiliary space.'],
1964:['obstacles','Find the longest nondecreasing obstacle course ending at every position.','Maintain the smallest possible tail for every course length. Upper-bound search places a new height after all equal tails, allowing equality to extend a course.','start empty minimum tails|read the next obstacle|binary search the first tail strictly greater than its height|replace or append that tail and record position plus one|return the course length for every position','O(n log n) time; O(n) space.'],
1966:['nums','Count values guaranteed to be found by binary search despite the array being unsorted.','A value is safe exactly when all values to its left are smaller and all values to its right are larger. Prefix maxima and suffix minima certify both sides.','compute suffix minima|scan while retaining the left maximum|compare the current value with both outside bounds|count values between those strict bounds and update the maximum|return the number of searchable values','O(n) time; O(n) suffix space.'],
1967:['patterns word','Count how many supplied patterns occur as substrings of word.','Check each pattern independently. Duplicate entries count separately, and a pattern appearing multiple times contributes only once for that entry.','start count at zero|read each pattern entry|search for its first occurrence in word|increment once when an occurrence exists|return the number of matching entries','O(patterns*word length*maximum pattern length) naive search bound; O(1) counting space.'],
};

const solvers={
1953({milestones},emit){let total=0,largest=0;for(let i=0;i<milestones.length;i++){total+=milestones[i];largest=Math.max(largest,milestones[i]);emit('Other projects supply the separators needed between weeks on the dominant project. Track the total and largest demand before applying the final scheduling bound.',{index:i,codeStage:'update',metrics:{total,largest,others:total-largest,possible:Math.min(total,2*(total-largest)+1)}},'update');}return Math.min(total,2*(total-largest)+1);},
1954({neededApples},emit){const needed=BigInt(neededApples);let low=0n,high=100000n;while(low<high){const mid=(low+high)/2n,apples=2n*mid*(mid+1n)*(2n*mid+1n),enough=apples>=needed;emit('The apple count grows with radius. Keep this radius as an upper bound when sufficient; otherwise every smaller radius is also insufficient.',{sequence:[low.toString(),mid.toString(),high.toString()],index:1,codeStage:'inspect',metrics:{low:low.toString(),radius:mid.toString(),high:high.toString(),apples:apples.toString(),enough}});if(enough)high=mid;else low=mid+1n;}return Number(8n*low);},
1955({nums},emit){const counts=[0,0,0],mod=1000000007;for(let i=0;i<nums.length;i++){const phase=nums[i],before=[...counts];counts[phase]=(2*counts[phase]+(phase===0?1:counts[phase-1]))%mod;emit('Existing subsequences in this phase can either skip or include the digit, doubling their count. Start a new run only from a valid preceding phase; a zero can also start from the empty choice.',{index:i,codeStage:'update',table:counts.map((v,j)=>[['0+','0+1+','0+1+2+'][j],before[j],v]),tableHeaders:['Subsequence form','Before','After'],metrics:{phase}},'update');}return counts[2];},
1957({s},emit){const result=[];for(let i=0;i<s.length;i++){const discard=result.length>=2&&result.at(-1)===s[i]&&result.at(-2)===s[i];if(!discard)result.push(s[i]);emit(discard?'The last two kept characters already equal this one. Discarding it prevents a triple without removing useful earlier characters.':'Keeping this character preserves the rule and the longest retained prefix.',{index:i,output:[...result],codeStage:'update',metrics:{character:s[i],discard}},'update');}return result.join('');},
1958({board,rMove,cMove,color},emit){const opponent=color==='B'?'W':'B';let legal=false;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;let r=rMove+dr,c=cMove+dc,count=0;const inside=()=>r>=0&&r<8&&c>=0&&c<8;while(inside()&&board[r][c]===opponent){count++;r+=dr;c+=dc;}const closes=inside()&&count>0&&board[r][c]===color;legal||=closes;emit('A capture needs an uninterrupted nonempty opponent run followed by your own color. An empty square, the edge, or an immediate own-color neighbor cannot close a valid capture.',{matrix:board,cell:[rMove,cMove],otherCell:inside()?[r,c]:undefined,codeStage:'update',metrics:{direction:`${dr},${dc}`,opponents:count,closes,legal}},'update');}return legal;},
1959({nums,k},emit){const n=nums.length,dp=Array.from({length:k+2},()=>Array(n+1).fill(Infinity));dp[0][0]=0;let answer=Infinity;for(let groups=1;groups<=k+1;groups++){for(let end=groups;end<=n;end++){let maximum=0,sum=0;for(let start=end-1;start>=groups-1;start--){maximum=Math.max(maximum,nums[start]);sum+=nums[start];const waste=maximum*(end-start)-sum;if(Number.isFinite(dp[groups-1][start]))dp[groups][end]=Math.min(dp[groups][end],dp[groups-1][start]+waste);emit('A constant capacity must cover the largest demand in this final segment. Combine its unused capacity with an already solved earlier prefix, then keep the cheapest split.',{index:end-1,marks:{[start]:'segment start'},table:dp.map((row,g)=>[g,...row.map(v=>Number.isFinite(v)?v:'unreachable')]),tableHeaders:['Segments',...Array.from({length:n+1},(_,i)=>`Prefix ${i}`)],codeStage:'update',metrics:{groups,start,end:end-1,maximum,waste,best:Number.isFinite(dp[groups][end])?dp[groups][end]:'unreachable'}},'update');}}answer=Math.min(answer,dp[groups][n]);}return answer;},
1961({s,words},emit){let joined='';for(let i=0;i<words.length;i++){joined+=words[i];emit('Only a boundary after a complete word can finish a valid prefix. Once the accumulated length reaches the target length, later words cannot repair a mismatch.',{sequence:words,index:i,output:[...joined],codeStage:'update',metrics:{target:s,joined,equal:joined===s}},'update');if(joined.length>=s.length)break;}return joined===s;},
1962({piles,k},emit){const remaining=[...piles];for(let round=0;round<k;round++){let index=0;for(let i=1;i<remaining.length;i++)if(remaining[i]>remaining[index])index=i;const before=remaining[index],removed=Math.floor(before/2);remaining[index]-=removed;emit('A largest pile supplies a maximum removable half. Round the removal down, leaving the extra stone when the pile size is odd.',{sequence:[...remaining],index,codeStage:'update',metrics:{operation:round+1,before,removed,after:remaining[index]}},'update');}return remaining.reduce((a,b)=>a+b,0);},
1963({s},emit){let unmatched=0;for(let i=0;i<s.length;i++){if(s[i]==='[')unmatched++;else if(unmatched)unmatched--;emit('Match a closing bracket whenever an earlier unmatched opening is available. The openings left unmatched at the end measure the unresolved reversed pairs.',{index:i,codeStage:'update',metrics:{bracket:s[i],unmatchedOpenings:unmatched}},'update');}return Math.ceil(unmatched/2);},
1964({obstacles},emit){const tails=[],answer=[];for(let i=0;i<obstacles.length;i++){let low=0,high=tails.length;while(low<high){const mid=Math.floor((low+high)/2);if(tails[mid]<=obstacles[i])low=mid+1;else high=mid;}tails[low]=obstacles[i];answer.push(low+1);emit('The first strictly greater tail is replaced. Equal tails stay to the left, so this obstacle may extend a nondecreasing course; the tails table summarizes lengths, not one shared course.',{index:i,output:[...answer],table:tails.map((v,j)=>[j+1,v]),tableHeaders:['Course length','Smallest possible tail'],codeStage:'update',metrics:{height:obstacles[i],position:low,length:low+1}},'update');}return answer;},
1966({nums},emit){const suffix=Array(nums.length+1).fill(Infinity);for(let i=nums.length-1;i>=0;i--)suffix[i]=Math.min(nums[i],suffix[i+1]);let left=-Infinity,count=0;for(let i=0;i<nums.length;i++){const safe=left<nums[i]&&nums[i]<suffix[i+1];if(safe)count++;emit('Every possible binary-search comparison must point toward this position. A larger value on its left or a smaller value on its right can direct a search away from it.',{index:i,codeStage:'update',metrics:{leftMaximum:Number.isFinite(left)?left:'none',value:nums[i],rightMinimum:Number.isFinite(suffix[i+1])?suffix[i+1]:'none',safe,count}},'update');left=Math.max(left,nums[i]);}return count;},
1967({patterns,word},emit){let count=0;for(let i=0;i<patterns.length;i++){const first=word.indexOf(patterns[i]);if(first>=0)count++;emit('This input entry contributes once if its text occurs anywhere. Repeated occurrences within the word do not add more, but a duplicate pattern entry is still counted separately.',{sequence:patterns,index:i,codeStage:'update',metrics:{pattern:patterns[i],word,firstOccurrence:first,count}},'update');}return count;},
};

const python={
1953:`def numberOfWeeks(milestones):
    total = largest = 0
    for value in milestones:
        total += value
        largest = max(largest, value)  # step: update
    return min(total, 2 * (total - largest) + 1)  # step: return`,
1954:`def minimumPerimeter(neededApples):
    low, high = 0, 100000
    while low < high:
        radius = (low + high) // 2
        apples = 2 * radius * (radius + 1) * (2 * radius + 1)
        enough = apples >= neededApples  # step: inspect
        if enough:
            high = radius
        else:
            low = radius + 1
    return 8 * low  # step: return`,
1955:`def countSpecialSubsequences(nums):
    counts = [0, 0, 0]
    modulus = 1_000_000_007
    for phase in nums:
        predecessor = 1 if phase == 0 else counts[phase - 1]
        counts[phase] = (2 * counts[phase] + predecessor) % modulus  # step: update
    return counts[2]  # step: return`,
1957:`def makeFancyString(s):
    result = []
    for letter in s:
        discard = len(result) >= 2 and result[-1] == result[-2] == letter
        if not discard:
            result.append(letter)
        # step: update
    return ''.join(result)  # step: return`,
1958:`def checkMove(board, rMove, cMove, color):
    opponent = 'W' if color == 'B' else 'B'
    legal = False
    for dr in range(-1, 2):
        for dc in range(-1, 2):
            if dr == dc == 0:
                continue
            row, col, count = rMove + dr, cMove + dc, 0
            while 0 <= row < 8 and 0 <= col < 8 and board[row][col] == opponent:
                count += 1
                row, col = row + dr, col + dc
            closes = 0 <= row < 8 and 0 <= col < 8 and count > 0 and board[row][col] == color
            legal = legal or closes  # step: update
    return legal  # step: return`,
1959:`def minSpaceWastedKResizing(nums, k):
    n = len(nums)
    dp = [[float('inf')] * (n + 1) for _ in range(k + 2)]
    dp[0][0] = 0
    answer = float('inf')
    for groups in range(1, k + 2):
        for end in range(groups, n + 1):
            maximum = total = 0
            for start in range(end - 1, groups - 2, -1):
                maximum = max(maximum, nums[start])
                total += nums[start]
                waste = maximum * (end - start) - total
                dp[groups][end] = min(dp[groups][end], dp[groups - 1][start] + waste)  # step: update
        answer = min(answer, dp[groups][n])
    return answer  # step: return`,
1961:`def isPrefixString(s, words):
    joined = ''
    for word in words:
        joined += word  # step: update
        if len(joined) >= len(s):
            break
    return joined == s  # step: return`,
1962:`def minStoneSum(piles, k):
    remaining = piles[:]
    for _ in range(k):
        index = max(range(len(remaining)), key=remaining.__getitem__)
        removed = remaining[index] // 2
        remaining[index] -= removed  # step: update
    return sum(remaining)  # step: return`,
1963:`def minSwaps(s):
    unmatched = 0
    for bracket in s:
        if bracket == '[':
            unmatched += 1
        elif unmatched:
            unmatched -= 1
        # step: update
    return (unmatched + 1) // 2  # step: return`,
1964:`def longestObstacleCourseAtEachPosition(obstacles):
    from bisect import bisect_right
    tails, answer = [], []
    for height in obstacles:
        position = bisect_right(tails, height)
        if position == len(tails):
            tails.append(height)
        else:
            tails[position] = height
        answer.append(position + 1)  # step: update
    return answer  # step: return`,
1966:`def binarySearchableNumbers(nums):
    suffix = [float('inf')] * (len(nums) + 1)
    for i in range(len(nums) - 1, -1, -1):
        suffix[i] = min(nums[i], suffix[i + 1])
    left, count = float('-inf'), 0
    for i, value in enumerate(nums):
        if left < value < suffix[i + 1]:
            count += 1
        # step: update
        left = max(left, value)
    return count  # step: return`,
1967:`def numOfStrings(patterns, word):
    count = 0
    for pattern in patterns:
        if pattern in word:
            count += 1
        # step: update
    return count  # step: return`,
};
const board=rows=>rows.map(row=>[...row]);
const cases={
1953:[['Many projects can separate the dominant project',{milestones:[12,4,7,3,5,2]}],['One project dominates all available separators',{milestones:[24,2,3]}],['A single project allows one week',{milestones:[17]}],['The largest exactly fits between all other weeks',{milestones:[9,3,5]}]],
1954:[['A substantial garden requires a radius search',{neededApples:7654321}],['One apple still needs a positive radius',{neededApples:1}],['An exact radius count',{neededApples:420}],['Just above that exact count',{neededApples:421}]],
1955:[['Interleaved phases create many valid choices',{nums:[0,0,1,0,1,2,1,2,0,1,2,2]}],['Missing middle phase',{nums:[0,0,2,2]}],['Reverse order prevents a complete subsequence',{nums:[2,2,1,1,0,0]}],['Long runs multiply independent choices',{nums:[0,0,0,1,1,1,2,2,2]}]],
1957:[['Several overlong runs need independent deletions',{s:'aaaabbbbbccdddddeeeeffg'}],['Already valid paired runs',{s:'aabbccddeeff'}],['One long repeated run',{s:'zzzzzzzzzz'}],['One character needs no deletion',{s:'q'}]],
1958:[['A horizontal run is closed by the moving color',{board:board(['........','........','........','..WWB...','........','........','........','........']),rMove:3,cMove:1,color:'B'}],['Opponent run reaches the edge without closure',{board:board(['.WWWWWWW','........','........','........','........','........','........','........']),rMove:0,cMove:0,color:'B'}],['Immediate own-color neighbor captures nothing',{board:board(['........','........','...B....','........','........','........','........','........']),rMove:2,cMove:2,color:'B'}],['Diagonal capture from a corner',{board:board(['........','.B......','..B.....','...W....','........','........','........','........']),rMove:0,cMove:0,color:'W'}]],
1959:[['Several demand plateaus compete for limited resizing',{nums:[4,7,6,19,22,18,5,8,7],k:2}],['No resize means one maximum capacity',{nums:[3,11,5,9,2],k:0}],['A resize between every pair eliminates waste',{nums:[6,17,3,12],k:3}],['Constant demand needs no resizing',{nums:[8,8,8,8,8],k:2}]],
1961:[['The target ends at a later complete-word boundary',{s:'silverriverbend',words:['silver','river','bend','at','dawn']}],['Target ends inside a word',{s:'moonlig',words:['moon','light','trail']}],['All words together are still too short',{s:'pineforest',words:['pine','for']}],['The first complete word matches',{s:'harbor',words:['harbor','lights']}]],
1962:[['Repeated maximum choices move between piles',{piles:[31,12,27,8,19,44],k:8}],['An odd pile leaves the extra stone',{piles:[15],k:1}],['Unit piles cannot lose stones',{piles:[1,1,1,1],k:7}],['Tied maxima offer interchangeable choices',{piles:[18,18,18,18],k:4}]],
1963:[['Nested and reversed groups mix',{s:']]][[[]][[]['}],['Already balanced nested groups',{s:'[[[]]][[]]'}],['All closing brackets precede all openings',{s:']]]][[[['}],['One reversed pair',{s:']['}]],
1964:[['Repeated heights extend some courses and replace other tails',{obstacles:[5,2,2,6,3,3,7,4,8,4]}],['Equal heights all extend',{obstacles:[9,9,9,9,9]}],['Strictly decreasing heights',{obstacles:[17,13,8,4,1]}],['One obstacle',{obstacles:[23]}]],
1966:[['Some positions separate disordered regions',{nums:[3,1,5,7,6,9,12,11,15]}],['Sorted input certifies every position',{nums:[2,6,10,14,18]}],['Reverse order certifies none',{nums:[19,13,8,4]}],['Singleton has no outside constraints',{nums:[7]}]],
1967:[['Several overlapping patterns occur in a longer word',{patterns:['river','ver','bend','riverbend','ridge','erbe','end'],word:'silverriverbend'}],['Duplicate entries each contribute',{patterns:['ana','ana','na','zz'],word:'bananas'}],['A longer pattern cannot fit',{patterns:['orchard','orchards'],word:'orch'}],['Repeated occurrences still count once per entry',{patterns:['a','aa','aaa'],word:'aaaaaaa'}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=10000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,maxLength=60)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,1));
  const word=s=>typeof s==='string'&&/^[a-z]{1,120}$/.test(s);
  if(id===1953)need(vector(input.milestones),'Use 1-60 positive milestone counts no larger than 10000.');
  if(id===1954)need(integer(input.neededApples,1,1000000000000000),'Use an apple requirement from 1 through 10^15.');
  if(id===1955)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=120&&input.nums.every(v=>integer(v,0,2)),'Use 1-120 values chosen from zero, one, and two.');
  if(id===1957)need(word(input.s),'Use 1-120 lowercase characters.');
  if(id===1958)need(Array.isArray(input.board)&&input.board.length===8&&input.board.every(row=>Array.isArray(row)&&row.length===8&&row.every(c=>['.','B','W'].includes(c)))&&integer(input.rMove,0,7)&&integer(input.cMove,0,7)&&input.board[input.rMove][input.cMove]==='.'&&['B','W'].includes(input.color),'Use an eight-by-eight board of ., B, W with an empty move cell and color B or W.');
  if(id===1959)need(vector(input.nums,16)&&integer(input.k,0,input.nums.length-1),'Use 1-16 positive demands and k between zero and length minus one.');
  if(id===1961)need(word(input.s)&&Array.isArray(input.words)&&input.words.length>=1&&input.words.length<=30&&input.words.every(word),'Use a lowercase target and 1-30 nonempty lowercase words.');
  if(id===1962)need(vector(input.piles)&&integer(input.k,1,80),'Use 1-60 positive piles and 1-80 operations.');
  if(id===1963)need(typeof input.s==='string'&&/^[\[\]]{2,120}$/.test(input.s)&&[...input.s].filter(c=>c==='[').length*2===input.s.length,'Use 2-120 brackets with equal opening and closing counts.');
  if(id===1964)need(vector(input.obstacles),'Use 1-60 positive obstacle heights.');
  if(id===1966)need(vector(input.nums)&&new Set(input.nums).size===input.nums.length,'Use 1-60 distinct positive values.');
  if(id===1967)need(word(input.word)&&Array.isArray(input.patterns)&&input.patterns.length>=1&&input.patterns.length<=40&&input.patterns.every(word),'Use a lowercase word and 1-40 nonempty lowercase patterns.');
  return input;
}
export default {specs,solvers,python,cases,validate,tags:{1953:['Greedy'],1954:['Binary Search','Math'],1955:['Dynamic Programming'],1957:['String','Greedy'],1958:['Matrix','Simulation'],1959:['Dynamic Programming'],1961:['String'],1962:['Greedy'],1963:['Greedy'],1964:['Binary Search'],1966:['Prefix Sum'],1967:['String']}};
