export const CODE = [
  "def cloneGraph(node):",
  "    if not node: return None",
  "    clones = {}",
  "    queue = deque([node])",
  "    clones[node.val] = Node(node.val)",
  "    while queue:",
  "        curr = queue.popleft()",
  "        for neighbor in curr.neighbors:",
  "            if neighbor.val not in clones:",
  "                clones[neighbor.val] = Node(neighbor.val)",
  "                queue.append(neighbor)",
  "            clones[curr.val].neighbors.append(clones[neighbor.val])",
  "    return clones[node.val]",
];

/**
 * Deterministic simulated heap address generator.
 * Gives original nodes a distinct 0x1... address and clones a 0x7... address.
 */
export function getOriginalAddress(val) {
  return "0x" + (0x1000 + val * 0x19).toString(16).toUpperCase();
}

export function getCloneAddress(val) {
  return "0x" + (0x7000 + val * 0x3b).toString(16).toUpperCase();
}

/**
 * Parses and strictly validates a 1-indexed adjacency list input.
 * Supports string JSON/Python syntax or raw arrays.
 * Validates:
 * - 1-indexed node numbers (1..N)
 * - Array of arrays
 * - Max 20 nodes
 * - No negative values, non-integers, self-loops, or duplicate neighbors
 * - Reciprocity (undirected graph property: u in adj[v] <=> v in adj[u])
 */
export function parseAdjListInput(input) {
  if (input === null || input === undefined) {
    throw new Error("Input cannot be empty");
  }

  let parsed = input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      try {
        const normalized = trimmed.replace(/'/g, '"');
        parsed = JSON.parse(normalized);
      } catch {
        throw new Error("Invalid JSON format for adjacency list");
      }
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Adjacency list must be an array of arrays");
  }

  // Empty graph
  if (parsed.length === 0) {
    return [];
  }

  if (parsed.length > 20) {
    throw new Error("Graph node count exceeds 20 (max 20 nodes allowed)");
  }

  const N = parsed.length;

  for (let i = 0; i < N; i++) {
    const u = i + 1;
    const neighbors = parsed[i];
    if (!Array.isArray(neighbors)) {
      throw new Error(`Node ${u} neighbors must be an array`);
    }

    const seenNeighbors = new Set();
    for (const v of neighbors) {
      if (typeof v !== "number" || !Number.isInteger(v)) {
        throw new Error(`Neighbor values must be integers (node ${u})`);
      }
      if (v < 1 || v > N) {
        throw new Error(`Neighbor ${v} of node ${u} is out of bounds (must be 1..${N})`);
      }
      if (v === u) {
        throw new Error(`Node ${u} contains a self-loop`);
      }
      if (seenNeighbors.has(v)) {
        throw new Error(`Node ${u} contains duplicate neighbor entry ${v}`);
      }
      seenNeighbors.add(v);
    }
  }

  // Reciprocity check: undirected graph requires u in neighbors(v) iff v in neighbors(u)
  for (let u = 1; u <= N; u++) {
    const neighbors = parsed[u - 1];
    for (const v of neighbors) {
      if (!parsed[v - 1].includes(u)) {
        throw new Error(
          `Graph is not undirected: edge ${u}-${v} is missing reciprocal edge ${v}-${u}`
        );
      }
    }
  }

  return parsed.map((row) => [...row]);
}

/**
 * Builds the visual story for Clone Graph (Problem 133).
 * Returns { originalGraph, clonedGraph, frames }.
 */
export function buildCloneGraphStory(input) {
  const adjList = parseAdjListInput(input);
  const numNodes = adjList.length;

  // Build originalGraph metadata
  const origNodes = [];
  const origAdj = {};
  const origEdges = [];
  const edgeSeen = new Set();

  for (let u = 1; u <= numNodes; u++) {
    origNodes.push({
      id: u,
      val: u,
      label: `Node ${u}`,
      address: getOriginalAddress(u),
    });
    origAdj[u] = [...adjList[u - 1]];

    for (const v of adjList[u - 1]) {
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (!edgeSeen.has(key)) {
        edgeSeen.add(key);
        origEdges.push({ u: Math.min(u, v), v: Math.max(u, v), key });
      }
    }
  }

  const originalGraph = {
    numNodes,
    nodes: origNodes,
    edges: origEdges,
    adj: origAdj,
  };

  // Build clonedGraph target metadata
  const cloneNodes = origNodes.map((n) => ({
    id: n.id,
    val: n.val,
    label: `Node ${n.val}'`,
    address: getCloneAddress(n.val),
  }));

  const clonedGraph = {
    numNodes,
    nodes: cloneNodes,
    edges: origEdges.map((e) => ({ ...e })),
    adj: { ...origAdj },
  };

  const frames = [];

  // Helper to snapshot a frame immutably
  function addFrame({
    activeLine,
    phase,
    explanation,
    message,
    queue,
    clones,
    curr = null,
    neighbor = null,
    activeOriginalNode = null,
    activeCloneNode = null,
    activeEdge = null,
    highlightCloneEdge = null,
    result = undefined,
  }) {
    const clonesSnapshot = {};
    for (const [k, obj] of Object.entries(clones)) {
      clonesSnapshot[k] = {
        val: obj.val,
        address: obj.address,
        neighbors: [...obj.neighbors],
      };
    }

    const clonedUndirectedKeys = new Set();
    const clonedEdgesList = [];
    for (const [uStr, obj] of Object.entries(clonesSnapshot)) {
      const u = Number(uStr);
      for (const v of obj.neighbors) {
        clonedEdgesList.push({ from: u, to: v });
        clonedUndirectedKeys.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
      }
    }

    frames.push({
      activeLine,
      phase,
      explanation,
      message: message || explanation,
      queue: [...queue],
      clones: clonesSnapshot,
      curr,
      neighbor,
      activeOriginalNode,
      activeCloneNode,
      activeEdge: activeEdge ? { ...activeEdge } : null,
      highlightCloneEdge: highlightCloneEdge ? { ...highlightCloneEdge } : null,
      clonedEdges: clonedEdgesList,
      clonedUndirectedKeys: Array.from(clonedUndirectedKeys),
      result,
    });
  }

  // Edge case: Empty graph
  if (numNodes === 0) {
    addFrame({
      activeLine: 1,
      phase: "start",
      explanation: "cloneGraph(node) called with node = None (empty graph).",
      message: "cloneGraph(node=None)",
      queue: [],
      clones: {},
    });

    addFrame({
      activeLine: 2,
      phase: "check-null",
      explanation: "Input node is None, so return None immediately.",
      message: "node is None -> return None",
      queue: [],
      clones: {},
      result: null,
    });

    addFrame({
      activeLine: 2,
      phase: "done",
      explanation: "Empty graph handled: returned None.",
      message: "Returned None.",
      queue: [],
      clones: {},
      result: null,
    });

    return { originalGraph, clonedGraph, frames };
  }

  // Standard BFS cloning traversal
  let queue = [];
  const clones = {};

  // Frame 1: line 1 def cloneGraph(node)
  addFrame({
    activeLine: 1,
    phase: "start",
    explanation: `Call cloneGraph(node) starting at root Node(1) located at ${getOriginalAddress(1)}.`,
    message: "cloneGraph(node=Node(1))",
    queue,
    clones,
    activeOriginalNode: 1,
  });

  // Frame 2: line 2 if not node: return None
  addFrame({
    activeLine: 2,
    phase: "check-null",
    explanation: "Node(1) exists (is not None). Continue initialization.",
    message: "node is not None -> proceed",
    queue,
    clones,
    activeOriginalNode: 1,
  });

  // Frame 3: line 3 clones = {}
  addFrame({
    activeLine: 3,
    phase: "init-map",
    explanation: "Initialize empty hash map clones = {} to store original-to-clone node mappings.",
    message: "clones = {}",
    queue,
    clones,
  });

  // Frame 4: line 4 queue = deque([node])
  queue.push(1);
  addFrame({
    activeLine: 4,
    phase: "init-queue",
    explanation: "Initialize BFS queue with starting node: queue = deque([Node(1)]).",
    message: "queue = deque([Node(1)])",
    queue,
    clones,
    activeOriginalNode: 1,
  });

  // Frame 5: line 5 clones[node.val] = Node(node.val)
  clones[1] = { val: 1, address: getCloneAddress(1), neighbors: [] };
  addFrame({
    activeLine: 5,
    phase: "clone-start",
    explanation: `Instantiate clone Node(1)' at ${getCloneAddress(1)} and register in clones[1].`,
    message: "clones[1] = Node(1)",
    queue,
    clones,
    activeOriginalNode: 1,
    activeCloneNode: 1,
  });

  // BFS loop
  while (queue.length > 0) {
    // Line 6: while queue:
    addFrame({
      activeLine: 6,
      phase: "check-queue",
      explanation: `Queue has ${queue.length} node(s): [${queue.map((v) => `Node(${v})`).join(", ")}]. Continue BFS loop.`,
      message: `while queue: (${queue.length} item${queue.length > 1 ? "s" : ""})`,
      queue,
      clones,
    });

    // Line 7: curr = queue.popleft()
    const curr = queue.shift();
    addFrame({
      activeLine: 7,
      phase: "pop",
      explanation: `Dequeued curr = Node(${curr}) at ${getOriginalAddress(curr)} from queue to process neighbors.`,
      message: `curr = queue.popleft() -> Node(${curr})`,
      queue,
      clones,
      curr,
      activeOriginalNode: curr,
      activeCloneNode: curr,
    });

    const neighbors = adjList[curr - 1];
    if (neighbors.length === 0) {
      addFrame({
        activeLine: 8,
        phase: "scan-neighbors",
        explanation: `Node(${curr}) has no neighbors. Loop finishes for this node.`,
        message: `curr Node(${curr}) has 0 neighbors`,
        queue,
        clones,
        curr,
        activeOriginalNode: curr,
        activeCloneNode: curr,
      });
    }

    for (const nbr of neighbors) {
      // Line 8: for neighbor in curr.neighbors:
      addFrame({
        activeLine: 8,
        phase: "next-neighbor",
        explanation: `Inspecting neighbor Node(${nbr}) of curr Node(${curr}).`,
        message: `Inspect neighbor Node(${nbr}) of curr Node(${curr})`,
        queue,
        clones,
        curr,
        neighbor: nbr,
        activeOriginalNode: curr,
        activeEdge: { from: curr, to: nbr },
      });

      // Line 9: if neighbor.val not in clones:
      const notInClones = !(nbr in clones);
      addFrame({
        activeLine: 9,
        phase: "check-neighbor",
        explanation: notInClones
          ? `Neighbor Node(${nbr}) is not in clones map yet. Needs instantiation.`
          : `Neighbor Node(${nbr}) is already in clones map (clones[${nbr}] exists).`,
        message: notInClones
          ? `Node(${nbr}) not in clones -> clone and enqueue`
          : `Node(${nbr}) already in clones -> connect edge directly`,
        queue,
        clones,
        curr,
        neighbor: nbr,
        activeOriginalNode: nbr,
        activeEdge: { from: curr, to: nbr },
      });

      if (notInClones) {
        // Line 10: clones[neighbor.val] = Node(neighbor.val)
        clones[nbr] = { val: nbr, address: getCloneAddress(nbr), neighbors: [] };
        addFrame({
          activeLine: 10,
          phase: "clone-node",
          explanation: `Instantiate new clone Node(${nbr})' at ${getCloneAddress(nbr)} and register in clones[${nbr}].`,
          message: `clones[${nbr}] = Node(${nbr})`,
          queue,
          clones,
          curr,
          neighbor: nbr,
          activeOriginalNode: nbr,
          activeCloneNode: nbr,
          activeEdge: { from: curr, to: nbr },
        });

        // Line 11: queue.append(neighbor)
        queue.push(nbr);
        addFrame({
          activeLine: 11,
          phase: "enqueue",
          explanation: `Enqueue original Node(${nbr}) into queue for later exploration.`,
          message: `queue.append(Node(${nbr}))`,
          queue,
          clones,
          curr,
          neighbor: nbr,
          activeOriginalNode: nbr,
          activeEdge: { from: curr, to: nbr },
        });
      }

      // Line 12: clones[curr.val].neighbors.append(clones[neighbor.val])
      clones[curr].neighbors.push(nbr);
      addFrame({
        activeLine: 12,
        phase: "clone-edge",
        explanation: `Connect cloned edge: append clone Node(${nbr})' to clones[${curr}].neighbors.`,
        message: `clones[${curr}].neighbors.append(clones[${nbr}])`,
        queue,
        clones,
        curr,
        neighbor: nbr,
        activeCloneNode: curr,
        activeEdge: { from: curr, to: nbr },
        highlightCloneEdge: { from: curr, to: nbr },
      });
    }
  }

  // Queue is now empty
  addFrame({
    activeLine: 6,
    phase: "queue-empty",
    explanation: "BFS queue is now empty. All reachable nodes and edges have been cloned.",
    message: "Queue is empty. BFS complete.",
    queue: [],
    clones,
  });

  // Line 13: return clones[node.val]
  addFrame({
    activeLine: 13,
    phase: "done",
    explanation: `Cloning successful! Return cloned root Node(1)' at ${getCloneAddress(1)}. Deep copy complete.`,
    message: "return clones[node.val]",
    queue: [],
    clones,
    activeCloneNode: 1,
    result: clones[1],
  });

  return { originalGraph, clonedGraph, frames };
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_GRAPH_NODES = 20
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"adj_list": [[2,4],[1,3],[2,4],[1,3]]}.') }
  if (!data || typeof data !== 'object' || !Array.isArray(data.adj_list)) throw new Error('Input must be an object with an "adj_list" array.')
  const adj = data.adj_list, n = adj.length
  if (n > MAX_GRAPH_NODES) throw new Error(`Use at most ${MAX_GRAPH_NODES} nodes for this trace.`)
  adj.forEach((nbrs, i) => {
    if (!Array.isArray(nbrs)) throw new Error('Each adjacency entry must be an array.')
    const seen = new Set()
    for (const w of nbrs) {
      if (!Number.isInteger(w) || w < 1 || w > n) throw new Error(`Neighbour values must be integers from 1 to ${n}.`)
      if (w === i + 1) throw new Error('Self-loops are not allowed.')
      if (seen.has(w)) throw new Error('Repeated edges are not allowed.')
      seen.add(w)
      if (!adj[w - 1].includes(i + 1)) throw new Error('Adjacency must be symmetric for an undirected graph.')
    }
  })
  if (n > 0) {
    const reached = new Set([1]), stack = [1]
    while (stack.length) for (const w of adj[stack.pop() - 1]) if (!reached.has(w)) { reached.add(w); stack.push(w) }
    if (reached.size !== n) throw new Error('The graph must be connected.')
  }
  return { adj_list: adj }
}

export function buildTrace(input) {
  const adj = input.adj_list
  const copies = new Map()
  const frames = []
  const clone = v => {
    if (copies.has(v)) return copies.get(v)
    const copy = { val: v, neighbors: [] }
    copies.set(v, copy)
    frames.push({ activeLine: L('create a copy of node'), phase: 'copy', node: v, copies: copies.size, message: `Create the copy for node ${v} and record it in the map.` })
    for (const w of adj[v - 1]) {
      copy.neighbors.push(clone(w))
      frames.push({ activeLine: L('add the copy of each neighbour'), phase: 'link', node: v, copies: copies.size, message: `Link copy ${v} to copy ${w}.` })
    }
    return copy
  }
  if (adj.length > 0) clone(1)
  const result = adj.map((_, i) => (copies.has(i + 1) ? copies.get(i + 1).neighbors.map(c => c.val) : []))
  frames.push({ activeLine: L('return the copy of the starting node'), phase: 'done', node: null, copies: copies.size, message: `Cloned ${copies.size} nodes with their edges.` })
  return { input, result, frames }
}

export const code = [
  { line: 1, text: 'clone a connected undirected graph' },
  { line: 2, text: 'copies = empty map from original node to its copy' },
  { line: 3, text: 'clone(node): if node is in copies, return its copy' },
  { line: 4, text: 'create a copy of node with the same value' },
  { line: 5, text: 'record the copy in copies' },
  { line: 6, text: 'for each neighbour, add the copy of each neighbour to the copy' },
  { line: 7, text: 'return the copy of the starting node' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def clone_graph(adj_list):
    if len(adj_list) == 0:
        return []
    copies = {}

    def clone(v):
        if v in copies:
            return copies[v]
        copy = {"val": v, "neighbors": []}
        copies[v] = copy
        for w in adj_list[v - 1]:
            copy["neighbors"].append(clone(w))
        return copy

    clone(1)
    return [[nb["val"] for nb in copies[v]["neighbors"]] for v in range(1, len(adj_list) + 1)]
`
