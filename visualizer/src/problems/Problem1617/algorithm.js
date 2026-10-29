export const CODE = [
  "FUNCTION countSubgraphsForEachDiameter(n, edges)",
  "    adjacency ← neighbour lists built from edges",
  "    answer ← n − 1 zeros, one per diameter 1 through n − 1",
  "    FOR each non-empty bitmask S over the cities",
  "        IF BFS from every city in S reaches all of S, record the largest distance",
  "        diameter ← largest distance found (0 if S is not connected)",
  "        IF diameter ≥ 1 THEN answer[diameter − 1] += 1",
  "    RETURN answer",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const python = `def countSubgraphsForEachDiameter(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u - 1].append(v - 1)
        adj[v - 1].append(u - 1)
    answer = [0] * (n - 1)
    for mask in range(1, 1 << n):
        members = [i for i in range(n) if mask >> i & 1]
        diameter = 0
        connected = True
        for source in members:
            dist = {source: 0}
            queue = [source]
            for node in queue:
                for nxt in adj[node]:
                    if mask >> nxt & 1 and nxt not in dist:
                        dist[nxt] = dist[node] + 1
                        queue.append(nxt)
            if len(dist) != len(members):
                connected = False
                break
            diameter = max(diameter, max(dist.values()))
        if connected and diameter >= 1:
            answer[diameter - 1] += 1
    return answer`;

// Pseudocode activeLine -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 6, 4: 7, 5: 11, 6: 22, 7: 23, 8: 24 };

const MAX_N = 10;

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try { data = JSON.parse(text); } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`); }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "n" and "edges".');
  const { n, edges } = data;
  if (!Number.isInteger(n) || n < 2) throw new Error("n must be an integer of at least 2.");
  if (n > MAX_N) throw new Error(`n (${n}) exceeds the visualization limit of ${MAX_N}; subset enumeration grows as 2^n (LeetCode allows up to 15).`);
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must have n - 1 = ${n - 1} entries.`);
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  edges.forEach(edge => {
    if (!Array.isArray(edge) || edge.length !== 2 || edge.some(v => !Number.isInteger(v) || v < 1 || v > n)) {
      throw new Error(`Invalid edge ${JSON.stringify(edge)}; cities are numbered 1 to n.`);
    }
    const [u, v] = edge;
    if (u === v) throw new Error(`Edge ${JSON.stringify(edge)} connects a city to itself.`);
    const ru = find(u), rv = find(v);
    if (ru === rv) throw new Error("edges must form a tree: a cycle was found.");
    parent[ru] = rv;
  });
  return { n, edges };
}

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u - 1].push(v - 1); adj[v - 1].push(u - 1); }
  const answer = Array(n - 1).fill(0);
  const frames = [];
  let tried = 0;
  for (let mask = 1; mask < (1 << n); mask++) {
    const members = [];
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) members.push(i);
    tried++;
    const base = extra => ({ mask, members: members.slice(), answer: answer.slice(), tried, ...extra });
    frames.push({ phase: "enumerate", activeLine: 4, message: `Subset {${members.map(i => i + 1).join(", ")}}.`, ...base({ connected: null, diameter: null }) });
    let diameter = 0, connected = true;
    for (const source of members) {
      const dist = new Map([[source, 0]]);
      const queue = [source];
      for (let k = 0; k < queue.length; k++) {
        const node = queue[k];
        for (const nxt of adj[node]) {
          if (((mask >> nxt) & 1) && !dist.has(nxt)) { dist.set(nxt, dist.get(node) + 1); queue.push(nxt); }
        }
      }
      if (dist.size !== members.length) { connected = false; break; }
      diameter = Math.max(diameter, ...dist.values());
    }
    frames.push({ phase: "connect", activeLine: 5, message: connected ? `Every city reaches every other city inside the subset; largest distance ${diameter}.` : "A city inside the subset cannot reach all the others, so the subset is not connected.", ...base({ connected, diameter: connected ? diameter : 0 }) });
    if (connected && diameter >= 1) {
      answer[diameter - 1] += 1;
      frames.push({ phase: "count", activeLine: 7, message: `Max distance ${diameter} is counted: answer[${diameter}] (index ${diameter - 1}) becomes ${answer[diameter - 1]}.`, ...base({ connected, diameter }) });
    }
  }
  frames.push({ phase: "done", activeLine: 8, message: `Return [${answer.join(", ")}].`, ...{ mask: 0, members: [], answer: answer.slice(), tried, connected: null, diameter: null } });
  return { input: { n, edges }, result: answer, frames };
}
