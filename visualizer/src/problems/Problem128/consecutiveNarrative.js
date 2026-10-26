export const consecutiveNarrative = {
  goal: "Find the length of the longest sequence of consecutive elements in an unsorted array in O(n) time using O(1) hash set lookups.",
  chapters: [
    "Build hash set",
    "Identify sequence starts",
    "Count consecutive streak",
    "Record maximum length",
  ],
  ready: {
    why: "Inserting all numbers into a hash set allows checking if a number is the start of a streak (num - 1 not in set) in O(1) time. This ensures each number is part of only one expansion, guaranteeing O(n) overall runtime.",
    achieved: "Hash set not built yet.",
    next: "Convert input array into a hash set and initialize longest = 0.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Set up the hash set for O(1) membership queries.",
      achieved:
        step.activeLine === 2
          ? `Built hash set from input elements.`
          : `Initialized longest streak tracker to 0.`,
      next: "Begin scanning numbers to find sequence starting points.",
    }),
    scan: ({ step }) => ({
      chapter: 1,
      why: "A number is the start of a consecutive sequence only if (num - 1) is NOT in the set.",
      achieved: step.hasLeftNeighbor
        ? `Number ${step.num} has left neighbor ${step.leftNeighbor} in set: skip (will be counted from its true start).`
        : `Number ${step.num} has NO left neighbor in set: this is the start of a new sequence!`,
      next: step.hasLeftNeighbor
        ? "Advance to the next number in the set."
        : `Start counting consecutive streak starting at ${step.num}.`,
    }),
    chain: ({ step }) => ({
      chapter: 2,
      why: "Initialize current element curr = num and streak length = 1.",
      achieved: `Sequence initialized: [${step.curr}], current streak = ${step.streak}.`,
      next: `Check if ${step.curr + 1} exists in the set.`,
    }),
    expand: ({ step }) => ({
      chapter: 2,
      why: "While curr + 1 is in the set, extend the consecutive streak.",
      achieved: `Found ${step.curr} in set. Current streak increased to ${step.streak} elements: [${step.currentSequence?.join(", ")}].`,
      next: `Check if ${step.curr + 1} is in the set.`,
    }),
    update: ({ step }) => ({
      chapter: 3,
      why: "When the chain ends, update the global maximum streak: longest = max(longest, streak).",
      achieved: step.isNewLongest
        ? `New longest record! Updated longest = ${step.longest} (from sequence [${step.currentSequence?.join(", ")}]).`
        : `Chain ended at streak ${step.streak}. Longest remains ${step.longest}.`,
      next: "Continue scanning remaining numbers in the set.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All unique elements checked; each streak traversed at most once.",
      achieved: `Longest consecutive sequence length is ${step.longest}.`,
      next: "Try another array with duplicate or negative numbers.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Convert input list into a set to enable O(1) element lookups.",
      achieved: "Hash set created.",
      next: "Initialize longest = 0.",
    },
    3: {
      chapter: 0,
      why: "Initialize longest streak counter to 0.",
      achieved: "longest = 0.",
      next: "Iterate over elements in num_set.",
    },
    5: ({ step }) => ({
      chapter: 1,
      why: "Check if (num - 1) not in num_set.",
      achieved: `${step.leftNeighbor} in set? ${step.hasLeftNeighbor ? "Yes (skip)" : "No (start sequence)"}.`,
      next: step.hasLeftNeighbor ? "Skip number." : "Initialize streak.",
    }),
    7: ({ step }) => ({
      chapter: 2,
      why: "Set curr = num and streak = 1.",
      achieved: `curr = ${step.curr}, streak = 1.`,
      next: "Enter while loop (while curr + 1 in num_set).",
    }),
    9: ({ step }) => ({
      chapter: 2,
      why: "Extend streak: curr += 1, streak += 1.",
      achieved: `curr = ${step.curr}, streak = ${step.streak}.`,
      next: "Check if next successor exists.",
    }),
    11: ({ step }) => ({
      chapter: 3,
      why: "Update longest = max(longest, streak).",
      achieved: `longest = ${step.longest}.`,
      next: "Continue outer loop.",
    }),
    12: ({ step }) => ({
      chapter: 3,
      why: "Return final longest consecutive length.",
      achieved: `Final longest streak: ${step.longest}.`,
      next: "Completed.",
    }),
  },
};
