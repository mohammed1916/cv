import {AuthoredMinHeap} from './authoredMinHeap.js';
const specs={
2161:['nums pivot','Partition values around a pivot while preserving order within each group.','Append each value to the less equal or greater group as encountered. Concatenating these groups gives the required order while keeping each group stable.','initialize less equal and greater groups|compare each value with the pivot|append it to its matching group|concatenate the three groups in order|return the stable partition','O(n) time and O(n) space.'],
2162:['startAt moveCost pushCost targetSeconds','Enter a microwave time with minimum finger movement and button cost.','The display accepts up to two minute digits and two second digits, including seconds above 59. Enumerate all minute/second representations of the duration, remove leading zeros, and price each button sequence.','enumerate minute values from zero through 99|derive seconds and keep values from zero through 99|omit leading zeros from the four-position display|simulate movement and pushing for each candidate sequence|return the cheapest input cost','O(100) time; O(1) auxiliary space.'],
2163:['nums','Remove one third of the values to minimize the first retained half sum minus the second.','At each split, keep the n smallest values available on the left and the n largest on the right. A max-heap maintains left minima and a min-heap maintains right maxima; compare every valid split.','maintain n smallest prefix values with a max-heap|maintain n largest suffix values with a min-heap|consider splits leaving at least n values on both sides|subtract the best suffix sum from the best prefix sum|return the minimum difference','O(n log n) time and O(n) space for an input of length 3n.'],
2164:['nums','Sort even-index values ascending and odd-index values descending.','The two parity groups never exchange positions. Sort each group independently, then consume their sorted values at matching index parity.','collect values at even and odd indices|sort the even group ascending|sort the odd group descending|rebuild by alternating values from the matching group|return the reordered array','O(n log n) time and O(n) space.'],
2165:['num','Rearrange the digits into the smallest number with the original sign and no leading zero.','For a positive number, use ascending digits but move the smallest nonzero digit to the front. For a negative number, the smallest signed value has the largest magnitude, so use descending digits.','extract the absolute-value digits|sort ascending for positive numbers and descending for negative numbers|move a nonzero digit to the positive leading position|restore the original sign|return the smallest rearranged value','O(d log d) time and O(d) space.'],
2166:['size operations','Maintain a bitset supporting individual changes whole-set flips and queries.','Store bits relative to a global flip flag. Logical value is stored bit XOR flip; a cached one-count makes all one and count queries constant time without materializing a flip.','initialize stored zero bits a flip flag and a one-count|translate fix and unfix through the current flip flag|toggle the flag and complement the count for a whole-set flip|answer queries from the count or reconstructed logical bits|return each operation result','O(1) per operation except O(size) toString; O(size) storage, excluding displayed snapshots.'],
};
const solvers={
2161({nums,pivot},emit){const less=[],equal=[],greater=[];for(let i=0;i<nums.length;i++){const value=nums[i],group=value<pivot?less:value===pivot?equal:greater;group.push(value);emit('Append without reordering earlier values in this category. The final concatenation changes category order while preserving order inside each category.',{index:i,table:[['less',less.join(', ')],['equal',equal.join(', ')],['greater',greater.join(', ')]],tableHeaders:['Group','Values in encounter order'],output:[...less,...equal,...greater],codeStage:'append',metrics:{value,pivot,group:value<pivot?'less':value===pivot?'equal':'greater'}},'update');}return[...less,...equal,...greater];},
2162({startAt,moveCost,pushCost,targetSeconds},emit){let best=Infinity;const candidates=[];for(let minutes=0;minutes<=99;minutes++){const seconds=targetSeconds-60*minutes;if(seconds<0||seconds>99)continue;const digits=(String(minutes).padStart(2,'0')+String(seconds).padStart(2,'0')).replace(/^0+/,''),pressed=[];let finger=startAt,cost=0;for(const char of digits){const digit=Number(char),moved=finger!==digit;cost+=pushCost+(moved?moveCost:0);finger=digit;pressed.push(char);emit('Charge movement only when the next button differs from the current finger position, then charge every press. Repeated identical digits avoid movement cost.',{sequence:[...digits],index:pressed.length-1,output:[...pressed],codeStage:'press',metrics:{minutes,seconds,digit,moved,finger,candidateCost:cost,bestCompleted:Number.isFinite(best)?best:'none'}},'update');}best=Math.min(best,cost);candidates.push([minutes,seconds,digits,cost]);emit('This display representation reaches the same target duration. Leading zero presses are unnecessary, and a seconds field above 59 can still be a cheaper valid representation.',{table:[...candidates],tableHeaders:['Minutes','Seconds','Buttons','Cost'],codeStage:'candidate',metrics:{targetSeconds,best}},'update');}return best;},
2163({nums},emit){const n=nums.length/3,left=Array(nums.length).fill(null),right=Array(nums.length).fill(null),smallest=new AuthoredMinHeap((a,b)=>b[0]-a[0]),largest=new AuthoredMinHeap();let sum=0;for(let i=0;i<2*n;i++){smallest.push([nums[i]]);sum+=nums[i];if(smallest.size>n)sum-=smallest.pop()[0];if(smallest.size===n)left[i]=sum;emit('Keep the n smallest prefix values by removing the largest whenever the heap grows too large. Their original order can still be retained in a subsequence.',{index:i,window:[0,i],output:[...left],table:smallest.data.map(([v])=>[v]),tableHeaders:['Selected prefix value'],codeStage:'prefix',metrics:{i,n,selected:smallest.size,sum}},'update');}sum=0;for(let i=nums.length-1;i>=n;i--){largest.push([nums[i]]);sum+=nums[i];if(largest.size>n)sum-=largest.pop()[0];if(largest.size===n)right[i]=sum;emit('Keep the n largest suffix values by removing the smallest. Maximizing the subtracted half makes the final difference as small as possible.',{index:i,window:[i,nums.length-1],output:[...right],table:largest.data.map(([v])=>[v]),tableHeaders:['Selected suffix value'],codeStage:'suffix',metrics:{i,n,selected:largest.size,sum}},'update');}let best=Infinity;for(let split=n-1;split<2*n;split++){const difference=left[split]-right[split+1];best=Math.min(best,difference);emit('This split separates the two retained halves. Independently optimal choices on its left and right can coexist because their source positions do not overlap.',{index:split,table:[['left',left[split]],['right',right[split+1]]],tableHeaders:['Retained half','Best sum'],codeStage:'split',metrics:{splitAfter:split,difference,best}},'update');}return best;},
2164({nums},emit){const even=nums.filter((_,i)=>i%2===0).sort((a,b)=>a-b),odd=nums.filter((_,i)=>i%2===1).sort((a,b)=>b-a),answer=[];for(let i=0;i<nums.length;i++){const value=(i%2?odd:even)[Math.floor(i/2)];answer.push(value);emit('Read the next value from the sorted group matching this index parity. Values never migrate between the even and odd position groups.',{index:i,output:[...answer],table:[['even ascending',even.join(', ')],['odd descending',odd.join(', ')]],tableHeaders:['Group','Sorted values'],codeStage:'rebuild',metrics:{index:i,parity:i%2?'odd':'even',value}},'update');}return answer;},
2165({num},emit){if(num===0)return 0;const negative=num<0,digits=[...String(Math.abs(num))].sort((a,b)=>negative?Number(b)-Number(a):Number(a)-Number(b));if(!negative&&digits[0]==='0'){const first=digits.findIndex(d=>d!=='0');[digits[0],digits[first]]=[digits[first],digits[0]];}const result=Number(digits.join(''))*(negative?-1:1);emit(negative?'For a negative number, a larger magnitude produces a smaller signed value, so place large digits first.':'Place the smallest nonzero digit first, then keep the remaining digits ascending so zeros never become an illegal leading prefix.',{sequence:digits,codeStage:'rearrange',metrics:{original:num,negative,result}},'update');return result;},
2166({size,operations},emit){const bits=Array(size).fill(0),answer=[];let flipped=0,ones=0;for(let step=0;step<operations.length;step++){const[type,index]=operations[step];let result=null;if(type==='fix'||type==='unfix'){const desired=Number(type==='fix'),logical=bits[index]^flipped;if(logical!==desired){bits[index]=desired^flipped;ones+=desired?1:-1;}}else if(type==='flip'){flipped^=1;ones=size-ones;}else if(type==='all')result=ones===size;else if(type==='one')result=ones>0;else if(type==='count')result=ones;else result=bits.map(bit=>bit^flipped).join('');answer.push(result);emit(type==='flip'?'Toggle one global flag and complement the cached count. No individual stored bit needs to change.':'Interpret stored bits through the flip flag. Repeating fix or unfix on an already matching logical bit leaves the one-count unchanged.',{sequence:bits.map(bit=>bit^flipped),index:index??-1,table:bits.map((bit,i)=>[i,bit,flipped,bit^flipped]),tableHeaders:['Index','Stored bit','Flip flag','Logical bit'],output:[...answer],codeStage:type==='fix'||type==='unfix'?'set':type==='flip'?'flip':'query',metrics:{operation:step+1,type,ones,size,result:result??'mutation'}},'update');}return answer;},
};
const python={
2161:`def pivotArray(nums, pivot):
    less, equal, greater = [], [], []
    for value in nums:
        group = less if value < pivot else equal if value == pivot else greater
        group.append(value)  # step: append
    return less + equal + greater  # step: return`,
2162:`def minCostSetTime(startAt, moveCost, pushCost, targetSeconds):
    best = float('inf')
    for minutes in range(100):
        seconds = targetSeconds - 60 * minutes
        if not 0 <= seconds <= 99:
            continue
        digits = (f'{minutes:02d}{seconds:02d}').lstrip('0')
        finger, cost = startAt, 0
        for char in digits:
            digit = int(char)
            cost += pushCost + (moveCost if finger != digit else 0)
            finger = digit  # step: press
        best = min(best, cost)  # step: candidate
    return best  # step: return`,
2163:`def minimumDifference(nums):
    from heapq import heappush, heappop
    n = len(nums) // 3
    left, right = [None] * len(nums), [None] * len(nums)
    heap, total = [], 0
    for i in range(2 * n):
        heappush(heap, -nums[i])
        total += nums[i]
        if len(heap) > n:
            total += heappop(heap)
        if len(heap) == n:
            left[i] = total
        # step: prefix
    heap, total = [], 0
    for i in range(len(nums) - 1, n - 1, -1):
        heappush(heap, nums[i])
        total += nums[i]
        if len(heap) > n:
            total -= heappop(heap)
        if len(heap) == n:
            right[i] = total
        # step: suffix
    best = float('inf')
    for split in range(n - 1, 2 * n):
        best = min(best, left[split] - right[split + 1])  # step: split
    return best  # step: return`,
2164:`def sortEvenOdd(nums):
    even, odd = sorted(nums[::2]), sorted(nums[1::2], reverse=True)
    answer = []
    for i in range(len(nums)):
        answer.append((odd if i % 2 else even)[i // 2])  # step: rebuild
    return answer  # step: return`,
2165:`def smallestNumber(num):
    if num == 0:
        return 0  # step: zero
    negative = num < 0
    digits = sorted(str(abs(num)), reverse=negative)
    if not negative and digits[0] == '0':
        first = next(i for i, digit in enumerate(digits) if digit != '0')
        digits[0], digits[first] = digits[first], digits[0]
    result = int(''.join(digits)) * (-1 if negative else 1)  # step: rearrange
    return result  # step: return`,
2166:`class Bitset:
    def __init__(self, size):
        self.bits = [0] * size
        self.flipped = 0
        self.ones = 0

    def _set(self, index, desired):
        if (self.bits[index] ^ self.flipped) != desired:
            self.bits[index] = desired ^ self.flipped
            self.ones += 1 if desired else -1
        # step: set

    def fix(self, idx):
        self._set(idx, 1)

    def unfix(self, idx):
        self._set(idx, 0)

    def flip(self):
        self.flipped ^= 1
        self.ones = len(self.bits) - self.ones  # step: flip

    def all(self):
        return self.ones == len(self.bits)

    def one(self):
        return self.ones > 0

    def count(self):
        return self.ones

    def toString(self):
        return ''.join(str(bit ^ self.flipped) for bit in self.bits)

def runBitset(size, operations):
    bitset, answer = Bitset(size), []
    for operation in operations:
        result = getattr(bitset, operation[0])(*operation[1:])  # step: query
        answer.append(result)
    return answer  # step: return`,
};
const cases={
2161:[['Repeated pivots and interleaved groups preserve encounter order',{nums:[12,4,9,3,9,15,2,11,9,6,18],pivot:9}],['All values equal the pivot',{nums:[7,7,7,7],pivot:7}],['The pivot is absent but still separates two groups',{nums:[8,2,11,1,9,3],pivot:5}],['Signed values retain stable order within their groups',{nums:[-2,6,-7,0,-2,4,-9],pivot:-2}]],
2162:[['Two displays reach the same duration with different button paths',{startAt:7,moveCost:6,pushCost:2,targetSeconds:95}],['A seconds-only display avoids leading zero presses',{startAt:8,moveCost:5,pushCost:3,targetSeconds:8}],['Repeated digits can avoid several finger movements',{startAt:1,moveCost:9,pushCost:1,targetSeconds:71}],['Maximum supported display uses both 99 fields',{startAt:9,moveCost:4,pushCost:2,targetSeconds:6039}]],
2163:[['Different split positions retain different best thirds',{nums:[18,4,12,7,25,3,16,9,22,6,14,20]}],['The smallest input keeps one value on each side',{nums:[9,2,11]}],['Equal values give zero difference at every split',{nums:[5,5,5,5,5,5]}],['Ascending values favor small left and large right values',{nums:[1,3,5,7,9,11,13,15,17]}]],
2164:[['The two index groups sort in opposite directions',{nums:[14,3,8,19,2,11,17,5,6]}],['One value has no odd-index group',{nums:[7]}],['Duplicates remain in their original parity group',{nums:[4,9,4,9,2,7]}],['Already ordered parity groups remain unchanged',{nums:[1,12,3,9,5,6]}]],
2165:[['Several zeros must follow the smallest nonzero leading digit',{num:50802031}],['Negative values reverse the magnitude objective',{num:-407260}],['Zero has no nonzero leading digit to select',{num:0}],['Repeated digits keep their multiplicities',{num:733117}]],
2166:[['Flips and repeated updates preserve logical values and counts',{size:8,operations:[['fix',2],['fix',6],['count'],['flip'],['toString'],['unfix',1],['fix',2],['fix',2],['one'],['all'],['flip'],['count'],['toString']]}],['A single bit exercises all and one at both states',{size:1,operations:[['all'],['one'],['fix',0],['all'],['count'],['unfix',0],['toString']]}],['Two flips restore the initial bit pattern',{size:5,operations:[['fix',1],['fix',4],['toString'],['flip'],['flip'],['toString'],['count']]}],['Repeated unfix on an empty bitset keeps the count zero',{size:4,operations:[['unfix',2],['unfix',2],['count'],['one'],['all']]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2161)need(vector(input.nums,-1000000)&&integer(input.pivot,-1000000),'Use 1-80 signed values and a signed pivot within one million in magnitude.');
  if(id===2162)need(integer(input.startAt,0,9)&&integer(input.moveCost,1,100)&&integer(input.pushCost,1,100)&&integer(input.targetSeconds,1,6039),'Use a starting digit 0-9, positive costs 1-100, and a target from one through 6039 seconds.');
  if(id===2163)need(vector(input.nums,1,45)&&input.nums.length%3===0,'Use 3-45 positive values with length divisible by three.');
  if(id===2164)need(vector(input.nums,1),'Use 1-80 positive values.');
  if(id===2165)need(integer(input.num,-1000000000000,1000000000000),'Use an integer within one trillion in magnitude.');
  if(id===2166){need(integer(input.size,1,64)&&Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80,'Use bitset size 1-64 and 1-80 operations.');for(const op of input.operations)need(Array.isArray(op)&&((['fix','unfix'].includes(op[0])&&op.length===2&&integer(op[1],0,input.size-1))||(['flip','all','one','count','toString'].includes(op[0])&&op.length===1)),'Use fix/unfix with one valid index, or flip/all/one/count/toString without arguments.');}
  return input;
}
export default {specs,solvers,python,cases,validate,resultStage:(id,result,input)=>id===2165&&input.num===0?'zero':'return',pseudocodeStages:{2161:{append:3},2162:{press:4,candidate:5},2163:{prefix:1,suffix:2,split:4},2164:{rebuild:4},2165:{rearrange:4},2166:{set:2,flip:3,query:4}},tags:{2161:['Array'],2162:['Enumeration'],2163:['Heap','Prefix Sum'],2164:['Sorting'],2165:['Greedy'],2166:['Design','Bit Manipulation']}};
