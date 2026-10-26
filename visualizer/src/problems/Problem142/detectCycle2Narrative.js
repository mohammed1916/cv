export const detectCycle2Narrative = {
  goal: "Find the node where the cycle begins in O(N) time and O(1) space using Floyd's Two-Phase Cycle Algorithm.",
  chapters: [
    "Phase 1: Pointers Initialization",
    "Phase 1: Chase & Collision Detection",
    "Phase 2: Cycle Entrance Traversal",
    "Result Confirmation",
  ],
  ready: {
    why: "Floyd's algorithm uses two phases: phase 1 detects a cycle and finds a meeting point; phase 2 aligns pointers to find the cycle entrance.",
    achieved: "Visualizer is ready to initialize runners at head.",
    next: "Step forward to begin Phase 1 cycle detection.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: "Phase 1: Pointers Initialization",
      why: "Initialize slow and fast pointers at head to begin collision search.",
      achieved:
        step && step.slow !== null
          ? `Slow and fast runners placed at head (Node ${step.slow}).`
          : "Linked list is empty; pointers initialized to None.",
      next: "Evaluate while loop condition for Phase 1.",
    }),
    phase1: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Advance slow by 1 hop and fast by 2 hops until collision or end of list.",
      achieved:
        step && step.isMeeting
          ? `Collision confirmed at meeting node ${step.meetingPoint}!`
          : step && step.meetingPoint !== null
            ? `Meeting point established at node ${step.meetingPoint}.`
            : `Phase 1 active: slow at node ${step?.slow ?? "None"}, fast at node ${step?.fast ?? "None"}.`,
      next:
        step && (step.isMeeting || step.meetingPoint !== null)
          ? "Proceed to Phase 2 to locate the cycle entrance."
          : "Continue Phase 1 traversal.",
    }),
    phase2: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "By mathematical invariant F = nC - a, advancing ptr1 from head and ptr2 from meeting point at speed 1 meets precisely at cycle entrance.",
      achieved:
        step && step.isEntrance
          ? `ptr1 and ptr2 collided at cycle entrance (Node ${step.cycleEntrance})!`
          : `ptr1 at node ${step?.ptr1}, ptr2 at node ${step?.ptr2} (step ${step?.phase2Steps}).`,
      next:
        step && step.isEntrance
          ? "Return cycle entrance node."
          : "Advance both ptr1 and ptr2 by 1 node.",
    }),
    done: ({ step }) => ({
      chapter: "Result Confirmation",
      why: "Conclude algorithm and return cycle entrance or None.",
      achieved:
        step && step.result !== null
          ? `Cycle entrance confirmed at node ${step.result}. Returned node ${step.result}.`
          : "No cycle detected in list. Returned None.",
      next: "Algorithm complete.",
    }),
  },
  lines: {
    1: ({ step }) => ({
      chapter: "Phase 1: Pointers Initialization",
      why: "Enter detectCycle function and inspect linked list structure.",
      achieved: step?.message ?? "Function detectCycle entered.",
      next: "Initialize slow and fast pointers to head.",
    }),
    2: ({ step }) => ({
      chapter: "Phase 1: Pointers Initialization",
      why: "Assign slow = fast = head.",
      achieved:
        step && step.slow !== null
          ? `Pointers slow and fast assigned to Node ${step.slow}.`
          : "List is empty, slow and fast set to None.",
      next: "Test while loop condition (fast and fast.next).",
    }),
    3: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Ensure fast pointer can take two forward steps safely.",
      achieved:
        step && step.fast !== null
          ? `Fast pointer at node ${step.fast} — path is clear.`
          : "Fast pointer reached list boundary.",
      next:
        step && step.fast !== null
          ? "Move slow forward by 1 step."
          : "Break to else clause (no cycle).",
    }),
    4: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Advance slow pointer 1 step (slow = slow.next).",
      achieved: `Slow pointer advanced to Node ${step?.slow}.`,
      next: "Advance fast pointer 2 steps.",
    }),
    5: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Advance fast pointer 2 steps (fast = fast.next.next).",
      achieved:
        step && step.fast !== null
          ? `Fast pointer advanced to Node ${step.fast}.`
          : "Fast pointer stepped into None (end of list).",
      next: "Compare slow and fast positions.",
    }),
    6: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Check if slow and fast pointers meet (slow == fast).",
      achieved:
        step && step.isMeeting
          ? `Meeting condition matched at Node ${step.meetingPoint}!`
          : `No meeting yet (slow at node ${step?.slow}, fast at node ${step?.fast ?? "None"}).`,
      next:
        step && step.isMeeting
          ? "Break out of Phase 1 loop."
          : "Continue Phase 1 loop.",
    }),
    7: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Break Phase 1 loop to transition to Phase 2.",
      achieved: `Phase 1 loop broken with collision node ${step?.meetingPoint}.`,
      next: "Set up Phase 2 pointers at head and meeting node.",
    }),
    8: ({ step }) => ({
      chapter: "Phase 1: Chase & Collision Detection",
      why: "Fast reached end without cycle; execute while-else block.",
      achieved: "Loop completed without collision.",
      next: "Return None.",
    }),
    9: () => ({
      chapter: "Result Confirmation",
      why: "Return None for acyclic linked list.",
      achieved: "Returned None.",
      next: "Algorithm complete.",
    }),
    10: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "Initialize ptr1 at head of linked list.",
      achieved: `ptr1 initialized at head (Node ${step?.ptr1}).`,
      next: "Set ptr2 to meeting point.",
    }),
    11: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "Initialize ptr2 at collision node slow.",
      achieved: `ptr2 initialized at collision Node ${step?.ptr2}.`,
      next: "Compare ptr1 and ptr2 positions.",
    }),
    12: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "Check if ptr1 has collided with ptr2 (ptr1 != ptr2).",
      achieved:
        step && step.isEntrance
          ? `ptr1 and ptr2 converged at entrance Node ${step.cycleEntrance}!`
          : `ptr1 (Node ${step?.ptr1}) != ptr2 (Node ${step?.ptr2}).`,
      next:
        step && step.isEntrance
          ? "Exit Phase 2 loop and return entrance node."
          : "Advance both ptr1 and ptr2 by 1 step.",
    }),
    13: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "Advance ptr1 1 step towards entrance (ptr1 = ptr1.next).",
      achieved: `ptr1 moved to Node ${step?.ptr1}.`,
      next: "Advance ptr2 1 step.",
    }),
    14: ({ step }) => ({
      chapter: "Phase 2: Cycle Entrance Traversal",
      why: "Advance ptr2 1 step around cycle (ptr2 = ptr2.next).",
      achieved: `ptr2 moved to Node ${step?.ptr2}.`,
      next: "Check if ptr1 and ptr2 have collided.",
    }),
    15: ({ step }) => ({
      chapter: "Result Confirmation",
      why: "Return ptr1 (the cycle entrance node).",
      achieved: `Returned Node ${step?.result} as the cycle entrance.`,
      next: "Algorithm complete.",
    }),
  },
};
