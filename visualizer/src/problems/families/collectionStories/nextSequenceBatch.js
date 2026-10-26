// Independently authored algorithms, teaching checkpoints, and bounded inputs.
export const nextSequenceSpecs = {
  1903: ['num','Keep the largest odd-valued substring of a decimal number.','An odd number must end in an odd digit. The rightmost odd digit allows the longest prefix, which dominates every shorter candidate.','start at the final digit|move left across even digits|inspect whether this digit is odd|stop at the rightmost odd digit|return the prefix or an empty string','O(n) time; O(n) returned string.'],
  1909: ['nums','Decide whether deleting exactly one element can leave a strictly increasing array.','At the first non-increasing pair, remove the larger predecessor if the earlier prefix permits it; otherwise remove the current value. A second conflict exhausts the deletion budget.','retain the first value|scan subsequent values|detect a non-increasing pair|spend one deletion and retain a compatible predecessor|return whether at most one deletion was needed','O(n) time; O(1) auxiliary state.'],
  1910: ['s part','Repeatedly erase the leftmost occurrence of part.','Build a surviving-character stack. Whenever its suffix becomes part, erase that suffix immediately, allowing future characters to expose new matches.','start an empty character stack|append each incoming character|compare the stack suffix with part|erase a matching suffix immediately|return surviving characters','O(n*m) time for suffix comparison; O(n) space.'],
  1911: ['nums','Maximize the alternating sum of a subsequence.','Maintain the best sums with an even or odd number of selected elements. Read both previous states before deciding whether to skip, add, or subtract the next value.','even = 0; odd = negative infinity|scan the next value|read both previous parity states|update odd by adding and even by subtracting|return the best nonempty alternating sum','O(n) time; O(1) auxiliary state.'],
  1913: ['nums','Maximize the difference between two products using four distinct positions.','Sort the positive values. The two largest maximize the first product; the two smallest minimize the second, using disjoint positions even when values repeat.','sort a copy of the values|identify the two smallest positions|identify the two largest positions|subtract the smallest product from the largest|return the product difference','O(n log n) time; O(n) copied storage.'],
  1920: ['nums','Compose a permutation with itself.','For each output position, first read the input value as an address, then read the value at that address. Keep the original permutation intact while writing the result.','allocate a result array|visit each output position i|read address = nums[i]|append nums[address] to the result|return the composed permutation','O(n) time and output space.'],
  1921: ['dist speed','Eliminate as many approaching monsters as possible before any arrives.','Sort integer arrival deadlines. The weapon fires at minutes 0,1,2,...; a monster whose deadline is at or before its firing minute has already arrived.','compute ceil(distance/speed) deadlines|sort deadlines from earliest to latest|compare firing minute with deadline|eliminate if minute is strictly before arrival|return the number eliminated before a breach','O(n log n) time; O(n) space.'],
  1922: ['n','Count length-n digit strings with even digits at even indices and prime digits at odd indices.','There are five even choices and four prime choices. Compute their powers modulo 1000000007 by repeatedly squaring, so huge lengths need only logarithmic work.','split indices into ceil(n/2) even and floor(n/2) odd positions|start modular powers with bases 5 and 4|read the lowest exponent bit|multiply when set then square and halve the exponent|return the product modulo 1000000007','O(log n) time; O(1) auxiliary state.'],
  1925: ['n','Count ordered positive integer triples satisfying a squared plus b squared equals c squared.','Enumerate each unordered pair of distinct legs once. A perfect-square sum within the bound contributes both leg orders; equal positive legs cannot have an integer hypotenuse.','start count at zero|enumerate legs a less than b|compute the integer square root of a squared plus b squared|add two when the root is exact and at most n|return ordered triple count','O(n^2) time; O(1) counting state.'],
  1929: ['nums','Build two consecutive copies of an array.','Each source position fills one position in the first half and the matching position in the second half. No source values are overwritten.','allocate twice the input length|visit each source position|read the original value|write at i and i plus input length|return the concatenation','O(n) time and output space.'],
  1930: ['s','Count distinct palindromic subsequences of length three.','For each possible outer letter, its first and last occurrence enclose every possible middle letter. Each distinct middle letter gives one unique palindrome.','initialize count to zero|consider each lowercase outer letter|find its first and last occurrence|count distinct letters strictly between them|return the sum of unique palindrome counts','O(26*n) time; O(26) working set.'],
  1935: ['text brokenLetters','Count words that can be typed without a broken key.','A word is usable only if every letter avoids the broken-key set. Repeated letters and repeated words each obey the same membership rule.','put broken letters in a set|split text into words|inspect letters for broken-key membership|count words with no blocked letter|return the number of typeable words','O(text length) time; O(text length) split storage.'],
};

export const nextSequenceSolvers = {
  1925({n},emit) {
    let count=0;
    for(let a=1;a<=n;a++)for(let b=a+1;b<=n;b++) {
      const square=a*a+b*b,c=Math.floor(Math.sqrt(square)),match=c<=n&&c*c===square;
      if(match)count+=2;
      emit(match?'This pair has an exact integer hypotenuse within the bound. Swapping unequal legs supplies a second ordered triple.':'The squared sum has no allowed integer hypotenuse, so this pair contributes nothing.',{sequence:[a,b,c],codeStage:'update',metrics:{a,b,square,c,match,count}},'update');
    }
    return count;
  },
  1929({nums},emit) {
    const result=Array(nums.length*2).fill(null);
    for(let i=0;i<nums.length;i++) {
      result[i]=result[i+nums.length]=nums[i];
      emit('Copy one original value into matching positions in both halves. The two writes establish the concatenation invariant for this source index.',{index:i,output:[...result],outputIndex:i+nums.length,codeStage:'update',metrics:{first:i,second:i+nums.length,value:nums[i]}},'update');
    }
    return result;
  },
  1930({s},emit) {
    let count=0;
    for(const outer of [...new Set(s)].sort()) {
      const left=s.indexOf(outer),right=s.lastIndexOf(outer),middle=new Set(left<right?s.slice(left+1,right):'');
      count+=middle.size;
      emit('The widest pair of this outer letter encloses every possible middle choice. Count each middle letter once, regardless of how many index triples spell the same palindrome.',{index:left,marks:{[left]:'first',[right]:'last'},output:[...middle].map(c=>outer+c+outer),codeStage:'update',metrics:{outer,left,right,newPalindromes:middle.size,count}},'update');
    }
    return count;
  },
  1935({text,brokenLetters},emit) {
    const words=text.split(' '),broken=new Set(brokenLetters);let count=0;
    for(let i=0;i<words.length;i++) {
      const blocked=[...new Set([...words[i]].filter(c=>broken.has(c)))];
      if(!blocked.length)count++;
      emit(blocked.length?'At least one required key is broken, so this word cannot be typed.':'Every required letter is available, so this word contributes one to the answer.',{sequence:words,index:i,codeStage:'update',metrics:{blocked:blocked.join('')||'none',count}},'update');
    }
    return count;
  },
  1903({num},emit) {
    let end=-1;
    for(let i=num.length-1;i>=0;i--) {
      const odd=Number(num[i])%2===1;
      emit(odd?'This is the rightmost odd digit. Keeping every preceding digit gives the largest possible odd substring.':'An even final digit cannot end an odd number, so discard this suffix position.',{index:i,codeStage:'inspect',metrics:{digit:num[i],odd,candidate:odd?num.slice(0,i+1):''}});
      if(odd){end=i;break;}
    }
    return num.slice(0,end+1);
  },
  1909({nums},emit) {
    let previous=nums[0],before=-Infinity,removed=0;
    for(let i=1;i<nums.length;i++) {
      let action='keep current';
      if(nums[i]<=previous) {
        removed++;
        if(nums[i]>before){previous=nums[i];action='remove predecessor';}
        else action='remove current';
      } else {before=previous;previous=nums[i];}
      emit('The retained prefix must remain strictly increasing. Choose the deletion that keeps a valid, small tail; more than one conflict cannot be repaired with one deletion.',{index:i,codeStage:'update',metrics:{before:Number.isFinite(before)?before:'none',previous,removed,action}},'update');
      if(removed>1)break;
    }
    return removed<=1;
  },
  1910({s,part},emit) {
    const stack=[];
    for(let i=0;i<s.length;i++) {
      stack.push(s[i]);
      const matched=stack.slice(-part.length).join('')===part;
      if(matched)stack.splice(-part.length);
      emit(matched?'Erase the newly completed suffix. The surviving prefix can combine with later characters to make another match.':'Keep this character because the surviving suffix is not a complete match yet.',{index:i,output:[...stack],codeStage:'update',metrics:{part,matched,survivors:stack.join('')}},'update');
    }
    return stack.join('');
  },
  1911({nums},emit) {
    let even=0,odd=-Infinity;
    for(let i=0;i<nums.length;i++) {
      const oldEven=even,oldOdd=odd;
      even=Math.max(oldEven,oldOdd-nums[i]);odd=Math.max(oldOdd,oldEven+nums[i]);
      emit('Skip preserves a state. Selecting this value adds after an even-length subsequence or subtracts after an odd-length one. Both transitions use the old states.',{index:i,codeStage:'update',table:[['Even selected',oldEven,even],['Odd selected',Number.isFinite(oldOdd)?oldOdd:'unreachable',odd]],tableHeaders:['Parity','Before','After'],metrics:{value:nums[i]}},'update');
    }
    return odd;
  },
  1913({nums},emit) {
    const sorted=[...nums].sort((a,b)=>a-b),n=sorted.length;
    const small=sorted[0]*sorted[1],large=sorted[n-2]*sorted[n-1];
    emit('Four separate sorted positions supply the two products. Repeated values are allowed because the positions, rather than their values, must differ.',{sequence:sorted,marks:{0:'small',1:'small',[n-2]:'large',[n-1]:'large'},codeStage:'update',metrics:{small,large,difference:large-small}},'update');
    return large-small;
  },
  1920({nums},emit) {
    const result=[];
    for(let i=0;i<nums.length;i++) {
      result.push(nums[nums[i]]);
      emit('Use the first lookup as an address for the second lookup. Append to a separate output so later reads still see the original permutation.',{index:i,marks:{[nums[i]]:'read address'},output:[...result],codeStage:'update',metrics:{position:i,address:nums[i],value:nums[nums[i]]}},'update');
    }
    return result;
  },
  1921({dist,speed},emit) {
    const deadlines=dist.map((d,i)=>({id:i,deadline:Math.ceil(d/speed[i])})).sort((a,b)=>a.deadline-b.deadline);
    let eliminated=0;
    for(let minute=0;minute<deadlines.length;minute++) {
      const target=deadlines[minute],breach=minute>=target.deadline;
      emit(breach?'Arrival happens before a shot at this minute can save the city. Stop here.':'Shoot the earliest remaining arrival. Delaying this monster cannot improve a later deadline.',{sequence:deadlines.map(x=>x.deadline),index:minute,table:deadlines.map(x=>[x.id,dist[x.id],speed[x.id],x.deadline]),tableHeaders:['Monster','Distance','Speed','Arrival deadline'],codeStage:'inspect',metrics:{minute,breach,eliminated}});
      if(breach)break;
      eliminated++;
    }
    return eliminated;
  },
  1922({n},emit) {
    const mod=1000000007n;
    function power(base,exponent,label) {
      let result=1n;
      while(exponent>0n) {
        const bit=exponent&1n,oldExponent=exponent,oldBase=base;
        if(bit)result=result*base%mod;
        base=base*base%mod;exponent>>=1n;
        emit('A set exponent bit contributes the current power. Squaring advances to the next binary place without constructing the enormous number of strings.',{sequence:[...oldExponent.toString(2)],codeStage:'update',metrics:{positions:label,exponent:oldExponent.toString(),base:oldBase.toString(),bit:Number(bit),partial:result.toString()}},'update');
      }
      return result;
    }
    const length=BigInt(n);
    return Number(power(5n,(length+1n)/2n,'even indices')*power(4n,length/2n,'odd indices')%mod);
  },
};

export function validateNextSequence(id,input) {
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const vector=(v,min=1)=>Array.isArray(v)&&v.length>=min&&v.length<=60&&v.every(x=>Number.isInteger(x)&&x>=1&&x<=10000);
  if(id===1925)need(Number.isInteger(input.n)&&input.n>=1&&input.n<=35,'Use a bound from 1 to 35 for readable pair enumeration.');
  if(id===1929)need(vector(input.nums),'Use 1-60 positive integer entries no larger than 10000.');
  if(id===1930)need(typeof input.s==='string'&&/^[a-z]{3,120}$/.test(input.s),'Use 3-120 lowercase letters.');
  if(id===1935)need(typeof input.text==='string'&&input.text.length<=180&&/^[a-z]+(?: [a-z]+)*$/.test(input.text)&&typeof input.brokenLetters==='string'&&/^[a-z]{0,26}$/.test(input.brokenLetters)&&new Set(input.brokenLetters).size===input.brokenLetters.length,'Use lowercase words separated by single spaces and distinct lowercase broken letters.');
  if(id===1903)need(typeof input.num==='string'&&/^[1-9][0-9]{0,119}$/.test(input.num),'Use 1-120 decimal digits without a leading zero.');
  if([1909,1911,1913].includes(id))need(vector(input.nums,id===1909?2:id===1913?4:1),'Use positive integer values up to 10000, at most 60 entries, and the required minimum length.');
  if(id===1910)need(typeof input.s==='string'&&/^[a-z]{1,120}$/.test(input.s)&&typeof input.part==='string'&&/^[a-z]{1,120}$/.test(input.part)&&input.part.length<=input.s.length,'Use lowercase strings, with part no longer than s, and at most 120 characters.');
  if(id===1920)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=60&&new Set(input.nums).size===input.nums.length&&input.nums.every(x=>Number.isInteger(x)&&x>=0&&x<input.nums.length),'Use a permutation of 0 through n-1, with 1-60 entries.');
  if(id===1921)need(vector(input.dist)&&vector(input.speed)&&input.dist.length===input.speed.length,'Use equally sized positive distance and speed arrays, with at most 60 entries.');
  if(id===1922)need(Number.isSafeInteger(input.n)&&input.n>=1&&input.n<=1000000000000000,'Use an integer length from 1 through 10^15.');
  return input;
}

export const nextSequencePython = {
1925:`def countTriples(n):
    from math import isqrt
    count = 0
    for a in range(1, n + 1):
        for b in range(a + 1, n + 1):
            square = a * a + b * b
            c = isqrt(square)
            if c <= n and c * c == square:
                count += 2
            # step: update
    return count  # step: return`,
1929:`def getConcatenation(nums):
    n = len(nums)
    result = [None] * (2 * n)
    for i, value in enumerate(nums):
        result[i] = result[i + n] = value  # step: update
    return result  # step: return`,
1930:`def countPalindromicSubsequence(s):
    count = 0
    for outer in sorted(set(s)):
        left, right = s.find(outer), s.rfind(outer)
        middle = set(s[left + 1:right]) if left < right else set()
        count += len(middle)  # step: update
    return count  # step: return`,
1935:`def canBeTypedWords(text, brokenLetters):
    broken = set(brokenLetters)
    count = 0
    for word in text.split(' '):
        blocked = any(letter in broken for letter in word)
        if not blocked:
            count += 1
        # step: update
    return count  # step: return`,
1903:`def largestOddNumber(num):
    end = -1
    for i in range(len(num) - 1, -1, -1):
        odd = int(num[i]) % 2 == 1  # step: inspect
        if odd:
            end = i
            break
    return num[:end + 1]  # step: return`,
1909:`def canBeIncreasing(nums):
    previous, before, removed = nums[0], float('-inf'), 0
    for value in nums[1:]:
        if value <= previous:
            removed += 1
            if value > before:
                previous = value
        else:
            before, previous = previous, value
        # step: update
        if removed > 1:
            break
    return removed <= 1  # step: return`,
1910:`def removeOccurrences(s, part):
    stack = []
    width = len(part)
    for character in s:
        stack.append(character)
        if ''.join(stack[-width:]) == part:
            del stack[-width:]
        # step: update
    return ''.join(stack)  # step: return`,
1911:`def maxAlternatingSum(nums):
    even, odd = 0, float('-inf')
    for value in nums:
        old_even, old_odd = even, odd
        even = max(old_even, old_odd - value)
        odd = max(old_odd, old_even + value)  # step: update
    return odd  # step: return`,
1913:`def maxProductDifference(nums):
    ordered = sorted(nums)
    small = ordered[0] * ordered[1]
    large = ordered[-2] * ordered[-1]  # step: update
    return large - small  # step: return`,
1920:`def buildArray(nums):
    result = []
    for i in range(len(nums)):
        address = nums[i]
        result.append(nums[address])  # step: update
    return result  # step: return`,
1921:`def eliminateMaximum(dist, speed):
    deadlines = sorted((d + s - 1) // s for d, s in zip(dist, speed))
    eliminated = 0
    for minute, deadline in enumerate(deadlines):
        breach = minute >= deadline  # step: inspect
        if breach:
            break
        eliminated += 1
    return eliminated  # step: return`,
1922:`def countGoodNumbers(n):
    modulus = 1_000_000_007
    def power(base, exponent):
        result = 1
        while exponent:
            if exponent & 1:
                result = result * base % modulus
            base = base * base % modulus
            exponent >>= 1  # step: update
        return result
    return power(5, (n + 1) // 2) * power(4, n // 2) % modulus  # step: return`,
};
export const nextSequencePythonStages=Object.fromEntries(Object.entries(nextSequencePython).map(([id,source])=>[id,Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];}))]));

export const nextSequenceCases = {
1925:[['Several primitive and scaled triples fit',{n:26}],['No positive triple fits',{n:4}],['An exact hypotenuse reaches the boundary',{n:13}],['Smallest allowed bound',{n:1}]],
1929:[['A longer mixed sequence repeats in order',{nums:[8,3,14,6,11,2,19,7,5,16]}],['Repeated values retain all positions',{nums:[4,4,9,4,9]}],['One value becomes two entries',{nums:[17]}],['Equal values still double the length',{nums:[6,6,6,6]}]],
1930:[['Many outer letters enclose overlapping middle choices',{s:'cabdacbecafbgahc'}],['Many index triples spell one palindrome',{s:'rrrrrrrr'}],['No outer letter repeats',{s:'abcdefghi'}],['Exactly three positions form a palindrome',{s:'zqz'}]],
1935:[['Several words depend on different broken keys',{text:'silver lantern beside quiet river under maple branches',brokenLetters:'vq'}],['No keys are broken',{text:'morning birds cross open fields',brokenLetters:''}],['Every word needs the same broken key',{text:'amber acacia atlas',brokenLetters:'a'}],['Repeated words count separately',{text:'fern moss fern moss',brokenLetters:'s'}]],
1903:[['Discard a long even suffix',{num:'846239751864280'}],['Every digit is even',{num:'8624804268'}],['The final digit is already odd',{num:'246802468135'}],['One odd digit',{num:'7'}]],
1909:[['A late outlier interrupts a long increasing prefix',{nums:[2,5,8,11,29,14,17,20,23]}],['Remove the current value rather than its predecessor',{nums:[2,7,1,9,12]}],['Two conflicts exhaust the budget',{nums:[4,3,2,8,9]}],['Two equal entries become a singleton',{nums:[6,6]}]],
1910:[['Multiple cascading deletions across a longer stream',{s:'xyxyzzpqxyzxyzrxyzz',part:'xyz'}],['A deletion exposes a new overlapping boundary',{s:'aabcbc',part:'abc'}],['No occurrence exists',{s:'harborlantern',part:'zz'}],['All characters disappear',{s:'kkkkkk',part:'kk'}]],
1911:[['Several peaks and valleys reward skipping',{nums:[8,3,12,4,15,6,18,2,11]}],['Strictly decreasing values',{nums:[19,14,9,5,2]}],['Repeated equal values',{nums:[6,6,6,6,6]}],['One selected value',{nums:[23]}]],
1913:[['Extremes are scattered through the input',{nums:[14,3,19,7,2,17,11,5]}],['Four entries require using every position',{nums:[8,2,13,4]}],['Distinct positions may have identical values',{nums:[9,9,9,9,9]}],['Repeated minimum and maximum values',{nums:[2,16,2,16,7,8]}]],
1920:[['Several cycles compose independently',{nums:[3,5,7,1,6,0,4,2,9,8]}],['Identity permutation',{nums:[0,1,2,3,4]}],['One cycle advances by two positions',{nums:[1,2,3,4,5,0]}],['Singleton permutation',{nums:[0]}]],
1921:[['Mixed speeds produce several tight deadlines',{dist:[15,4,27,10,36,7,48,22],speed:[3,2,3,2,4,1,4,2]}],['Two arrivals compete for the same shot',{dist:[2,3,9],speed:[2,3,1]}],['Arrival exactly at firing time loses',{dist:[2,4,6],speed:[2,2,3]}],['One monster can always be shot immediately',{dist:[1],speed:[100]}]],
1922:[['Binary exponentiation of a long odd length',{n:987654321}],['One even-indexed digit',{n:1}],['Equal counts of even and odd positions',{n:8}],['Largest supported length',{n:1000000000000000}]],
};
