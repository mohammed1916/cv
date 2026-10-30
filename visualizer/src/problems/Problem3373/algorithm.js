export const code = [
  { line: 1, text: "colour each tree by depth parity, starting node 0 with colour 0" },
  { line: 2, text: "for tree 2, the bridge is the larger colour class, unless tree 2 has no odd-coloured node" },
  { line: 3, text: "for each node u of tree 1, count the nodes of tree 1 with the same colour and add the bridge" },
  { line: 4, text: "return all totals" },
];

export const python = `def maxTargetNodes(edges1, edges2):
    def colour(edges):
        n = len(edges) + 1
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        parity = [-1] * n
        parity[0] = 0
        stack = [0]
        while stack:
            node = stack.pop()
            for nxt in graph[node]:
                if parity[nxt] == -1:
                    parity[nxt] = parity[node] ^ 1
                    stack.append(nxt)
        return parity

    p1 = colour(edges1)
    p2 = colour(edges2)
    zeros1 = p1.count(0)
    ones1 = len(p1) - zeros1
    zeros2 = p2.count(0)
    ones2 = len(p2) - zeros2
    bridge = max(zeros2, ones2) if ones2 else 0
    return [(zeros1 if p1[u] == 0 else ones1) + bridge for u in range(len(p1))]`;

const PYTHON_LINES = python.split("\n");
const pyLine = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1;
const MAX_NODES = 40;

function parseTree(value, name) {
  if (!Array.isArray(value)) throw new Error(`"${name}" must be an array of [a, b] edges`);
  const n = value.length + 1;
  if (n > MAX_NODES) throw new Error(`"${name}" has ${n} nodes; the visualization accepts at most ${MAX_NODES}`);
  const seen = new Set();
  value.forEach((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(Number.isInteger)) {
      throw new Error(`"${name}"[${index}] must be a pair of integers`);
    }
    const [a, b] = edge;
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) {
      throw new Error(`"${name}"[${index}] must use node labels from 0 to ${n - 1}`);
    }
    seen.add(a); seen.add(b);
  });
  if (value.length > 0 && seen.size !== n) throw new Error(`"${name}" must be a connected tree on nodes 0 to ${n - 1}`);
  return value;
}

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object with "edges1" and "edges2"');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  return { edges1: parseTree(data.edges1, "edges1"), edges2: parseTree(data.edges2, "edges2") };
}

function adjacency(edges) {
  const graph = Array.from({ length: edges.length + 1 }, () => []);
  edges.forEach(([a, b]) => { graph[a].push(b); graph[b].push(a); });
  return graph;
}

export function buildTrace(input) {
  const { edges1, edges2 } = input;
  const frames = [];
  const colourOf = edges => {
    const graph = adjacency(edges);
    const parity = new Array(graph.length).fill(-1);
    parity[0] = 0;
    const stack = [0];
    frames.push({ phase: "setup", activeLine: 1, pythonLine: pyLine("parity = [-1]"), message: `Start colouring at node 0 with colour 0.`, current: null, colours: [...parity], tree: null });
    while (stack.length) {
      const node = stack.pop();
      frames.push({ phase: "colour", activeLine: 1, pythonLine: pyLine("node = stack.pop()"), message: `Visit node ${node} (colour ${parity[node]}).`, current: node, colours: [...parity], tree: null });
      for (const next of graph[node]) {
        if (parity[next] === -1) {
          parity[next] = parity[node] ^ 1;
          stack.push(next);
        }
      }
    }
    return parity;
  };
  const p1 = colourOf(edges1);
  const p2 = colourOf(edges2);
  const zeros1 = p1.filter(c => c === 0).length;
  const ones1 = p1.length - zeros1;
  const zeros2 = p2.filter(c => c === 0).length;
  const ones2 = p2.length - zeros2;
  const bridge = ones2 ? Math.max(zeros2, ones2) : 0;
  frames.push({
    phase: "bridge", activeLine: 2, pythonLine: pyLine("bridge = max"),
    message: `Tree 2 has ${zeros2} node(s) of colour 0 and ${ones2} of colour 1. The bridge contributes ${bridge}.`,
    current: null, colours: p1, tree: null, bridge,
  });
  const result = [];
  for (let u = 0; u < p1.length; u += 1) {
    const same = p1[u] === 0 ? zeros1 : ones1;
    result.push(same + bridge);
    frames.push({
      phase: "count", activeLine: 3, pythonLine: pyLine("return [(zeros1"),
      message: `Node ${u} has colour ${p1[u]}; ${same} tree-1 node(s) share it, so its total is ${same + bridge}.`,
      current: u, colours: p1, tree: "first", bridge, same, counts: [...result],
    });
  }
  frames.push({
    phase: "done", activeLine: 4, pythonLine: pyLine("return [(zeros1"),
    message: `Return the totals ${JSON.stringify(result)}.`, current: null, colours: p1, tree: null, bridge, counts: result,
  });
  return { input, result, frames };
}
