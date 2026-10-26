export const cloneGraphNarrative = {
  goal: "Create a deep copy of a connected undirected graph using Breadth-First Search (BFS) and a hash map tracking original-to-clone node mappings.",
  chapters: [
    "Clone root & start BFS queue",
    "Process node neighbors",
    "Instantiate missing clone nodes",
    "Wire cloned adjacency edges",
  ],
  ready: {
    why: "A hash map (clones[val] = Node(val)) prevents infinite loops on cyclic graph topologies and ensures each vertex is instantiated exactly once, while BFS traverses and clones all edges.",
    achieved: "Graph cloning not started yet.",
    next: "Check if input node is null and initialize BFS queue.",
  },
  phases: {
    start: {
      chapter: 0,
      why: "Begin cloneGraph(node) with the starting vertex.",
      achieved: "Execution initiated on starting graph node.",
      next: "Check if input node is None.",
    },
    "check-null": {
      chapter: 0,
      why: "If input graph is empty (node is None), return None.",
      achieved: "Checked null condition.",
      next: "Initialize clone map and BFS queue.",
    },
    "init-map": {
      chapter: 0,
      why: "clones = {}: create mapping from original node values to their newly allocated clone instances.",
      achieved: "Clone dictionary created.",
      next: "Enqueue starting node.",
    },
    "init-queue": {
      chapter: 0,
      why: "queue = deque([node]): start BFS exploration queue with the root node.",
      achieved: "BFS queue initialized.",
      next: "Instantiate clone of starting node.",
    },
    "clone-start": ({ step }) => ({
      chapter: 0,
      why: "Allocate clone Node(1)' at a new memory address and record in clones hash map.",
      achieved: `Instantiated clone Node(${step.activeOriginalNode})'.`,
      next: "Enter BFS while loop.",
    }),
    "check-queue": ({ step }) => ({
      chapter: 1,
      why: "Check if BFS queue contains nodes to process.",
      achieved: `Queue contains ${step.queue?.length} node(s): [${step.queue?.map((v) => `Node(${v})`).join(", ")}].`,
      next: "Dequeue next node to inspect its adjacency list.",
    }),
    pop: ({ step }) => ({
      chapter: 1,
      why: "curr = queue.popleft(): dequeue the front node to visit its neighbors.",
      achieved: `Dequeued curr = Node(${step.curr}).`,
      next: "Iterate over neighbors of curr.",
    }),
    "scan-neighbors": ({ step }) => ({
      chapter: 1,
      why: "Inspect neighbors of curr.",
      achieved: `Node(${step.curr}) has no neighbors.`,
      next: "Continue BFS.",
    }),
    "next-neighbor": ({ step }) => ({
      chapter: 1,
      why: "Inspect adjacent neighbor in curr.neighbors.",
      achieved: `Inspecting neighbor Node(${step.neighbor}) of curr Node(${step.curr}).`,
      next: `Check if Node(${step.neighbor}) is already in clones map.`,
    }),
    "check-neighbor": ({ step }) => ({
      chapter: 2,
      why: "if neighbor.val not in clones: check if neighbor was already copied.",
      achieved: `Node(${step.neighbor}) ${step.clones?.[step.neighbor] ? "already exists in clones" : "is new (not yet cloned)"}.`,
      next: step.clones?.[step.neighbor]
        ? "Connect cloned edge directly."
        : "Instantiate new clone node and enqueue.",
    }),
    "clone-node": ({ step }) => ({
      chapter: 2,
      why: "clones[neighbor.val] = Node(neighbor.val): instantiate new clone vertex in memory.",
      achieved: `Created clone Node(${step.neighbor})'.`,
      next: "Enqueue original neighbor into queue.",
    }),
    enqueue: ({ step }) => ({
      chapter: 2,
      why: "queue.append(neighbor): queue this new vertex so its own neighbors will be cloned later.",
      achieved: `Enqueued Node(${step.neighbor}).`,
      next: "Connect edge between curr clone and neighbor clone.",
    }),
    "clone-edge": ({ step }) => ({
      chapter: 3,
      why: "clones[curr.val].neighbors.append(clones[neighbor.val]): wire directed link between clone instances.",
      achieved: `Connected clone edge: Node(${step.curr})' -> Node(${step.neighbor})'.`,
      next: "Check next neighbor or dequeue next node.",
    }),
    "queue-empty": {
      chapter: 3,
      why: "BFS queue is empty: all reachable nodes and edges cloned.",
      achieved: "Queue drained.",
      next: "Return cloned root node.",
    },
    done: ({ step }) => ({
      chapter: 3,
      why: "return clones[node.val]: deep copy is complete with all nodes and edges cloned at new memory addresses.",
      achieved: "Deep copy complete! Returned cloned graph root.",
      next: "Try another graph structure.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "if not node: return None.",
      achieved: "Checked null graph.",
      next: "Initialize clones map.",
    },
    5: ({ step }) => ({
      chapter: 0,
      why: "clones[node.val] = Node(node.val).",
      achieved: `Cloned starting node.`,
      next: "Start BFS queue loop.",
    }),
    7: ({ step }) => ({
      chapter: 1,
      why: "curr = queue.popleft().",
      achieved: `Dequeued Node(${step.curr}).`,
      next: "Iterate over neighbors.",
    }),
    10: ({ step }) => ({
      chapter: 2,
      why: "clones[neighbor.val] = Node(neighbor.val).",
      achieved: `Instantiated clone Node(${step.neighbor})'.`,
      next: "Enqueue neighbor.",
    }),
    12: ({ step }) => ({
      chapter: 3,
      why: "clones[curr.val].neighbors.append(clones[neighbor.val]).",
      achieved: `Wired clone edge (${step.curr}' -> ${step.neighbor}').`,
      next: "Continue neighbor iteration.",
    }),
    13: {
      chapter: 3,
      why: "return clones[node.val].",
      achieved: "Returned clone root.",
      next: "Completed.",
    },
  },
};
