const specs={
2103:['rings','Count rods carrying at least one ring of every color.','Each rod needs only three presence bits. Repeated rings of an already present color leave the mask unchanged; mask seven means all three colors are present.','initialize ten empty rod masks|read each color and rod pair|set that color bit on its rod|count masks containing all three bits|return the number of complete rods','O(n) time; O(1) space for ten rods.'],
2104:['nums','Sum the difference between maximum and minimum over every contiguous subarray.','Count each value contribution as a maximum and as a minimum using monotonic stacks. Opposite strictness on the two sides assigns tied extrema to exactly one occurrence.','compute the sum of subarray maxima with a decreasing stack|pop values when a later value owns their right boundary|multiply each value by its left and right span counts|repeat symmetrically for minima|return maximum contributions minus minimum contributions','O(n) time and O(n) stack space.'],
2105:['plants capacityA capacityB','Water plants from both ends with the fewest required refills.','Each gardener waters the next plant from their own side, refilling only when necessary. If one middle plant remains, the gardener with more water handles it.','start both gardeners with full cans at opposite ends|refill each can only when its next plant cannot be watered|water both plants and move inward|use the larger remaining water amount for a lone middle plant|return total refills','O(n) time; O(1) space.'],
2106:['fruits startPos k','Harvest the most fruit within a travel budget on a number line.','A visited interval can be covered by turning at most once. Its cheapest route is interval width plus the smaller distance from the start to either endpoint; slide a window while this cost exceeds the budget.','extend a window over sorted fruit locations|compute the cheapest route covering its endpoints|discard left endpoints until travel fits the budget|track the largest feasible fruit total|return the maximum harvest','O(n) time; O(1) window state excluding input.'],
2107:['candies k','Keep the most distinct flavors after giving away one contiguous block of k candies.','Maintain frequencies outside the shared block. Moving that block right restores its old left candy and removes its new right candy; the number of positive counts is the remaining variety.','remove the first k candies from retained counts|measure retained distinct flavors|slide the shared block one position right|restore the old left flavor and remove the new right flavor|return the largest retained distinct count','O(n) expected time and O(distinct flavors) space.'],
2108:['words','Return the first palindrome in the input order.','Check symmetric character pairs in each word. Stop at the first mismatch for that word, and stop the entire search only when a word passes every pair.','visit words in their original order|compare characters moving inward from both ends|reject the word at its first mismatch|return the first word whose pairs all match|return an empty string when none qualifies','O(total characters) time; O(1) auxiliary space.'],
2109:['s spaces','Insert spaces before the requested original character indices.','The supplied positions refer to the original string. A separate pointer into those positions avoids shifting later indices as output grows.','scan original characters in order|compare the current index with the next requested insertion|append a space when the indices match|append the original character|return the constructed text','O(n+m) time and O(n+m) output space.'],
2110:['prices','Count periods where each price is exactly one lower than the previous price.','The length of the current smooth-descent suffix equals the number of valid periods ending today. Extend it on a difference of exactly one; otherwise restart at one.','start with an empty suffix and zero total|compare each price with its predecessor|extend the suffix only for a decrease of exactly one|add the suffix length to the total|return all smooth-descent periods','O(n) time; O(1) state.'],
2111:['arr k','Change as few values as possible so every k-spaced subsequence is nondecreasing.','Indices with the same remainder modulo k are independent. Keep a longest nondecreasing subsequence in each chain, found with upper-bound tails, and change the other positions.','split indices into k residue chains|maintain minimal tails for nondecreasing subsequences|place equal values after existing equal tails using upper bound|add chain length minus the retained subsequence length|return the total changes','O(n log(n/k+1)) time; O(n/k) auxiliary tails space.'],
};
const solvers={
2103({rings},emit){const masks=Array(10).fill(0),bits={R:1,G:2,B:4};for(let i=0;i<rings.length;i+=2){const color=rings[i],rod=Number(rings[i+1]);masks[rod]|=bits[color];emit('Setting a color bit records presence, not quantity. Repeated rings of one color do not replace a missing different color.',{sequence:masks,index:rod,table:masks.map((mask,j)=>[j,Boolean(mask&1),Boolean(mask&2),Boolean(mask&4),mask===7]),tableHeaders:['Rod','Red','Green','Blue','Complete'],codeStage:'update',metrics:{color,rod,mask:masks[rod],complete:masks.filter(m=>m===7).length}},'update');}return masks.filter(m=>m===7).length;},
2104({nums},emit){function contributions(maximum){const stack=[];let total=0;for(let right=0;right<=nums.length;right++){while(stack.length&&(right===nums.length||(maximum?nums[stack.at(-1)]<=nums[right]:nums[stack.at(-1)]>=nums[right]))){const index=stack.pop(),left=stack.at(-1)??-1,count=(index-left)*(right-index),added=nums[index]*count;total+=added;emit('The popped value owns every subarray choosing a start after its left blocker and an end before its right blocker. Equal values belong to the later occurrence, preventing double counting.',{sequence:nums,index,window:[left+1,right-1],table:stack.map(i=>[i,nums[i]]),tableHeaders:['Stack index','Value'],codeStage:maximum?'maximum':'minimum',metrics:{role:maximum?'maximum':'minimum',leftBlocker:left,rightBlocker:right,ownedSubarrays:count,contribution:added,subtotal:total}},'update');}if(right<nums.length)stack.push(right);}return total;}const maxima=contributions(true),minima=contributions(false);emit('Every subarray contributes its maximum once and its minimum once. Subtract the two totals to obtain the sum of all ranges.',{codeStage:'combine',metrics:{maxima,minima,rangeSum:maxima-minima}},'update');return maxima-minima;},
2105({plants,capacityA,capacityB},emit){let left=0,right=plants.length-1,a=capacityA,b=capacityB,refills=0;while(left<right){const refillA=a<plants[left],refillB=b<plants[right];if(refillA){a=capacityA;refills++;}if(refillB){b=capacityB;refills++;}a-=plants[left];b-=plants[right];emit('Each gardener refills only if the next plant exceeds their remaining water. These two plants are distinct because the pointers have not met.',{window:[left,right],marks:{[left]:'Alice',[right]:'Bob'},codeStage:'pair',metrics:{left,right,refillA,refillB,aliceRemaining:a,bobRemaining:b,refills}},'update');left++;right--;}if(left===right){const available=Math.max(a,b),refill=available<plants[left];refills+=Number(refill);emit('One plant remains. Give it to the gardener with more water; refill once only if even that amount is insufficient.',{index:left,codeStage:'middle',metrics:{plant:plants[left],available,refill,refills}},'update');}return refills;},
2106({fruits,startPos,k},emit){let left=0,sum=0,best=0;const cost=(l,r)=>fruits[r][0]-fruits[l][0]+Math.min(Math.abs(startPos-fruits[l][0]),Math.abs(startPos-fruits[r][0]));for(let right=0;right<fruits.length;right++){sum+=fruits[right][1];while(left<=right&&cost(left,right)>k)sum-=fruits[left++][1];best=Math.max(best,sum);emit('Covering an interval requires its full width plus reaching the nearer endpoint first. Removing left locations makes the interval cheaper until it fits the travel budget.',{sequence:fruits.map(([p])=>p),window:left<=right?[left,right]:null,index:right,table:fruits.map(([position,amount],i)=>[position,amount,i>=left&&i<=right]),tableHeaders:['Position','Fruit','In window'],codeStage:'update',metrics:{startPos,budget:k,left,right,cost:left<=right?cost(left,right):0,harvest:sum,best}},'update');}return best;},
2107({candies,k},emit){const counts=new Map();for(const flavor of candies)counts.set(flavor,(counts.get(flavor)||0)+1);const change=(flavor,delta)=>{const next=(counts.get(flavor)||0)+delta;if(next)counts.set(flavor,next);else counts.delete(flavor);};for(let i=0;i<k;i++)change(candies[i],-1);let best=counts.size;for(let left=0;left<=candies.length-k;left++){if(left){change(candies[left-1],1);change(candies[left+k-1],-1);}best=Math.max(best,counts.size);emit('Only candies outside the shared block remain. A flavor disappears from the retained set only when its final outside occurrence is removed.',{window:k?[left,left+k-1]:null,table:[...counts],tableHeaders:['Retained flavor','Occurrences'],codeStage:'update',metrics:{sharedStart:left,sharedLength:k,distinctRetained:counts.size,best}},'update');}return best;},
2108({words},emit){for(let index=0;index<words.length;index++){const word=words[index];let left=0,right=word.length-1,valid=true;while(left<right){const match=word[left]===word[right];emit('Compare symmetric positions. A mismatch rules out this word immediately without checking its remaining pairs.',{sequence:[...word],window:[left,right],codeStage:'compare',metrics:{wordIndex:index,word,left,right,match}});if(!match){valid=false;break;}left++;right--;}if(valid){emit('Every symmetric pair matched, so this is the first palindrome in input order.',{sequence:[...word],codeStage:'found',metrics:{wordIndex:index,word}},'update');return word;}}return'';},
2109({s,spaces},emit){const output=[];let next=0;for(let i=0;i<s.length;i++){const insert=next<spaces.length&&spaces[next]===i;if(insert){output.push(' ');next++;}output.push(s[i]);emit('Read the insertion index against the original string, then append the current character. Output growth never shifts the remaining source indices.',{index:i,output:output.map(c=>c===' '?'␠':c),codeStage:'append',metrics:{sourceIndex:i,insertedSpace:insert,insertionsUsed:next,text:output.join('')}},'update');}return output.join('');},
2110({prices},emit){let length=0,total=0;for(let i=0;i<prices.length;i++){const extendsRun=i>0&&prices[i-1]-prices[i]===1;length=extendsRun?length+1:1;total+=length;emit('Each suffix of the current smooth run is a different valid period ending today. A drop larger than one, a rise, or equality restarts the run.',{index:i,window:[i-length+1,i],codeStage:'update',metrics:{price:prices[i],extendsRun,runLength:length,periodsAdded:length,total}},'update');}return total;},
2111({arr,k},emit){let changes=0;for(let offset=0;offset<k;offset++){const indices=arr.map((_,i)=>i).filter(i=>i%k===offset),tails=[];for(const index of indices){const value=arr[index];let lo=0,hi=tails.length;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(tails[mid]<=value)lo=mid+1;else hi=mid;}tails[lo]=value;emit('Upper bound places this value after equal tails, so equal values can extend a nondecreasing subsequence. Tails summarize achievable lengths, not one literal chosen subsequence.',{index,marks:Object.fromEntries(indices.map(i=>[i,'same residue chain'])),output:[...tails],codeStage:'place',metrics:{offset,value,tailPosition:lo,retainedLength:tails.length,changesInEarlierChains:changes}},'update');}changes+=indices.length-tails.length;emit('This residue chain is independent of every other chain. Keep its longest nondecreasing subsequence and change the remaining values.',{output:[...tails],codeStage:'chain',metrics:{offset,chainLength:indices.length,kept:tails.length,changes}},'update');}return changes;},
};
const python={
2103:`def countPoints(rings):
    masks = [0] * 10
    bits = {'R': 1, 'G': 2, 'B': 4}
    for i in range(0, len(rings), 2):
        rod = int(rings[i + 1])
        masks[rod] |= bits[rings[i]]  # step: update
    return sum(mask == 7 for mask in masks)  # step: return`,
2104:`def subArrayRanges(nums):
    def contributions(maximum):
        stack, total = [], 0
        for right in range(len(nums) + 1):
            while stack and (right == len(nums) or
                    (nums[stack[-1]] <= nums[right] if maximum else nums[stack[-1]] >= nums[right])):
                index = stack.pop()
                left = stack[-1] if stack else -1
                count = (index - left) * (right - index)
                total += nums[index] * count
                if maximum:
                    pass  # step: maximum
                else:
                    pass  # step: minimum
            if right < len(nums):
                stack.append(right)
        return total
    maxima = contributions(True)
    minima = contributions(False)
    answer = maxima - minima  # step: combine
    return answer  # step: return`,
2105:`def minimumRefill(plants, capacityA, capacityB):
    left, right = 0, len(plants) - 1
    a, b, refills = capacityA, capacityB, 0
    while left < right:
        if a < plants[left]:
            a = capacityA
            refills += 1
        if b < plants[right]:
            b = capacityB
            refills += 1
        a -= plants[left]
        b -= plants[right]  # step: pair
        left += 1
        right -= 1
    if left == right:
        refills += int(max(a, b) < plants[left])  # step: middle
    return refills  # step: return`,
2106:`def maxTotalFruits(fruits, startPos, k):
    def cost(left, right):
        a, b = fruits[left][0], fruits[right][0]
        return b - a + min(abs(startPos - a), abs(startPos - b))
    left = total = best = 0
    for right, (_, amount) in enumerate(fruits):
        total += amount
        while left <= right and cost(left, right) > k:
            total -= fruits[left][1]
            left += 1
        best = max(best, total)  # step: update
    return best  # step: return`,
2107:`def shareCandies(candies, k):
    from collections import Counter
    counts = Counter(candies)
    def change(flavor, delta):
        counts[flavor] += delta
        if counts[flavor] == 0:
            del counts[flavor]
    for i in range(k):
        change(candies[i], -1)
    best = len(counts)
    for left in range(len(candies) - k + 1):
        if left:
            change(candies[left - 1], 1)
            change(candies[left + k - 1], -1)
        best = max(best, len(counts))  # step: update
    return best  # step: return`,
2108:`def firstPalindrome(words):
    for word in words:
        left, right, valid = 0, len(word) - 1, True
        while left < right:
            match = word[left] == word[right]  # step: compare
            if not match:
                valid = False
                break
            left += 1
            right -= 1
        if valid:
            return word  # step: found
    return ''  # step: return`,
2109:`def addSpaces(s, spaces):
    output, next_space = [], 0
    for i, letter in enumerate(s):
        if next_space < len(spaces) and spaces[next_space] == i:
            output.append(' ')
            next_space += 1
        output.append(letter)  # step: append
    return ''.join(output)  # step: return`,
2110:`def getDescentPeriods(prices):
    length = total = 0
    for i, price in enumerate(prices):
        length = length + 1 if i > 0 and prices[i - 1] - price == 1 else 1
        total += length  # step: update
    return total  # step: return`,
2111:`def kIncreasing(arr, k):
    from bisect import bisect_right
    changes = 0
    for offset in range(k):
        chain = arr[offset::k]
        tails = []
        for value in chain:
            position = bisect_right(tails, value)
            if position == len(tails):
                tails.append(value)
            else:
                tails[position] = value
            # step: place
        changes += len(chain) - len(tails)  # step: chain
    return changes  # step: return`,
};
const cases={
2103:[['Several rods receive complete sets while others miss colors',{rings:'R2G2B2R5B5G5R8G8R2B1G1R1B8'}],['Repeating one color never completes a rod',{rings:'R4R4R4R4R4'}],['All three colors reach different rods',{rings:'R0G3B7'}],['One rod gets all colors in a different order',{rings:'B9R9G9'}]],
2104:[['Alternating peaks valleys and duplicate heights share boundaries',{nums:[4,-2,7,7,1,9,-3,5,2,8]}],['Equal values have zero range in every subarray',{nums:[6,6,6,6,6]}],['A singleton has no maximum-minus-minimum gap',{nums:[-12]}],['Strictly descending values flush one stack direction repeatedly',{nums:[15,11,8,3,-4]}]],
2105:[['Unequal cans run out on different inward steps',{plants:[3,5,2,6,4,1,5,3,2,4,6],capacityA:9,capacityB:11}],['One middle plant uses the fuller initial can',{plants:[7],capacityA:8,capacityB:12}],['Every plant exactly empties a can',{plants:[4,4,4,4,4,4],capacityA:4,capacityB:4}],['An odd middle needs a final refill',{plants:[4,5,4],capacityA:6,capacityB:6}]],
2106:[['Both turn directions compete across uneven fruit locations',{fruits:[[1,5],[3,8],[6,3],[8,12],[11,6],[14,10],[18,7],[23,20]],startPos:10,k:13}],['Zero steps can harvest only the starting location',{fruits:[[2,4],[7,9],[12,6]],startPos:7,k:0}],['All fruit lies on one side of the start',{fruits:[[5,4],[9,8],[13,3],[20,11]],startPos:1,k:12}],['Every location is outside the travel budget',{fruits:[[2,7],[30,9]],startPos:15,k:4}]],
2107:[['Sharing different windows removes different final occurrences',{candies:[4,8,4,2,9,8,6,2,7,4,9,3],k:5}],['Sharing none preserves every flavor',{candies:[5,2,5,8,2],k:0}],['Sharing the full array leaves no flavors',{candies:[3,7,3,9],k:4}],['One repeated flavor survives any proper block',{candies:[6,6,6,6,6],k:3}]],
2108:[['Several near matches precede the first palindrome',{words:['garden','harbor','abccbaq','rotator','refer','level']}],['A one-letter first word qualifies immediately',{words:['z','civic','boat']}],['No word is palindromic',{words:['planet','forest','stream','cloud']}],['Even-length symmetry is checked pair by pair',{words:['ripple','noon','deed']}]],
2109:[['Multiple insertions preserve original indices in a long string',{s:'Brightlanternsguidequietboats',spaces:[6,14,19,24]}],['An insertion at zero produces a leading space',{s:'harbor',spaces:[0]}],['Adjacent insertion indices each precede one character',{s:'abcdef',spaces:[1,2,3,5]}],['An empty insertion list leaves the text unchanged',{s:'unbroken',spaces:[]}]],
2110:[['Smooth descents restart at plateaus larger drops and rises',{prices:[20,19,18,18,16,15,14,21,20,19,17,16]}],['A fully smooth run contributes a triangular number',{prices:[9,8,7,6,5,4]}],['Equal prices produce only singleton periods',{prices:[8,8,8,8]}],['One day is one period',{prices:[42]}]],
2111:[['Interleaved residue chains need different numbers of replacements',{arr:[9,4,8,7,3,6,5,5,7,2,6,9],k:3}],['Equal values extend a nondecreasing chain',{arr:[4,4,4,4,4],k:1}],['One position per chain needs no replacement',{arr:[8,3,7,1],k:4}],['A descending single chain keeps one value',{arr:[15,12,9,6,3],k:1}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=100000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2103)need(typeof input.rings==='string'&&/^(?:[RGB][0-9]){1,100}$/.test(input.rings),'Use 1-100 color/rod pairs, such as R2G2B2.');
  if(id===2104)need(vector(input.nums,-100000),'Use 1-80 signed values within -100000..100000.');
  if(id===2105)need(vector(input.plants,1)&&integer(input.capacityA,Math.max(...(input.plants||[])))&&integer(input.capacityB,Math.max(...(input.plants||[]))),'Use 1-80 positive plant requirements and each can capacity at least the largest requirement.');
  if(id===2106)need(Array.isArray(input.fruits)&&input.fruits.length>=1&&input.fruits.length<=60&&input.fruits.every((p,i)=>Array.isArray(p)&&p.length===2&&integer(p[0])&&integer(p[1],1)&&(i===0||p[0]>input.fruits[i-1][0]))&&integer(input.startPos)&&integer(input.k),'Use at most 60 sorted distinct nonnegative positions with positive fruit counts, and nonnegative start and travel budget.');
  if(id===2107)need(vector(input.candies,1)&&integer(input.k,0,input.candies?.length),'Use 1-80 positive flavor IDs and a shared length from zero through the array length.');
  if(id===2108)need(Array.isArray(input.words)&&input.words.length>=1&&input.words.length<=30&&input.words.every(w=>typeof w==='string'&&/^[a-z]{1,40}$/.test(w)),'Use 1-30 lowercase words of length 1-40.');
  if(id===2109)need(typeof input.s==='string'&&/^[a-zA-Z]{1,120}$/.test(input.s)&&Array.isArray(input.spaces)&&input.spaces.every((v,i)=>integer(v,0,input.s.length-1)&&(i===0||v>input.spaces[i-1])),'Use 1-120 letters and strictly increasing original character indices for inserted spaces.');
  if(id===2110)need(vector(input.prices,1),'Use 1-80 positive prices.');
  if(id===2111)need(vector(input.arr,1)&&integer(input.k,1,input.arr?.length),'Use 1-80 positive values and k from one through the array length.');
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result)=>id===2108&&result!==''?'found':'return',pseudocodeStages:{2104:{maximum:3,minimum:4,combine:5},2105:{pair:3,middle:4},2108:{compare:2,found:4},2109:{append:4},2111:{place:3,chain:4}},tags:{2103:['Bit Manipulation'],2104:['Monotonic Stack'],2105:['Two Pointers'],2106:['Sliding Window'],2107:['Sliding Window'],2108:['Two Pointers'],2109:['Two Pointers'],2110:['Dynamic Programming'],2111:['Binary Search','Dynamic Programming']}};
