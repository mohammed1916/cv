const specs={
2223:['s','Sum the common-prefix scores of every suffix of the string.','The Z value at each position is that suffix common-prefix length with the whole string. Reuse a previously matched interval before extending comparisons, avoiding repeated scans of known matches.','initialize the whole-string score and an empty Z interval|reuse mirrored Z information inside the current matching interval|extend only beyond already known matches|update the rightmost interval and add each suffix score|return the sum of all Z values','O(n) time and O(n) Z-array space.'],
2224:['current correct','Convert the current clock time to the later target using the fewest allowed minute increments.','Compute the minute difference, then consume increments of 60 15 5 and 1 in descending order. For these denominations, replacing a larger increment with smaller ones cannot reduce the number of operations.','convert both times to minutes since midnight|compute the nonnegative difference|take as many 60 15 5 and 1 minute operations as possible in order|accumulate operation counts and reduce the remaining difference|return the minimum operation count','O(1) time and space for four increments.'],
2225:['matches','Find players with no losses and players with exactly one loss.','Every winner must be recorded even before losing, while each match increments only the loser count. Classify the final counts and sort the two output groups.','initialize player loss counts as players appear|record each match loser once|retain winners with zero losses until a later loss occurs|collect and sort zero-loss and one-loss players|return both groups','O(matches+players log players) time; O(players) space.'],
2226:['candies k','Give each of k children the largest equal pile size without combining source piles.','For a proposed portion size, a pile supplies its size divided by the portion rounded down. Feasibility decreases as the portion grows, so binary search the largest size yielding enough portions.','bound portion size between zero and the largest pile|try an upper midpoint portion|sum whole portions available from each pile|keep larger feasible sizes or shrink the infeasible bound|return the largest feasible portion size','O(n log(max pile)) time; O(1) auxiliary space.'],
2227:['keys values dictionary operations','Encrypt words and count dictionary words matching a ciphertext.','Encryption maps each character to its code. Pre-encrypt the dictionary into a frequency table so code collisions are counted correctly; decryption returns a count rather than attempting to choose one plaintext.','build the character-to-code mapping|encrypt every encodable dictionary word and count ciphertexts|encrypt requested words character by character|answer decryption queries from ciphertext frequencies|return the sequence of query results','O(total dictionary characters) preprocessing; O(query text length) hashing or encryption time; O(dictionary ciphertext size) space.'],
2229:['nums','Check whether distinct input values form one consecutive integer interval.','An interval with n distinct integers has maximum minus minimum equal to n minus one. Check both distinctness and span; span alone can hide duplicate values and missing interior values.','find minimum and maximum values|count distinct input values|require no duplicate occurrence|require interval width equal to array length minus one|return whether the array is consecutive','O(n) time and O(n) set space.'],
};
const solvers={
2223({s},emit){const z=Array(s.length).fill(0);z[0]=s.length;let left=0,right=-1,total=s.length;for(let i=1;i<s.length;i++){const reused=i<=right?Math.min(right-i+1,z[i-left]):0;z[i]=reused;while(i+z[i]<s.length&&s[z[i]]===s[i+z[i]])z[i]++;if(i+z[i]-1>right){left=i;right=i+z[i]-1;}total+=z[i];emit('Reuse only the part of a prior Z match still inside the known interval, then extend by comparing with the original prefix. This Z value is the full score of the suffix starting here.',{sequence:[...s],index:i,window:z[i]?[i,i+z[i]-1]:null,output:[...z],outputIndex:i,codeStage:'suffix',metrics:{suffixStart:i,reused,score:z[i],knownLeft:left,knownRight:right,total}},'update');}return total;},
2224({current,correct},emit){const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));let remaining=minutes(correct)-minutes(current),operations=0;const plan=[];for(const step of [60,15,5,1]){const count=Math.floor(remaining/step);remaining%=step;operations+=count;plan.push([step,count]);emit('Use this largest remaining increment as many times as possible. The remainder is smaller and is handled by the following denominations.',{table:[...plan],tableHeaders:['Minutes per operation','Operations'],codeStage:'take',metrics:{current,correct,increment:step,count,remaining,operations}},'update');}return operations;},
2225({matches},emit){const losses=new Map();for(let i=0;i<matches.length;i++){const[winner,loser]=matches[i];if(!losses.has(winner))losses.set(winner,0);losses.set(loser,(losses.get(loser)||0)+1);emit('Register both participants, but increase only the loser count. A player can remain undefeated through many wins.',{sequence:matches,index:i,table:[...losses].sort((a,b)=>a[0]-b[0]),tableHeaders:['Player','Losses'],codeStage:'match',metrics:{match:i+1,winner,loser,loserLosses:losses.get(loser)}},'update');}return[0,1].map(count=>[...losses].filter(([,loss])=>loss===count).map(([player])=>player).sort((a,b)=>a-b));},
2226({candies,k},emit){let low=0,high=Math.max(...candies);while(low<high){const portion=Math.floor((low+high+1)/2),counts=candies.map(pile=>Math.floor(pile/portion)),children=counts.reduce((a,b)=>a+b,0),feasible=children>=k;if(feasible)low=portion;else high=portion-1;emit('Count only whole portions cut from each individual pile. Leftovers from different piles cannot be combined to make another child portion.',{sequence:candies,output:counts,codeStage:'bound',metrics:{portion,childrenServed:children,required:k,feasible,low,high}},'update');}return low;},
2227({keys,values,dictionary,operations},emit){const codes=new Map(keys.map((key,i)=>[key,values[i]])),encrypt=word=>{let encoded='';for(const c of word){if(!codes.has(c))return'';encoded+=codes.get(c);}return encoded;},counts=new Map(),rows=[];for(const word of dictionary){const encoded=encrypt(word);rows.push([word,encoded||'not encodable']);if(encoded)counts.set(encoded,(counts.get(encoded)||0)+1);}emit('Different dictionary words can produce the same ciphertext when character codes collide. Count all encodable dictionary words under their complete ciphertext.',{table:rows,tableHeaders:['Dictionary word','Ciphertext'],codeStage:'dictionary',metrics:{dictionaryWords:dictionary.length,distinctCiphertexts:counts.size}});const answer=[];for(let i=0;i<operations.length;i++){const[type,text]=operations[i],result=type==='encrypt'?encrypt(text):counts.get(text)||0;answer.push(result);emit(type==='encrypt'?'Concatenate the mapped code for every character. An unmapped character makes the word unencodable.':'Look up the ciphertext frequency. Decryption counts dictionary candidates, including distinct words that share this exact encrypted text.',{sequence:[...text],table:type==='encrypt'?[...codes]:[...counts],tableHeaders:type==='encrypt'?['Character','Code']:['Ciphertext','Dictionary matches'],output:[...answer],codeStage:type,metrics:{operation:i+1,type,text,result}},'update');}return answer;},
2229({nums},emit){const seen=new Set();let min=Infinity,max=-Infinity;for(let i=0;i<nums.length;i++){seen.add(nums[i]);min=Math.min(min,nums[i]);max=Math.max(max,nums[i]);emit('Track distinctness separately from the range width. A duplicate can leave the minimum and maximum unchanged while an interior integer is missing.',{index:i,output:[...seen].sort((a,b)=>a-b),codeStage:'scan',metrics:{minimum:min,maximum:max,distinct:seen.size,seen:i+1,span:max-min}},'update');}return seen.size===nums.length&&max-min===nums.length-1;},
};
const python={
2223:`def sumScores(s):
    z = [0] * len(s)
    z[0] = len(s)
    left, right, total = 0, -1, len(s)
    for i in range(1, len(s)):
        if i <= right:
            z[i] = min(right - i + 1, z[i - left])
        while i + z[i] < len(s) and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] - 1 > right:
            left, right = i, i + z[i] - 1
        total += z[i]  # step: suffix
    return total  # step: return`,
2224:`def convertTime(current, correct):
    def minutes(time):
        hours, minute = map(int, time.split(':'))
        return 60 * hours + minute
    remaining, operations = minutes(correct) - minutes(current), 0
    for increment in (60, 15, 5, 1):
        count, remaining = divmod(remaining, increment)
        operations += count  # step: take
    return operations  # step: return`,
2225:`def findWinners(matches):
    losses = {}
    for winner, loser in matches:
        losses.setdefault(winner, 0)
        losses[loser] = losses.get(loser, 0) + 1  # step: match
    return [sorted(player for player, loss in losses.items() if loss == count) for count in (0, 1)]  # step: return`,
2226:`def maximumCandies(candies, k):
    low, high = 0, max(candies)
    while low < high:
        portion = (low + high + 1) // 2
        children = sum(pile // portion for pile in candies)
        if children >= k:
            low = portion
        else:
            high = portion - 1
        # step: bound
    return low  # step: return`,
2227:`class Encrypter:
    def __init__(self, keys, values, dictionary):
        self.codes = dict(zip(keys, values))
        self.counts = {}
        for word in dictionary:
            encoded = self.encrypt(word)
            if encoded:
                self.counts[encoded] = self.counts.get(encoded, 0) + 1
        # step: dictionary

    def encrypt(self, word):
        result = []
        for letter in word:
            if letter not in self.codes:
                return ''
            result.append(self.codes[letter])
        return ''.join(result)  # step: encrypt

    def decrypt(self, word):
        return self.counts.get(word, 0)  # step: decrypt

def runEncrypter(keys, values, dictionary, operations):
    encrypter = Encrypter(keys, values, dictionary)
    answer = []
    for operation, text in operations:
        answer.append(getattr(encrypter, operation)(text))
    return answer  # step: return`,
2229:`def isConsecutive(nums):
    seen = set()
    minimum, maximum = float('inf'), float('-inf')
    for value in nums:
        seen.add(value)
        minimum, maximum = min(minimum, value), max(maximum, value)  # step: scan
    return len(seen) == len(nums) and maximum - minimum == len(nums) - 1  # step: return`,
};
const cases={
2223:[['Repeated prefix blocks reuse and extend a Z interval',{s:'abacababacabaeabacaba'}],['Every suffix of a repeated letter matches the prefix',{s:'aaaaaaaaa'}],['Distinct letters leave only the whole-string score',{s:'abcdefghijk'}],['A singleton scores one',{s:'q'}]],
2224:[['A longer clock difference uses several allowed increments',{current:'08:17',correct:'13:59'}],['Equal times need no operation',{current:'16:42',correct:'16:42'}],['A difference below five uses one-minute steps',{current:'09:10',correct:'09:14'}],['A nearly full day still uses the same four denominations',{current:'00:03',correct:'23:58'}]],
2225:[['Players accumulate wins and several different loss totals',{matches:[[11,23],[11,34],[23,45],[56,34],[56,67],[45,67],[78,23],[78,89],[11,89],[90,45]]}],['One match separates an undefeated winner and one-loss player',{matches:[[7,19]]}],['A cycle leaves every player with one loss',{matches:[[2,5],[5,9],[9,2]]}],['A frequently losing player belongs to neither output group',{matches:[[3,12],[6,12],[9,12],[3,15]]}]],
2226:[['Uneven source piles leave unusable remainders',{candies:[17,9,24,13,7,31],k:15}],['More children than total candies forces zero',{candies:[2,4,1],k:12}],['One child can take the largest whole source pile',{candies:[8,19,6,12],k:1}],['Equal piles split into equal portions',{candies:[12,12,12,12],k:12}]],
2227:[['Colliding character codes create multiple dictionary decryptions',{keys:['a','b','c','d'],values:['pq','rs','pq','tu'],dictionary:['ab','cb','ad','cd','da','dc','abc','cba'],operations:[['encrypt','abcd'],['decrypt','pqrs'],['decrypt','tupq'],['encrypt','cba'],['decrypt','pqrspq'],['decrypt','zzzz']]}],['An unmapped character cannot be encrypted',{keys:['m','n'],values:['ab','cd'],dictionary:['mn','nm','mx'],operations:[['encrypt','mx'],['decrypt','abcd'],['encrypt','nm']]}],['Unique codes distinguish reversed words',{keys:['x','y'],values:['lm','no'],dictionary:['xy','yx','xx'],operations:[['decrypt','lmno'],['decrypt','nolm'],['decrypt','lmlm']]}],['A ciphertext absent from the dictionary has zero candidates',{keys:['a'],values:['zz'],dictionary:['a','aa'],operations:[['decrypt','zzzzzz'],['encrypt','aa'],['decrypt','zzzz']]}]],
2229:[['Shuffled values fill one uninterrupted interval',{nums:[17,13,19,15,14,18,16]}],['A duplicate hides a missing interior value',{nums:[4,4,6]}],['Distinct values with an interior gap fail the span test',{nums:[8,9,11,12]}],['One value forms a consecutive singleton interval',{nums:[31]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0)=>Array.isArray(v)&&v.length>=1&&v.length<=80&&v.every(x=>integer(x,min));
  if(id===2223)need(typeof input.s==='string'&&/^[a-z]{1,150}$/.test(input.s),'Use 1-150 lowercase letters.');
  if(id===2224)need([input.current,input.correct].every(t=>typeof t==='string'&&/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(t))&&input.current<=input.correct,'Use valid HH:MM times on the same day with current no later than correct.');
  if(id===2225)need(Array.isArray(input.matches)&&input.matches.length>=1&&input.matches.length<=80&&input.matches.every(m=>Array.isArray(m)&&m.length===2&&m.every(v=>integer(v,1))&&m[0]!==m[1]),'Use 1-80 [winner,loser] matches with different positive player IDs.');
  if(id===2226)need(vector(input.candies,1)&&integer(input.k,1,1000000000000),'Use 1-80 positive candy piles and 1-1000000000000 children.');
  if(id===2227){need(Array.isArray(input.keys)&&input.keys.length>=1&&input.keys.length<=26&&input.keys.every(c=>typeof c==='string'&&/^[a-z]$/.test(c))&&new Set(input.keys).size===input.keys.length&&Array.isArray(input.values)&&input.values.length===input.keys.length&&input.values.every(v=>typeof v==='string'&&/^[a-z]{2}$/.test(v)),'Use unique lowercase keys and one two-letter code per key.');need(Array.isArray(input.dictionary)&&input.dictionary.length>=1&&input.dictionary.length<=50&&input.dictionary.every(w=>typeof w==='string'&&/^[a-z]{1,30}$/.test(w))&&new Set(input.dictionary).size===input.dictionary.length,'Use 1-50 distinct lowercase dictionary words of length at most thirty.');need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=50&&input.operations.every(op=>Array.isArray(op)&&op.length===2&&['encrypt','decrypt'].includes(op[0])&&typeof op[1]==='string'&&/^[a-z]{1,60}$/.test(op[1])),'Use 1-50 encrypt/decrypt operations with lowercase text of length 1-60.');}
  if(id===2229)need(vector(input.nums,0),'Use 1-80 nonnegative integer values.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2223:{suffix:4},2224:{take:4},2225:{match:2},2226:{bound:4},2227:{dictionary:2,encrypt:3,decrypt:4},2229:{scan:2}},tags:{2223:['String','Z Algorithm'],2224:['Greedy'],2225:['Counting'],2226:['Binary Search'],2227:['Design','Hash Table'],2229:['Hash Table']}};
