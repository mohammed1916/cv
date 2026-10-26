import {AuthoredMinHeap} from './authoredMinHeap.js';
import {parseLevelOrderTree} from '../../../components/shared/levelOrderTree.js';
import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout.js';
const specs={
2231:['num','Maximize a number by swapping only digits with the same parity.','Each position retains its original digit parity. Sort even and odd digits independently in descending order, then use the largest remaining digit of the required parity at each position.','collect even and odd digits separately|sort both pools descending|read original positions from left to right|take the largest unused digit matching each position parity|return the largest resulting number','O(d log d) time and O(d) space.'],
2232:['expression','Place one pair of parentheses around the plus sign to minimize the expression value.','Enumerate every left cut before the plus and right cut after it. Missing outside factors equal one; evaluate the two outside factors times the enclosed sum and retain the smallest result.','split the positive operands around the plus sign|choose where the left parenthesis starts in the first operand|choose where the right parenthesis ends in the second operand|evaluate outside-left times enclosed-sum times outside-right|return the parenthesized expression with minimum value','O(left digits*right digits*total digits) time including substring conversion; O(total digits) space.'],
2233:['nums k','Maximize the product after exactly k increments of individual values.','For two values a no larger than b, incrementing a produces at least as large a product as incrementing b. Repeatedly increment the current minimum with a heap, then multiply modulo one billion plus seven.','build a min-heap of all values|remove the current minimum|increment it once and reinsert it|repeat exactly k times|return the final product modulo one billion plus seven','O((n+k) log n) time and O(n) space.'],
2234:['flowers newFlowers target full partial','Distribute extra flowers to maximize full-garden rewards plus the minimum incomplete-garden reward.','For each possible number of incomplete gardens, complete the largest existing gardens first. Spend the remaining budget raising the minimum among the incomplete prefix, capped below target so its partial reward still applies.','sort and cap garden counts at target|consider completing largest incomplete gardens first|binary search the affordable minimum for the remaining incomplete prefix|combine full rewards with the incomplete minimum reward|return the largest beauty across completion choices','O(n log n+n log(target)*log n) time; O(n) prefix-sum space.'],
2235:['num1 num2','Return the sum of two signed integers.','Addition combines the two signed quantities. A negative second value lowers the first, a positive value raises it, and opposite values can cancel completely.','read the first signed integer|read the second signed integer|add their signed values|store the resulting total|return the sum','O(1) time and space for bounded integers.'],
2236:['root','Check whether a three-node tree root equals the sum of its children.','Read both child values, add them, and compare the result with the root. The condition concerns the child sum, not equality with either child separately.','read the root and its two child values|add the left and right child values|compare their sum with the root value|record whether equality holds|return the equality decision','O(1) time and space for three nodes.'],
};
const solvers={
2231({num},emit){const digits=[...String(num)].map(Number),pools=[digits.filter(d=>d%2===0).sort((a,b)=>b-a),digits.filter(d=>d%2===1).sort((a,b)=>b-a)],used=[0,0],answer=[];for(let i=0;i<digits.length;i++){const parity=digits[i]%2,value=pools[parity][used[parity]++];answer.push(value);emit('This position can receive only a digit of its original parity. Choosing the largest available one maximizes the earliest still-undecided decimal position.',{sequence:digits,index:i,output:[...answer],table:[['even',pools[0].slice(used[0]).join(', ')],['odd',pools[1].slice(used[1]).join(', ')]],tableHeaders:['Parity pool','Remaining digits'],codeStage:'place',metrics:{position:i,requiredParity:parity?'odd':'even',chosen:value}},'update');}return Number(answer.join(''));},
2232({expression},emit){const[left,right]=expression.split('+');let best=Infinity,answer='';for(let i=0;i<left.length;i++)for(let j=1;j<=right.length;j++){const a=Number(left.slice(0,i)||1),b=Number(left.slice(i)),c=Number(right.slice(0,j)),d=Number(right.slice(j)||1),value=a*(b+c)*d,candidate=left.slice(0,i)+'('+left.slice(i)+'+'+right.slice(0,j)+')'+right.slice(j);if(value<best){best=value;answer=candidate;}emit('The parentheses must include at least one digit from each side of the plus. Treat an absent outside factor as one, then evaluate the resulting multiplication and sum.',{sequence:[...expression],codeStage:'candidate',metrics:{candidate,outsideLeft:a,insideLeft:b,insideRight:c,outsideRight:d,value,best,bestExpression:answer}},'update');}return answer;},
2233({nums,k},emit){const heap=new AuthoredMinHeap();nums.forEach(value=>heap.push([value]));for(let operation=1;operation<=k;operation++){const before=heap.pop()[0];heap.push([before+1]);emit('Increment the smallest current value. This balances the factors and yields at least as much product as spending this increment on a larger factor.',{sequence:heap.data.map(([v])=>v),codeStage:'increment',metrics:{operation,required:k,before,after:before+1}},'update');}let product=1n;for(const[value]of heap.data)product=product*BigInt(value)%1000000007n;return Number(product);},
2234({flowers,newFlowers,target,full,partial},emit){const values=flowers.map(v=>Math.min(v,target)).sort((a,b)=>a-b),prefix=[0];for(const value of values)prefix.push(prefix.at(-1)+value);const initialIncomplete=values.filter(v=>v<target).length;let spent=0,best=0;for(let remaining=initialIncomplete;remaining>=0;remaining--){if(spent>newFlowers)break;const budget=newFlowers-spent;let level=0;if(remaining){let low=values[0],high=target-1;while(low<high){const trial=Math.floor((low+high+1)/2);let lo=0,hi=remaining;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(values[mid]<trial)lo=mid+1;else hi=mid;}const cost=trial*lo-prefix[lo],feasible=cost<=budget;if(feasible)low=trial;else high=trial-1;emit('Only incomplete gardens below the trial minimum need flowers. A prefix sum computes their exact leveling cost while completed gardens keep their separately reserved budget.',{sequence:values,window:[0,remaining-1],codeStage:'level',metrics:{incompleteGardens:remaining,fullGardens:values.length-remaining,reservedForCompletion:spent,levelingBudget:budget,trial,gardensRaised:lo,levelingCost:cost,feasible,low,high}},'update');}level=low;}const beauty=(values.length-remaining)*full+level*partial;best=Math.max(best,beauty);emit('Combine the full-garden count with the minimum incomplete level. If every garden is full there is no incomplete group, so its partial contribution is zero.',{sequence:values,output:values.map((value,i)=>i<remaining?Math.max(value,level):target),codeStage:'beauty',metrics:{incompleteGardens:remaining,fullGardens:values.length-remaining,minimumIncomplete:remaining?level:'none',beauty,best}},'update');if(remaining)spent+=target-values[remaining-1];}return best;},
2235({num1,num2},emit){const total=num1+num2;emit('Combine the signed quantities directly. The second operand changes the first by its signed amount, so cancellation and negative totals are ordinary addition cases.',{sequence:[num1,num2],output:[total],codeStage:'add',metrics:{first:num1,second:num2,total}},'update');return total;},
2236({root},emit){const tree=parseLevelOrderTree(JSON.stringify(root)),sum=root[1]+root[2],equal=root[0]===sum;emit('Add the two child values before comparing with the root. Highlighting all three nodes makes the exact equality being checked visible.',{treeDiagram:{...binaryTreeLayout(tree),activeIds:new Set([0,1,2])},codeStage:'compare',metrics:{root:root[0],left:root[1],right:root[2],childrenSum:sum,equal}},'update');return equal;},
};
const python={
2231:`def largestInteger(num):
    digits = [int(char) for char in str(num)]
    pools = [sorted((d for d in digits if d % 2 == parity), reverse=True) for parity in (0, 1)]
    used, answer = [0, 0], []
    for digit in digits:
        parity = digit % 2
        answer.append(pools[parity][used[parity]])
        used[parity] += 1  # step: place
    return int(''.join(map(str, answer)))  # step: return`,
2232:`def minimizeResult(expression):
    left, right = expression.split('+')
    best, answer = float('inf'), ''
    for i in range(len(left)):
        for j in range(1, len(right) + 1):
            a, b = int(left[:i] or '1'), int(left[i:])
            c, d = int(right[:j]), int(right[j:] or '1')
            value = a * (b + c) * d
            candidate = left[:i] + '(' + left[i:] + '+' + right[:j] + ')' + right[j:]
            if value < best:
                best, answer = value, candidate
            # step: candidate
    return answer  # step: return`,
2233:`def maximumProduct(nums, k):
    from heapq import heappush, heappop
    heap = []
    for value in nums:
        heappush(heap, value)
    for _ in range(k):
        heappush(heap, heappop(heap) + 1)  # step: increment
    product = 1
    for value in heap:
        product = product * value % 1_000_000_007
    return product  # step: return`,
2234:`def maximumBeauty(flowers, newFlowers, target, full, partial):
    from bisect import bisect_left
    values = sorted(min(value, target) for value in flowers)
    prefix = [0]
    for value in values:
        prefix.append(prefix[-1] + value)
    initial_incomplete = bisect_left(values, target)
    spent = best = 0
    for remaining in range(initial_incomplete, -1, -1):
        if spent > newFlowers:
            break
        budget, level = newFlowers - spent, 0
        if remaining:
            low, high = values[0], target - 1
            while low < high:
                trial = (low + high + 1) // 2
                count = bisect_left(values, trial, 0, remaining)
                cost = trial * count - prefix[count]
                if cost <= budget:
                    low = trial
                else:
                    high = trial - 1
                # step: level
            level = low
        beauty = (len(values) - remaining) * full + level * partial
        best = max(best, beauty)  # step: beauty
        if remaining:
            spent += target - values[remaining - 1]
    return best  # step: return`,
2235:`def sumIntegers(num1, num2):
    total = num1 + num2  # step: add
    return total  # step: return`,
2236:`def checkTree(root):
    # The visualizer supplies the three-node tree in level order.
    children_sum = root[1] + root[2]
    equal = root[0] == children_sum  # step: compare
    return equal  # step: return`,
};
const cases={
2231:[['Interleaved parity positions draw from different descending pools',{num:583204716}],['Only even digits may be freely rearranged',{num:20486}],['Only odd digits use one shared pool',{num:13579}],['Repeated digits preserve their occurrence counts',{num:772244}]],
2232:[['Several interior cuts compete across multi-digit operands',{expression:'3847+629'}],['Single-digit operands force the only parentheses placement',{expression:'6+8'}],['One side has several cuts while the other has one digit',{expression:'735+4'}],['Symmetric operands still allow different outside factors',{expression:'222+222'}]],
2233:[['Repeated increments change which factor is smallest',{nums:[2,9,4,1,7,3],k:14}],['Zero factors must receive increments before a positive product is possible',{nums:[0,0,5],k:4}],['No increment returns the original product modulo the modulus',{nums:[8,11,13],k:0}],['A singleton receives every increment',{nums:[6],k:9}]],
2234:[['Completion rewards compete with raising the incomplete minimum',{flowers:[2,8,4,11,6,3,9],newFlowers:24,target:10,full:13,partial:7}],['All gardens already full have no partial component',{flowers:[9,12,15],newFlowers:20,target:8,full:5,partial:100}],['A strong partial reward can favor leaving one garden incomplete',{flowers:[1,2,3],newFlowers:30,target:8,full:2,partial:20}],['No new flowers preserves the existing full and minimum rewards',{flowers:[3,7,10,4],newFlowers:0,target:7,full:9,partial:4}]],
2235:[['Two longer positive quantities combine into a larger total',{num1:347,num2:586}],['A negative second quantity reduces the first',{num1:72,num2:-119}],['Opposite quantities cancel exactly',{num1:-245,num2:245}],['Zero leaves the other quantity unchanged',{num1:0,num2:-37}]],
2236:[['Different positive child values add to the root',{root:[73,28,45]}],['A near match still fails exact equality',{root:[42,17,24]}],['Signed children may cancel to a zero root',{root:[0,-18,18]}],['A negative root can equal two negative children',{root:[-31,-12,-19]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const vector=(v,min=0,maxLength=80)=>Array.isArray(v)&&v.length>=1&&v.length<=maxLength&&v.every(x=>integer(x,min));
  if(id===2231)need(integer(input.num,1,1000000000),'Use a positive integer at most one billion.');
  if(id===2232)need(typeof input.expression==='string'&&/^[1-9]{1,5}\+[1-9]{1,5}$/.test(input.expression),'Use two operands of 1-5 nonzero digits separated by one plus sign.');
  if(id===2233)need(vector(input.nums,0,50)&&integer(input.k,0,200),'Use 1-50 nonnegative values up to one million and 0-200 increments.');
  if(id===2234)need(vector(input.flowers,1,30)&&integer(input.newFlowers,0,1000000000000)&&integer(input.target,1)&&integer(input.full,1)&&integer(input.partial,1),'Use 1-30 positive garden counts, at most one trillion extra flowers, and positive target/rewards at most one million.');
  if(id===2235)need(integer(input.num1,-1000000)&&integer(input.num2,-1000000),'Use two signed integers within one million in magnitude.');
  if(id===2236)need(Array.isArray(input.root)&&input.root.length===3&&input.root.every(v=>integer(v,-1000000)),'Use exactly three signed values in root-left-right level order.');
  return input;
}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2231:{place:4},2232:{candidate:4},2233:{increment:3},2234:{level:3,beauty:4},2235:{add:3},2236:{compare:3}},tags:{2231:['Greedy'],2232:['Enumeration'],2233:['Heap','Greedy'],2234:['Sorting','Binary Search'],2235:['Math'],2236:['Tree']}};
