import {parseLevelOrderTree} from '../../../components/shared/levelOrderTree.js';
import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout.js';
const specs={
426:['root','Convert a binary search tree into a sorted circular doubly linked list using the original nodes.','Inorder traversal gives sorted node order. Reuse each node by linking its left pointer to its predecessor and right pointer to its successor, then close the first and last links into a circle.','collect original nodes in inorder|clear their tree links and append them to a doubly linked chain|connect each predecessor and successor in both directions|link the first and last nodes to close the circle|return one forward traversal of the circular list','O(n) time and O(n) inorder-reference space in this implementation.'],
427:['grid','Represent a binary square grid as a quad tree that compresses uniform regions.','A prefix sum detects whether a region is all zero or all one. Uniform regions become leaves; mixed regions split into top-left top-right bottom-left and bottom-right quadrants.','build a two-dimensional sum table|inspect the current square region total|emit one leaf for a uniform region|split mixed regions into four ordered quadrants and recurse|return the resulting nested quad-tree representation','O(n^2) time and space for an n-by-n grid.'],
432:['operations','Maintain string counts with constant-time updates and minimum/maximum-key queries.','Link nonempty count buckets in increasing order and map each key to its bucket. An increment or decrement moves a key only to a neighboring count bucket; the two list ends expose the extremes.','initialize linked count buckets and key locations|move incremented keys into the next count bucket|move decremented keys into the previous bucket or remove zero-count keys|remove empty buckets and read extreme keys from the list ends|return update and query results','Expected O(1) per operation; O(number of keys) space.'],
487:['nums','Find the longest run of ones obtainable by flipping at most one zero.','Maintain a window containing at most one zero. Adding a second zero forces the left boundary past the older zero; the widest valid window is the answer.','extend the right boundary one value at a time|count zeros in the current window|advance the left boundary while more than one zero remains|record the widest valid window|return its length','O(n) time; O(1) auxiliary state.'],
491:['nums','List all distinct nondecreasing subsequences of length at least two.','Backtracking preserves source order and permits equal values. A fresh used-value set at each recursion depth prevents duplicate choices at that depth without blocking equal values later in a subsequence.','choose the next source index after the current prefix|skip values smaller than the last retained value|skip duplicate next values only at the current recursion depth|record every prefix of length at least two and recurse|return all unique nondecreasing subsequences','O(n*2^n) output-sensitive time and O(n) recursion space excluding output.'],
};
function inorder(root){const order=[],stack=[];let node=root;while(node||stack.length){while(node){stack.push(node);node=node.left;}node=stack.pop();order.push(node);node=node.right;}return order;}
const solvers={
426({root},emit){const tree=parseLevelOrderTree(JSON.stringify(root)),order=inorder(tree);for(const node of order){node.left=null;node.right=null;}const linked=[];for(let i=0;i<order.length;i++){const node=order[i],previous=order[i-1];if(previous){previous.right=node;node.left=previous;}linked.push(node);emit('Inorder fixes the sorted order while retaining original node identities. Append this node by assigning both the predecessor next link and the new node previous link.',{treeDiagram:null,doublyLinkedList:{nodes:linked.map(n=>({id:n.id,val:n.val,prevId:n.left?.id??null,nextId:n.right?.id??null})),headId:order[0].id,activeIds:[node.id,...(previous?[previous.id]:[])]},codeStage:'link',metrics:{node:node.val,previous:previous?.val??'none',linkedNodes:linked.length}},'update');}if(order.length){order[0].left=order.at(-1);order.at(-1).right=order[0];emit('Close both ends: the first node previous pointer reaches the last, and the last node next pointer reaches the first. A singleton points to itself in both directions.',{treeDiagram:null,doublyLinkedList:{nodes:order.map(n=>({id:n.id,val:n.val,prevId:n.left.id,nextId:n.right.id})),headId:order[0].id,activeIds:[order[0].id,order.at(-1).id]},codeStage:'close',metrics:{first:order[0].val,last:order.at(-1).val,circular:true}},'update');}return order.map(node=>node.val);},
427({grid},emit){const n=grid.length,prefix=Array.from({length:n+1},()=>Array(n+1).fill(0)),records=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)prefix[r+1][c+1]=grid[r][c]+prefix[r][c+1]+prefix[r+1][c]-prefix[r][c];function build(r,c,size,parent='none',quadrant='root'){const sum=prefix[r+size][c+size]-prefix[r][c+size]-prefix[r+size][c]+prefix[r][c],leaf=sum===0||sum===size*size,id=records.length;records.push([id,parent,quadrant,`${r},${c}`,size,leaf?'leaf':'branch',leaf?Number(sum>0):'mixed']);emit(leaf?'Every cell in this region has the same value, so one leaf replaces the entire square.':'This region contains both values, so split it into four equal quadrants in a fixed order.',{matrix:grid,region:[r,c,r+size-1,c+size-1],table:records.map(row=>[...row]),tableHeaders:['Node','Parent','Quadrant','Top-left','Side length','Kind','Value'],codeStage:leaf?'leaf':'split',metrics:{node:id,row:r,column:c,size,ones:sum,area:size*size}},'update');if(leaf)return{isLeaf:true,val:sum>0,children:[]};const half=size/2;return{isLeaf:false,val:true,children:[build(r,c,half,id,'top-left'),build(r,c+half,half,id,'top-right'),build(r+half,c,half,id,'bottom-left'),build(r+half,c+half,half,id,'bottom-right')]};}return build(0,0,n);},
432({operations},emit){const head={id:'head',count:0,keys:new Set()},tail={id:'tail',count:Infinity,keys:new Set()};head.next=tail;tail.prev=head;const locations=new Map(),answer=[];let nextId=0;const insertAfter=(previous,count)=>{const bucket={id:nextId++,count,keys:new Set(),prev:previous,next:previous.next};previous.next.prev=bucket;previous.next=bucket;return bucket;};for(let operation=0;operation<operations.length;operation++){const[type,key]=operations[operation];let result=null;if(type==='inc'||type==='dec'){const old=locations.get(key),count=(old?.count||0)+(type==='inc'?1:-1);if(count>0){let destination;if(type==='inc'){const previous=old||head;destination=previous.next.count===count?previous.next:insertAfter(previous,count);}else destination=old.prev.count===count?old.prev:insertAfter(old.prev,count);destination.keys.add(key);locations.set(key,destination);}else locations.delete(key);if(old){old.keys.delete(key);if(!old.keys.size){old.prev.next=old.next;old.next.prev=old.prev;}}}else{const bucket=type==='getMinKey'?head.next:tail.prev;result=bucket===head||bucket===tail?'':bucket.keys.values().next().value;}answer.push(result);const buckets=[];for(let bucket=head.next;bucket!==tail;bucket=bucket.next)buckets.push(bucket);emit(type==='inc'||type==='dec'?'Move only between adjacent count levels, creating a missing neighbor bucket and removing an emptied source bucket. The key-location map avoids searching for the old count.':'The first and last nonempty buckets expose minimum and maximum counts directly. Any key in the chosen bucket is a valid answer.',{doublyLinkedList:{nodes:buckets.map(bucket=>({id:bucket.id,val:bucket.count,prevId:bucket.prev===head?null:bucket.prev.id,nextId:bucket.next===tail?null:bucket.next.id})),headId:buckets[0]?.id??null,activeIds:key&&locations.has(key)?[locations.get(key).id]:[]},table:buckets.map(bucket=>[bucket.id,bucket.count,[...bucket.keys].join(', ')]),tableHeaders:['Bucket ID','Count','Keys'],output:[...answer],codeStage:type,metrics:{operation:operation+1,type,key:key??'none',result:result??'updated',keys:locations.size,buckets:buckets.length}},'update');}return answer;},
487({nums},emit){let left=0,zeros=0,best=0;for(let right=0;right<nums.length;right++){zeros+=Number(nums[right]===0);while(zeros>1)zeros-=Number(nums[left++]===0);best=Math.max(best,right-left+1);emit('This window contains at most one zero, so flipping that one position can make the whole window ones. A second zero forces the left boundary forward until the older zero leaves.',{index:right,window:[left,right],codeStage:'window',metrics:{left,right,zeros,length:right-left+1,best}},'update');}return best;},
491({nums},emit){const answer=[],path=[],indices=[];function dfs(start){if(path.length>=2){answer.push([...path]);emit('This source-ordered prefix is nondecreasing and long enough to be an answer. Continue extending it so longer valid subsequences are included too.',{sequence:nums,marks:Object.fromEntries(indices.map(i=>[i,'chosen'])),output:[...path],codeStage:'record',metrics:{nextStart:start,length:path.length,answers:answer.length}},'update');}const used=new Set();for(let i=start;i<nums.length;i++){if((path.length&&nums[i]<path.at(-1))||used.has(nums[i]))continue;used.add(nums[i]);path.push(nums[i]);indices.push(i);dfs(i+1);indices.pop();path.pop();}}dfs(0);return answer;},
};
const python={
426:`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def treeToDoublyList(root):
    from collections import deque
    if not root:
        return []
    tree = Node(root[0])
    queue, cursor = deque([tree]), 1
    while queue and cursor < len(root):
        node = queue.popleft()
        for side in ('left', 'right'):
            if cursor == len(root):
                break
            value = root[cursor]
            cursor += 1
            if value is not None:
                child = Node(value)
                setattr(node, side, child)
                queue.append(child)
    order, stack, node = [], [], tree
    while node is not None or stack:
        while node is not None:
            stack.append(node)
            node = node.left
        node = stack.pop()
        order.append(node)
        node = node.right
    for node in order:
        node.left = node.right = None
    for i, node in enumerate(order):
        if i:
            order[i - 1].right = node
            node.left = order[i - 1]
        # step: link
    order[0].left, order[-1].right = order[-1], order[0]  # step: close
    # Serialize one forward traversal of the circular list.
    return [node.val for node in order]  # step: return`,
427:`def construct(grid):
    n = len(grid)
    prefix = [[0] * (n + 1) for _ in range(n + 1)]
    for r in range(n):
        for c in range(n):
            prefix[r + 1][c + 1] = grid[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c]
    def build(r, c, size):
        total = prefix[r + size][c + size] - prefix[r][c + size] - prefix[r + size][c] + prefix[r][c]
        if total == 0 or total == size * size:
            return {'isLeaf': True, 'val': total > 0, 'children': []}  # step: leaf
        half = size // 2  # step: split
        children = [build(r, c, half), build(r, c + half, half),
                    build(r + half, c, half), build(r + half, c + half, half)]
        return {'isLeaf': False, 'val': True, 'children': children}
    return build(0, 0, n)  # step: return`,
432:`class Bucket:
    def __init__(self, count):
        self.count, self.keys = count, {}
        self.prev = self.next = None

class AllOne:
    def __init__(self):
        self.head, self.tail = Bucket(0), Bucket(float('inf'))
        self.head.next, self.tail.prev = self.tail, self.head
        self.locations = {}

    def _insert_after(self, previous, count):
        bucket = Bucket(count)
        bucket.prev, bucket.next = previous, previous.next
        previous.next.prev, previous.next = bucket, bucket
        return bucket

    def _remove_empty(self, bucket):
        if not bucket.keys:
            bucket.prev.next, bucket.next.prev = bucket.next, bucket.prev

    def inc(self, key):
        old = self.locations.get(key)
        previous = old if old else self.head
        count = previous.count + 1
        destination = previous.next if previous.next.count == count else self._insert_after(previous, count)
        destination.keys[key] = None
        self.locations[key] = destination
        if old:
            del old.keys[key]
            self._remove_empty(old)
        # step: inc

    def dec(self, key):
        old = self.locations[key]
        count = old.count - 1
        if count:
            destination = old.prev if old.prev.count == count else self._insert_after(old.prev, count)
            destination.keys[key] = None
            self.locations[key] = destination
        else:
            del self.locations[key]
        del old.keys[key]
        self._remove_empty(old)  # step: dec

    def getMinKey(self):
        return next(iter(self.head.next.keys), '')  # step: getMinKey

    def getMaxKey(self):
        return next(iter(self.tail.prev.keys), '')  # step: getMaxKey

def runAllOne(operations):
    counts, answer = AllOne(), []
    for operation in operations:
        answer.append(getattr(counts, operation[0])(*operation[1:]))
    return answer  # step: return`,
487:`def findMaxConsecutiveOnes(nums):
    left = zeros = best = 0
    for right, value in enumerate(nums):
        zeros += int(value == 0)
        while zeros > 1:
            zeros -= int(nums[left] == 0)
            left += 1
        best = max(best, right - left + 1)  # step: window
    return best  # step: return`,
491:`def findSubsequences(nums):
    answer, path = [], []
    def dfs(start):
        if len(path) >= 2:
            answer.append(path[:])  # step: record
        used = set()
        for i in range(start, len(nums)):
            if (path and nums[i] < path[-1]) or nums[i] in used:
                continue
            used.add(nums[i])
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return answer  # step: return`,
};
const cases={
426:[['A deeper BST becomes one bidirectional sorted cycle',{root:[30,14,52,7,21,43,68,null,10,18,25,39,47,61,75]}],['One original node links to itself in both directions',{root:[11]}],['A skewed tree still produces sorted circular order',{root:[4,null,9,null,16,null,25]}],['An empty tree produces an empty list',{root:[]}]],
427:[['Some quadrants are uniform while others require another split',{grid:[[1,1,0,0],[1,1,0,1],[0,0,1,1],[0,0,1,1]]}],['A uniform square compresses to one leaf',{grid:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]}],['A checkerboard reaches one-cell leaves',{grid:[[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]]}],['One cell is already a leaf',{grid:[[1]]}]],
432:[['Keys move between count buckets while empty buckets disappear',{operations:[['inc','fern'],['inc','oak'],['inc','fern'],['inc','pine'],['inc','pine'],['inc','pine'],['getMaxKey'],['dec','pine'],['dec','fern'],['getMinKey'],['dec','oak'],['getMaxKey']]}],['Empty extreme queries return empty strings',{operations:[['getMinKey'],['getMaxKey'],['inc','bay'],['dec','bay'],['getMinKey']]}],['Several keys can share one count bucket',{operations:[['inc','a'],['inc','b'],['inc','c'],['getMinKey'],['getMaxKey'],['inc','b'],['getMaxKey']]}],['Decrementing can recreate a missing intermediate bucket',{operations:[['inc','x'],['inc','x'],['inc','x'],['inc','y'],['dec','x'],['getMinKey'],['getMaxKey']]}]],
487:[['Different one-zero windows compete across a longer binary array',{nums:[1,1,0,1,1,1,0,1,1,0,1,1,1,1]}],['All ones need no flip',{nums:[1,1,1,1,1,1]}],['All zeros can contribute only one flipped position',{nums:[0,0,0,0]}],['A zero between two runs joins them with one flip',{nums:[1,1,1,0,1,1,1,1]}]],
491:[['Equal values and later smaller values require full depth-aware search',{nums:[2,5,3,3,6,4,7,7]}],['Equal values may extend a nondecreasing subsequence',{nums:[4,4,4,4]}],['Strictly decreasing values have no length-two result',{nums:[9,7,5,3,1]}],['A singleton cannot produce a qualifying subsequence',{nums:[12]}]],
};
function validate(id,input){
  const need=(ok,message)=>{if(!ok)throw new Error(message);};
  const integer=(v,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  if(id===426){need(Array.isArray(input.root)&&input.root.length<=63&&(input.root.length===0||integer(input.root[0],-10000,10000))&&input.root.every(v=>v===null||integer(v,-10000,10000)),'Use an empty tree or at most 63 level-order values with null gaps and a numeric root.');const values=inorder(parseLevelOrderTree(JSON.stringify(input.root))).map(node=>node.val);need(values.every((v,i)=>i===0||v>values[i-1]),'The input must be a binary search tree with distinct values.');}
  if(id===427)need(Array.isArray(input.grid)&&[1,2,4,8].includes(input.grid.length)&&input.grid.every(row=>Array.isArray(row)&&row.length===input.grid.length&&row.every(v=>v===0||v===1)),'Use a binary square grid with side length 1, 2, 4, or 8.');
  if(id===432){need(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=80,'Use 1-80 AllOne operations.');const counts=new Map();for(const op of input.operations){need(Array.isArray(op),'Each operation must be an array.');if(op[0]==='inc'||op[0]==='dec'){need(op.length===2&&typeof op[1]==='string'&&/^[a-z]{1,20}$/.test(op[1]),'Updates need one lowercase key of length 1-20.');need(op[0]!=='dec'||counts.get(op[1])>0,'Only an existing key may be decremented.');counts.set(op[1],(counts.get(op[1])||0)+(op[0]==='inc'?1:-1));}else need(['getMinKey','getMaxKey'].includes(op[0])&&op.length===1,'Use inc/dec with a key or getMinKey/getMaxKey with no arguments.');}}
  if(id===487)need(Array.isArray(input.nums)&&input.nums.length>=1&&input.nums.length<=120&&input.nums.every(v=>v===0||v===1),'Use 1-120 binary values.');
  if(id===491)need(Array.isArray(input.nums)&&input.nums.length<=10&&input.nums.every(v=>integer(v,-10000,10000)),'Use at most ten signed values for bounded complete subsequence enumeration.');
  return input;
}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>id===426?{treeDiagram:binaryTreeLayout(parseLevelOrderTree(JSON.stringify(input.root)))}:{},pseudocodeStages:{426:{link:3,close:4},427:{leaf:3,split:4},432:{inc:2,dec:3,getMinKey:4,getMaxKey:4},487:{window:4},491:{record:4}},tags:{426:['Tree','Linked List'],427:['Tree','Divide and Conquer'],432:['Design','Hash Table'],487:['Sliding Window'],491:['Backtracking']}};
