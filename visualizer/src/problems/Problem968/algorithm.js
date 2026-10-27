import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && !Number.isInteger(v))) throw new Error('Values must be integers or null.')
  return arr
}

// State of a subtree's root: NEEDS = not watched yet, CAMERA = has a camera, WATCHED = watched without a camera.
const NEEDS = 0, CAMERA = 1, WATCHED = 2

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const states = new Map()
  const frames = [{ phase: 'start', activeLine: L('set cameras to 0'), node: null, states: {}, cameras: 0, message: 'Work from the leaves upward. Place a camera only when a node cannot be watched otherwise.' }]
  let cameras = 0
  // Post-order: children are decided before their parent.
  const visit = node => {
    if (!node) return WATCHED
    const left = visit(node.left), right = visit(node.right)
    let state
    let message
    if (left === NEEDS || right === NEEDS) {
      cameras++
      state = CAMERA
      message = `${node.value} has a child that needs watching, so it gets a camera.`
    } else if (left === CAMERA || right === CAMERA) {
      state = WATCHED
      message = `${node.value} is watched by a child's camera.`
    } else {
      state = NEEDS
      message = `${node.value}'s children are both watched without cameras, so ${node.value} must wait for its parent.`
    }
    states.set(node.id, state)
    frames.push({ phase: 'visit', activeLine: L(state === CAMERA ? 'add 1 to cameras and return CAMERA' : state === WATCHED ? 'if left or right is CAMERA' : 'return NEEDS'), node: node.id, states: Object.fromEntries(states), cameras, message })
    return state
  }
  if (visit(root) === NEEDS) {
    cameras++
    frames.push({ phase: 'root', activeLine: L('if visit(root) is NEEDS'), node: root.id, states: Object.fromEntries(states), cameras, message: 'The root itself is not watched, so it gets a camera.' })
  }
  frames.push({ phase: 'done', activeLine: L('return cameras'), node: null, states: Object.fromEntries(states), cameras, message: `${cameras} camera(s) cover the tree.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: cameras, frames }
}

export const code = `minCameraCover(root) returns the fewest cameras that watch every node
  set cameras to 0
  visit(node) returns the state of node: NEEDS, CAMERA, or WATCHED
    if node is empty, then return WATCHED
    set left and right to visit(left child) and visit(right child)
    if left or right is NEEDS, then add 1 to cameras and return CAMERA
    if left or right is CAMERA, then return WATCHED
    return NEEDS
  if visit(root) is NEEDS, then add 1 to cameras
  return cameras`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `NEEDS, CAMERA, WATCHED = 0, 1, 2

class TreeNode:
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

def min_camera_cover(arr):
    cameras = 0
    def visit(node):
        nonlocal cameras
        if not node:
            return WATCHED
        left, right = visit(node.left), visit(node.right)
        if left == NEEDS or right == NEEDS:
            cameras += 1
            return CAMERA
        if left == CAMERA or right == CAMERA:
            return WATCHED
        return NEEDS
    if visit(build(arr)) == NEEDS:
        cameras += 1
    return cameras`
