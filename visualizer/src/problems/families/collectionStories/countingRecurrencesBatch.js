const MOD=1000000007;
const specs={
634:['n','Count permutations in which no position keeps its original item.','Focus on the item paired with the first position. Either those two items swap as a pair or the displaced item participates in a larger cycle, giving D(n)=(n-1)*(D(n-1)+D(n-2)).','start with D zero equals one and D one equals zero|advance the permutation size|combine the smaller-cycle and two-item-swap cases|multiply by the choice of first partner and reduce modulo|return the derangement count','O(n) time and O(n) displayed DP space.'],
639:['s','Count letter decodings when an asterisk can represent any digit from one to nine.','At each position, combine valid one-character decodings with valid two-character decodings. Wildcard pair multiplicities depend on both symbols, and zero is valid only in a suitable pair.','start with one decoding of the empty prefix|count valid single-symbol interpretations|count valid two-symbol interpretations with the preceding symbol|combine both previous DP lengths modulo the modulus|return the full-prefix decoding count','O(n) time and O(1) algorithm DP space excluding trace.'],
650:['n','Reach exactly n letters using the fewest Copy All and Paste operations.','A copy followed by pastes multiplies the current count. Splitting a composite multiplier into its prime factors never costs more operations, so the optimum is the sum of prime factors with multiplicity.','start with one letter and zero operations|factor the target beginning with divisor two|add each extracted factor to the operation count|add any remaining prime factor|return the minimum operation total','O(sqrt(n)) trial division time and O(1) auxiliary space.'],
651:['n','Maximize the number of A characters produced by n presses on a four-key keyboard.','Either type directly or finish with Select All, Copy, and several Pastes. Try every earlier breakpoint whose best screen count is copied; multiply it by the number of final copies.','compute the best result for each press budget|start with typing one more A|try a breakpoint before Select All Copy and Paste operations|maximize earlier best times the resulting copy count|return the optimum for n presses','O(n^2) time and O(n) DP space.'],
790:['n','Count tilings of a two-by-n board using dominoes and trominoes.','Full and partial frontier states collapse to a recurrence: full(n)=2*full(n-1)+full(n-3). The additional term accounts for the paired staggered frontier patterns introduced by trominoes.','seed full board counts for widths zero one and two|advance the width from three onward|combine twice the previous full count with the width-three count|reduce each new count modulo the modulus|return the full tiling count for width n','O(n) time and O(n) displayed DP space.'],
823:['arr','Count ordered binary trees where every internal value equals the product of its children.','Process distinct values in increasing order. A value is always a one-node tree; each ordered factor pair drawn from earlier values contributes the product of its two subtree counts.','sort the distinct values and start each count at one|inspect earlier values as left factors|look up the matching right factor when divisibility holds|add the product of ordered child-tree counts modulo|sum counts over all possible root values','O(n^2) time and O(n) DP space with exact products.'],
920:['n goal k','Count playlists of length goal using every song while requiring k other songs before a repeat.','DP tracks playlist length and how many distinct songs have appeared. Add an unused song in n-used+1 ways, or replay one of used-k eligible songs; the final state must use all n songs.','start with one empty playlist using zero songs|advance playlist length|add transitions introducing one unused song|add transitions repeating an eligible previously used song|return the length-goal state using all n songs','O(goal*n) time and O(n) rolling DP space.'],
935:['n','Count length-n phone-number sequences made by knight moves on a keypad.','Store counts ending on each digit. Every legal knight edge transfers all sequences from its source to its destination; five has no outgoing moves, while zero connects to four and six.','initialize one length-one sequence at every digit|advance the sequence length|transfer counts along legal knight moves|reduce destination counts modulo the modulus|sum counts ending at every digit','O(n) time for the fixed keypad and O(10) state space.'],
940:['s','Count distinct nonempty subsequences of a lowercase string.','Appending a character creates total+1 subsequences ending in that character. Replace the old ending-character contribution rather than adding it again, which removes duplicates caused by earlier copies.','track counts of subsequences ending in each character|compute total plus one new endings for the current character|subtract that character previous ending count|replace its ending count and update the modular total|return the number of distinct nonempty subsequences','O(n) time and O(26) space.'],
1223:['n rollMax','Count die sequences obeying a separate maximum consecutive-run length for each face.','DP remembers the last face and its run length. Switching faces starts a length-one run; repeating a face shifts its count to the next run length only when that face limit permits it.','initialize one length-one sequence for each die face|advance the number of rolls|start runs from totals ending in other faces|extend same-face runs within their individual limits|sum all final face and run-length states','O(n*sum rollMax) time and O(sum rollMax) rolling state space.'],
};
const single=c=>c==='*'?9:c==='0'?0:1;
function pair(a,b){if(a==='*'&&b==='*')return 15;if(a==='*')return Number(b)<=6?2:1;if(b==='*')return a==='1'?9:a==='2'?6:0;const value=Number(a+b);return value>=10&&value<=26?1:0;}
const moves=[[4,6],[6,8],[7,9],[4,8],[0,3,9],[],[0,1,7],[2,6],[1,3],[2,4]];
const solvers={
634({n},emit){const dp=[1,0];for(let size=2;size<=n;size++){dp[size]=(size-1)*(dp[size-1]+dp[size-2])%MOD;emit('Choose the first item partner, then combine the two possibilities: a closed two-item swap or continuation through a larger cycle.',{sequence:dp.map((_,i)=>i),output:[...dp],outputIndex:size,codeStage:'recurrence',metrics:{size,partnerChoices:size-1,count:dp[size]}},'update');}return dp[n];},
639({s},emit){let before=0,previous=1;for(let i=0;i<s.length;i++){const one=single(s[i]),two=i?pair(s[i-1],s[i]):0,current=(one*previous+two*before)%MOD;emit('Single-symbol interpretations extend the preceding prefix. Valid pairs extend the prefix two positions earlier; zeros and wildcard pairs contribute their exact multiplicities.',{sequence:s.split(''),index:i,codeStage:'decode',metrics:{singleWays:one,pairWays:two,previousPrefix:previous,twoBackPrefix:before,current}},'update');before=previous;previous=current;}return previous;},
650({n},emit){let remaining=n,answer=0;const factors=[];for(let factor=2;factor*factor<=remaining;factor++)while(remaining%factor===0){remaining/=factor;answer+=factor;factors.push(factor);emit('This factor is one Copy All followed by factor-minus-one Pastes. Prime stages achieve the target with minimum total operation cost.',{sequence:[...factors],codeStage:'factor',metrics:{factor,remaining,operations:answer}},'update');}if(remaining>1){answer+=remaining;factors.push(remaining);emit('The remaining factor is prime and contributes one final multiplication stage.',{sequence:factors,codeStage:'prime',metrics:{factor:remaining,operations:answer}},'update');}return answer;},
651({n},emit){const dp=Array(n+1).fill(0);for(let presses=1;presses<=n;presses++){dp[presses]=dp[presses-1]+1;let breakpoint=null;for(let before=1;before<=presses-3;before++){const copies=presses-before-1,candidate=dp[before]*copies;if(candidate>dp[presses]){dp[presses]=candidate;breakpoint=before;}}emit('Compare typing one more character with every final copy-and-paste block. Two presses select and copy; each remaining press adds another full copied screen.',{sequence:dp.map((_,i)=>i),output:[...dp],outputIndex:presses,codeStage:'budget',metrics:{presses,best:dp[presses],copyBreakpoint:breakpoint??'type only'}},'update');}return dp[n];},
790({n},emit){const dp=[1,1,2];for(let width=3;width<=n;width++){dp[width]=(2*dp[width-1]+dp[width-3])%MOD;emit('The reduced frontier recurrence combines the previous width with the staggered tromino contribution three columns earlier.',{sequence:dp.map((_,i)=>i),output:[...dp],outputIndex:width,codeStage:'tile',metrics:{width,twicePrevious:2*dp[width-1],threeBack:dp[width-3],tilings:dp[width]}},'update');}return dp[n];},
823({arr},emit){const values=[...arr].sort((a,b)=>a-b),counts=new Map(),mod=1000000007n;for(let i=0;i<values.length;i++){const root=values[i];let count=1n;const factors=[];for(let j=0;j<i;j++){const left=values[j],right=root/left;if(root%left===0&&counts.has(right)){const added=counts.get(left)*counts.get(right);count=(count+added)%mod;factors.push([left,right,String(added%mod)]);}}counts.set(root,count);emit('A leaf contributes one tree. Each ordered factor pair contributes every combination of its left and right subtree choices; reversed unequal children count separately.',{sequence:values,index:i,output:[...counts.values()].map(String),table:factors,tableHeaders:['Left child value','Right child value','Added trees modulo'],codeStage:'factors',metrics:{root,trees:String(count)}},'update');}return Number([...counts.values()].reduce((a,b)=>(a+b)%mod,0n));},
920({n,goal,k},emit){let dp=Array(n+1).fill(0);dp[0]=1;for(let length=1;length<=goal;length++){const next=Array(n+1).fill(0);for(let used=1;used<=Math.min(n,length);used++)next[used]=(dp[used-1]*(n-used+1)+dp[used]*Math.max(0,used-k))%MOD;dp=next;emit('A new song increases the distinct-song count; a replay keeps it unchanged and excludes the k most recently played distinct songs.',{sequence:Array.from({length:n+1},(_,i)=>i),output:[...dp],codeStage:'playlist',metrics:{length,goal,totalSongs:n,repeatGap:k,allSongsUsed:dp[n]}},'update');}return dp[n];},
935({n},emit){let counts=Array(10).fill(1);for(let length=2;length<=n;length++){const next=Array(10).fill(0);for(let from=0;from<10;from++)for(const to of moves[from])next[to]=(next[to]+counts[from])%MOD;counts=next;emit('Each legal knight jump transfers all sequences ending at its source. The isolated center digit cannot receive a length-two or longer sequence.',{matrix:[[1,2,3],[4,5,6],[7,8,9],['',0,'']],outputMatrix:[[counts[1],counts[2],counts[3]],[counts[4],counts[5],counts[6]],[counts[7],counts[8],counts[9]],['',counts[0],'']],outputMatrixLabel:'Sequence counts ending at each key',codeStage:'jump',metrics:{length,total:counts.reduce((a,b)=>(a+b)%MOD,0)}},'update');}return counts.reduce((a,b)=>(a+b)%MOD,0);},
940({s},emit){const endings=Array(26).fill(0);let total=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i)-97,old=endings[c],fresh=(total+1)%MOD;total=(total+fresh-old+MOD)%MOD;endings[c]=fresh;emit('Replace the old contribution ending in this character with all previous subsequences plus the new singleton. Subtracting the old contribution avoids counting duplicate text twice.',{sequence:s.split(''),index:i,table:endings.flatMap((count,j)=>count?[[String.fromCharCode(97+j),count]]:[]),tableHeaders:['Ending character','Distinct subsequences'],codeStage:'replace',metrics:{character:s[i],oldEndings:old,newEndings:fresh,total}},'update');}return total;},
1223({n,rollMax},emit){let dp=rollMax.map(limit=>Array(limit+1).fill(0));for(let face=0;face<6;face++)dp[face][1]=1;for(let length=2;length<=n;length++){const totals=dp.map(row=>row.reduce((a,b)=>(a+b)%MOD,0)),total=totals.reduce((a,b)=>(a+b)%MOD,0),next=rollMax.map(limit=>Array(limit+1).fill(0));for(let face=0;face<6;face++){next[face][1]=(total-totals[face]+MOD)%MOD;for(let run=2;run<=rollMax[face];run++)next[face][run]=dp[face][run-1];}dp=next;emit('Switching from another face starts a new run. Repeating this face advances its run length only while that face-specific limit allows it.',{matrix:dp.map((row,face)=>Array.from({length:Math.max(...rollMax)},(_,j)=>j<rollMax[face]?row[j+1]:'blocked')),matrixLabel:'Rows: die faces; columns: run length minus one',codeStage:'roll',metrics:{length,total:dp.flat().reduce((a,b)=>(a+b)%MOD,0)}},'update');}return dp.flat().reduce((a,b)=>(a+b)%MOD,0);},
};
const python={
634:`def findDerangement(n):
    dp = [1, 0]
    for size in range(2, n + 1):
        dp.append((size - 1) * (dp[-1] + dp[-2]) % 1000000007)  # step: recurrence
    return dp[n]  # step: return`,
639:`def numDecodings(s):
    def single(c):
        return 9 if c == '*' else 0 if c == '0' else 1
    def pair(a, b):
        if a == '*' and b == '*':
            return 15
        if a == '*':
            return 2 if int(b) <= 6 else 1
        if b == '*':
            return 9 if a == '1' else 6 if a == '2' else 0
        return int(10 <= int(a + b) <= 26)
    before, previous = 0, 1
    for index, character in enumerate(s):
        two = pair(s[index - 1], character) if index else 0
        current = (single(character) * previous + two * before) % 1000000007  # step: decode
        before, previous = previous, current
    return previous  # step: return`,
650:`def minSteps(n):
    remaining, factor, answer = n, 2, 0
    while factor * factor <= remaining:
        while remaining % factor == 0:
            remaining //= factor
            answer += factor  # step: factor
        factor += 1
    if remaining > 1:
        answer += remaining  # step: prime
    return answer  # step: return`,
651:`def maxA(n):
    dp = [0] * (n + 1)
    for presses in range(1, n + 1):
        dp[presses] = dp[presses - 1] + 1
        for before in range(1, presses - 2):
            dp[presses] = max(dp[presses], dp[before] * (presses - before - 1))
        # step: budget
    return dp[n]  # step: return`,
790:`def numTilings(n):
    dp = [1, 1, 2]
    for width in range(3, n + 1):
        dp.append((2 * dp[width - 1] + dp[width - 3]) % 1000000007)  # step: tile
    return dp[n]  # step: return`,
823:`def numFactoredBinaryTrees(arr):
    values, counts, modulus = sorted(arr), {}, 1000000007
    for index, root in enumerate(values):
        count = 1
        for left in values[:index]:
            if root % left == 0 and root // left in counts:
                count = (count + counts[left] * counts[root // left]) % modulus
        counts[root] = count  # step: factors
    return sum(counts.values()) % modulus  # step: return`,
920:`def numMusicPlaylists(n, goal, k):
    modulus, dp = 1000000007, [1] + [0] * n
    for length in range(1, goal + 1):
        following = [0] * (n + 1)
        for used in range(1, min(n, length) + 1):
            following[used] = (dp[used - 1] * (n - used + 1)
                               + dp[used] * max(0, used - k)) % modulus
        dp = following  # step: playlist
    return dp[n]  # step: return`,
935:`def knightDialer(n):
    moves = ((4, 6), (6, 8), (7, 9), (4, 8), (0, 3, 9), (), (0, 1, 7), (2, 6), (1, 3), (2, 4))
    counts, modulus = [1] * 10, 1000000007
    for length in range(2, n + 1):
        following = [0] * 10
        for source in range(10):
            for destination in moves[source]:
                following[destination] = (following[destination] + counts[source]) % modulus
        counts = following  # step: jump
    return sum(counts) % modulus  # step: return`,
940:`def distinctSubseqII(s):
    endings, total, modulus = [0] * 26, 0, 1000000007
    for character in s:
        index = ord(character) - ord('a')
        fresh = (total + 1) % modulus
        total = (total + fresh - endings[index]) % modulus
        endings[index] = fresh  # step: replace
    return total  # step: return`,
1223:`def dieSimulator(n, rollMax):
    modulus = 1000000007
    dp = [[0] * (limit + 1) for limit in rollMax]
    for face in range(6):
        dp[face][1] = 1
    for length in range(2, n + 1):
        totals = [sum(row) % modulus for row in dp]
        total = sum(totals) % modulus
        following = [[0] * (limit + 1) for limit in rollMax]
        for face in range(6):
            following[face][1] = (total - totals[face]) % modulus
            for run in range(2, rollMax[face] + 1):
                following[face][run] = dp[face][run - 1]
        dp = following  # step: roll
    return sum(map(sum, dp)) % modulus  # step: return`,
};
const cases={
634:[['Several recurrence layers combine the two cycle possibilities',{n:11}],['One item cannot leave its own position',{n:1}],['Two items have only their swap',{n:2}],['A larger count wraps modulo the required modulus',{n:48}]],
639:[['Wildcards and zeros require both single and pair multiplicities',{s:'*1*0*2*8*'}],['A leading zero prevents every decoding',{s:'03*7'}],['Two wildcard pairs around zero change pair availability',{s:'**0**'}],['A wildcard after three cannot join it into a letter',{s:'3*7'}]],
650:[['Repeated prime factors create several copy-and-paste stages',{n:180}],['The initial single letter requires no operations',{n:1}],['A prime target needs one copy then repeated paste',{n:29}],['A power of two repeatedly doubles',{n:128}]],
651:[['Several copy breakpoints compete within a longer press budget',{n:18}],['Too few presses favor typing directly',{n:4}],['A copy block begins to outperform typing',{n:8}],['Longer budgets combine multiple multiplication stages',{n:30}]],
790:[['A wider board exposes repeated frontier recurrence contributions',{n:9}],['One column admits one vertical domino',{n:1}],['Two columns admit the two domino orientations',{n:2}],['A larger board requires modular reduction',{n:60}]],
823:[['Several values can be roots and ordered child factors',{arr:[2,3,6,9,12,18,36,54]}],['Prime values only produce leaf trees',{arr:[5,11,17,23]}],['Repeated powers permit nested factor trees',{arr:[2,4,8,16,32]}],['A singleton value is one leaf tree',{arr:[13]}]],
920:[['Extra playlist positions allow constrained reuse',{n:5,goal:9,k:2}],['A playlist of n positions uses each song once',{n:4,goal:4,k:1}],['One song can repeat when the gap is zero',{n:1,goal:8,k:0}],['A gap of n minus one forces cyclic reuse after the first order',{n:4,goal:10,k:3}]],
935:[['Longer knight sequences redistribute counts around the keypad',{n:7}],['One press may start at any digit including five',{n:1}],['The isolated center disappears after moving',{n:2}],['Many steps require modular count accumulation',{n:45}]],
940:[['Repeated letters replace earlier ending-character contributions',{s:'cabbacacdbac'}],['One repeated letter creates one subsequence per length',{s:'zzzzzzz'}],['Distinct characters generate every nonempty selection',{s:'orbit'}],['Alternating repeats create overlapping duplicate texts',{s:'abababab'}]],
1223:[['Different face limits require separate run-length states',{n:9,rollMax:[1,3,2,4,2,3]}],['A single roll always offers all six faces',{n:1,rollMax:[1,2,3,4,5,6]}],['No face may repeat immediately',{n:6,rollMax:[1,1,1,1,1,1]}],['Limits longer than the sequence impose no restriction',{n:4,rollMax:[5,5,5,5,5,5]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if([634,650,651,790,920,935,1223].includes(id)){const max=id===650?100000:id===651?50:id===920?12:id===1223?60:200;need(integer(input.n,1,max),`n must be between one and ${max} for a bounded trace.`);}if(id===639)need(typeof input.s==='string'&&/^[0-9*]{1,160}$/.test(input.s),'Use 1-160 decimal digits and asterisks.');if(id===940)need(typeof input.s==='string'&&/^[a-z]{1,160}$/.test(input.s),'Use 1-160 lowercase letters.');if(id===823)need(Array.isArray(input.arr)&&input.arr.length>=1&&input.arr.length<=40&&input.arr.every(v=>integer(v,2,10000))&&new Set(input.arr).size===input.arr.length,'Use 1-40 distinct integers from two to 10000.');if(id===920)need(integer(input.goal,input.n,40)&&integer(input.k,0,input.n-1),'Use n <= goal <= 40 and 0 <= k < n.');if(id===1223)need(Array.isArray(input.rollMax)&&input.rollMax.length===6&&input.rollMax.every(v=>integer(v,1,15)),'Supply six maximum run lengths from one to fifteen.');return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{634:{recurrence:4},639:{decode:4},650:{factor:3,prime:4},651:{budget:4},790:{tile:4},823:{factors:4},920:{playlist:4},935:{jump:4},940:{replace:4},1223:{roll:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,id==='650'?['Math','Prime Factorization']:['Dynamic Programming']]))};
