const specs={
2154:['nums original','Repeatedly double a value while it is present in the input.','The array is a membership set, not a consumable sequence. Each successful lookup doubles the current value; the first absent value ends the process.','build a set of input values|look for the current value|double it after a successful lookup|stop at the first absent value|return the final value','O(n+log(max value/original+1)) expected time; O(n) space.'],
2155:['nums','Find every split maximizing zeros on the left plus ones on the right.','Initially all ones belong to the right. Moving one element across the split adds a point for zero or removes a point for one, so every split can be scored incrementally.','count ones for the empty-left split|score each split including both endpoints|move the next value from right to left|retain all split indices tied for the maximum|return every best split index','O(n) time and output space.'],
2156:['s power modulo k hashValue','Find the earliest length-k substring with the requested polynomial hash.','The first character has exponent zero, so slide from right to left. Multiply the previous hash by power, add the new first letter, and remove the outgoing letter contribution at exponent k.','precompute power to k modulo the modulus|scan characters from right to left|extend the hash and remove an outgoing character beyond width k|record matching full windows while moving toward smaller indices|return the leftmost matching substring','O(n+k) time; O(1) auxiliary arithmetic state.'],
2157:['words','Group letter sets connected by adding deleting or replacing one letter.','Union identical masks first. A deleted-letter mask connects words differing by an insertion or deletion; two words sharing the same deleted-letter signature differ by a replacement.','encode every distinct-letter word as a bitmask|union duplicate masks|remove each present bit and union any exact smaller mask|union words sharing the same deletion signature|return the component count and largest group size','O(total letters*alpha(n)) expected time; O(total letters+n) space.'],
2158:['paint','Measure the newly painted length each day despite overlapping half-open intervals.','Compress interval endpoints into elementary segments. A successor disjoint-set skips segments already painted, so each physical segment contributes its width only on the first day that reaches it.','sort all interval endpoints and form elementary segments|start each day at its first unpainted segment|add that segment physical width|link painted segments to the next available successor|return each day newly painted length','O(n log n+n*alpha(n)) time; O(n) space.'],
2160:['num','Split four digits into two numbers with the smallest possible sum.','Each digit contributes either a tens or units place. Put the two smallest digits in the tens positions and the two larger digits in units positions; leading zeros are allowed.','extract and sort the four digits|assign the smallest two to tens positions|assign the remaining two to units positions|add the constructed numbers|return the minimum sum','O(1) time and space for four digits.'],
};
const solvers={
2154({nums,original},emit){const values=new Set(nums);let value=original;while(values.has(value)){const next=value*2;emit('Membership succeeds, so double the current value and perform a fresh lookup. Duplicates in the input do not create extra operations.',{sequence:nums,index:nums.indexOf(value),codeStage:'double',metrics:{found:value,next}},'update');value=next;}emit('This value is absent, so the repeated-doubling process stops.',{codeStage:'missing',metrics:{absent:value}});return value;},
2155({nums},emit){let score=nums.reduce((a,b)=>a+b,0),best=-1,answer=[];for(let split=0;split<=nums.length;split++){if(score>best){best=score;answer=[split];}else if(score===best)answer.push(split);emit('The split lies before this index. Count zeros strictly to its left and ones from this index onward; empty sides are allowed.',{sequence:nums,marks:Object.fromEntries(nums.map((_,i)=>[i,i<split?'left':'right'])),output:[...answer],codeStage:'score',metrics:{split,score,best}},'update');if(split<nums.length)score+=nums[split]===0?1:-1;}return answer;},
2156({s,power,modulo,k,hashValue},emit){const p=BigInt(power),mod=BigInt(modulo),target=BigInt(hashValue),value=c=>BigInt(c.charCodeAt(0)-96);let pToK=1n,hash=0n,found=-1;for(let i=0;i<k;i++)pToK=pToK*p%mod;for(let i=s.length-1;i>=0;i--){hash=(hash*p+value(s[i]))%mod;if(i+k<s.length)hash=(hash-value(s[i+k])*pToK%mod+mod)%mod;if(i+k<=s.length){const matches=hash===target;if(matches)found=i;emit('Moving left raises every retained character exponent by one. Remove the outgoing exponent-k term so only this full window remains; later matches in this scan have earlier source indices.',{sequence:[...s],window:[i,i+k-1],index:i,codeStage:'hash',metrics:{start:i,power,modulo,hash:hash.toString(),target:hashValue,matches,earliestMatch:found===-1?'none':found}},'update');}}if(found===-1)throw new Error('No length-k substring has the requested hash. Choose a hash occurring in this input.');return s.slice(found,found+k);},
2157({words},emit){const masks=words.map(word=>[...word].reduce((m,c)=>m|(1<<(c.charCodeAt(0)-97)),0)),parent=words.map((_,i)=>i),size=words.map(()=>1),exact=new Map(),deleted=new Map();const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};const union=(a,b)=>{a=find(a);b=find(b);if(a===b)return false;if(size[a]<size[b])[a,b]=[b,a];parent[b]=a;size[a]+=size[b];return true;};for(let i=0;i<words.length;i++){if(exact.has(masks[i]))union(i,exact.get(masks[i]));else exact.set(masks[i],i);}for(let i=0;i<words.length;i++)for(let bit=0;bit<26;bit++)if(masks[i]&(1<<bit)){const smaller=masks[i]^(1<<bit);let joins=0;if(exact.has(smaller))joins+=Number(union(i,exact.get(smaller)));if(deleted.has(smaller))joins+=Number(union(i,deleted.get(smaller)));else deleted.set(smaller,i);emit('An exact smaller mask supplies an add/delete connection. A shared deletion signature supplies a replacement connection, even when that smaller word is not itself present.',{sequence:words,index:i,table:words.map((w,j)=>[w,masks[j].toString(2),find(j),size[find(j)]]),tableHeaders:['Word','Mask','Group root','Group size'],codeStage:'join',metrics:{word:words[i],removedLetter:String.fromCharCode(97+bit),signature:smaller.toString(2),newUnions:joins}},'update');}const roots=parent.map((_,i)=>find(i)),groups=new Set(roots);return[groups.size,Math.max(...[...groups].map(root=>size[root]))];},
2158({paint},emit){const coordinates=[...new Set(paint.flat())].sort((a,b)=>a-b),index=new Map(coordinates.map((x,i)=>[x,i])),parent=coordinates.map((_,i)=>i),owner=Array(coordinates.length-1).fill(null),answer=[];const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};for(let day=0;day<paint.length;day++){const[start,end]=paint[day],stop=index.get(end);let segment=find(index.get(start)),added=0;while(segment<stop){const width=coordinates[segment+1]-coordinates[segment];added+=width;owner[segment]=day+1;parent[segment]=find(segment+1);emit('This compressed segment has not been painted before. Add its actual coordinate width, then remove it from future scans by linking to its next unpainted successor.',{sequence:coordinates,index:segment,table:owner.map((d,i)=>[coordinates[i],coordinates[i+1],d??'unpainted']),tableHeaders:['Segment start','Segment end','First painting day'],codeStage:'paint',metrics:{day:day+1,start,end,width,newLengthToday:added}},'update');segment=find(segment);}answer.push(added);emit('The successor scan has reached this day interval end. Already-painted segments were skipped without adding their lengths again.',{output:[...answer],codeStage:'day',metrics:{day:day+1,newLength:added}},'update');}return answer;},
2160({num},emit){const digits=[...String(num)].map(Number).sort((a,b)=>a-b),first=10*digits[0]+digits[2],second=10*digits[1]+digits[3];emit('Tens positions have greater weight than units positions, so assign the smallest digits to tens. Leading zeros simply make one constructed number shorter.',{sequence:digits,table:[['first',digits[0],digits[2],first],['second',digits[1],digits[3],second]],tableHeaders:['Number','Tens digit','Units digit','Value'],codeStage:'construct',metrics:{first,second,sum:first+second}},'update');return first+second;},
};
const python={
2154:`def findFinalValue(nums, original):
    values = set(nums)
    value = original
    while value in values:
        value *= 2  # step: double
    # step: missing
    return value  # step: return`,
2155:`def maxScoreIndices(nums):
    score, best, answer = sum(nums), -1, []
    for split in range(len(nums) + 1):
        if score > best:
            best, answer = score, [split]
        elif score == best:
            answer.append(split)
        # step: score
        if split < len(nums):
            score += 1 if nums[split] == 0 else -1
    return answer  # step: return`,
2156:`def subStrHash(s, power, modulo, k, hashValue):
    power_to_k = pow(power, k, modulo)
    current, found = 0, -1
    def value(letter):
        return ord(letter) - ord('a') + 1
    for i in range(len(s) - 1, -1, -1):
        current = (current * power + value(s[i])) % modulo
        if i + k < len(s):
            current = (current - value(s[i + k]) * power_to_k) % modulo
        if i + k <= len(s):
            if current == hashValue:
                found = i
            # step: hash
    if found == -1:
        raise ValueError('No length-k substring has the requested hash.')
    return s[found:found + k]  # step: return`,
2157:`def groupStrings(words):
    masks = [sum(1 << (ord(c) - ord('a')) for c in word) for word in words]
    parent, size = list(range(len(words))), [1] * len(words)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        a, b = find(a), find(b)
        if a == b:
            return
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
    exact, deleted = {}, {}
    for i, mask in enumerate(masks):
        if mask in exact:
            union(i, exact[mask])
        else:
            exact[mask] = i
    for i, mask in enumerate(masks):
        for bit in range(26):
            if not mask & (1 << bit):
                continue
            smaller = mask ^ (1 << bit)
            if smaller in exact:
                union(i, exact[smaller])
            if smaller in deleted:
                union(i, deleted[smaller])
            else:
                deleted[smaller] = i
            # step: join
    roots = {find(i) for i in range(len(words))}
    return [len(roots), max(size[root] for root in roots)]  # step: return`,
2158:`def amountPainted(paint):
    coordinates = sorted({x for interval in paint for x in interval})
    index = {x: i for i, x in enumerate(coordinates)}
    parent = list(range(len(coordinates)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    answer = []
    for start, end in paint:
        segment, stop, added = find(index[start]), index[end], 0
        while segment < stop:
            added += coordinates[segment + 1] - coordinates[segment]
            parent[segment] = find(segment + 1)  # step: paint
            segment = find(segment)
        answer.append(added)  # step: day
    return answer  # step: return`,
2160:`def minimumSum(num):
    digits = sorted(int(char) for char in str(num))
    first = 10 * digits[0] + digits[2]
    second = 10 * digits[1] + digits[3]  # step: construct
    return first + second  # step: return`,
};
const cases={
2154:[['A chain of doublings ignores unrelated values and duplicates',{nums:[3,6,12,5,24,48,6,11,96,7],original:3}],['The initial value is absent',{nums:[2,5,9,14],original:7}],['Repeated occurrences do not repeat the same doubling',{nums:[4,4,4,8,8],original:4}],['A large final doubling leaves the membership set',{nums:[125,250,500,1000],original:125}]],
2155:[['Alternating contributions create several tied best splits',{nums:[0,1,0,0,1,1,0,1,0,0,1,0]}],['All zeros favor the empty right side',{nums:[0,0,0,0,0]}],['All ones favor the empty left side',{nums:[1,1,1,1]}],['One zero has a single best endpoint',{nums:[0]}]],
2156:[['Repeated matching windows must return the earliest source position',{s:'zzzcabcabxy',power:3,modulo:101,k:3,hashValue:24}],['A modulus of one makes every full window match',{s:'lanternriver',power:7,modulo:1,k:4,hashValue:0}],['The entire string is the only full window',{s:'fern',power:2,modulo:101,k:4,hashValue:99}],['A matching internal window follows two nonmatching windows',{s:'azbycx',power:5,modulo:97,k:2,hashValue:30}]],
2157:[['Add delete replace and duplicate connections form several groups',{words:['ab','abc','ac','bc','cab','xyz','xy','xw','mnop','mno']}],['Singleton letters connect through replacement',{words:['a','d','q','z']}],['Widely different letter sets remain separate',{words:['abc','mnop','uvwxyz']}],['Anagrams are duplicate letter-set members',{words:['abcd','dcba','badc','cdab']}]],
2158:[['Overlapping days fill gaps and skip previously painted segments',{paint:[[2,8],[5,12],[0,4],[15,19],[10,17],[0,20]]}],['Repeating the same interval adds nothing after day one',{paint:[[4,11],[4,11],[4,11]]}],['Touching intervals share no positive-length overlap',{paint:[[0,3],[3,7],[7,12]]}],['A nested later interval is already fully painted',{paint:[[1,20],[5,8],[2,19]]}]],
2160:[['Assign small digits to the two tens places',{num:8642}],['Two zeros can become leading zeros',{num:9001}],['Repeated digits still occupy four positions',{num:7777}],['Three zeros leave one single-digit contribution',{num:1000}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0)=>Array.isArray(v)&&v.length>=1&&v.length<=80&&v.every(x=>integer(x,min));
  if(id===2154)need(vector(input.nums,1)&&integer(input.original,1),'Use 1-80 positive values and a positive original value, each at most one million.');
  if(id===2155)need(vector(input.nums)&&input.nums.every(v=>v===0||v===1),'Use 1-80 binary values.');
  if(id===2156)need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s)&&integer(input.power,1,1000000000)&&integer(input.modulo,1,1000000000)&&integer(input.k,1,input.s.length)&&integer(input.hashValue,0,input.modulo-1),'Use 1-120 lowercase letters, valid window length, positive power/modulus up to one billion, and a hash below the modulus that occurs in the input.');
  if(id===2157)need(Array.isArray(input.words)&&input.words.length>=1&&input.words.length<=40&&input.words.every(w=>typeof w==='string'&&/^[a-z]{1,26}$/.test(w)&&new Set(w).size===w.length),'Use 1-40 lowercase words with no repeated letter within a word.');
  if(id===2158)need(Array.isArray(input.paint)&&input.paint.length>=1&&input.paint.length<=40&&input.paint.every(p=>Array.isArray(p)&&p.length===2&&integer(p[0])&&integer(p[1],p[0]+1)),'Use 1-40 nonempty half-open intervals [start,end] with nonnegative integer endpoints at most one million.');
  if(id===2160)need(integer(input.num,1000,9999),'Use a four-digit positive integer.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2154:{double:3,missing:4},2155:{score:4},2156:{hash:4},2157:{join:4},2158:{paint:4,day:5},2160:{construct:4}},tags:{2154:['Hash Table'],2155:['Prefix Sum'],2156:['Rolling Hash'],2157:['Union Find','Bit Manipulation'],2158:['Union Find','Coordinate Compression'],2160:['Greedy']}};
