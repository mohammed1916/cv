import {parseLevelOrderTree} from '../../../components/shared/levelOrderTree.js';
import {binaryTreeLayout} from '../../../components/shared/binaryTreeLayout.js';
const specs={510:['root target','Find the inorder successor of a BST node using its child and parent links.','If a right subtree exists, its leftmost node is next. Otherwise climb past ancestors reached from their right child; the first ancestor reached from its left child is the next larger node.','locate the target and attach parent links while decoding the tree|if the target has a right child enter that subtree|follow left children to its smallest node|otherwise climb while the current node is a right child|return the first left-side ancestor or null','O(h) successor search with O(1) auxiliary space; O(n) JSON tree decoding.']};
function decode(values){const root=parseLevelOrderTree(JSON.stringify(values)),nodes=[],parents=new Map();function visit(node,parent){if(!node)return;nodes.push(node);parents.set(node.id,parent);visit(node.left,node);visit(node.right,node);}visit(root,null);return {root,nodes,parents};}
const solvers={510({root:values,target},emit){const {root,nodes,parents}=decode(values),layout=binaryTreeLayout(root);let node=nodes.find(n=>n.val===target);const show=(message,stage)=>emit(message,{treeDiagram:{...layout,activeIds:new Set(node?[node.id]:[])},table:nodes.map(n=>[n.val,parents.get(n.id)?.val??'null',n.left?.val??'null',n.right?.val??'null']),tableHeaders:['Node','Parent','Left child','Right child'],codeStage:stage,metrics:{current:node?.val??'null',target}},'update');if(node.right){node=node.right;show('A right subtree contains larger values. Enter it, then search its left edge for the smallest one.','right');while(node.left){node=node.left;show('Moving left decreases the candidate while staying strictly larger than the original target.','left');}return node.val;}while(parents.get(node.id)&&parents.get(node.id).right===node){node=parents.get(node.id);show('We reached this ancestor from its right subtree, so that ancestor was already visited before the target. Continue upward.','climb');}node=parents.get(node.id);show(node?'This is the first ancestor reached from its left subtree. Inorder visits it immediately after that subtree finishes.':'Every ancestor was reached from its right subtree. The target was the maximum value and has no successor.','return');return node?.val??null;}};
const python={510:`class Node:
    def __init__(self, value, parent=None):
        self.val, self.parent = value, parent
        self.left = self.right = None

def inorderSuccessor(root, target):
    from collections import deque
    tree = Node(root[0])
    queue, index, selected = deque([tree]), 1, None
    while queue:
        node = queue.popleft()
        if node.val == target:
            selected = node
        for side in ('left', 'right'):
            if index < len(root):
                value = root[index]
                index += 1
                if value is not None:
                    child = Node(value, node)
                    setattr(node, side, child)
                    queue.append(child)
    node = selected
    if node.right:
        node = node.right  # step: right
        while node.left:
            node = node.left  # step: left
        return node.val  # step: found
    while node.parent and node.parent.right is node:
        node = node.parent  # step: climb
    return node.parent.val if node.parent else None  # step: return`};
const cases={510:[['The right subtree contains several smaller successor candidates',{root:[40,18,72,9,27,56,88,4,13,23,31,49,63,81,95],target:40}],['Climb past several right-child ancestors',{root:[40,18,72,9,27,56,88,null,null,23,31],target:31}],['The maximum node has no successor',{root:[16,8,24,3,12,20,29],target:29}],['A single-node tree also has no successor',{root:[17],target:17}]]};
function validate(id,input){const need=(ok,message)=>{if(!ok)throw new Error(message);},values=input.root;need(Array.isArray(values)&&values.length>=1&&values.length<=63&&Number.isSafeInteger(values[0])&&values.every(v=>v===null||(Number.isSafeInteger(v)&&Math.abs(v)<=1000000)),'Use 1-63 level-order BST entries, numeric root, and null gaps.');let slots=1;for(const value of values){need(slots>0||value===null,'Non-null values cannot follow an exhausted tree.');if(slots>0){slots--;if(value!==null)slots+=2;}}const {root,nodes}=decode(values);function check(node,low,high){if(!node)return true;return node.val>low&&node.val<high&&check(node.left,low,node.val)&&check(node.right,node.val,high);}need(check(root,-Infinity,Infinity),'Every node must obey strict BST ordering.');need(Number.isSafeInteger(input.target)&&nodes.some(n=>n.val===input.target),'Target must be a value present in the tree.');return input;}
export default {specs,solvers,python,cases,validate,inputState:(id,input)=>({treeDiagram:binaryTreeLayout(decode(input.root).root)}),resultStage:(id,result,input)=>decode(input.root).nodes.find(n=>n.val===input.target).right?'found':'return',pseudocodeStages:{510:{right:2,left:3,climb:4,found:5}},tags:{510:['Tree','Binary Search Tree']}};
