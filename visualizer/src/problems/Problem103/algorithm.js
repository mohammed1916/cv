import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
import { traceLevelOrder } from '../../components/shared/traceLevelOrder.js';

// The queue always traverses left to right; only the completed output row reverses.
export function generateSteps(text) {
  const output=[];
  const lines={3:2,4:4,7:7,8:10,9:11,10:12,11:13,12:15,13:17};
  for(const frame of traceLevelOrder(text)) {
    const levels=frame.levels.map((row,i)=>i%2?[...row].reverse():row);
    const levelNum=frame.phase==='level-done'?levels.length-1:levels.length;
    const leftToRight=levelNum%2===0;
    const mapped={...frame,activeLine:lines[frame.activeLine],result:levels,levelNum,leftToRight,level:frame.currentLevel};
    if(frame.phase==='level-done') {
      const level=leftToRight?frame.currentLevel:[...frame.currentLevel].reverse();
      output.push({...mapped,phase:'reverse',activeLine:14,result:levels.slice(0,-1),level,message:leftToRight?'Keep this row in traversal order.':'Reverse this completed row; the FIFO queue stays unchanged.'});
      output.push({...mapped,level,message:`Save output row ${levelNum}: [${level.join(', ')}].`});
      output.push({...mapped,phase:'direction',activeLine:16,level,leftToRight:!leftToRight,message:'Flip the output direction for the next level.'});
    } else output.push(mapped);
  }
  return output;
}

// ---- Binary Tree Zigzag Level Order Traversal (statement-sourced; see scratch statements/103.md) ----
export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = buildTreeFromLevels(arr)
  const levels = []
  const frames = [{ phase: 'start', activeLine: L('set queue to [root]'), node: root ? root.id : null, levels: [], message: 'Start a queue with the root.' }]
  let queue = root ? [root] : []
  while (queue.length) {
    const width = queue.length
    const row = []
    const next = []
    for (let i = 0; i < width; i++) {
      const node = queue[i]
      row.push(node.value)
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
      frames.push({ phase: 'visit', activeLine: L('take every node that is in the queue now'), node: node.id, levels: levels.map(l => [...l]), message: `Visit ${node.value} and queue its children.` })
    }
    const reversed = levels.length % 2 === 1
    levels.push(reversed ? [...row].reverse() : row)
    frames.push({ phase: 'level', activeLine: L('append row to result'), node: null, levels: levels.map(l => [...l]), message: reversed ? `Level ${levels.length} runs right to left: [${levels.at(-1).join(', ')}].` : `Level ${levels.length} runs left to right: [${row.join(', ')}].` })
    queue = next
  }
  frames.push({ phase: 'done', activeLine: L('return result'), node: null, levels: levels.map(l => [...l]), message: `${levels.length} levels from top to bottom.` })
  return { input: arr, result: levels, frames }
}

export const code = `level order (root):
  set result to an empty list
  if the root is empty then return result
  set queue to [root]
  while the queue is not empty:
    set row to an empty list
    take every node that is in the queue now
    for each node taken, add its value to row
    queue the node's children for the next level
    if the level number is odd then reverse row
    append row to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def zigzag_level_order(root):
    result = []
    queue = [build(root)] if build(root) is not None else []
    while queue:
        row = []
        next_queue = []
        for node in queue:
            row.append(node.val)
            if node.left is not None:
                next_queue.append(node.left)
            if node.right is not None:
                next_queue.append(node.right)
        if len(result) % 2 == 1:
            row.reverse()
        result.append(row)
        queue = next_queue
    return result
`
