const PYTHON_LINES = [
  "def validateBinaryTreeNodes(n, leftChild, rightChild):",
  "    indegree = [0] * n",
  "    for i in range(n):",
  "        for child in (leftChild[i], rightChild[i]):",
  "            if child != -1:",
  "                indegree[child] += 1",
  "                if indegree[child] > 1:",
  "                    return False",
  "    roots = [i for i in range(n) if indegree[i] == 0]",
  "    if len(roots) != 1:",
  "        return False",
  "    seen = set()",
  "    stack = [roots[0]]",
  "    while stack:",
  "        node = stack.pop()",
  "        if node in seen:",
  "            return False",
  "        seen.add(node)",
  "        for child in (leftChild[node], rightChild[node]):",
  "            if child != -1:",
  "                stack.append(child)",
  "    return len(seen) == n",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "indegree[v] = 0 for every node v" },
  { line: 2, text: "for each node i:" },
  { line: 3, text: "for each child c of i (skip -1):" },
  { line: 4, text: "indegree[c] += 1; fail if it exceeds 1" },
  { line: 5, text: "roots = nodes with indegree 0" },
  { line: 6, text: "if roots is not exactly one node: return false" },
  { line: 7, text: "stack = [root]; seen = empty set" },
  { line: 8, text: "while stack is not empty:" },
  { line: 9, text: "node = pop; fail if seen; mark node as seen" },
  { line: 10, text: "push the children of node" },
  { line: 11, text: "return true only if every node was seen" },
];

export const pythonLineMap = { 1: 2, 2: 3, 3: 4, 4: 6, 5: 9, 6: 10, 7: 13, 8: 14, 9: 15, 10: 21, 11: 22 };

export const examples = [
  { label: "Valid tree", input: '{"n":4,"leftChild":[1,-1,3,-1],"rightChild":[2,-1,-1,-1]}' },
  { label: "Two parents", input: '{"n":4,"leftChild":[1,-1,3,-1],"rightChild":[2,3,-1,-1]}' },
  { label: "Cycle", input: '{"n":2,"leftChild":[1,0],"rightChild":[-1,-1]}' },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"n":4,"leftChild":[1,-1,3,-1],"rightChild":[2,-1,-1,-1]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { n, leftChild, rightChild } = data;
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be an integer of at least 1");
  if (n > 50) throw new Error(`n is ${n}; the visualization caps it at 50`);
  for (const [name, arr] of [["leftChild", leftChild], ["rightChild", rightChild]]) {
    if (!Array.isArray(arr) || arr.length !== n) throw new Error(`${name} must be an array of length n`);
    arr.forEach((v, i) => {
      if (!Number.isInteger(v) || v < -1 || v > n - 1) throw new Error(`${name}[${i}] must be -1 or a node from 0 to n-1`);
    });
  }
  return { n, leftChild: [...leftChild], rightChild: [...rightChild] };
}

export function buildTrace(input) {
  const { n, leftChild: L, rightChild: R } = input;
  const frames = [];
  const indegree = Array(n).fill(0);
  const snap = () => [...indegree];
  frames.push({ phase: "count", activeLine: 1, message: "Start every in-degree at 0.", node: null, indegree: snap(), visited: [], stack: [], ok: null });
  let ok = true;
  for (let i = 0; i < n && ok; i++) {
    frames.push({ phase: "count", activeLine: 2, message: `Look at the children of node ${i}.`, node: i, indegree: snap(), visited: [], stack: [], ok: null });
    for (const child of [L[i], R[i]]) {
      if (child === -1) continue;
      indegree[child] += 1;
      if (indegree[child] > 1) {
        ok = false;
        frames.push({ phase: "count", activeLine: 4, message: `Node ${child} has two parents; the answer is false.`, node: child, indegree: snap(), visited: [], stack: [], ok: false });
        break;
      }
      frames.push({ phase: "count", activeLine: 4, message: `Node ${child} gets a parent (${i}).`, node: child, indegree: snap(), visited: [], stack: [], ok: null });
    }
  }
  let visited = [];
  let root = null;
  if (ok) {
    const roots = [];
    for (let v = 0; v < n; v++) if (indegree[v] === 0) roots.push(v);
    frames.push({ phase: "roots", activeLine: 5, message: `Roots (indegree 0): ${JSON.stringify(roots)}.`, node: null, indegree: snap(), visited: [], stack: [], ok: null });
    if (roots.length !== 1) {
      ok = false;
      frames.push({ phase: "roots", activeLine: 6, message: `There are ${roots.length} roots, so the answer is false.`, node: null, indegree: snap(), visited: [], stack: [], ok: false });
    } else {
      root = roots[0];
      const stack = [root];
      frames.push({ phase: "walk", activeLine: 7, message: `Start the walk at root ${root}.`, node: null, indegree: snap(), visited: [], stack: [...stack], ok: null });
      while (stack.length && ok) {
        frames.push({ phase: "walk", activeLine: 8, message: "The stack is not empty.", node: null, indegree: snap(), visited: [...visited], stack: [...stack], ok: null });
        const node = stack.pop();
        if (visited.includes(node)) {
          ok = false;
          frames.push({ phase: "walk", activeLine: 9, message: `Node ${node} was already seen (cycle); the answer is false.`, node, indegree: snap(), visited: [...visited], stack: [...stack], ok: false });
          break;
        }
        visited.push(node);
        frames.push({ phase: "walk", activeLine: 9, message: `Visit node ${node}.`, node, indegree: snap(), visited: [...visited], stack: [...stack], ok: null });
        for (const child of [L[node], R[node]]) if (child !== -1) stack.push(child);
        frames.push({ phase: "walk", activeLine: 10, message: `Push the children of ${node}.`, node, indegree: snap(), visited: [...visited], stack: [...stack], ok: null });
      }
    }
  }
  const result = ok && visited.length === n;
  frames.push({ phase: "done", activeLine: 11, message: `Visited ${visited.length} of ${n} nodes, so the answer is ${result}.`, node: null, indegree: snap(), visited: [...visited], stack: [], ok: result });
  return { input, result, frames };
}
