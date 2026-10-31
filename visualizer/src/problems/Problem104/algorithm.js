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
  let arr = text
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr) } catch { throw new Error('Use a JSON level-order array, such as [3,9,20,null,null,15,7].') }
  }
  if (arr && typeof arr === 'object' && !Array.isArray(arr) && 'root' in arr) arr = arr.root
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

// generateSteps owns the post-order walk: each frame carries the tree layout, the call stack and returned depths.
// Each frame is mapped to the pseudocode line in `code`.
const PSEUDO_LINE_FOR_LEGACY = { 3: 2, 4: 3, 5: 4, 6: 5 }
const PHASE_FOR_LEGACY = { 3: 'done', 4: 'left', 5: 'right', 6: 'return' }

export function buildTrace(input) {
  const arr = parseInput(input)
  const story = generateSteps(JSON.stringify(arr))
  const frames = story.steps.map(frame => ({
    ...frame,
    legacyLine: frame.activeLine,
    phase: PHASE_FOR_LEGACY[frame.activeLine],
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
    positions: story.positions,
    edges: story.edges,
    nodes: story.nodes,
    pythonLine: pythonLineFor(frame),
  }))
  return { input: arr, result: story.steps.at(-1).total, frames }
}

// Python line (1-based index into `python` above) that each frame executes.
function pythonLineFor(frame) {
  // frame.activeLine here is the legacy line: 4 = call left, 5 = call right, 6 = return, 3 = done
  if (frame.activeLine === 4) return 28   // left = depth(node.left)
  if (frame.activeLine === 5) return 29   // right = depth(node.right)
  if (frame.activeLine === 6) return frame.message.startsWith('Maximum depth') ? 31 : 30 // return 1 + max(...) / return depth(build(root))
  return 31                               // return depth(build(root))
}

export const code = `maximum depth (node):
  if node is empty then return 0
  depth of the left subtree is maximum depth (node.left)
  depth of the right subtree is maximum depth (node.right)
  return 1 plus the larger of the two depths`.split('\n').map((text, index) => ({ line: index + 1, text }))

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
    def depth(node):
        if node is None:
            return 0
        left = depth(node.left)
        right = depth(node.right)
        return 1 + max(left, right)
    return depth(build(root))
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 26,
  3: 28,
  4: 29,
  5: 30,
}
