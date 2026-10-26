export const permuteUniqueNarrative = {
  goal: "Generate all unique permutations of an array containing duplicates by sorting the values and pruning duplicate branches during backtracking.",
  chapters: [
    "Sort array & duplicate grouping",
    "Choose unused element",
    "Prune duplicate branches",
    "Collect unique permutation",
  ],
  ready: {
    why: "Sorting places duplicate values next to each other. By enforcing the rule that a duplicate value can only be chosen if its preceding identical copy is already used, duplicate permutation branches are pruned at O(1) decision time.",
    achieved: "Backtracking has not started yet.",
    next: "Sort the array and start backtracking from an empty path.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Sort elements so identical values are adjacent, and initialize the used boolean array and empty path.",
      achieved: "Values sorted; backtracking ready.",
      next: "Start exploring permutation slots from depth 0.",
    },
    skip: ({ step }) => ({
      chapter: 2,
      why: "Prune redundant exploration: either index is already used in current path, or an earlier identical copy is unused.",
      achieved: `Skipped index ${step.candidate}. Avoids generating duplicate permutations.`,
      next: "Try next candidate index in sorted array.",
    }),
    add: ({ step }) => ({
      chapter: 1,
      why: "Pick the current unused number, mark used[i] = True, and recurse to build the next slot in the permutation.",
      achieved: `Placed index ${step.candidate} into path. Current path length: ${step.path?.length}.`,
      next: "Recursively search deeper slots.",
    }),
    remove: ({ step }) => ({
      chapter: 1,
      why: "Backtrack: pop the last number from the path and mark used[i] = False so it can be used in other branches.",
      achieved: `Backtracked index ${step.candidate}: removed from path and restored availability.`,
      next: "Continue loop at current depth.",
    }),
    result: ({ step }) => ({
      chapter: 3,
      why: "Base case reached: all slots in the permutation are filled.",
      achieved: `Found unique permutation #${step.resultCount}! Saved copy to result list.`,
      next: "Backtrack to search for additional valid permutations.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "Backtracking complete; all permutations explored without duplicates.",
      achieved: `Total unique permutations found: ${step.resultCount}.`,
      next: "Try another list with duplicate numbers.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Sort nums in ascending order.",
      achieved: "Array sorted.",
      next: "Initialize result and path.",
    },
    7: ({ step }) => ({
      chapter: 3,
      why: "Base case: if len(path) == len(nums), record permutation.",
      achieved: `Permutation #${step.resultCount} recorded.`,
      next: "Backtrack.",
    }),
    11: ({ step }) => ({
      chapter: 2,
      why: "if used[i]: continue (already used in path).",
      achieved: `Index ${step.candidate} already used.`,
      next: "Skip candidate.",
    }),
    13: ({ step }) => ({
      chapter: 2,
      why: "Prune duplicate: if nums[i] == nums[i-1] and not used[i-1]: continue.",
      achieved: `Pruned duplicate branch at index ${step.candidate}.`,
      next: "Skip candidate.",
    }),
    14: ({ step }) => ({
      chapter: 1,
      why: "path.append(nums[i]); used[i] = True.",
      achieved: `Selected index ${step.candidate}.`,
      next: "Recurse via backtrack().",
    }),
    16: ({ step }) => ({
      chapter: 1,
      why: "path.pop(); used[i] = False.",
      achieved: `Backtracked index ${step.candidate}.`,
      next: "Continue for loop.",
    }),
    18: ({ step }) => ({
      chapter: 3,
      why: "Return all unique permutations.",
      achieved: `All ${step.resultCount} unique permutations found.`,
      next: "Completed.",
    }),
  },
};
