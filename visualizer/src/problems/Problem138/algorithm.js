export const CODE = [
  "def copyRandomList(head):",
  "    if not head: return None",
  "    curr = head",
  "    while curr:",
  "        copy = Node(curr.val)",
  "        copy.next = curr.next",
  "        curr.next = copy",
  "        curr = copy.next",
  "    curr = head",
  "    while curr:",
  "        if curr.random:",
  "            curr.next.random = curr.random.next",
  "        curr = curr.next.next",
  "    curr = head",
  "    copy_head = head.next",
  "    while curr:",
  "        copy = curr.next",
  "        curr.next = copy.next",
  "        if copy.next:",
  "            copy.next = copy.next.next",
  "        curr = curr.next",
  "    return copy_head",
];

export const LINE_PATTERN_MAP = {
  1: "init",
  2: "init",
  3: "init",
  4: "interleave",
  5: "interleave",
  6: "interleave",
  7: "interleave",
  8: "interleave",
  9: "random",
  10: "random",
  11: "random",
  12: "random",
  13: "random",
  14: "decouple",
  15: "decouple",
  16: "decouple",
  17: "decouple",
  18: "decouple",
  19: "decouple",
  20: "decouple",
  21: "decouple",
  22: "done",
};

export const PATTERNS = ["init", "interleave", "random", "decouple", "done"];

export function parseListWithRandom(input) {
  if (input == null) {
    throw new Error("Input cannot be empty");
  }

  let raw = input;
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    if ("nodes" in raw) raw = raw.nodes;
    else if ("input" in raw) raw = raw.input;
    else if ("arr" in raw) raw = raw.arr;
    else {
      throw new Error("Input object must have a 'nodes' or 'input' property");
    }
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }
    const sanitized = trimmed
      .replace(/\bNone\b/g, "null")
      .replace(/'/g, '"');
    try {
      raw = JSON.parse(sanitized);
    } catch {
      throw new Error("Invalid list syntax: expected JSON array of [val, random] pairs");
    }
  }

  if (!Array.isArray(raw)) {
    throw new Error("Input must be an array of [val, random] pairs");
  }

  if (raw.length === 0) {
    return [];
  }

  if (raw.length > 30) {
    throw new Error(`List length (${raw.length}) exceeds maximum limit of 30 nodes`);
  }

  return raw.map((item, i) => {
    let val;
    let random;

    if (Array.isArray(item)) {
      if (item.length !== 2) {
        throw new Error(`Node at index ${i} must be a pair [val, random]`);
      }
      [val, random] = item;
    } else if (item !== null && typeof item === "object") {
      if (!("val" in item)) {
        throw new Error(`Node at index ${i} is missing 'val' property`);
      }
      val = item.val;
      random = "random" in item ? item.random : null;
    } else {
      throw new Error(`Node at index ${i} must be a pair [val, random]`);
    }

    if (typeof val !== "number" || !Number.isInteger(val)) {
      throw new Error(`Node at index ${i} val must be an integer, got ${JSON.stringify(val)}`);
    }
    if (val < -10000 || val > 10000) {
      throw new Error(`Node at index ${i} val (${val}) is out of bounds [-10000, 10000]`);
    }

    if (random !== null) {
      if (
        typeof random !== "number" ||
        !Number.isInteger(random) ||
        random < 0 ||
        random >= raw.length
      ) {
        throw new Error(
          `Node at index ${i} random pointer (${JSON.stringify(random)}) is out of bounds [0, ${raw.length - 1}]`
        );
      }
    }

    return {
      id: i,
      val,
      random,
      [Symbol.iterator]: function* () {
        yield this.val;
        yield this.random;
      },
    };
  });
}

function makeFrame({
  activeLine,
  phase,
  phaseNumber,
  phaseTitle,
  explanation,
  message,
  curr = null,
  copy = null,
  copyHead = null,
  currRandom = null,
  targetCloneRandom = null,
  action = "step",
  origNext,
  cloneCreated,
  cloneNext,
  cloneRandom,
  original,
  highlightedLinks = [],
  relatedLines = [activeLine],
}) {
  const n = original.length;

  const originalNodes = original.map((node, i) => ({
    id: i,
    key: `orig-${i}`,
    val: node.val,
    random: node.random,
    randomKey: node.random !== null ? `orig-${node.random}` : null,
    nextKey: origNext[i],
    isClone: false,
  }));

  const clonedNodes = original.map((node, i) => ({
    id: i,
    key: `clone-${i}`,
    val: node.val,
    random: cloneRandom[i],
    randomKey: cloneRandom[i] !== null ? `clone-${cloneRandom[i]}` : null,
    nextKey: cloneNext[i],
    isClone: true,
    created: cloneCreated[i],
  }));

  return {
    activeLine,
    phase,
    phaseNumber,
    phaseTitle,
    explanation,
    message,
    curr,
    copy,
    copyHead,
    currRandom,
    targetCloneRandom,
    action,
    originalNodes,
    clonedNodes,
    highlightedLinks: highlightedLinks.map((l) => ({ ...l })),
    relatedLines: [...relatedLines],
    activePointers: {
      curr: curr !== null ? `orig-${curr}` : null,
      copy: copy !== null ? `clone-${copy}` : null,
      copyHead: copyHead !== null ? `clone-${copyHead}` : null,
    },
    totalNodes: n,
  };
}

export function buildCopyRandomListStory(input) {
  const original = parseListWithRandom(input);
  const n = original.length;
  const frames = [];

  // Base case: empty list
  if (n === 0) {
    frames.push({
      activeLine: 1,
      phase: "init",
      phaseNumber: 0,
      phaseTitle: "Function Invocation",
      explanation: "Called copyRandomList(head) with head = None.",
      message: "def copyRandomList(head): head is None",
      curr: null,
      copy: null,
      copyHead: null,
      currRandom: null,
      targetCloneRandom: null,
      action: "check_empty",
      originalNodes: [],
      clonedNodes: [],
      highlightedLinks: [],
      relatedLines: [1],
      activePointers: { curr: null, copy: null, copyHead: null },
      totalNodes: 0,
    });
    frames.push({
      activeLine: 2,
      phase: "done",
      phaseNumber: 4,
      phaseTitle: "Base Case Reached",
      explanation: "if not head: return None. The list is empty, returning None.",
      message: "if not head: return None -> returns None",
      curr: null,
      copy: null,
      copyHead: null,
      currRandom: null,
      targetCloneRandom: null,
      action: "return_none",
      originalNodes: [],
      clonedNodes: [],
      highlightedLinks: [],
      relatedLines: [2],
      activePointers: { curr: null, copy: null, copyHead: null },
      totalNodes: 0,
    });
    return { original, frames };
  }

  // Simulation state
  const origNext = Array.from({ length: n }, (_, i) => (i + 1 < n ? `orig-${i + 1}` : null));
  const cloneCreated = Array(n).fill(false);
  const cloneNext = Array(n).fill(null);
  const cloneRandom = Array(n).fill(null);

  // Line 2: check if head is None
  frames.push(
    makeFrame({
      activeLine: 2,
      phase: "init",
      phaseNumber: 0,
      phaseTitle: "Initialization & Base Check",
      explanation: `Checking 'if not head': head exists (node 0, val: ${original[0].val}). Proceeding to copy.`,
      message: `head is not None (list length = ${n}). Proceeding.`,
      curr: null,
      action: "check_head",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [1, 2],
    })
  );

  // Line 3: curr = head
  frames.push(
    makeFrame({
      activeLine: 3,
      phase: "init",
      phaseNumber: 0,
      phaseTitle: "Initialize Traversal Pointer",
      explanation: "Set curr = head (points to original node 0).",
      message: "curr = head: Start pointer at node 0.",
      curr: 0,
      action: "init_curr",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [3],
    })
  );

  // Phase 1: Interleave clone nodes (Lines 4 - 8)
  for (let i = 0; i < n; i++) {
    // Line 4: while curr:
    frames.push(
      makeFrame({
        activeLine: 4,
        phase: "interleave",
        phaseNumber: 1,
        phaseTitle: "Phase 1: Interleave Clone Nodes",
        explanation: `while curr: curr is at original node ${i} (val: ${original[i].val}).`,
        message: `while curr: curr at node ${i} (val: ${original[i].val})`,
        curr: i,
        action: "loop_interleave",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [4],
      })
    );

    // Line 5: copy = Node(curr.val)
    cloneCreated[i] = true;
    frames.push(
      makeFrame({
        activeLine: 5,
        phase: "interleave",
        phaseNumber: 1,
        phaseTitle: "Phase 1: Interleave Clone Nodes",
        explanation: `Created new clone node ${i}' with val = ${original[i].val}. Not yet linked into chain.`,
        message: `copy = Node(${original[i].val}): Created clone ${i}'`,
        curr: i,
        copy: i,
        action: "create_copy",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [5],
      })
    );

    // Line 6: copy.next = curr.next
    const targetNext = origNext[i];
    cloneNext[i] = targetNext;
    frames.push(
      makeFrame({
        activeLine: 6,
        phase: "interleave",
        phaseNumber: 1,
        phaseTitle: "Phase 1: Interleave Clone Nodes",
        explanation: `Set copy.next = curr.next: clone ${i}' now points to ${targetNext ? `node ${i + 1}` : "null"}.`,
        message: `copy.next = curr.next: clone ${i}' points to ${targetNext ? `node ${i + 1}` : "null"}`,
        curr: i,
        copy: i,
        action: "link_copy_next",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        highlightedLinks: [
          {
            from: `clone-${i}`,
            to: targetNext,
            type: "next",
            status: "new",
          },
        ],
        relatedLines: [6],
      })
    );

    // Line 7: curr.next = copy
    origNext[i] = `clone-${i}`;
    frames.push(
      makeFrame({
        activeLine: 7,
        phase: "interleave",
        phaseNumber: 1,
        phaseTitle: "Phase 1: Interleave Clone Nodes",
        explanation: `Set curr.next = copy: original node ${i} now points to its clone ${i}'. Interleaved: node ${i} -> clone ${i}'.`,
        message: `curr.next = copy: spliced clone ${i}' right after node ${i}`,
        curr: i,
        copy: i,
        action: "link_curr_copy",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        highlightedLinks: [
          {
            from: `orig-${i}`,
            to: `clone-${i}`,
            type: "next",
            status: "new",
          },
        ],
        relatedLines: [7],
      })
    );

    // Line 8: curr = copy.next
    const nextCurr = i + 1 < n ? i + 1 : null;
    frames.push(
      makeFrame({
        activeLine: 8,
        phase: "interleave",
        phaseNumber: 1,
        phaseTitle: "Phase 1: Interleave Clone Nodes",
        explanation: `curr = copy.next: advance curr past the clone to ${nextCurr !== null ? `node ${nextCurr}` : "null (end of list)"}.`,
        message: `curr = copy.next: curr advances to ${nextCurr !== null ? `node ${nextCurr}` : "null"}`,
        curr: nextCurr,
        copy: i,
        action: "advance_curr",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [8],
      })
    );
  }

  // End of Phase 1 loop: curr is null at line 4
  frames.push(
    makeFrame({
      activeLine: 4,
      phase: "interleave",
      phaseNumber: 1,
      phaseTitle: "Phase 1: Complete",
      explanation: "curr is None. Phase 1 complete: all cloned nodes are interleaved with originals (A -> A' -> B -> B' -> ...).",
      message: "Phase 1 complete: all clone nodes successfully interleaved!",
      curr: null,
      action: "complete_phase1",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [4],
    })
  );

  // Phase 2: Assign random pointers (Lines 9 - 13)
  // Line 9: curr = head
  frames.push(
    makeFrame({
      activeLine: 9,
      phase: "random",
      phaseNumber: 2,
      phaseTitle: "Phase 2: Assign Random Pointers",
      explanation: "curr = head: reset curr to original head (node 0) to begin wiring random pointers.",
      message: "curr = head: Reset curr to node 0 for Phase 2.",
      curr: 0,
      action: "init_random_pass",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [9],
    })
  );

  for (let i = 0; i < n; i++) {
    // Line 10: while curr:
    frames.push(
      makeFrame({
        activeLine: 10,
        phase: "random",
        phaseNumber: 2,
        phaseTitle: "Phase 2: Assign Random Pointers",
        explanation: `while curr: curr is at original node ${i} (val: ${original[i].val}).`,
        message: `while curr: curr at node ${i}`,
        curr: i,
        action: "loop_random",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [10],
      })
    );

    // Line 11: if curr.random:
    const r = original[i].random;
    frames.push(
      makeFrame({
        activeLine: 11,
        phase: "random",
        phaseNumber: 2,
        phaseTitle: "Phase 2: Assign Random Pointers",
        explanation:
          r !== null
            ? `curr.random is node ${r}. Since node ${r}'s clone is node ${r}.next (clone ${r}'), we can directly wire clone ${i}'.random = clone ${r}'.`
            : `curr.random is None. Clone ${i}'.random remains None.`,
        message:
          r !== null
            ? `if curr.random: True (points to node ${r})`
            : `if curr.random: False (null)`,
        curr: i,
        currRandom: r,
        action: "check_random",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        highlightedLinks:
          r !== null
            ? [
                {
                  from: `orig-${i}`,
                  to: `orig-${r}`,
                  type: "random",
                  status: "reference",
                },
              ]
            : [],
        relatedLines: [11],
      })
    );

    // Line 12: curr.next.random = curr.random.next
    if (r !== null) {
      cloneRandom[i] = r;
      frames.push(
        makeFrame({
          activeLine: 12,
          phase: "random",
          phaseNumber: 2,
          phaseTitle: "Phase 2: Assign Random Pointers",
          explanation: `curr.next.random = curr.random.next: Wired clone ${i}'.random = clone ${r}' in O(1) space!`,
          message: `curr.next.random = curr.random.next: clone ${i}'.random -> clone ${r}'`,
          curr: i,
          copy: i,
          currRandom: r,
          targetCloneRandom: r,
          action: "wire_clone_random",
          origNext,
          cloneCreated,
          cloneNext,
          cloneRandom,
          original,
          highlightedLinks: [
            {
              from: `orig-${i}`,
              to: `orig-${r}`,
              type: "random",
              status: "reference",
            },
            {
              from: `clone-${i}`,
              to: `clone-${r}`,
              type: "random",
              status: "new",
            },
          ],
          relatedLines: [12],
        })
      );
    }

    // Line 13: curr = curr.next.next
    const nextCurr = i + 1 < n ? i + 1 : null;
    frames.push(
      makeFrame({
        activeLine: 13,
        phase: "random",
        phaseNumber: 2,
        phaseTitle: "Phase 2: Assign Random Pointers",
        explanation: `curr = curr.next.next: Advance curr two steps past clone ${i}' to ${nextCurr !== null ? `node ${nextCurr}` : "null"}.`,
        message: `curr = curr.next.next: curr advances to ${nextCurr !== null ? `node ${nextCurr}` : "null"}`,
        curr: nextCurr,
        action: "advance_random",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [13],
      })
    );
  }

  // End of Phase 2 loop: curr is null at line 10
  frames.push(
    makeFrame({
      activeLine: 10,
      phase: "random",
      phaseNumber: 2,
      phaseTitle: "Phase 2: Complete",
      explanation: "curr is None. Phase 2 complete: all clone random pointers are correctly assigned!",
      message: "Phase 2 complete: all clone random pointers wired!",
      curr: null,
      action: "complete_phase2",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [10],
    })
  );

  // Phase 3: Decouple original and copied lists (Lines 14 - 22)
  // Line 14: curr = head
  frames.push(
    makeFrame({
      activeLine: 14,
      phase: "decouple",
      phaseNumber: 3,
      phaseTitle: "Phase 3: Decouple Lists",
      explanation: "curr = head: reset curr to original head (node 0) to separate the interleaved lists.",
      message: "curr = head: Reset curr to node 0 for decoupling.",
      curr: 0,
      action: "init_decouple",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [14],
    })
  );

  // Line 15: copy_head = head.next
  const copyHead = 0;
  frames.push(
    makeFrame({
      activeLine: 15,
      phase: "decouple",
      phaseNumber: 3,
      phaseTitle: "Phase 3: Decouple Lists",
      explanation: "copy_head = head.next: save reference to clone 0' as the head of the new copied list.",
      message: "copy_head = head.next: Saved head of copied list (clone 0').",
      curr: 0,
      copyHead,
      action: "set_copy_head",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [15],
    })
  );

  for (let i = 0; i < n; i++) {
    // Line 16: while curr:
    frames.push(
      makeFrame({
        activeLine: 16,
        phase: "decouple",
        phaseNumber: 3,
        phaseTitle: "Phase 3: Decouple Lists",
        explanation: `while curr: curr is at original node ${i}.`,
        message: `while curr: curr at node ${i}`,
        curr: i,
        copyHead,
        action: "loop_decouple",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [16],
      })
    );

    // Line 17: copy = curr.next
    frames.push(
      makeFrame({
        activeLine: 17,
        phase: "decouple",
        phaseNumber: 3,
        phaseTitle: "Phase 3: Decouple Lists",
        explanation: `copy = curr.next: copy points to clone ${i}'.`,
        message: `copy = curr.next: clone ${i}'`,
        curr: i,
        copy: i,
        copyHead,
        action: "get_copy",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [17],
      })
    );

    // Line 18: curr.next = copy.next
    const restoredOrigNext = cloneNext[i];
    origNext[i] = restoredOrigNext;
    frames.push(
      makeFrame({
        activeLine: 18,
        phase: "decouple",
        phaseNumber: 3,
        phaseTitle: "Phase 3: Decouple Lists",
        explanation: `curr.next = copy.next: restore original node ${i}.next -> ${restoredOrigNext ? `node ${i + 1}` : "null"}.`,
        message: `curr.next = copy.next: original node ${i} restored`,
        curr: i,
        copy: i,
        copyHead,
        action: "restore_orig_next",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        highlightedLinks: [
          {
            from: `orig-${i}`,
            to: restoredOrigNext,
            type: "next",
            status: "new",
          },
        ],
        relatedLines: [18],
      })
    );

    // Line 19: if copy.next:
    const hasCopyNext = cloneNext[i] !== null;
    frames.push(
      makeFrame({
        activeLine: 19,
        phase: "decouple",
        phaseNumber: 3,
        phaseTitle: "Phase 3: Decouple Lists",
        explanation: hasCopyNext
          ? `copy.next exists (node ${i + 1}). We will rewire copy.next to copy.next.next (clone ${i + 1}').`
          : `copy.next is None (end of list). Clone ${i}' is the last node.`,
        message: hasCopyNext
          ? `if copy.next: True (node ${i + 1} exists)`
          : `if copy.next: False (last clone)`,
        curr: i,
        copy: i,
        copyHead,
        action: "check_copy_next",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [19],
      })
    );

    // Line 20: copy.next = copy.next.next
    if (hasCopyNext) {
      cloneNext[i] = `clone-${i + 1}`;
      frames.push(
        makeFrame({
          activeLine: 20,
          phase: "decouple",
          phaseNumber: 3,
          phaseTitle: "Phase 3: Decouple Lists",
          explanation: `copy.next = copy.next.next: wire clone ${i}'.next directly to clone ${i + 1}'.`,
          message: `copy.next = copy.next.next: clone ${i}' -> clone ${i + 1}'`,
          curr: i,
          copy: i,
          copyHead,
          action: "wire_clone_next",
          origNext,
          cloneCreated,
          cloneNext,
          cloneRandom,
          original,
          highlightedLinks: [
            {
              from: `clone-${i}`,
              to: `clone-${i + 1}`,
              type: "next",
              status: "new",
            },
          ],
          relatedLines: [20],
        })
      );
    }

    // Line 21: curr = curr.next
    const nextCurr = origNext[i] ? i + 1 : null;
    frames.push(
      makeFrame({
        activeLine: 21,
        phase: "decouple",
        phaseNumber: 3,
        phaseTitle: "Phase 3: Decouple Lists",
        explanation: `curr = curr.next: advance curr along restored original chain to ${nextCurr !== null ? `node ${nextCurr}` : "null"}.`,
        message: `curr = curr.next: advance to ${nextCurr !== null ? `node ${nextCurr}` : "null"}`,
        curr: nextCurr,
        copy: i,
        copyHead,
        action: "advance_decouple",
        origNext,
        cloneCreated,
        cloneNext,
        cloneRandom,
        original,
        relatedLines: [21],
      })
    );
  }

  // End of Phase 3 loop: curr is null at line 16
  frames.push(
    makeFrame({
      activeLine: 16,
      phase: "decouple",
      phaseNumber: 3,
      phaseTitle: "Phase 3: Complete",
      explanation: "curr is None. Decoupling complete: original list and cloned list are completely separated!",
      message: "Decoupling loop terminated: both lists independent.",
      curr: null,
      copyHead,
      action: "complete_decouple",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [16],
    })
  );

  // Line 22: return copy_head
  frames.push(
    makeFrame({
      activeLine: 22,
      phase: "done",
      phaseNumber: 4,
      phaseTitle: "Done: Return Cloned Head",
      explanation:
        "return copy_head: Successfully returned head of copied list. Original list topology is preserved.",
      message: "return copy_head: Clone complete! O(N) time, O(1) space.",
      curr: null,
      copyHead,
      action: "return_head",
      origNext,
      cloneCreated,
      cloneNext,
      cloneRandom,
      original,
      relatedLines: [22],
    })
  );

  return { original, frames };
}
