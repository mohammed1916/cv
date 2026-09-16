import { parseLevelOrderTree } from './levelOrderTree.js';
import { binaryTreeLayout } from './binaryTreeLayout.js';

export function traceLevelOrder(text) {
  const root = parseLevelOrderTree(text), layout = binaryTreeLayout(root);
  const steps = [], queue = root ? [root] : [], visited = new Set(), levels = [];
  let head = 0, remaining = 0, currentLevel = [];
  const emit = (phase, activeLine, message, active = null) => steps.push({
    phase, activeLine, message, positions: layout.positions, edges: layout.edges, allNodes: layout.nodes,
    activeIds: new Set(active === null ? [] : [active]), visitedIds: new Set(visited),
    queueIds: new Set(queue.slice(head).map(n=>n.id)), queue: queue.slice(head).map(n=>({id:n.id,val:n.val})),
    remaining, currentLevel: [...currentLevel], levels: levels.map(l=>[...l]),
  });
  if (!root) { emit('done',3,'Empty tree: return no levels.'); return steps; }
  emit('init',4,'Enqueue the root. The front of the queue is processed first.');
  while (head < queue.length) {
    remaining = queue.length-head;
    currentLevel=[];
    emit('level-start',7,`Freeze this level's size at ${remaining}. Newly enqueued children belong to the next level.`);
    while (remaining) {
      const node=queue[head++];
      emit('dequeue',8,`Remove node #${node.id} (${node.val}) from the front.`,node.id);
      currentLevel.push(node.val); visited.add(node.id);
      emit('visit',9,`Append ${node.val} to this level.`,node.id);
      for (const [side,line] of [['left',10],['right',11]]) {
        if (node[side]) queue.push(node[side]);
        emit('enqueue',line,node[side]?`Append ${side} child #${node[side].id} to the back, behind all waiting nodes.`:`No ${side} child to enqueue.`,node.id);
      }
      remaining--;
    }
    levels.push([...currentLevel]);
    emit('level-done',12,`Save level ${levels.length-1}: [${currentLevel.join(', ')}].`);
  }
  emit('done',13,'Every queued node has been processed. Return the grouped levels.');
  return steps;
}
