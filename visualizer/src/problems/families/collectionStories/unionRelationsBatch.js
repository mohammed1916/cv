import {AuthoredUnionFind as UF,unionState,unionPython} from './authoredUnionFind.js';
const specs={
737:['sentence1 sentence2 similarPairs','Decide whether two sentences match position by position under transitive word similarity.','Union all supplied similar-word pairs into equivalence classes. Equal words match even without a pair; otherwise the two words at each position must belong to the same class.','reject unequal sentence lengths|assign IDs to words and union every similarity pair|compare the aligned sentence words|accept equality or a shared representative at each position|return whether all positions match','O(total words and pairs * inverse Ackermann) expected time and O(distinct words) space.'],
765:['row','Find the minimum swaps of seated people needed to place every couple together.','Treat each couple as one node and union the couple IDs sharing each seat pair. A component with k couples needs k-1 swaps, so the answer is total couples minus the number of components.','map each person to their couple using integer division by two|inspect each adjacent seat pair|union the two couple IDs sharing those seats|count successful unions across all pairs|return that count as the minimum swaps','O(people * inverse Ackermann) time and O(couples) space.'],
839:['strs','Count connected groups of anagram strings linked by one allowed character swap.','Two strings are directly similar if they are equal or differ in exactly two mutually reversed positions. Union those pairs; transitive chains form groups even when the chain endpoints are not directly similar.','start one component per input string|compare every pair character by character|accept equal strings or one valid two-position swap|union directly similar pairs|return the remaining number of components','O(strings^2 * word length) time and O(strings) union-find space.'],
947:['stones','Remove as many stones as possible while every removed stone shares a row or column with another remaining stone.','Union stones sharing a row or a column. Each connected component can be reduced to one stone by removing leaves of a spanning tree, but its final stone cannot be removed.','start one component per stone|remember the first stone seen in each row and column|union later stones with those row and column representatives|count connected components after all unions|return stone count minus component count','O(stones * inverse Ackermann) expected time and O(stones) space.'],
952:['nums','Find the largest component when numbers are connected by a common factor greater than one.','Factor each number into distinct primes. The first owner of each prime is a representative; union every later number carrying that prime. Transitive factor chains combine into full connected components.','start one component per number|extract each number distinct prime factors|union numbers sharing a prime owner|finish all factor connections|return the largest component size','O(numbers * sqrt(max value)) factorization time plus near-linear unions; O(numbers and prime factors) space.'],
990:['equations','Determine whether all equalities and inequalities between variables can hold at once.','First union every equality so transitive equality is complete. Then reject any inequality whose two variables have the same representative; all other components can receive different values.','start a component for each lowercase variable|union every equality before checking inequalities|inspect each inequality after equality closure|reject an inequality inside one component|return true when no inequality conflicts','O(equations * inverse Ackermann) time and O(26) space.'],
1319:['n connections','Find the fewest cable relocations needed to connect every computer, or report impossibility.','At least n-1 cables are necessary. If enough exist, union the current connections and count components; each relocation joins two components, so exactly components minus one moves suffice.','reject when fewer than n minus one cables exist|start one component per computer|union the endpoints of every cable|count remaining disconnected components|return components minus one relocations','O((computers+connections) * inverse Ackermann) time and O(computers) space.'],
1627:['n threshold queries','Answer which city pairs are connected through links sharing a divisor greater than the threshold.','For each divisor above the threshold, union it with all of its multiples. Those unions represent every qualifying common-divisor link and automatically capture paths through intermediate cities.','create components for cities one through n|visit every divisor greater than the threshold|union that divisor with its multiples|compare representatives for each city query|return the connectivity answers','O(n log n * inverse Ackermann + queries * inverse Ackermann) time and O(n) space.'],
};
const solvers={
737({sentence1,sentence2,similarPairs},emit){if(sentence1.length!==sentence2.length)return false;const words=[...new Set([...sentence1,...sentence2,...similarPairs.flat()])],ids=new Map(words.map((w,i)=>[w,i])),dsu=new UF(words.length);for(const[a,b]of similarPairs){const merged=dsu.union(ids.get(a),ids.get(b));emit('A similarity pair joins whole equivalence classes. Later word comparisons can use any transitive chain inside the merged class.',{...unionState(dsu,words),codeStage:'union',metrics:{first:a,second:b,merged}},'update');}for(let i=0;i<sentence1.length;i++){const match=dsu.find(ids.get(sentence1[i]))===dsu.find(ids.get(sentence2[i]));emit('Check the same sentence position after all similarity unions. Shared representatives prove equality or a transitive similarity path.',{...unionState(dsu,words),sequence:sentence1,index:i,output:sentence2,outputIndex:i,codeStage:'compare',metrics:{first:sentence1[i],second:sentence2[i],match}},'inspect');if(!match)return false;}return true;},
765({row},emit){const dsu=new UF(row.length/2);let swaps=0;for(let i=0;i<row.length;i+=2){const a=Math.floor(row[i]/2),b=Math.floor(row[i+1]/2),merged=dsu.union(a,b);if(merged)swaps++;emit(merged?'These seats mix two previously separate couple components. Joining them contributes one necessary swap to the component total.':'These couples already belong to the same seating component, so this pair adds no new component merge.',{...unionState(dsu),sequence:row,window:[i,i+1],index:i,codeStage:'union',metrics:{firstCouple:a,secondCouple:b,minimumSwaps:swaps}},'update');}return swaps;},
839({strs},emit){const dsu=new UF(strs.length);for(let i=0;i<strs.length;i++)for(let j=i+1;j<strs.length;j++){const different=[];for(let k=0;k<strs[i].length;k++)if(strs[i][k]!==strs[j][k])different.push(k);const similar=different.length===0||(different.length===2&&strs[i][different[0]]===strs[j][different[1]]&&strs[i][different[1]]===strs[j][different[0]]);if(similar)dsu.union(i,j);emit(similar?'These strings are equal or one swap apart. Unite their entire groups, including any previously discovered similarity chains.':'More than one valid swap would be needed for this pair. It creates no direct similarity edge.',{...unionState(dsu,strs.map((s,k)=>`${k}:${s}`)),sequence:strs,index:i,codeStage:'pair',metrics:{first:i,second:j,differentPositions:different.join(', ')||'none',similar,groups:dsu.count}},'update');}return dsu.count;},
947({stones},emit){const dsu=new UF(stones.length),rows=new Map(),cols=new Map();for(let i=0;i<stones.length;i++){const[r,c]=stones[i];if(rows.has(r))dsu.union(i,rows.get(r));else rows.set(r,i);if(cols.has(c))dsu.union(i,cols.get(c));else cols.set(c,i);emit('One representative per row and column is enough to connect every stone sharing either coordinate. Each final component must keep exactly one stone.',{...unionState(dsu),pointState:{points:stones.map(([x,y],id)=>({x,y,id,label:String(id)})),pointCaption:'Stone indices at their coordinates.'},codeStage:'union',metrics:{stone:i,row:r,column:c,components:dsu.count}},'update');}return stones.length-dsu.count;},
952({nums},emit){const dsu=new UF(nums.length),owner=new Map();for(let i=0;i<nums.length;i++){let remaining=nums[i];const factors=[];for(let prime=2;prime*prime<=remaining;prime++)if(remaining%prime===0){factors.push(prime);while(remaining%prime===0)remaining/=prime;}if(remaining>1)factors.push(remaining);for(const prime of factors){if(owner.has(prime))dsu.union(i,owner.get(prime));else owner.set(prime,i);}emit('Repeated powers of one prime create no new connectivity. Join this number to the first owner of each distinct prime factor; one has no prime factors and stays isolated.',{...unionState(dsu,nums),sequence:nums,index:i,codeStage:'factor',metrics:{value:nums[i],primeFactors:factors.join(', ')||'none',largest:Math.max(...dsu.size)}},'update');}return Math.max(...dsu.size);},
990({equations},emit){const labels=Array.from({length:26},(_,i)=>String.fromCharCode(97+i)),dsu=new UF(26),id=c=>c.charCodeAt(0)-97;for(const equation of equations)if(equation[1]==='='){dsu.union(id(equation[0]),id(equation[3]));emit('Apply every equality first. A later equality may connect variables that appeared unrelated when an earlier inequality was read.',{...unionState(dsu,labels),sequence:equations,codeStage:'union',metrics:{equation}},'update');}for(const equation of equations)if(equation[1]==='!'){const conflict=dsu.find(id(equation[0]))===dsu.find(id(equation[3]));emit('An inequality conflicts exactly when both variables are already in the same equality component.',{...unionState(dsu,labels),sequence:equations,codeStage:'check',metrics:{equation,conflict}},'inspect');if(conflict)return false;}return true;},
1319({n,connections},emit){if(connections.length<n-1){emit('There are fewer than n-1 cables in total. Rearranging their endpoints cannot create enough links for one connected network.',{codeStage:'shortage',metrics:{available:connections.length,required:n-1}},'inspect');return -1;}const dsu=new UF(n);let spare=0;for(const[a,b]of connections){const merged=dsu.union(a,b);if(!merged)spare++;emit(merged?'This cable joins previously separate components.':'This cable lies inside an existing component, so it can be relocated without breaking a spanning forest.',{...unionState(dsu),codeStage:'union',metrics:{first:a,second:b,components:dsu.count,spare,needed:dsu.count-1}},'update');}return dsu.count-1;},
1627({n,threshold,queries},emit){const dsu=new UF(n);for(let divisor=threshold+1;divisor<=Math.floor(n/2);divisor++){const joined=[];for(let multiple=2*divisor;multiple<=n;multiple+=divisor){dsu.union(divisor-1,multiple-1);joined.push(multiple);}emit('Every listed multiple shares this divisor, which exceeds the threshold. Joining them captures these direct links and any resulting transitive paths.',{...unionState(dsu,Array.from({length:n},(_,i)=>i+1)),codeStage:'multiples',metrics:{divisor,multiples:joined.join(', ')}},'update');}const answer=[];for(const[a,b]of queries){const connected=dsu.find(a-1)===dsu.find(b-1);answer.push(connected);emit('The query can use any path of qualifying links, not only a direct common divisor between its endpoints.',{...unionState(dsu,Array.from({length:n},(_,i)=>i+1)),output:[...answer],codeStage:'query',metrics:{first:a,second:b,connected}},'inspect');}return answer;},
};
const implementations={
737:`def areSentencesSimilarTwo(sentence1, sentence2, similarPairs):
    if len(sentence1) != len(sentence2):
        return False  # step: length
    words = set(sentence1 + sentence2)
    for pair in similarPairs:
        words.update(pair)
    ids = {word: index for index, word in enumerate(sorted(words))}
    dsu = UnionFind(len(ids))
    for first, second in similarPairs:
        dsu.union(ids[first], ids[second])  # step: union
    for first, second in zip(sentence1, sentence2):
        if dsu.find(ids[first]) != dsu.find(ids[second]):  # step: compare
            return False
    return True  # step: return`,
765:`def minSwapsCouples(row):
    dsu = UnionFind(len(row) // 2)
    swaps = 0
    for index in range(0, len(row), 2):
        if dsu.union(row[index] // 2, row[index + 1] // 2):  # step: union
            swaps += 1
    return swaps  # step: return`,
839:`def numSimilarGroups(strs):
    dsu = UnionFind(len(strs))
    for first in range(len(strs)):
        for second in range(first + 1, len(strs)):
            a, b = strs[first], strs[second]
            different = [i for i in range(len(a)) if a[i] != b[i]]
            similar = (not different or (len(different) == 2
                and a[different[0]] == b[different[1]]
                and a[different[1]] == b[different[0]]))  # step: pair
            if similar:
                dsu.union(first, second)
    return dsu.count  # step: return`,
947:`def removeStones(stones):
    dsu, rows, columns = UnionFind(len(stones)), {}, {}
    for index, (row, column) in enumerate(stones):
        if row in rows:
            dsu.union(index, rows[row])
        else:
            rows[row] = index
        if column in columns:
            dsu.union(index, columns[column])  # step: union
        else:
            columns[column] = index
    return len(stones) - dsu.count  # step: return`,
952:`def largestComponentSize(nums):
    dsu, owner = UnionFind(len(nums)), {}
    for index, value in enumerate(nums):
        remaining, prime, factors = value, 2, []
        while prime * prime <= remaining:
            if remaining % prime == 0:
                factors.append(prime)
                while remaining % prime == 0:
                    remaining //= prime
            prime += 1
        if remaining > 1:
            factors.append(remaining)
        for prime in factors:  # step: factor
            if prime in owner:
                dsu.union(index, owner[prime])
            else:
                owner[prime] = index
    return max(dsu.size)  # step: return`,
990:`def equationsPossible(equations):
    dsu = UnionFind(26)
    def index(character):
        return ord(character) - ord('a')
    for equation in equations:
        if equation[1] == '=':
            dsu.union(index(equation[0]), index(equation[3]))  # step: union
    for equation in equations:
        if equation[1] == '!' and dsu.find(index(equation[0])) == dsu.find(index(equation[3])):  # step: check
            return False
    return True  # step: return`,
1319:`def makeConnected(n, connections):
    if len(connections) < n - 1:
        return -1  # step: shortage
    dsu = UnionFind(n)
    for first, second in connections:
        dsu.union(first, second)  # step: union
    return dsu.count - 1  # step: return`,
1627:`def areConnected(n, threshold, queries):
    dsu = UnionFind(n)
    for divisor in range(threshold + 1, n // 2 + 1):
        for multiple in range(2 * divisor, n + 1, divisor):
            dsu.union(divisor - 1, multiple - 1)  # step: multiples
    answer = []
    for first, second in queries:
        answer.append(dsu.find(first - 1) == dsu.find(second - 1))  # step: query
    return answer  # step: return`,
};
const python=Object.fromEntries(Object.entries(implementations).map(([id,source])=>[id,unionPython+source]));
const cases={
737:[['Several similarity chains match a longer sentence',{sentence1:['calm','birds','cross','wide','rivers'],sentence2:['quiet','birds','traverse','broad','streams'],similarPairs:[['calm','peaceful'],['peaceful','quiet'],['cross','pass'],['pass','traverse'],['wide','broad'],['rivers','waterways'],['waterways','streams']]}],['Identical unseen words need no pairs',{sentence1:['silver','moon'],sentence2:['silver','moon'],similarPairs:[]}],['Different sentence lengths cannot align',{sentence1:['bright','day'],sentence2:['day'],similarPairs:[['bright','day']]}],['One unmatched position rejects the whole sentence',{sentence1:['gentle','wind'],sentence2:['soft','rain'],similarPairs:[['gentle','soft']]}]],
765:[['Several mixed seat pairs form connected couple groups',{row:[0,3,2,5,4,1,6,9,8,7,10,11]}],['Every couple is already seated together',{row:[3,2,0,1,5,4]}],['One long couple cycle needs one fewer swap than couples',{row:[0,3,2,5,4,7,6,1]}],['A single couple needs no swaps',{row:[1,0]}]],
839:[['Direct swaps build chains between several anagram strings',{strs:['abcde','bacde','baced','edcba','decba']}],['Repeated identical strings form one group',{strs:['noon','noon','noon']}],['Two anagrams requiring more than one swap stay separate',{strs:['abcd','badc']}],['One string starts and ends in one group',{strs:['orbit']}]],
947:[['Row and column chains connect stones across a larger cluster',{stones:[[1,2],[1,6],[4,6],[4,9],[7,9],[10,3],[12,3],[15,15]]}],['A single stone cannot be removed',{stones:[[8,11]]}],['Distinct rows and columns keep every stone isolated',{stones:[[1,2],[3,4],[5,6],[7,8]]}],['One shared row permits all but one removal',{stones:[[6,1],[6,4],[6,9],[6,13]]}]],
952:[['Prime bridges connect values without one globally shared factor',{nums:[6,35,10,77,143,26,17,1]}],['Distinct prime numbers are isolated',{nums:[2,5,11,17,23]}],['Prime powers share one component',{nums:[4,8,16,32,64]}],['One has no common factor greater than one',{nums:[1]}]],
990:[['An inequality conflicts only after a longer equality chain closes',{equations:['a!=e','a==b','b==c','c==d','d==e','x==y']}],['Different equality components can satisfy inequalities',{equations:['a==b','c==d','b!=c','x!=a']}],['A variable cannot differ from itself',{equations:['m!=m']}],['Repeated and reflexive equalities are harmless',{equations:['q==q','q==r','r==q','q==r']}]],
1319:[['Cycles provide spare cables for isolated network components',{n:8,connections:[[0,1],[1,2],[2,0],[2,3],[3,0],[4,5],[5,6],[6,4]]}],['Too few cables makes reconnection impossible',{n:6,connections:[[0,1],[1,2],[3,4]]}],['An already connected network needs no relocation',{n:5,connections:[[0,1],[1,2],[2,3],[3,4]]}],['One computer is already connected',{n:1,connections:[]}]],
1627:[['Divisor chains can connect cities without a direct qualifying gcd',{n:18,threshold:2,queries:[[6,15],[4,18],[5,14],[7,14],[1,18],[11,11]]}],['Threshold zero makes every city share divisor one',{n:9,threshold:0,queries:[[1,9],[2,7],[4,6]]}],['Threshold n permits only self connectivity',{n:7,threshold:7,queries:[[2,2],[2,4],[1,7]]}],['A common divisor equal to the threshold does not qualify',{n:8,threshold:4,queries:[[4,8],[5,5],[6,8]]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max,word=w=>typeof w==='string'&&/^[a-z]{1,16}$/.test(w);if(id===737){need([input.sentence1,input.sentence2].every(s=>Array.isArray(s)&&s.length>=1&&s.length<=30&&s.every(word)),'Use sentences of 1-30 lowercase words.');need(Array.isArray(input.similarPairs)&&input.similarPairs.length<=50&&input.similarPairs.every(p=>Array.isArray(p)&&p.length===2&&p.every(word)),'Use up to fifty lowercase word pairs.');}if(id===765)need(Array.isArray(input.row)&&input.row.length>=2&&input.row.length<=60&&input.row.length%2===0&&input.row.every(v=>integer(v,0,input.row.length-1))&&new Set(input.row).size===input.row.length,'Use an even-length permutation of people 0 through length-1, up to sixty people.');if(id===839){need(Array.isArray(input.strs)&&input.strs.length>=1&&input.strs.length<=25&&input.strs.every(word),'Use 1-25 lowercase words of length 1-16.');const sorted=input.strs[0].split('').sort().join('');need(input.strs.every(w=>w.split('').sort().join('')===sorted),'All strings must be anagrams of one another.');}if(id===947)need(Array.isArray(input.stones)&&input.stones.length>=1&&input.stones.length<=60&&input.stones.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>integer(v,0,10000)))&&new Set(input.stones.map(p=>p.join(','))).size===input.stones.length,'Use 1-60 distinct nonnegative coordinate pairs, at most 10000.');if(id===952)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=60&&input.nums.every(v=>integer(v,1,10000))&&new Set(input.nums).size===input.nums.length,'Use 1-60 distinct integers from 1 to 10000.');if(id===990)need(Array.isArray(input.equations)&&input.equations.length>=1&&input.equations.length<=60&&input.equations.every(e=>typeof e==='string'&&/^[a-z](?:==|!=)[a-z]$/.test(e)),'Use 1-60 equations such as a==b or c!=d.');if(id===1319||id===1627){need(integer(input.n,1,80),'Use 1-80 nodes.');const pairs=id===1319?input.connections:input.queries;need(Array.isArray(pairs)&&pairs.length<=120&&pairs.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>integer(v,id===1319?0:1,id===1319?input.n-1:input.n))),'Use up to 120 valid node pairs.');if(id===1319){need(pairs.every(([a,b])=>a!==b)&&new Set(pairs.map(p=>[...p].sort((a,b)=>a-b).join(','))).size===pairs.length,'Cables must be distinct undirected edges without self loops.');}else need(integer(input.threshold,0,input.n),'Threshold must be between zero and n.');}return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===737?(input.sentence1.length!==input.sentence2.length?'length':result?'return':'compare'):id===990&&!result?'check':id===1319&&result===-1?'shortage':'return',pseudocodeStages:{737:{length:1,union:2,compare:4},765:{union:3},839:{pair:3},947:{union:3},952:{factor:3},990:{union:2,check:4},1319:{shortage:1,union:3},1627:{multiples:3,query:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['Union Find']]))};
