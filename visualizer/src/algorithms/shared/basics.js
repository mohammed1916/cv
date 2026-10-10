import { AuthoredMinHeap } from '../../problems/families/collectionStories/authoredMinHeap.js';

function trace(input) {
  const frames = [];
  const emit = (message, state = {}, activeLine = 1, phase = 'inspect') => frames.push(structuredClone({ phase, activeLine, message, ...state }));
  return { emit, finish: result => ({ input: structuredClone(input), frames, result }) };
}

export function linearSearch(input) {
  const { nums, target } = input, { emit, finish } = trace(input);
  emit('No positions have been checked yet.', { index: -1, checked: [] }, 1, 'start');
  const checked = [];
  for (let i = 0; i < nums.length; i++) {
    emit(`Compare position ${i}: ${nums[i]} with target ${target}.`, { index: i, checked }, 3);
    if (nums[i] === target) {
      emit(`The first match is at index ${i}; earlier positions were ruled out.`, { index: i, checked, result: i }, 4, 'done');
      return finish(i);
    }
    checked.push(i);
    emit(`Rule out index ${i}. Search continues without requiring a sorted array.`, { index: i, checked }, 2, 'update');
  }
  emit('Every position was checked. Return -1.', { index: -1, checked, result: -1 }, 5, 'done');
  return finish(-1);
}

export function lowerBound(input) {
  const { nums, target } = input, { emit, finish } = trace(input);
  let left = 0, right = nums.length;
  emit('Use the half-open interval [left, right). The insertion point may be n.', { left, right, mid: null }, 2, 'start');
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    emit(`Read nums[${mid}] = ${nums[mid]}. Is it below ${target}?`, { left, right, mid }, 5);
    if (nums[mid] < target) {
      left = mid + 1;
      emit('This value and everything before it are too small.', { left, right, mid }, 6, 'update');
    } else {
      right = mid;
      emit('Keep this position as a candidate; an earlier equal value may exist.', { left, right, mid }, 8, 'update');
    }
  }
  emit(`First value at least ${target} belongs at index ${left}${left === nums.length ? ' (past the last item)' : ''}.`, { left, right, mid: null, result: left }, 9, 'done');
  return finish(left);
}

export function heapOperations(input) {
  const { emit, finish } = trace(input), output = [];
  let action = '', operation = -1;
  const heap = new AuthoredMinHeap((a, b) => a - b, event => {
    const message = event.type === 'compare' ? `Compare tree positions ${event.indices.join(' and ')}; the smaller value must be above.`
      : event.type === 'swap' ? 'Swap along one ancestor path to repair the heap property.'
      : event.type === 'append' ? 'Append a leaf, then sift it toward its parent.'
      : 'Remove the minimum; move the last leaf to the root and sift down.';
    emit(message, { ...event, action, operation, output }, action === 'push' ? 6 : 8, event.type === 'compare' ? 'inspect' : 'update');
  });
  emit('Start with an empty min-heap. Parent values never exceed their children.', { heap: [], indices: [], output }, 3, 'start');
  input.operations.forEach((op, index) => {
    operation = index; action = op[0];
    if (action === 'push') heap.push(op[1]);
    else output.push(heap.pop() ?? null);
    emit(`${action === 'push' ? `Inserted ${op[1]}` : `Removed ${output.at(-1) ?? 'nothing: heap is empty'}`}. The heap property is restored.`, { heap: heap.data, indices: [], output, operation, action }, action === 'push' ? 6 : 8, 'update');
  });
  emit('Return the values removed by pop operations; null marks an empty pop.', { heap: heap.data, indices: [], output, result: output }, 9, 'done');
  return finish(output);
}

export function segmentTree(input) {
  const { emit, finish } = trace(input), nums = [...input.nums], nodes = [], output = [];
  let operation = 'build', query = null;
  const show = (message, node, line, phase = 'update', extra = {}) => emit(message, { nums, nodes, output, active: node, operation, query, ...extra }, line, phase);
  function build(lo, hi, parent = null) {
    const id = nodes.length;
    nodes.push({ id, parent, lo, hi, sum: null, left: null, right: null });
    show(`Create a node for inclusive range [${lo}, ${hi}].`, id, 4);
    if (lo === hi) nodes[id].sum = nums[lo];
    else {
      const mid = Math.floor((lo + hi) / 2);
      const left = build(lo, mid, id), right = build(mid + 1, hi, id);
      Object.assign(nodes[id], { left, right, sum: nodes[left].sum + nodes[right].sum });
    }
    show(`Range [${lo}, ${hi}] stores sum ${nodes[id].sum}.`, id, lo === hi ? 5 : 9);
    return id;
  }
  function update(id, index, value) {
    const node = nodes[id];
    show(`Descend only through the range containing index ${index}.`, id, 17, 'inspect');
    if (node.lo === node.hi) { node.sum = value; nums[index] = value; }
    else {
      update(index <= nodes[node.left].hi ? node.left : node.right, index, value);
      node.sum = nodes[node.left].sum + nodes[node.right].sum;
    }
    show(`Recompute [${node.lo}, ${node.hi}] as ${node.sum}; unrelated branches stay unchanged.`, id, node.lo === node.hi ? 18 : 23);
  }
  function sum(id, lo, hi) {
    const node = nodes[id];
    if (hi < node.lo || lo > node.hi) { show('No overlap: contribute zero and prune this branch.', id, 12, 'inspect', { contribution: 0 }); return 0; }
    if (lo <= node.lo && node.hi <= hi) { show(`Full overlap: reuse stored sum ${node.sum} without visiting children.`, id, 13, 'inspect', { contribution: node.sum }); return node.sum; }
    show('Partial overlap: split the query between the two child ranges.', id, 15, 'inspect');
    const result = sum(node.left, lo, hi) + sum(node.right, lo, hi);
    show(`Combine child contributions into ${result}.`, id, 15, 'update', { contribution: result });
    return result;
  }
  emit('Build once, then reuse stored range sums for queries and point updates.', { nums, nodes, output, active: -1 }, 2, 'start');
  build(0, nums.length - 1);
  for (const op of input.operations) {
    operation = op[0]; query = operation === 'sum' ? [op[1], op[2]] : null;
    if (operation === 'set') update(0, op[1], op[2]);
    else output.push(sum(0, op[1], op[2]));
    show(`Completed ${JSON.stringify(op)}.`, 0, operation === 'set' ? 26 : 27);
  }
  show('Return the range-query answers in operation order.', -1, 28, 'done', { result: output });
  return finish(output);
}

export function trieLookup(input) {
  const { emit, finish } = trace(input), nodes = [{ id: 0, parent: null, char: '', prefix: '', terminal: false }], children = [new Map()];
  const show = (message, activeNode, word, index, line, phase = 'update', extra = {}) => emit(message, { nodes, activeNode, word, index, ...extra }, line, phase);
  show('Start at the empty prefix. Shared prefixes reuse the same nodes.', 0, '', -1, 2, 'start');
  for (const word of input.words) {
    let at = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!children[at].has(char)) {
        const id = nodes.length;
        children[at].set(char, id); children.push(new Map());
        nodes.push({ id, parent: at, char, prefix: word.slice(0, i + 1), terminal: false });
        at = id;
        show(`Create an edge for '${char}'; prefix '${nodes[at].prefix}' is new.`, at, word, i, 6);
      } else { at = children[at].get(char); show(`Reuse the existing prefix '${nodes[at].prefix}'.`, at, word, i, 6); }
    }
    nodes[at].terminal = true;
    show(`Mark '${word}' as a complete word. A prefix alone is not a complete word.`, at, word, word.length - 1, 7);
  }
  let at = 0;
  for (let i = 0; i < input.query.length; i++) {
    const char = input.query[i];
    show(`Follow edge '${char}' from prefix '${nodes[at].prefix}'.`, at, input.query, i, 10, 'inspect');
    if (!children[at].has(char)) {
      const result = { prefix: false, word: false };
      show('The edge is missing: neither a prefix nor a word matches.', at, input.query, i, 11, 'done', { result });
      return finish(result);
    }
    at = children[at].get(char);
    show(`Matched prefix '${nodes[at].prefix}'.`, at, input.query, i, 12, 'inspect');
  }
  const result = { prefix: true, word: nodes[at].terminal };
  show(result.word ? 'All characters match and the node is terminal: exact word found.' : 'All characters match, but this node is not terminal: prefix only.', at, input.query, input.query.length - 1, 13, 'done', { result });
  return finish(result);
}

export function prefixSums(input) {
  const { emit, finish } = trace(input), prefix = [0], output = [];
  emit('prefix[0] = 0 represents an empty prefix.', { prefix, output, index: -1 }, 2, 'start');
  input.nums.forEach((value, i) => {
    prefix.push(prefix.at(-1) + value);
    emit(`prefix[${i + 1}] = ${prefix[i]} + ${value} = ${prefix[i + 1]}.`, { prefix, output, index: i }, 4, 'update');
  });
  for (const [left, right] of input.queries) {
    const result = prefix[right + 1] - prefix[left];
    output.push(result);
    emit(`Subtract prefix[${left}] = ${prefix[left]} from prefix[${right + 1}] = ${prefix[right + 1]}; the inclusive range sums to ${result}.`, { prefix, output, index: -1, query: [left, right], reads: [left, right + 1] }, 7, 'inspect');
  }
  emit('Preprocessing makes every range sum a pair of reads and one subtraction.', { prefix, output, index: -1, result: output }, 8, 'done');
  return finish(output);
}

export function breadthFirstSearch(input) {
  const { emit, finish } = trace(input), adjacency = Array.from({ length: input.n }, () => []), distance = Array(input.n).fill(null), parent = Array(input.n).fill(null), queue = [input.start], visited = [];
  for (const [a, b] of input.edges) { adjacency[a].push(b); adjacency[b].push(a); }
  distance[input.start] = 0;
  const show = (message, active, neighbor, line, phase = 'inspect', extra = {}) => emit(message, { distance, parent, queue, visited, active, neighbor, ...extra }, line, phase);
  show('Enqueue the start vertex at distance zero. Mark vertices when enqueued.', input.start, null, 6, 'start');
  while (queue.length) {
    const vertex = queue.shift(); visited.push(vertex);
    show(`Dequeue ${vertex}. FIFO order processes nearer vertices before farther ones.`, vertex, null, 9);
    for (const neighbor of adjacency[vertex]) {
      if (distance[neighbor] !== null) { show(`Vertex ${neighbor} is already discovered; do not enqueue it again.`, vertex, neighbor, 11); continue; }
      distance[neighbor] = distance[vertex] + 1; parent[neighbor] = vertex; queue.push(neighbor);
      show(`Discover ${neighbor} from ${vertex}: distance ${distance[neighbor]}, parent ${vertex}.`, vertex, neighbor, 13, 'update');
    }
  }
  show('The queue is empty. Null distances identify unreachable vertices.', null, null, 14, 'done', { result: distance });
  return finish(distance);
}
