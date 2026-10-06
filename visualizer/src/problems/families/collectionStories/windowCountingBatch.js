const specs={
795:['nums left right','Count contiguous subarrays whose maximum lies within the inclusive bounds.','For each ending index, remember the latest value above the upper bound and the latest value inside the allowed range. Valid starts lie after the bad value and no later than the in-range value.','start last invalid and last in-range positions before the array|update the invalid position for values above right|update the in-range position for values between left and right|add the number of valid starts for this ending index|return the subarray count','O(n) time and O(1) auxiliary space.'],
992:['nums k','Count subarrays containing exactly k distinct values.','Count windows with at most k distinct values, then subtract windows with at most k-1. Each at-most pass shrinks a frequency window only when its distinct count exceeds the limit.','count subarrays with at most k distinct values|extend the right endpoint and update frequencies|shrink the left endpoint until the distinct limit holds|add every valid suffix ending at the current right endpoint|subtract the at-most k minus one count','O(n) expected time and O(distinct values) space.'],
1234:['s','Find the shortest substring whose replacement makes Q W E and R equally frequent.','Track counts outside a candidate replacement window. The window is sufficient once every outside count is at most one quarter of the total length; its replacement can supply all missing characters.','count every character outside an initially empty window|expand the replacement window and remove its new character from outside counts|while all outside counts fit their quota record the window length|shrink the left endpoint to search for a shorter sufficient window|return the minimum replacement length','O(n) time and O(1) four-character state.'],
1297:['s maxLetters minSize maxSize','Find the greatest frequency of an allowed repeated substring.','Only minSize needs counting: any longer valid substring has a valid minSize prefix appearing at least as often. Slide a fixed-length frequency window, counting text keys only when their distinct-letter count fits the limit.','use a fixed window of length minSize|update letter frequencies as the window slides|ignore windows with too many distinct letters|count each allowed substring text and update the maximum frequency|return the largest frequency','O(n*minSize) time for substring keys and O(n*minSize) stored-key space.'],
1358:['s','Count substrings containing at least one a one b and one c.','Keep the most recent index of each required character. At a given ending index, every start at or before the smallest of those last positions includes all three.','initialize last positions of a b and c to minus one|read each ending character|update its latest position|add one plus the smallest latest position|return the total qualifying substrings','O(n) time and O(1) space.'],
1371:['s','Find the longest substring in which each vowel occurs an even number of times.','A five-bit prefix mask records vowel-count parity. Equal masks at two prefix boundaries mean every vowel changed an even number of times between them; keep each mask earliest index for maximum length.','record the zero parity mask before the string|toggle the bit for each encountered vowel|look up the earliest occurrence of the resulting mask|maximize the distance or store a newly seen mask|return the longest even-vowel substring length','O(n) time and O(32) parity state.'],
1542:['s','Find the longest digit substring that can be rearranged into a palindrome.','A palindrome permutation has at most one odd count. Two prefix masks therefore may be identical or differ in one digit bit; compare each current mask against the earliest occurrence of those eleven possibilities.','record an empty ten-bit digit parity mask|toggle the current digit bit|look up equal and one-bit-different earlier masks|maximize the boundary distance and retain earliest mask positions|return the longest qualifying substring length','O(10*n) time and O(1024) parity state.'],
2302:['nums k','Count subarrays whose sum multiplied by length is strictly below k.','All values are positive, so extending a window cannot reduce its score. Shrink from the left until the score is below k; every suffix of that valid window also qualifies.','extend a positive-sum window to each right endpoint|compute window sum times length|shrink while the score is at least k|add the number of valid suffixes ending here|return the count','O(n) time and O(1) auxiliary space.'],
2348:['nums','Count all contiguous subarrays made entirely of zeros.','A zero run of current length k contributes k new zero-only subarrays ending here. A nonzero value resets the run, separating independent contributions.','start the current zero run length at zero|extend it on a zero|reset it on any nonzero value|add the run length for every ending index|return the total zero-filled subarrays','O(n) time and O(1) space.'],
2393:['nums','Count strictly increasing contiguous subarrays including single elements.','Track the increasing run ending at each index. Extend it only for a strict rise; equal or smaller values start a new length-one run. Every suffix of the current run is an increasing subarray.','start a new run at the first value|extend the run when the current value exceeds the previous value|otherwise reset its length to one|add the run length for this ending index|return the total increasing subarrays','O(n) time and O(1) space.'],
};
const solvers={
795({nums,left,right},emit){let bad=-1,good=-1,answer=0;for(let i=0;i<nums.length;i++){if(nums[i]>right)bad=i;if(nums[i]>=left&&nums[i]<=right)good=i;const added=Math.max(0,good-bad);answer+=added;emit('A valid start must avoid the latest too-large value and still include a value inside the allowed maximum range.',{sequence:nums,index:i,window:added?[bad+1,i]:null,codeStage:'count',metrics:{lastTooLarge:bad,lastInRange:good,newSubarrays:added,total:answer}},'update');}return answer;},
992({nums,k},emit){function atMost(limit){const counts=new Map();let left=0,total=0;for(let right=0;right<nums.length;right++){counts.set(nums[right],(counts.get(nums[right])||0)+1);while(counts.size>limit){const value=nums[left++],count=counts.get(value)-1;if(count)counts.set(value,count);else counts.delete(value);}const added=right-left+1;total+=added;emit('After shrinking to this distinct-value limit, every suffix ending at the current right endpoint qualifies for the at-most count.',{sequence:nums,index:right,window:[left,right],table:[...counts],tableHeaders:['Value','Window occurrences'],codeStage:'window',metrics:{distinctLimit:limit,left,right,newSubarrays:added,atMostTotal:total}},'update');}return total;}return atMost(k)-atMost(k-1);},
1234({s},emit){const counts={Q:0,W:0,E:0,R:0},quota=s.length/4;for(const c of s)counts[c]++;if(Object.values(counts).every(v=>v===quota))return 0;let left=0,best=s.length;for(let right=0;right<s.length;right++){counts[s[right]]--;while(Object.values(counts).every(v=>v<=quota)){best=Math.min(best,right-left+1);emit('Every outside character count is at most its final quota. Replacing this window can fill the missing counts, so try shrinking it.',{sequence:s.split(''),index:right,window:[left,right],table:Object.entries(counts).map(([c,count])=>[c,count,quota]),tableHeaders:['Character','Outside window','Target quota'],codeStage:'shrink',metrics:{left,right,windowLength:right-left+1,best}},'update');counts[s[left++]]++;}}return best;},
1297({s,maxLetters,minSize,maxSize},emit){const letters=new Map(),occurrences=new Map();let best=0;for(let right=0;right<s.length;right++){letters.set(s[right],(letters.get(s[right])||0)+1);if(right>=minSize){const c=s[right-minSize],count=letters.get(c)-1;if(count)letters.set(c,count);else letters.delete(c);}if(right+1<minSize)continue;const left=right-minSize+1,text=s.slice(left,right+1),allowed=letters.size<=maxLetters;if(allowed){occurrences.set(text,(occurrences.get(text)||0)+1);best=Math.max(best,occurrences.get(text));}emit(allowed?'This minimum-length text fits the distinct-letter limit. Count this occurrence, including overlapping occurrences.':'This window has too many distinct letters and is excluded from the frequency table.',{sequence:s.split(''),index:right,window:[left,right],table:[...occurrences],tableHeaders:['Allowed substring','Occurrences'],codeStage:'count',metrics:{distinct:letters.size,maxLetters,minSize,maxSize,allowed,best}},'update');}return best;},
1358({s},emit){const last={a:-1,b:-1,c:-1};let answer=0;for(let i=0;i<s.length;i++){last[s[i]]=i;const added=Math.min(...Object.values(last))+1;answer+=added;emit('Every start from zero through the earliest of the three latest positions includes all required characters. A missing character contributes zero starts.',{sequence:s.split(''),index:i,table:Object.entries(last),tableHeaders:['Character','Latest index'],codeStage:'count',metrics:{newSubstrings:added,total:answer}},'update');}return answer;},
1371({s},emit){const vowels='aeiou',first=new Map([[0,-1]]);let mask=0,best=0;for(let i=0;i<s.length;i++){const bit=vowels.indexOf(s[i]);if(bit>=0)mask^=1<<bit;if(first.has(mask))best=Math.max(best,i-first.get(mask));else first.set(mask,i);emit('Matching prefix parity masks mean each vowel occurs an even number of times between those boundaries. Keep the earliest boundary for the longest span.',{sequence:s.split(''),index:i,window:[first.get(mask)+1,i],table:[...first].map(([m,position])=>[m.toString(2).padStart(5,'0'),position]),tableHeaders:['Vowel parity mask','Earliest prefix endpoint'],codeStage:'parity',metrics:{mask:mask.toString(2).padStart(5,'0'),best}},'update');}return best;},
1542({s},emit){const first=new Map([[0,-1]]);let mask=0,best=0;for(let i=0;i<s.length;i++){mask^=1<<Number(s[i]);let start=i+1;for(const candidate of [mask,...Array.from({length:10},(_,digit)=>mask^(1<<digit))])if(first.has(candidate))start=Math.min(start,first.get(candidate)+1);best=Math.max(best,i-start+1);if(!first.has(mask))first.set(mask,i);emit('An equal earlier mask leaves all digit counts even; a one-bit difference leaves exactly one odd count. Either pattern can be rearranged into a palindrome.',{sequence:s.split(''),index:i,window:[start,i],table:[...first].map(([m,position])=>[m.toString(2).padStart(10,'0'),position]),tableHeaders:['Digit parity mask','Earliest prefix endpoint'],codeStage:'parity',metrics:{mask:mask.toString(2).padStart(10,'0'),best}},'update');}return best;},
2302({nums,k},emit){let left=0,sum=0,answer=0;for(let right=0;right<nums.length;right++){sum+=nums[right];while(left<=right&&sum*(right-left+1)>=k)sum-=nums[left++];const added=right-left+1;answer+=added;emit('After removing any too-expensive prefix, this positive-value window and all its suffixes have score strictly below the threshold.',{sequence:nums,index:right,window:[left,right],codeStage:'window',metrics:{sum,length:added,score:sum*added,threshold:k,newSubarrays:added,total:answer}},'update');}return answer;},
2348({nums},emit){let run=0,answer=0;for(let i=0;i<nums.length;i++){run=nums[i]===0?run+1:0;answer+=run;emit('Each zero extends the run and creates one new zero-only subarray for every possible start within that run. Nonzero values reset the contribution.',{sequence:nums,index:i,window:run?[i-run+1,i]:null,codeStage:'run',metrics:{zeroRun:run,newSubarrays:run,total:answer}},'update');}return answer;},
2393({nums},emit){let run=0,answer=0;for(let i=0;i<nums.length;i++){run=i>0&&nums[i]>nums[i-1]?run+1:1;answer+=run;emit('Every suffix of the current strictly increasing run qualifies. Equal neighbors break the run just like a decrease.',{sequence:nums,index:i,window:[i-run+1,i],codeStage:'run',metrics:{increasingRun:run,newSubarrays:run,total:answer}},'update');}return answer;},
};
const python={
795:`def numSubarrayBoundedMax(nums, left, right):
    bad, good, answer = -1, -1, 0
    for index, value in enumerate(nums):
        if value > right:
            bad = index
        if left <= value <= right:
            good = index
        answer += max(0, good - bad)  # step: count
    return answer  # step: return`,
992:`def subarraysWithKDistinct(nums, k):
    def at_most(limit):
        counts, left, total = {}, 0, 0
        for right, value in enumerate(nums):
            counts[value] = counts.get(value, 0) + 1
            while len(counts) > limit:
                old = nums[left]
                counts[old] -= 1
                if counts[old] == 0:
                    del counts[old]
                left += 1
            total += right - left + 1  # step: window
        return total
    return at_most(k) - at_most(k - 1)  # step: return`,
1234:`def balancedString(s):
    counts = {character: s.count(character) for character in 'QWER'}
    quota = len(s) // 4
    if all(count == quota for count in counts.values()):
        return 0  # step: balanced
    left, best = 0, len(s)
    for right, character in enumerate(s):
        counts[character] -= 1
        while all(count <= quota for count in counts.values()):
            best = min(best, right - left + 1)  # step: shrink
            counts[s[left]] += 1
            left += 1
    return best  # step: return`,
1297:`def maxFreq(s, maxLetters, minSize, maxSize):
    letters, occurrences, best = {}, {}, 0
    for right, character in enumerate(s):
        letters[character] = letters.get(character, 0) + 1
        if right >= minSize:
            old = s[right - minSize]
            letters[old] -= 1
            if letters[old] == 0:
                del letters[old]
        if right + 1 >= minSize and len(letters) <= maxLetters:
            text = s[right - minSize + 1:right + 1]
            occurrences[text] = occurrences.get(text, 0) + 1  # step: count
            best = max(best, occurrences[text])
    return best  # step: return`,
1358:`def numberOfSubstrings(s):
    last, answer = {'a': -1, 'b': -1, 'c': -1}, 0
    for index, character in enumerate(s):
        last[character] = index
        answer += min(last.values()) + 1  # step: count
    return answer  # step: return`,
1371:`def findTheLongestSubstring(s):
    vowels, first, mask, best = 'aeiou', {0: -1}, 0, 0
    for index, character in enumerate(s):
        if character in vowels:
            mask ^= 1 << vowels.index(character)
        if mask in first:
            best = max(best, index - first[mask])  # step: parity
        else:
            first[mask] = index
    return best  # step: return`,
1542:`def longestAwesome(s):
    first, mask, best = {0: -1}, 0, 0
    for index, character in enumerate(s):
        mask ^= 1 << int(character)
        for candidate in [mask] + [mask ^ (1 << digit) for digit in range(10)]:
            if candidate in first:
                best = max(best, index - first[candidate])  # step: parity
        first.setdefault(mask, index)
    return best  # step: return`,
2302:`def countSubarrays(nums, k):
    left, total, answer = 0, 0, 0
    for right, value in enumerate(nums):
        total += value
        while left <= right and total * (right - left + 1) >= k:
            total -= nums[left]
            left += 1
        answer += right - left + 1  # step: window
    return answer  # step: return`,
2348:`def zeroFilledSubarray(nums):
    run, answer = 0, 0
    for value in nums:
        run = run + 1 if value == 0 else 0
        answer += run  # step: run
    return answer  # step: return`,
2393:`def countSubarrays(nums):
    run, answer = 0, 0
    for index, value in enumerate(nums):
        run = run + 1 if index > 0 and value > nums[index - 1] else 1
        answer += run  # step: run
    return answer  # step: return`,
};
const cases={
795:[['Allowed maxima and oversized barriers split valid start ranges',{nums:[1,4,2,6,3,8,2,5,1,7,4,2],left:3,right:6}],['Values below the lower bound never qualify alone',{nums:[1,2,1,0],left:3,right:5}],['A single allowed value extends across small neighbors',{nums:[1,1,4,1,1],left:4,right:4}],['Every value above the upper bound yields zero',{nums:[9,8,10],left:2,right:6}]],
992:[['Repeated values cause several window expansions and contractions',{nums:[3,1,3,2,1,4,2,4,3,1,2],k:3}],['Exactly one distinct value counts repeated-value runs',{nums:[5,5,2,2,2,5],k:1}],['Too many requested distinct values gives zero',{nums:[2,3,2,3],k:5}],['A singleton can satisfy k one',{nums:[7],k:1}]],
1234:[['Several excess character types compete for a short replacement',{s:'QQQQWWWWEERRQQER'}],['An already balanced string needs no replacement',{s:'QWERREWQ'}],['One repeated character needs three quarters replaced',{s:'QQQQQQQQ'}],['A tiny replacement can repair one surplus and deficit',{s:'QWERRQWQ'}]],
1297:[['Overlapping repeated text competes under the distinct-letter cap',{s:'cabacabcabacabcaba',maxLetters:3,minSize:4,maxSize:7}],['Repeated letters produce overlapping counted windows',{s:'zzzzzzzzz',maxLetters:1,minSize:3,maxSize:6}],['Every candidate violates the distinct-letter limit',{s:'abcdefg',maxLetters:1,minSize:2,maxSize:4}],['The entire string can be the only allowed window',{s:'orbit',maxLetters:5,minSize:5,maxSize:5}]],
1358:[['Uneven character runs change the earliest valid start boundary',{s:'aaacbbacccababbc'}],['Missing one required character yields no valid substring',{s:'aabbaabb'}],['The minimal three-character coverage contributes one',{s:'cab'}],['Repeated complete cycles produce many overlapping substrings',{s:'bcabcabca'}]],
1371:[['Vowel parity revisits states across a longer authored phrase',{s:'quietbluebirdsroamunderstars'}],['No vowels means the entire string qualifies',{s:'rhythms'}],['Every vowel paired allows the full string',{s:'aaeeiioouu'}],['A single vowel has no nonempty even-count substring',{s:'a'}]],
1542:[['Equal and one-bit-different parity states both extend candidates',{s:'7182271455449019'}],['Distinct digits allow only one-character palindromes',{s:'1234567890'}],['The full string can be rearranged with one odd-count digit',{s:'558877955'}],['One digit always qualifies',{s:'6'}]],
2302:[['Positive values force repeated shrinking near the score limit',{nums:[3,1,4,2,6,1,5,2,3],k:35}],['Equality with the threshold is excluded',{nums:[4],k:4}],['A low threshold can reject every singleton',{nums:[5,6,7],k:2}],['A large threshold admits every subarray',{nums:[1,2,1,3],k:100}]],
2348:[['Several zero runs are separated by positive and negative values',{nums:[0,0,4,0,-3,0,0,0,0,7,0,0]}],['An all-zero array follows the triangular count',{nums:[0,0,0,0,0]}],['Without zeros the answer is zero',{nums:[2,-1,5,8]}],['One zero contributes one subarray',{nums:[0]}]],
2393:[['Strict rises flat steps and decreases form different runs',{nums:[2,5,8,8,9,3,4,7,10,1,6]}],['A fully increasing array contributes all subarrays',{nums:[-4,-1,2,6,11]}],['Equal values allow only singletons',{nums:[7,7,7,7]}],['A descending array also allows only singletons',{nums:[9,6,3,1]}]],
};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;if([795,992,2302,2348,2393].includes(id)){need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=120&&input.nums.every(v=>integer(v,id===992||id===2302?1:id===795?0:-10000,10000)),'Use 1-120 bounded integers, positive for distinct and score windows.');if(id===795)need(integer(input.left,0,10000)&&integer(input.right,input.left,10000),'Use ordered nonnegative maximum bounds.');if(id===992)need(integer(input.k,1,120),'k must be from one to 120.');if(id===2302)need(Number.isSafeInteger(input.k)&&input.k>=1&&input.k<=1000000000000,'k must be a positive integer no greater than one trillion.');}else{need(typeof input.s==='string'&&input.s.length>=1&&input.s.length<=160,'Use a string of 1-160 characters.');const pattern=id===1234?/^[QWER]+$/:id===1542?/^[0-9]+$/:id===1358?/^[abc]+$/:/^[a-z]+$/;need(pattern.test(input.s),'Use the character alphabet required by this problem.');if(id===1234)need(input.s.length%4===0,'The QWER string length must be divisible by four.');if(id===1297)need(integer(input.maxLetters,1,26)&&integer(input.minSize,1,input.s.length)&&integer(input.maxSize,input.minSize,input.s.length),'Use maxLetters 1-26 and 1 <= minSize <= maxSize <= text length.');}return input;}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===1234&&result===0?'balanced':'return',pseudocodeStages:{795:{count:4},992:{window:4},1234:{balanced:1,shrink:3},1297:{count:4},1358:{count:4},1371:{parity:4},1542:{parity:4},2302:{window:4},2348:{run:4},2393:{run:4}},tags:Object.fromEntries(Object.keys(specs).map(id=>[id,['1371','1542'].includes(id)?['Prefix Sum','Bit Manipulation']:['Sliding Window']]))};
