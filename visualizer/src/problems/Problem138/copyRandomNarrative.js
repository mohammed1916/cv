export const copyRandomNarrative = {
  goal: "Create a deep copy of a linked list with random pointers in O(1) extra space by interleaving clone nodes directly with original nodes.",
  chapters: [
    "Interleave clone nodes (A → A')",
    "Assign clone random pointers",
    "Separate and restore original list",
    "Return head of copied list",
  ],
  ready: {
    why: "By inserting each clone node immediately after its original counterpart (A -> A' -> B -> B'), the clone of any node's random target is simply curr.random.next, eliminating the need for a hash map.",
    achieved: "List copy has not started yet.",
    next: "Start Phase 1: interleave each clone node after its original.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Verify that head is non-null and initialize pointer curr = head.",
      achieved: "List validated; pointer at head.",
      next: "Begin Phase 1 (interleaving clones).",
    },
    interleave: ({ step }) => ({
      chapter: 0,
      why: "Create clone node with val = curr.val and insert it between curr and curr.next.",
      achieved: `Phase 1: ${step.copy !== null ? `created clone ${step.copy}' (val: ${step.originalNodes?.[step.copy]?.val}) spliced after node ${step.copy}.` : "interleaving nodes."}`,
      next: "Advance curr past the newly created clone node.",
    }),
    random: ({ step }) => ({
      chapter: 1,
      why: "Assign clone random pointers: curr.next.random = curr.random.next.",
      achieved: `Phase 2: ${step.currRandom !== null ? `wired clone ${step.curr}'.random -> clone ${step.currRandom}'.` : `node ${step.curr} random is null.`}`,
      next: "Advance curr two steps to the next original node.",
    }),
    decouple: ({ step }) => ({
      chapter: 2,
      why: "Separate the interleaved chain into two independent lists: restore original next pointers and wire clone next pointers.",
      achieved: `Phase 3: separating original node ${step.curr} and clone ${step.copy}'.`,
      next: "Advance to the next node pair.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All 3 passes complete: deep copy is fully detached with preserved structure.",
      achieved: `Deep copy complete! Returned copy_head (clone 0').`,
      next: "Try another list with complex random cross-links or self-loops.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "if not head: return None.",
      achieved: "Checked empty list.",
      next: "Start Phase 1.",
    },
    5: ({ step }) => ({
      chapter: 0,
      why: "copy = Node(curr.val): allocate clone.",
      achieved: `Allocated clone ${step.copy}'.`,
      next: "Splicing into chain.",
    }),
    7: ({ step }) => ({
      chapter: 0,
      why: "curr.next = copy: interleave clone.",
      achieved: `Spliced clone ${step.copy}' into list.`,
      next: "Advance curr.",
    }),
    12: ({ step }) => ({
      chapter: 1,
      why: "curr.next.random = curr.random.next.",
      achieved: `Set clone random pointer.`,
      next: "Advance curr by 2 nodes.",
    }),
    18: ({ step }) => ({
      chapter: 2,
      why: "curr.next = copy.next (restore original link).",
      achieved: `Restored original next link.`,
      next: "Wire clone.next.",
    }),
    20: ({ step }) => ({
      chapter: 2,
      why: "copy.next = copy.next.next (wire clone list).",
      achieved: `Wired clone next link.`,
      next: "Advance curr.",
    }),
    23: {
      chapter: 3,
      why: "return copy_head.",
      achieved: "Returned head of deep copied list.",
      next: "Completed.",
    },
  },
};
