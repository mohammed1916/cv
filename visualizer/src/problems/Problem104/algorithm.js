import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';
import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';

export function generateSteps(text) {
  const root=parseLevelOrderTree(text),layout=binaryTreeLayout(root),steps=[],returnValues=new Map(),paths=new Map();
  const stack=root?[{node:root,stage:0}]:[];
  const emit=(phase,activeLine,node,message,extra={})=>steps.push({phase,activeLine,activeId:node?.id??-1,callStack:stack.map(w=>w.node.val),returnValues:new Map(returnValues),message,...extra});
  while(stack.length){
    const work=stack.at(-1),node=work.node;
    if(work.stage===0){emit('call',4,node,`Explore the left subtree of ${node.val}. A missing child contributes zero.`);work.stage=1;if(node.left)stack.push({node:node.left,stage:0});continue;}
    const left=node.left?returnValues.get(node.left.id):0;
    if(work.stage===1){emit('right',5,node,`Left depth is ${left}. Explore the right subtree.`,{left});work.stage=2;if(node.right)stack.push({node:node.right,stage:0});continue;}
    const right=node.right?returnValues.get(node.right.id):0,depth=1+Math.max(left,right),chosen=left>=right?node.left:node.right;
    returnValues.set(node.id,depth);paths.set(node.id,[node.id,...(chosen?paths.get(chosen.id):[])]);
    emit('return',6,node,`Return ${depth}: this node plus the deeper child (${left} versus ${right}).`,{left,right,path:paths.get(node.id)});
    stack.pop();
  }
  emit('done',root?6:3,null,`Maximum depth = ${root?returnValues.get(root.id):0}`,{path:root?paths.get(root.id):[],total:root?returnValues.get(root.id):0});
  return {...layout,steps};
}

// ---- Maximum Depth of Binary Tree (statement-sourced; see scratch statements/104.md) ----
export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = buildTreeFromLevels(arr)
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('if the root is empty'), node: root ? root.id : null, depth: 0, best: 0, message: 'Walk the tree and track the deepest node seen.' }]
  const visit = (node, depth) => {
    if (!node) return
    best = Math.max(best, depth)
    frames.push({ phase: 'visit', activeLine: L('set best to the larger of best and level'), node: node.id, depth, best, message: `Node ${node.value} is at depth ${depth}. Deepest so far: ${best}.` })
    visit(node.left, depth + 1)
    visit(node.right, depth + 1)
  }
  visit(root, 1)
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, depth: best, best, message: `Maximum depth is ${best}.` })
  return { input: arr, result: best, frames }
}

export const code = `maximum depth (root):
  if the root is empty then return 0
  set best to 0
  call visit on the root at level 1
  return best

visit(node, level):
  if node is empty then stop
  set best to the larger of best and level
  visit the left child at level + 1
  visit the right child at level + 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            node.left = TreeNode(arr[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            node.right = TreeNode(arr[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def max_depth(root):
    best = 0
    def visit(node, level):
        nonlocal best
        if node is None:
            return
        best = max(best, level)
        visit(node.left, level + 1)
        visit(node.right, level + 1)
    visit(build(root), 1)
    return best
`
