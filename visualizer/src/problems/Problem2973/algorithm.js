export const python = [
  "def placedCoins(edges, cost):",
  "    n = len(cost)",
  "    graph = [[] for _ in range(n)]",
  "    for a, b in edges:",
  "        graph[a].append(b)",
  "        graph[b].append(a)",
  "    coins = [0] * n",
  "    def dfs(node, parent):",
  "        values = [cost[node]]",
  "        for nxt in graph[node]:",
  "            if nxt != parent:",
  "                values.extend(dfs(nxt, node))",
  "        if len(values) < 3:",
  "            coins[node] = 1",
  "        else:",
  "            s = sorted(values)",
  "            best = max(s[-1] * s[-2] * s[-3], s[0] * s[1] * s[-1])",
  "            coins[node] = max(0, best)",
  "        return values",
  "    dfs(0, -1)",
  "    return coins",
].join("\n");

export const code = [
  "build the undirected adjacency list",
  "set coins to zero for every node",
  "define dfs(node, parent) that returns the subtree costs",
  "values = [cost of node]",
  "for each child, merge the child's subtree values",
  "if the subtree has fewer than 3 nodes, coins = 1",
  "otherwise coins = max(0, best triple product)",
  "return the subtree values",
  "call dfs from node 0 with no parent",
  "return coins",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"edges": [[0,1],[0,2]], "cost": [1,2,-2]}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "edges" and "cost".');
  const { edges, cost } = data;
  if (!Array.isArray(cost) || cost.length < 2 || cost.length > 50) throw new Error("cost must hold 2 to 50 integers for this visualization.");
  if (!cost.every(v => Number.isInteger(v) && Math.abs(v) >= 1 && Math.abs(v) <= 10000)) throw new Error("Every cost must be an integer with 1 <= |cost| <= 10000.");
  const n = cost.length;
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must contain exactly ${n - 1} pairs for ${n} nodes.`);
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(Number.isInteger)) throw new Error("Each edge must be a pair of integers.");
    const [a, b] = edge;
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error(`Edge [${a},${b}] must join two different nodes from 0 to ${n - 1}.`);
    const ra = find(a), rb = find(b);
    if (ra === rb) throw new Error("edges must form a tree with no cycle.");
    parent[ra] = rb;
  }
  return { edges: edges.map(([a, b]) => [a, b]), cost: [...cost] };
}

function buildAdjacency(input) {
  const adj = Array.from({ length: input.cost.length }, () => []);
  input.edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  return adj;
}

// Rooted at node 0; used by the tree view.
export function rootTree(input) {
  const adj = buildAdjacency(input);
  const make = (node, parent) => ({ id: node, children: adj[node].filter(next => next !== parent).map(next => make(next, node)) });
  return make(0, -1);
}

export function buildTrace(input) {
  const { cost } = input;
  const adj = buildAdjacency(input);
  const coins = Array(cost.length).fill(0);
  const frames = [];
  const push = (f) => frames.push({ seq: [...coins], index: -1, stats: {}, ...f });
  const dfs = (node, parent) => {
    let values = [cost[node]];
    push({ phase: "enter", activeLine: 4, pythonLine: 9, index: node, stats: { subtree: 1 }, message: `Enter node ${node} with cost ${cost[node]}.` });
    for (const next of adj[node]) {
      if (next === parent) continue;
      values = values.concat(dfs(next, node));
      push({ phase: "merge", activeLine: 5, pythonLine: 12, index: node, stats: { subtree: values.length }, message: `Merge child ${next}; node ${node}'s subtree now has ${values.length} node(s).` });
    }
    if (values.length < 3) {
      coins[node] = 1;
      push({ phase: "small", activeLine: 6, pythonLine: 14, index: node, stats: { subtree: values.length, coins: 1 }, message: `Fewer than 3 nodes, so node ${node} gets 1 coin.` });
    } else {
      const s = [...values].sort((a, b) => a - b);
      const m = s.length;
      const best = Math.max(s[m - 1] * s[m - 2] * s[m - 3], s[0] * s[1] * s[m - 1]);
      coins[node] = Math.max(0, best);
      push({ phase: "large", activeLine: 7, pythonLine: 18, index: node, stats: { subtree: m, best, coins: coins[node] }, message: `Best triple product is ${best}; node ${node} gets ${coins[node]} coin(s).` });
    }
    push({ phase: "return", activeLine: 8, pythonLine: 19, index: node, stats: { subtree: values.length }, message: `Return node ${node}'s subtree costs to its parent.` });
    return values;
  };
  dfs(0, -1);
  push({ phase: "done", activeLine: 10, pythonLine: 21, index: -1, message: "Return the coin count for every node." });
  return { input, result: coins, frames };
}
