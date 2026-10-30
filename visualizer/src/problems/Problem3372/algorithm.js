export const code = [
  { line: 1, text: "build adjacency lists for both trees" },
  { line: 2, text: "for each node v of tree 2, count nodes within k - 1 steps and keep the largest count as the bridge" },
  { line: 3, text: "for each node u of tree 1, count nodes within k steps and add the bridge count" },
  { line: 4, text: "return all totals" },
];

export const python = `from collections import deque

def maxTargetNodes(edges1, edges2, k):
    def adjacency(edges):
        n = len(edges) + 1
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        return graph

    def within(graph, source, limit):
        if limit < 0:
            return 0
        seen = {source}
        queue = deque([(source, 0)])
        while queue:
            node, dist = queue.popleft()
            if dist == limit:
                continue
            for nxt in graph[node]:
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, dist + 1))
        return len(seen)

    g1 = adjacency(edges1)
    g2 = adjacency(edges2)
    bridge = max(within(g2, v, k - 1) for v in range(len(g2)))
    return [within(g1, u, k) + bridge for u in range(len(g1))]`;

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
    throw new Error('Input must be a JSON object with "edges1", "edges2" and "k"');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object');
  const edges1 = parseTree(data.edges1, "edges1");
  const edges2 = parseTree(data.edges2, "edges2");
  const { k } = data;
  if (!Number.isInteger(k) || k < 0) throw new Error('"k" must be a non-negative integer');
  return { edges1, edges2, k };
}

function adjacency(edges) {
  const graph = Array.from({ length: edges.length + 1 }, () => []);
  edges.forEach(([a, b]) => { graph[a].push(b); graph[b].push(a); });
  return graph;
}

// Node ids reachable from source within `limit` edges, in BFS order.
function reachIds(graph, source, limit) {
  if (limit < 0) return [];
  const seen = new Set([source]);
  const queue = [[source, 0]];
  const order = [source];
  for (let head = 0; head < queue.length; head += 1) {
    const [node, dist] = queue[head];
    if (dist === limit) continue;
    for (const next of graph[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([next, dist + 1]);
        order.push(next);
      }
    }
  }
  return order;
}

export function buildTrace(input) {
  const { edges1, edges2, k } = input;
  const g1 = adjacency(edges1);
  const g2 = adjacency(edges2);
  const frames = [];
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: pyLine("g1 = adjacency"),
    message: "Build adjacency lists for both trees.", current: null, reach: [], bridge: null, counts: [], tree: null,
  });
  let bridge = 0;
  for (let v = 0; v < g2.length; v += 1) {
    const reach = reachIds(g2, v, k - 1);
    bridge = Math.max(bridge, reach.length);
    frames.push({
      phase: "bridge", activeLine: 2, pythonLine: pyLine("bridge = max"),
      message: `Tree 2 node ${v} reaches ${reach.length} node(s) within ${k - 1} step(s). Best bridge so far: ${bridge}.`,
      current: v, reach, bridge, counts: [], tree: "second",
    });
  }
  const counts = [];
  for (let u = 0; u < g1.length; u += 1) {
    const reach = reachIds(g1, u, k);
    counts.push(reach.length + bridge);
    frames.push({
      phase: "count", activeLine: 3, pythonLine: pyLine("return [within"),
      message: `Node ${u} of tree 1 reaches ${reach.length} node(s) within ${k} step(s); adding bridge ${bridge} gives ${counts[u]}.`,
      current: u, reach, bridge, counts: [...counts], tree: "first",
    });
  }
  frames.push({
    phase: "done", activeLine: 4, pythonLine: pyLine("return [within"),
    message: `Return the totals ${JSON.stringify(counts)}.`, current: null, reach: [], bridge, counts, tree: null,
  });
  return { input, result: counts, frames };
}
