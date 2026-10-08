export const candyNarrative = {
  goal: "Find the minimum number of candies needed to distribute to children in a line such that every child gets at least 1 candy, and higher-rated neighbors receive strictly more candies than their adjacent peers.",
  chapters: [
    "Give each child 1 candy",
    "Left-to-right slope pass",
    "Right-to-left slope pass",
    "Total minimum candy sum",
  ],
  ready: {
    why: "Two greedy passes decouple the neighbor constraints: the left pass ensures children higher than their left neighbor get more, and the right pass ensures children higher than their right neighbor get more (taking the maximum of both requirements).",
    achieved: "Candy distribution not started yet.",
    next: "Initialize each child with 1 candy.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Rule 1: every child must receive at least 1 candy. Allocate a baseline array of 1s.",
      achieved:
        step.activeLine === 2
          ? "Determined child count n."
          : `Initialized candy array with 1 for all ${step.candies?.length} children.`,
      next: "Begin left-to-right pass to satisfy left neighbor constraints.",
    }),
    loop: ({ step }) => ({
      chapter: step.direction === "ltr" ? 1 : 2,
      why:
        step.direction === "ltr"
          ? "Scan left-to-right from index 1 to n-1, comparing each child with their left neighbor."
          : "Scan right-to-left from index n-2 down to 0, comparing each child with their right neighbor.",
      achieved: `${step.direction === "ltr" ? "Left-to-right pass" : "Right-to-left pass"}: inspecting child ${step.i} against neighbor ${step.compareIndex}.`,
      next: `Compare rating ${step.direction === "ltr" ? `ratings[${step.i}] > ratings[${step.compareIndex}]` : `ratings[${step.i}] > ratings[${step.compareIndex}]`}.`,
    }),
    compare: ({ step }) => ({
      chapter: step.direction === "ltr" ? 1 : 2,
      why: "Check if current child has a strictly higher rating than adjacent neighbor.",
      achieved: `Condition ratings[${step.i}] > ratings[${step.compareIndex}] is ${step.conditionMet ? "True (higher rating)" : "False (equal or lower)"}.`,
      next: step.conditionMet
        ? step.direction === "ltr"
          ? "Increase candy allocation: candies[i] = candies[i-1] + 1."
          : "Update candy allocation: candies[i] = max(candies[i], candies[i+1] + 1)."
        : "No candy increase needed in this direction.",
    }),
    update: ({ step }) => ({
      chapter: step.direction === "ltr" ? 1 : 2,
      why:
        step.direction === "ltr"
          ? "Assign candies[i] = candies[i-1] + 1."
          : "Assign candies[i] = max(candies[i], candies[i+1] + 1) to satisfy both directions simultaneously.",
      achieved: `Child ${step.i} candy updated to ${step.candies?.[step.i]}. Current candy array: [${step.candies?.join(", ")}].`,
      next: "Advance to the next child in this pass.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "Both directional passes complete; all local constraints satisfied with minimal global sum.",
      achieved: `All constraints satisfied. Total minimum candies required: ${step.totalCandies} (distribution: [${step.candies?.join(", ")}]).`,
      next: "Try another rating distribution with peaks and valleys.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Get the length of the ratings array.",
      achieved: "Got array length n.",
      next: "Allocate candies array filled with 1s.",
    },
    3: ({ step }) => ({
      chapter: 0,
      why: "candies = [1] * n.",
      achieved: `Initialized candies array of size ${step.candies?.length}.`,
      next: "Start left-to-right pass.",
    }),
    4: ({ step }) => ({
      chapter: 1,
      why: "for i in range(1, n):",
      achieved: `Left pass at index ${step.i}.`,
      next: "Compare with left neighbor.",
    }),
    5: ({ step }) => ({
      chapter: 1,
      why: "Check if ratings[i] > ratings[i-1].",
      achieved: `Higher than left neighbor? ${step.conditionMet ? "Yes" : "No"}.`,
      next: step.conditionMet
        ? "Set candies[i] = candies[i-1] + 1."
        : "Continue left pass.",
    }),
    6: ({ step }) => ({
      chapter: 1,
      why: "candies[i] = candies[i-1] + 1.",
      achieved: `candies[${step.i}] = ${step.candies?.[step.i]}.`,
      next: "Continue left pass.",
    }),
    7: ({ step }) => ({
      chapter: 2,
      why: "for i in range(n-2, -1, -1):",
      achieved: `Right pass at index ${step.i}.`,
      next: "Compare with right neighbor.",
    }),
    8: ({ step }) => ({
      chapter: 2,
      why: "Check if ratings[i] > ratings[i+1].",
      achieved: `Higher than right neighbor? ${step.conditionMet ? "Yes" : "No"}.`,
      next: step.conditionMet
        ? "Set candies[i] = max(candies[i], candies[i+1] + 1)."
        : "Continue right pass.",
    }),
    9: ({ step }) => ({
      chapter: 2,
      why: "candies[i] = max(candies[i], candies[i+1] + 1).",
      achieved: `candies[${step.i}] = ${step.candies?.[step.i]}.`,
      next: "Continue right pass.",
    }),
    10: ({ step }) => ({
      chapter: 3,
      why: "Return sum of all distributed candies.",
      achieved: `Total candies: ${step.totalCandies}.`,
      next: "Completed.",
    }),
  },
};
