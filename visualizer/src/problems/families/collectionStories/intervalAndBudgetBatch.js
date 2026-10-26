const MOD=1000000007;
const specs={
629:['n k','Count permutations of one through n with exactly k inverse pairs.','Insert the new largest value into a smaller permutation. Its position creates zero through size-minus-one new inversions; a sliding sum combines those previous counts without iterating every insertion position for every state.','start with one empty permutation having zero inversions|advance the number of placed values|add the previous count entering the inversion window|subtract the previous count falling outside the insertion range|return the count for n values and k inversions modulo','O(n*k) time and O(k) rolling state space.'],
638:['price special needs','Buy exactly the needed quantities at minimum cost using unit prices and reusable bundle offers.','Memoize each remaining-needs vector. Buying everything individually gives a valid baseline; apply a fitting useful bundle and recursively price the reduced vector, never buying extra items.','use remaining quantities as the memoization key|price all remaining units individually as a baseline|try useful offers that fit without overbuying|combine offer cost with the optimal reduced needs|return the minimum total cost','O(product(needs+1)*offers*item types) bounded state time and memo space.'],
664:['s','Print a string using the fewest turns when one turn paints one character over a contiguous interval.','Interval DP first considers printing the left character separately. If that character occurs again inside the interval, the same printing turn can cover both occurrences while the intervening interval is repaired separately.','initialize one turn for each single character|grow the substring interval|start with printing the left character separately|merge its turn with later matching characters and minimize|return the whole-string minimum turns','O(n^3) time and O(n^2) space.'],
727:['s1 s2','Find the shortest substring of s1 containing s2 as a subsequence, preferring the leftmost tie.','Track the latest possible start for each matched prefix of s2 while scanning s1. Update target positions backward so one source character is not reused twice; each completed target supplies a candidate window.','initialize unmatched target-prefix start positions|scan the source string left to right|update matching target positions from right to left|compare each completed target window with the best so far|return the shortest leftmost window or an empty string','O(source length*target length) time and O(target length) space.'],
879:['n minProfit group profit','Count job subsets using at most n people and earning at least minProfit.','DP tracks people used and profit capped at the target. Process each job once using descending people counts so it cannot be reused; all larger profits share the capped qualifying state.','start with one empty scheme using zero people and profit|process each job with descending people capacity|add its profit and cap at the required target|accumulate ways modulo without reusing the job|sum target-profit counts over all allowed people totals','O(jobs*n*minProfit) time and O(n*minProfit) space.'],
887:['k n','Find the fewest worst-case egg drops needed to identify the critical floor.','Invert the usual question: with a fixed number of moves and eggs, count how many floors can be resolved. One drop covers lower floors when the egg breaks, upper floors when it survives, and the tested floor itself.','start with zero covered floors for every egg count|increase the allowed number of moves|update eggs downward using break coverage plus survive coverage plus one|stop when k eggs cover at least n floors|return the move count','O(k*moves) time and O(k) space.'],
956:['rods','Build two disjoint rod supports of equal height with the greatest possible height.','Map height difference to the best shorter-support height. Each rod can be skipped, added to the taller side, or added to the shorter side; only the best shorter height for a given difference matters.','start with two empty supports and difference zero|copy states to preserve skipping the current rod|add the rod to the taller side|add it to the shorter side and normalize the new difference|return the shorter height at difference zero','O(rods*sum of lengths) time and O(sum of lengths) space.'],
1000:['stones k','Merge adjacent groups of exactly k piles at minimum total cost until one pile remains.','Every merge removes k-1 piles, which determines feasibility. Interval DP merges subranges to their smallest achievable pile count; add the interval sum only when its length can collapse to one pile.','reject lengths that cannot reduce to one pile by k-way merges|build interval sums|split each interval at strides of k minus one|minimize subinterval costs and add the sum when one pile is reachable|return the complete merge cost','O(n^3/(k-1)) time and O(n^2) space.'],
1140:['piles','Find how many stones the first player can guarantee in Stone Game II.','The state is the current pile index and limit M. Taking X piles leaves the opponent an optimal suffix state with max(M,X); subtract that opponent result from the suffix total and maximize over legal X.','precompute suffix stone sums|memoize states by starting index and M|take the whole suffix when at most 2M piles remain|otherwise maximize suffix total minus the opponent optimal result|return the starting player best total','O(n^3) bounded reference time and O(n^2) memo space.'],
1388:['slices','Choose the greatest total from one third of a circular pizza slices under the neighboring-removal rule.','The chosen slices can be modeled as a fixed-size nonadjacent selection on a cycle. An optimum excludes either the first or last slice; solve both linear fixed-count selections and take the better total.','split the cycle into exclude-first and exclude-last cases|track exact selected count for each linear prefix|compare skipping with taking the current slice after a skipped neighbor|keep impossible exact-count states at negative infinity|return the better one-third-size selection','O(n^2) time and O(n^2) displayed DP space.'],
};
const display=matrix=>matrix.map(row=>row.map(v=>Number.isFinite(v)?v:v<0?'−∞':'∞'));
const solvers={
629({n,k},emit){if(k>n*(n-1)/2)return 0;let dp=Array(k+1).fill(0);dp[0]=1;for(let size=1;size<=n;size++){const next=Array(k+1).fill(0);let window=0;for(let inversions=0;inversions<=k;inversions++){window=(window+dp[inversions])%MOD;if(inversions>=size)window=(window-dp[inversions-size]+MOD)%MOD;next[inversions]=window;}dp=next;emit('The largest new value can introduce zero through size-minus-one inversions. This row is a sliding sum over exactly those predecessor counts.',{sequence:Array.from({length:k+1},(_,i)=>i),output:[...dp],codeStage:'size',metrics:{size,targetInversions:k,targetCount:dp[k]}},'update');}return dp[k];},
638({price,special,needs},emit){const useful=special.filter(offer=>offer.slice(0,-1).some(q=>q>0)&&offer.at(-1)<offer.slice(0,-1).reduce((sum,q,i)=>sum+q*price[i],0)),memo=new Map();function solve(remaining){const key=remaining.join(',');if(memo.has(key))return memo.get(key);let best=remaining.reduce((sum,q,i)=>sum+q*price[i],0);const options=[['individual',best]];for(let i=0;i<useful.length;i++){const offer=useful[i];if(remaining.every((q,j)=>q>=offer[j])){const candidate=offer.at(-1)+solve(remaining.map((q,j)=>q-offer[j]));best=Math.min(best,candidate);options.push([`offer ${i}`,candidate]);}}memo.set(key,best);emit('This remaining-needs vector compares individual purchases with every fitting useful bundle. The recursive remainder buys exactly the missing items, never extras.',{sequence:remaining,table:options,tableHeaders:['Purchase choice','Total cost from this state'],codeStage:'needs',metrics:{remaining:key,best,memoStates:memo.size}},'update');return best;}return solve(needs);},
664({s},emit){const n=s.length,dp=Array.from({length:n},()=>Array(n).fill(0));for(let i=n-1;i>=0;i--){dp[i][i]=1;for(let j=i+1;j<n;j++){dp[i][j]=1+dp[i+1][j];for(let same=i+1;same<=j;same++)if(s[same]===s[i])dp[i][j]=Math.min(dp[i][j],(same===i+1?0:dp[i+1][same-1])+dp[same][j]);emit('Printing the left character separately is always possible. A later matching character lets its print turn be shared, while any intervening text is handled by its own interval.',{sequence:s.split(''),window:[i,j],outputMatrix:dp.map(row=>[...row]),outputMatrixLabel:'Minimum printer turns for [row, column]',outputCell:[i,j],codeStage:'interval',metrics:{left:i,right:j,turns:dp[i][j]}},'update');}}return dp[0][n-1];},
727({s1,s2},emit){const starts=Array(s2.length).fill(-1);let bestStart=-1,bestLength=Infinity;for(let i=0;i<s1.length;i++){for(let j=s2.length-1;j>=0;j--)if(s1[i]===s2[j])starts[j]=j===0?i:starts[j-1];const start=starts.at(-1);if(start>=0&&i-start+1<bestLength){bestLength=i-start+1;bestStart=start;}emit('Update target prefixes backward so the current source character is used once. A later valid start gives a shorter completed window; equal-length answers keep the earlier winner.',{sequence:s1.split(''),index:i,window:start>=0?[start,i]:null,table:starts.map((start,j)=>[s2.slice(0,j+1),start]),tableHeaders:['Matched target prefix','Latest possible start'],codeStage:'scan',metrics:{bestStart,bestLength:Number.isFinite(bestLength)?bestLength:'none'}},'update');}return bestStart<0?'':s1.slice(bestStart,bestStart+bestLength);},
879({n,minProfit,group,profit},emit){const dp=Array.from({length:n+1},()=>Array(minProfit+1).fill(0));dp[0][0]=1;for(let job=0;job<group.length;job++){for(let people=n;people>=group[job];people--)for(let earned=minProfit;earned>=0;earned--){const target=Math.min(minProfit,earned+profit[job]);dp[people][target]=(dp[people][target]+dp[people-group[job]][earned])%MOD;}emit('Descending people counts read states from before this job, preventing reuse. Profits at or beyond the target merge into one qualifying column.',{sequence:group,index:job,outputMatrix:dp.map(row=>[...row]),outputMatrixLabel:'Ways by people used and capped profit',codeStage:'job',metrics:{job,peopleNeeded:group[job],profit:profit[job],qualifying:dp.reduce((sum,row)=>(sum+row[minProfit])%MOD,0)}},'update');}return dp.reduce((sum,row)=>(sum+row[minProfit])%MOD,0);},
887({k,n},emit){const covered=Array(k+1).fill(0);let moves=0;while(covered[k]<n){moves++;for(let eggs=k;eggs>=1;eggs--)covered[eggs]=Math.min(n,covered[eggs]+covered[eggs-1]+1);emit('One tested floor splits the problem into a broken-egg lower region and a surviving-egg upper region. Update downward so both terms use the previous move budget.',{sequence:Array.from({length:k+1},(_,i)=>i),output:[...covered],codeStage:'moves',metrics:{moves,targetFloors:n,coveredWithAllEggs:covered[k]}},'update');}return moves;},
956({rods},emit){let dp=new Map([[0,0]]);for(let i=0;i<rods.length;i++){const rod=rods[i],next=new Map(dp);for(const[difference,shorter]of dp){next.set(difference+rod,Math.max(next.get(difference+rod)??-Infinity,shorter));const gap=Math.abs(difference-rod),height=shorter+Math.min(difference,rod);next.set(gap,Math.max(next.get(gap)??-Infinity,height));}dp=next;emit('Keep the best shorter support for each difference. Adding to the shorter side may overtake the taller side, so normalize the difference and add only the overlapped height.',{sequence:rods,index:i,table:[...dp].sort((a,b)=>a[0]-b[0]).map(([gap,height])=>[gap,height,height+gap]),tableHeaders:['Height difference','Best shorter support','Taller support'],codeStage:'rod',metrics:{rod,bestEqualHeight:dp.get(0)}},'update');}return dp.get(0);},
1000({stones,k},emit){const n=stones.length;if((n-1)%(k-1)!==0)return -1;const prefix=[0];for(const value of stones)prefix.push(prefix.at(-1)+value);const dp=Array.from({length:n},()=>Array(n).fill(0));for(let length=2;length<=n;length++)for(let left=0;left+length<=n;left++){const right=left+length-1;dp[left][right]=Infinity;for(let split=left;split<right;split+=k-1)dp[left][right]=Math.min(dp[left][right],dp[left][split]+dp[split+1][right]);const collapses=(length-1)%(k-1)===0;if(collapses)dp[left][right]+=prefix[right+1]-prefix[left];emit('Split at positions where the left portion can collapse to one pile. Add this interval total only when its remaining pile count can complete one final k-way merge.',{sequence:stones,window:[left,right],outputMatrix:display(dp),outputCell:[left,right],outputMatrixLabel:'Minimum interval merge costs',codeStage:'interval',metrics:{left,right,length,collapsesToOne:collapses,cost:dp[left][right]}},'update');}return dp[0][n-1];},
1140({piles},emit){const n=piles.length,suffix=Array(n+1).fill(0),memo=new Map();for(let i=n-1;i>=0;i--)suffix[i]=suffix[i+1]+piles[i];function solve(start,m){if(start+2*m>=n)return suffix[start];const key=`${start},${m}`;if(memo.has(key))return memo.get(key);let best=0;const options=[];for(let take=1;take<=2*m;take++){const opponent=solve(start+take,Math.max(m,take)),score=suffix[start]-opponent;best=Math.max(best,score);options.push([take,Math.max(m,take),opponent,score]);}memo.set(key,best);emit('All remaining stones are eventually split between the two players. Subtract the opponent optimal future share from this suffix total and choose the best legal take.',{sequence:piles,index:start,table:options,tableHeaders:['Piles taken','Next M','Opponent future share','Current player total'],codeStage:'state',metrics:{start,m,suffixTotal:suffix[start],best}},'update');return best;}return solve(0,1);},
1388({slices},emit){const count=slices.length/3;function line(values,label){const n=values.length,dp=Array.from({length:n+1},()=>Array(count+1).fill(-Infinity));for(let i=0;i<=n;i++)dp[i][0]=0;for(let end=1;end<=n;end++){for(let picked=1;picked<=count;picked++)dp[end][picked]=Math.max(dp[end-1][picked],dp[Math.max(0,end-2)][picked-1]+values[end-1]);emit('Choose an exact number of nonadjacent slices. Taking this slice reads the prefix two positions earlier; impossible counts remain negative infinity instead of acting like zero.',{sequence:values,index:end-1,outputMatrix:display(dp),outputMatrixLabel:'Best total by prefix length and exact picks',codeStage:'line',metrics:{case:label,processed:end,requiredPicks:count}},'update');}return dp[n][count];}return Math.max(line(slices.slice(1),'exclude first'),line(slices.slice(0,-1),'exclude last'));},
};
const python={
629:`def kInversePairs(n, k):
    if k > n * (n - 1) // 2:
        return 0  # step: impossible
    modulus, dp = 1000000007, [1] + [0] * k
    for size in range(1, n + 1):
        following, window = [0] * (k + 1), 0
        for inversions in range(k + 1):
            window += dp[inversions]
            if inversions >= size:
                window -= dp[inversions - size]
            window %= modulus
            following[inversions] = window
        dp = following  # step: size
    return dp[k]  # step: return`,
638:`def shoppingOffers(price, special, needs):
    from functools import lru_cache
    useful = [offer for offer in special if any(offer[:-1])
              and offer[-1] < sum(q * p for q, p in zip(offer[:-1], price))]
    @lru_cache(None)
    def solve(remaining):
        best = sum(q * p for q, p in zip(remaining, price))
        for offer in useful:
            if all(q >= offer[i] for i, q in enumerate(remaining)):
                reduced = tuple(q - offer[i] for i, q in enumerate(remaining))
                best = min(best, offer[-1] + solve(reduced))
        # step: needs
        return best
    return solve(tuple(needs))  # step: return`,
664:`def strangePrinter(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for left in range(n - 1, -1, -1):
        dp[left][left] = 1
        for right in range(left + 1, n):
            dp[left][right] = 1 + dp[left + 1][right]
            for same in range(left + 1, right + 1):
                if s[same] == s[left]:
                    middle = dp[left + 1][same - 1] if same > left + 1 else 0
                    dp[left][right] = min(dp[left][right], middle + dp[same][right])
            # step: interval
    return dp[0][-1]  # step: return`,
727:`def minWindow(s1, s2):
    starts = [-1] * len(s2)
    best_start, best_length = -1, float('inf')
    for index, character in enumerate(s1):
        for target in range(len(s2) - 1, -1, -1):
            if character == s2[target]:
                starts[target] = index if target == 0 else starts[target - 1]
        if starts[-1] >= 0 and index - starts[-1] + 1 < best_length:
            best_start, best_length = starts[-1], index - starts[-1] + 1
        # step: scan
    return '' if best_start < 0 else s1[best_start:best_start + best_length]  # step: return`,
879:`def profitableSchemes(n, minProfit, group, profit):
    modulus = 1000000007
    dp = [[0] * (minProfit + 1) for _ in range(n + 1)]
    dp[0][0] = 1
    for people_needed, earned_profit in zip(group, profit):
        for people in range(n, people_needed - 1, -1):
            for earned in range(minProfit, -1, -1):
                target = min(minProfit, earned + earned_profit)
                dp[people][target] = (dp[people][target] + dp[people - people_needed][earned]) % modulus
        # step: job
    return sum(row[minProfit] for row in dp) % modulus  # step: return`,
887:`def superEggDrop(k, n):
    covered, moves = [0] * (k + 1), 0
    while covered[k] < n:
        moves += 1
        for eggs in range(k, 0, -1):
            covered[eggs] = min(n, covered[eggs] + covered[eggs - 1] + 1)
        # step: moves
    return moves  # step: return`,
956:`def tallestBillboard(rods):
    dp = {0: 0}
    for rod in rods:
        following = dict(dp)
        for difference, shorter in dp.items():
            following[difference + rod] = max(following.get(difference + rod, 0), shorter)
            gap = abs(difference - rod)
            following[gap] = max(following.get(gap, 0), shorter + min(difference, rod))
        dp = following  # step: rod
    return dp[0]  # step: return`,
1000:`def mergeStones(stones, k):
    n = len(stones)
    if (n - 1) % (k - 1):
        return -1  # step: impossible
    prefix = [0]
    for value in stones:
        prefix.append(prefix[-1] + value)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            dp[left][right] = min(dp[left][split] + dp[split + 1][right]
                                  for split in range(left, right, k - 1))
            if (length - 1) % (k - 1) == 0:
                dp[left][right] += prefix[right + 1] - prefix[left]
            # step: interval
    return dp[0][-1]  # step: return`,
1140:`def stoneGameII(piles):
    from functools import lru_cache
    n = len(piles)
    suffix = [0] * (n + 1)
    for index in range(n - 1, -1, -1):
        suffix[index] = suffix[index + 1] + piles[index]
    @lru_cache(None)
    def solve(start, limit):
        if start + 2 * limit >= n:
            return suffix[start]
        best = 0
        for take in range(1, 2 * limit + 1):
            best = max(best, suffix[start] - solve(start + take, max(limit, take)))
        # step: state
        return best
    return solve(0, 1)  # step: return`,
1388:`def maxSizeSlices(slices):
    count = len(slices) // 3
    def linear(values):
        n = len(values)
        dp = [[float('-inf')] * (count + 1) for _ in range(n + 1)]
        for row in dp:
            row[0] = 0
        for end in range(1, n + 1):
            for picked in range(1, count + 1):
                dp[end][picked] = max(dp[end - 1][picked],
                    dp[max(0, end - 2)][picked - 1] + values[end - 1])
            # step: line
        return dp[n][count]
    return max(linear(slices[1:]), linear(slices[:-1]))  # step: return`,
};
const cases={
629:[['Several insertion windows contribute to one inversion target',{n:8,k:12}],['Zero inversions has only increasing order',{n:9,k:0}],['The maximum inversion count has only decreasing order',{n:6,k:15}],['An unattainable inversion count returns zero',{n:4,k:8}]],
638:[['Reusable bundles compete with individual units across three items',{price:[3,6,4],special:[[2,1,0,9],[0,1,2,10],[1,0,1,5],[3,2,1,25]],needs:[4,3,3]}],['An oversized discount cannot buy unwanted extras',{price:[4,7],special:[[3,1,5]],needs:[2,1]}],['No required items costs zero',{price:[2,5],special:[[1,1,4]],needs:[0,0]}],['Offers more expensive than unit purchases are irrelevant',{price:[2,3],special:[[1,1,8]],needs:[3,2]}]],
664:[['Separated equal letters can share print turns across nested repairs',{s:'abacbcabca'}],['One repeated run prints in one turn',{s:'mmmmmm'}],['Distinct letters each need a turn',{s:'orbit'}],['A repeated outer letter can share a turn around the middle',{s:'xyzyx'}]],
727:[['Several target alignments compete for the shortest source window',{s1:'axbycabcaybzcab',s2:'abc'}],['Target order matters even when every letter exists',{s1:'cba',s2:'abc'}],['Repeated target letters need different source positions',{s1:'abacaba',s2:'aaa'}],['Equal shortest windows retain the leftmost one',{s1:'axbxxayb',s2:'ab'}]],
879:[['People budgets and capped profits combine across several jobs',{n:9,minProfit:8,group:[2,3,1,4,2],profit:[3,5,1,7,4]}],['Zero target profit includes the empty scheme',{n:4,minProfit:0,group:[1,2,3],profit:[0,2,4]}],['Jobs requiring too many people cannot be used',{n:2,minProfit:3,group:[3,4],profit:[8,10]}],['Different jobs with equal attributes remain separate choices',{n:4,minProfit:4,group:[2,2,2],profit:[4,4,4]}]],
887:[['Several egg-count states grow coverage together',{k:3,n:75}],['One egg requires checking floors sequentially',{k:1,n:12}],['Two eggs cover floors through triangular growth',{k:2,n:100}],['One floor needs only one drop',{k:8,n:1}]],
956:[['Rods can be skipped or assigned to either support',{rods:[3,8,5,11,7,4,6]}],['Equal rods make two matching supports directly',{rods:[9,9]}],['No nonempty equal supports leaves height zero',{rods:[2,5]}],['The tallest equal result may skip a long outlier',{rods:[4,6,10,27]}]],
1000:[['Several merge orders compete across a longer pile sequence',{stones:[4,7,2,9,3,6,5],k:3}],['Pile count can make k-way completion impossible',{stones:[3,8,4,6],k:3}],['One existing pile needs no merge cost',{stones:[12],k:4}],['Binary merges compare many parenthesizations',{stones:[5,1,8,2,6],k:2}]],
1140:[['Changing M alters both immediate and future choices',{piles:[5,9,3,12,4,8,6,11,2]}],['A single pile is taken immediately',{piles:[17]}],['The first player can take both initial piles',{piles:[4,13]}],['Equal piles still require planning around the move limit',{piles:[6,6,6,6,6,6,6,6]}]],
1388:[['Large neighboring slices compete around a longer cycle',{slices:[8,3,11,5,9,2,10,4,7]}],['Three slices permit selecting only the largest',{slices:[4,12,7]}],['Equal slices make every legal fixed-count choice equal',{slices:[6,6,6,6,6,6]}],['Large values at both cycle ends cannot both be selected',{slices:[15,2,3,8,4,14]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max,array=(values,min,max,length=30)=>Array.isArray(values)&&values.length>=1&&values.length<=length&&values.every(v=>integer(v,min,max));if(id===629)need(integer(input.n,1,50)&&integer(input.k,0,200),'Use 1-50 values and an inversion target 0-200.');if(id===638){need(array(input.price,1,20,4)&&Array.isArray(input.needs)&&input.needs.length===input.price.length&&input.needs.every(v=>integer(v,0,6)),'Use 1-4 item prices and matching remaining needs from zero to six.');need(Array.isArray(input.special)&&input.special.length<=12&&input.special.every(o=>Array.isArray(o)&&o.length===input.price.length+1&&o.slice(0,-1).every(v=>integer(v,0,6))&&integer(o.at(-1),0,200)),'Use up to twelve bundle offers with bounded quantities and costs.');}if(id===664)need(typeof input.s==='string'&&/^[a-z]{1,25}$/.test(input.s),'Use 1-25 lowercase letters.');if(id===727)need(typeof input.s1==='string'&&/^[a-z]{1,100}$/.test(input.s1)&&typeof input.s2==='string'&&/^[a-z]{1,25}$/.test(input.s2),'Use a source of 1-100 lowercase letters and target of 1-25.');if(id===879)need(integer(input.n,1,30)&&integer(input.minProfit,0,40)&&array(input.group,1,30,30)&&Array.isArray(input.profit)&&input.profit.length===input.group.length&&input.profit.every(v=>integer(v,0,40)),'Use at most thirty jobs, 1-30 people, and profits/target at most forty.');if(id===887)need(integer(input.k,1,10)&&integer(input.n,1,200),'Use 1-10 eggs and 1-200 floors.');if(id===956)need(array(input.rods,1,50,20),'Use 1-20 positive rods with length at most fifty.');if(id===1000)need(array(input.stones,1,100,20)&&integer(input.k,2,10),'Use 1-20 positive piles and merge arity 2-10.');if(id===1140)need(array(input.piles,1,100,24),'Use 1-24 positive pile sizes up to 100.');if(id===1388)need(array(input.slices,1,100,18)&&input.slices.length%3===0,'Use 3-18 positive slice sizes, with length divisible by three.');return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===629&&input.k>input.n*(input.n-1)/2||id===1000&&result===-1?'impossible':'return',pseudocodeStages:{629:{impossible:1,size:4},638:{needs:4},664:{interval:4},727:{scan:4},879:{job:4},887:{moves:3},956:{rod:4},1000:{impossible:1,interval:4},1140:{state:4},1388:{line:3}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Dynamic Programming']]))};
