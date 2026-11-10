// Authored for reverse linked list. Each scene names the nodes whose pointers the operation touches.
const reasons = {
  init: ['Start with nothing reversed', 'The reversed prefix is empty, so prev is None. curr starts at the head, the first node that still points forward in the original order.'],
  check: ['The loop needs a node to rewire', 'Reversal is finished when curr runs past the last node. While curr is a node, its forward pointer still leads into the untouched rest of the list.'],
  save: ['Save next before rewiring', 'Rewiring curr.next overwrites the only pointer that leads to the rest of the list. Saving nxt first keeps a handle on that rest, so the loop can continue after the pointer changes.'],
  rewire: ['Point curr back at prev', 'This single assignment reverses one link. curr.next moves from the saved nxt to prev, so the already reversed prefix hangs off curr and the old forward link is gone.'],
  move_prev: ['Grow the reversed prefix', 'curr now heads the reversed part, so it becomes prev. The nodes beyond nxt have not been touched, which is why the saved handle is still valid.'],
  move_curr: ['Step into the untouched rest', 'Moving curr to nxt returns to the unreversed part of the list. The next loop iteration will rewire this node in the same way.'],
  result: ['Return the new head', 'curr is None, so every original link has been reversed. prev is the last node that was rewired, which is the first node of the reversed list.'],
};

export function reverseListTutorial({ run, step, previousStep }) {
  const reason = reasons[step.kind] ?? reasons.check
  const { values } = run.input
  const show = i => (i >= 0 ? `node ${values[i]}` : 'None')
  const { prev, curr, nxt } = step
  let nodes = []
  let oldLink = null
  let newLink = null
  const variables = { prev: show(prev), curr: show(curr), nxt: show(nxt) }
  switch (step.kind) {
    case 'init':
      nodes = curr >= 0 ? [curr] : []
      variables.note = 'prev = None'
      break
    case 'check':
      nodes = curr >= 0 ? [curr] : []
      variables.test = curr >= 0 ? 'curr is a node' : 'curr is None'
      break
    case 'save':
      nodes = [curr, nxt].filter(i => i >= 0)
      oldLink = [curr, nxt]
      variables.saved = show(nxt)
      break
    case 'rewire':
      nodes = [prev, curr, nxt].filter(i => i >= 0)
      oldLink = nxt >= 0 ? [curr, nxt] : null
      newLink = [curr, prev]
      variables.transfer = `${show(nxt)} → ${show(prev)}`
      break
    case 'move_prev':
      nodes = [prev, nxt].filter(i => i >= 0)
      variables.kept = show(nxt)
      break
    case 'move_curr':
      nodes = [prev, curr].filter(i => i >= 0)
      break
    case 'result':
      nodes = prev >= 0 ? [prev] : []
      variables.head = show(prev)
      break
    default:
      break
  }
  if (previousStep && previousStep.kind === 'rewire' && step.kind === 'move_prev') variables.previous = 'curr.next was rewired'
  const focus = { kind: step.kind, nodes, oldLink, newLink, prev, curr, nxt }
  return { title: reason[0], reason: reason[1], action: step.message, variables, focus }
}
