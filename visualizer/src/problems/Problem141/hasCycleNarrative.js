export const hasCycleNarrative = {
  goal: "Detect if a cycle exists in the linked list in O(N) time and O(1) space using Floyd's Tortoise and Hare algorithm.",
  chapters: [
    "Pointer Initialization",
    "Loop Invariant & Boundary Check",
    "Advance Pointers",
    "Collision & Cycle Detection",
    "Termination",
  ],
  ready: {
    why: "Floyd's cycle-finding algorithm needs two pointers starting at the head to detect loops without extra memory.",
    achieved:
      "Visualizer is ready to initialize the slow and fast runners at the list head.",
    next: "Step forward to set slow = fast = head and evaluate the cycle traversal.",
  },
  phases: {
    init: {
      chapter: "Pointer Initialization",
      why: "Initialize both slow (1 hop per step) and fast (2 hops per step) at head node.",
      achieved: "Both pointers placed at head node.",
      next: "Check if fast pointer can safely advance two nodes.",
    },
    check: ({ step }) => ({
      chapter: "Loop Invariant & Boundary Check",
      why: "Fast pointer needs non-null current and next nodes to advance 2 steps safely.",
      achieved:
        step.fast !== null && step.fastNext !== null
          ? `Fast pointer at node ${step.fast} with next node ${step.fastNext} — path is clear to advance.`
          : "Fast pointer reached end of list (null or tail without loop).",
      next:
        step.fast !== null && step.fastNext !== null
          ? "Advance slow by 1 node and fast by 2 nodes."
          : "Exit loop and conclude that the list has no cycle.",
    }),
    move_slow: ({ step }) => ({
      chapter: "Advance Pointers",
      why: "Slow runner advances 1 hop along the chain.",
      achieved: `Slow pointer moved to node ${step.slow}${step.slowVal !== null ? ` (val=${step.slowVal})` : ""}.`,
      next: "Advance fast runner 2 hops.",
    }),
    move_fast: ({ step }) => ({
      chapter: "Advance Pointers",
      why: "Fast runner advances 2 hops, closing the distance to slow in any loop by 1 node per iteration.",
      achieved:
        step.fast !== null
          ? `Fast pointer advanced to node ${step.fast}${step.fastVal !== null ? ` (val=${step.fastVal})` : ""}.`
          : "Fast pointer advanced to null (end of list).",
      next: "Compare slow and fast pointer positions to test for a meeting point.",
    }),
    compare: ({ step }) => ({
      chapter: "Collision & Cycle Detection",
      why: "If slow and fast land on the identical node, a cycle is mathematically guaranteed.",
      achieved:
        step.meetingNode !== null
          ? `Collision detected at node ${step.meetingNode} (val=${step.slowVal})!`
          : `No collision this turn (slow at node ${step.slow}, fast at node ${step.fast ?? "null"}).`,
      next:
        step.meetingNode !== null
          ? "Return True to signal a confirmed cycle."
          : "Continue to next iteration of the chase.",
    }),
    done: ({ step }) => ({
      chapter: "Termination",
      why: "Conclude search with final boolean verdict.",
      achieved: step.result
        ? `Cycle confirmed (collision occurred at node ${step.meetingNode}). Result: True.`
        : "Acyclic linked list confirmed (fast reached null). Result: False.",
      next: "Execution finished.",
    }),
  },
  lines: {
    2: ({ step }) => ({
      chapter: "Pointer Initialization",
      why: "Set slow = fast = head as starting baseline.",
      achieved:
        step.slow !== null
          ? `Slow and fast both initialized at head node ${step.slow} (val=${step.slowVal}).`
          : "List is empty, slow and fast initialized to null.",
      next: "Evaluate while loop condition.",
    }),
    3: ({ step }) => ({
      chapter: "Loop Invariant & Boundary Check",
      why: "Verify fast and fast.next are non-null before two-step jump.",
      achieved:
        step.fast !== null && step.fastNext !== null
          ? `Loop condition met: fast is at node ${step.fast}, fast.next is node ${step.fastNext}.`
          : "Loop condition false: end of list reached.",
      next:
        step.fast !== null && step.fastNext !== null
          ? "Move slow pointer 1 step forward."
          : "Return False indicating no cycle.",
    }),
    4: ({ step }) => ({
      chapter: "Advance Pointers",
      why: "Execute slow = slow.next.",
      achieved: `Slow advanced 1 hop to node ${step.slow} (val=${step.slowVal}).`,
      next: "Advance fast pointer 2 steps.",
    }),
    5: ({ step }) => ({
      chapter: "Advance Pointers",
      why: "Execute fast = fast.next.next.",
      achieved:
        step.fast !== null
          ? `Fast advanced 2 hops to node ${step.fast} (val=${step.fastVal}).`
          : "Fast advanced past tail to null.",
      next: "Check if slow equals fast.",
    }),
    6: ({ step }) => ({
      chapter: "Collision & Cycle Detection",
      why: "Check slow == fast to determine if pointers met.",
      achieved:
        step.meetingNode !== null
          ? `Collision confirmed at node ${step.meetingNode}!`
          : `Pointers differ (slow=${step.slow}, fast=${step.fast ?? "null"}).`,
      next:
        step.meetingNode !== null
          ? "Return True."
          : "Proceed to next loop check.",
    }),
    7: ({ step }) => ({
      chapter: "Termination",
      why: "Pointers met inside loop, confirming cycle exists.",
      achieved: `Returned True — cycle detected at node ${step.meetingNode}.`,
      next: "Algorithm complete.",
    }),
    8: ({ step }) => ({
      chapter: "Termination",
      why: "Fast reached end of list without meeting slow, confirming no cycle.",
      achieved: "Returned False — list terminated naturally.",
      next: "Algorithm complete.",
    }),
  },
};
