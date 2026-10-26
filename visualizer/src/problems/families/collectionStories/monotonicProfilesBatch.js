import {makeListNodes,snapshotLinkedList} from './authoredLinkedLists.js';
const specs={
2487:['head','Remove every linked-list node that has a strictly larger value somewhere to its right.','Keep surviving nodes in nonincreasing order on a stack. A new larger node invalidates smaller tail candidates; reconnect the last surviving predecessor directly to the new node using original node identities.','scan original nodes from left to right|pop smaller retained nodes when a larger value arrives|link the surviving tail to the current node|append the current node as the new retained tail|return the surviving linked list','O(nodes) time and O(nodes) stack space.'],
2865:['maxHeights','Choose tower heights under their individual caps to maximize a mountain-shaped total.','Try every possible peak. Starting at its cap, walk outward and clamp each next tower to the previous chosen height and its own cap; this gives the largest mountain for that fixed peak.','choose each possible peak index|set its height to its cap|walk left and right clamping to the neighboring chosen height|sum the resulting mountain and keep the best peak|return the maximum height sum','O(n^2) time and O(n) profile space.'],
2866:['maxHeights','Maximize a capped mountain height sum without rebuilding every possible peak.','Monotonic stacks compute optimal left and right mountain-arm sums. Popping taller caps reveals a span flattened to the current height; combine both arm totals at each peak and subtract its double-counted height.','compute optimal left-arm sums using a monotonic stack|compute symmetric right-arm sums|combine both sums at every peak|subtract the peak height counted twice and keep the maximum|return the best mountain total','O(n) time and O(n) space.'],
3113:['nums','Count subarrays whose two boundary values equal the maximum value anywhere inside.','A decreasing stack groups equal candidate maxima. Smaller groups become invalid when a larger value arrives; an equal surviving group contributes one new subarray for each earlier equal endpoint plus the current singleton.','maintain decreasing groups of possible boundary maxima|discard smaller groups when a larger value arrives|extend an equal top group or create a new group|add the top group count for subarrays ending here|return the total matching subarrays','O(n) time and O(n) stack space.'],
};
const solvers={
2487({head},emit){const nodes=makeListNodes(head),stack=[];for(let i=0;i<nodes.length;i++){const removed=[];while(stack.length&&nodes[stack.at(-1)].val<nodes[i].val)removed.push(stack.pop());if(stack.length)nodes[stack.at(-1)].next=i;nodes[i].next=null;stack.push(i);emit('The current value proves every smaller retained tail node has a larger value on its right. Bypass those nodes and append this original node; equal values remain.',{linkedList:snapshotLinkedList(nodes,stack[0],[{label:'retained tail',nodeId:i}],[i]),sequence:head,index:i,codeStage:'retain',metrics:{current:nodes[i].val,removedNodeIds:removed.join(', ')||'none',retained:stack.length}},'update');}return stack.map(i=>nodes[i].val);},
2865({maxHeights},emit){let best=0;for(let peak=0;peak<maxHeights.length;peak++){const profile=[...maxHeights];for(let i=peak-1;i>=0;i--)profile[i]=Math.min(profile[i],profile[i+1]);for(let i=peak+1;i<profile.length;i++)profile[i]=Math.min(profile[i],profile[i-1]);const sum=profile.reduce((a,b)=>a+b,0);best=Math.max(best,sum);emit('For this fixed peak, each outward step takes the largest height that respects both its cap and the previous tower. Any larger choice would violate the mountain shape.',{sequence:maxHeights,index:peak,output:profile,outputIndex:peak,codeStage:'peak',metrics:{peak,sum,best}},'update');}return best;},
2866({maxHeights},emit){const n=maxHeights.length,left=Array(n).fill(0),right=Array(n).fill(0),stack=[];for(let i=0;i<n;i++){while(stack.length&&maxHeights[stack.at(-1)]>maxHeights[i])stack.pop();const previous=stack.at(-1)??-1;left[i]=(previous<0?0:left[previous])+maxHeights[i]*(i-previous);stack.push(i);emit('The previous no-taller cap anchors the already-optimal left arm. All towers between it and this index can be filled to the current height.',{sequence:maxHeights,index:i,output:[...left],table:stack.map(j=>[j,maxHeights[j]]),tableHeaders:['Left stack index','Cap'],codeStage:'left',metrics:{previous,leftArmSum:left[i]}},'update');}stack.length=0;for(let i=n-1;i>=0;i--){while(stack.length&&maxHeights[stack.at(-1)]>maxHeights[i])stack.pop();const next=stack.at(-1)??n;right[i]=(next===n?0:right[next])+maxHeights[i]*(next-i);stack.push(i);emit('Apply the same span calculation from the right to obtain the best descending arm beginning at this peak.',{sequence:maxHeights,index:i,output:[...right],table:stack.map(j=>[j,maxHeights[j]]),tableHeaders:['Right stack index','Cap'],codeStage:'right',metrics:{next,rightArmSum:right[i]}},'update');}let best=0;for(let i=0;i<n;i++){const total=left[i]+right[i]-maxHeights[i];best=Math.max(best,total);emit('Both arm sums contain this peak once. Subtract its cap once to obtain the complete mountain sum without double counting.',{sequence:maxHeights,index:i,table:maxHeights.map((cap,j)=>[j,left[j],right[j],left[j]+right[j]-cap]),tableHeaders:['Peak','Left arm','Right arm','Mountain sum'],codeStage:'combine',metrics:{peak:i,total,best}},'update');}return best;},
3113({nums},emit){const stack=[];let answer=0;for(let i=0;i<nums.length;i++){const value=nums[i];while(stack.length&&stack.at(-1)[0]<value)stack.pop();if(stack.length&&stack.at(-1)[0]===value)stack.at(-1)[1]++;else stack.push([value,1]);const added=stack.at(-1)[1];answer+=added;emit('A larger interior value blocks smaller boundary candidates. Equal maxima still on top can pair with this endpoint, and the new endpoint also contributes its singleton.',{sequence:nums,index:i,table:stack.map(row=>[...row]),tableHeaders:['Candidate boundary maximum','Eligible equal endpoints'],codeStage:'group',metrics:{value,newSubarrays:added,total:answer}},'update');}return answer;},
};
const python={
2487:`class ListNode:
    def __init__(self, value):
        self.val, self.next = value, None

def removeNodes(head):
    nodes = [ListNode(value) for value in head]
    stack = []
    for node in nodes:
        while stack and stack[-1].val < node.val:
            stack.pop()
        if stack:
            stack[-1].next = node
        node.next = None
        stack.append(node)  # step: retain
    answer, current = [], stack[0] if stack else None
    while current:
        answer.append(current.val)
        current = current.next
    return answer  # step: return`,
2865:`def maximumSumOfHeights(maxHeights):
    best = 0
    for peak in range(len(maxHeights)):
        profile = list(maxHeights)
        for index in range(peak - 1, -1, -1):
            profile[index] = min(profile[index], profile[index + 1])
        for index in range(peak + 1, len(profile)):
            profile[index] = min(profile[index], profile[index - 1])
        best = max(best, sum(profile))  # step: peak
    return best  # step: return`,
2866:`def maximumSumOfHeights(maxHeights):
    n = len(maxHeights)
    left, right, stack = [0] * n, [0] * n, []
    for index, height in enumerate(maxHeights):
        while stack and maxHeights[stack[-1]] > height:
            stack.pop()
        previous = stack[-1] if stack else -1
        left[index] = (left[previous] if previous >= 0 else 0) + height * (index - previous)  # step: left
        stack.append(index)
    stack = []
    for index in range(n - 1, -1, -1):
        height = maxHeights[index]
        while stack and maxHeights[stack[-1]] > height:
            stack.pop()
        following = stack[-1] if stack else n
        right[index] = (right[following] if following < n else 0) + height * (following - index)  # step: right
        stack.append(index)
    best = 0
    for index, height in enumerate(maxHeights):
        best = max(best, left[index] + right[index] - height)  # step: combine
    return best  # step: return`,
3113:`def numberOfSubarrays(nums):
    stack, answer = [], 0
    for value in nums:
        while stack and stack[-1][0] < value:
            stack.pop()
        if stack and stack[-1][0] == value:
            stack[-1][1] += 1
        else:
            stack.append([value, 1])
        answer += stack[-1][1]  # step: group
    return answer  # step: return`,
};
const cases={
2487:[['Successively larger right-side nodes remove several earlier candidates',{head:[18,7,12,4,16,9,11,3,8]}],['Equal values remain because removal needs a strictly larger value',{head:[6,6,6,6]}],['A descending list keeps every original node',{head:[20,15,10,5]}],['An increasing list retains only the last node',{head:[2,5,9,14]}]],
2865:[['Different peak choices flatten different surrounding caps',{maxHeights:[7,3,9,8,5,11,4,6]}],['A flat plateau can be kept entirely',{maxHeights:[5,5,5,5]}],['A rising profile can peak at the right boundary',{maxHeights:[2,4,7,10]}],['One tower is already a mountain',{maxHeights:[13]}]],
2866:[['Repeated stack pops reuse optimal arm sums across a longer skyline',{maxHeights:[12,5,9,3,11,14,8,8,4,10,6]}],['Equal caps retain valid no-taller stack anchors',{maxHeights:[7,7,7,7,7]}],['A descending skyline can peak at its left boundary',{maxHeights:[15,11,8,5,2]}],['One cap is counted once after combining both arms',{maxHeights:[19]}]],
3113:[['Equal boundary maxima survive smaller interiors but not larger barriers',{nums:[6,2,6,4,6,9,3,9,9,1,6]}],['Every subarray of an equal run qualifies',{nums:[4,4,4,4]}],['Strictly increasing values allow only singletons',{nums:[1,3,5,7]}],['A larger interior value blocks equal outer boundaries',{nums:[3,8,3]}]],
};
function validate(id,input){const values=id===2487?input.head:id===3113?input.nums:input.maxHeights;if(!Array.isArray(values)||values.length<1||values.length>(id===2865?40:100)||!values.every(v=>Number.isInteger(v)&&v>=1&&v<=1000000))throw new Error('Use positive heights or values up to one million, with at most 40 entries for peak enumeration and 100 otherwise.');return input;}
export default {specs,solvers,python,cases,validate,pseudocodeStages:{2487:{retain:4},2865:{peak:4},2866:{left:1,right:2,combine:4},3113:{group:4}},tags:{2487:['Linked List','Monotonic Stack'],2865:['Enumeration'],2866:['Monotonic Stack'],3113:['Monotonic Stack']}};
