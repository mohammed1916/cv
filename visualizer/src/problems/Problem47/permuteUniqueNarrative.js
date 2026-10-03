import { createTraceNarrative } from '../../components/shared/createTraceNarrative.js';

export const permuteUniqueNarrative = createTraceNarrative({
  "goal": "Enumerate each distinct permutation of an array that may contain duplicate values.",
  "strategy": "Sort equal copies together and permit only one ordering of unused equal copies at each search depth.",
  "chapters": [
    "Prepare and skip duplicate branches",
    "Choose and undo",
    "Save complete permutations"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        3,
        4,
        9,
        10,
        11,
        12,
        13
      ],
      "why": "Used indices cannot be chosen twice; an unused equal predecessor must be chosen before its successor to avoid duplicate branches.",
      "next": "Choose an eligible index."
    },
    {
      "chapter": 1,
      "lines": [
        14,
        15,
        16,
        17
      ],
      "why": "Each choice occupies an index until its recursive subtree finishes. Undoing frees that index for a different branch.",
      "next": "Explore remaining choices at this depth."
    },
    {
      "chapter": 2,
      "lines": [
        6,
        7,
        8,
        18
      ],
      "why": "Only paths using every index are complete permutations; copy their values before backtracking changes the path.",
      "next": "Continue until all distinct branches have been explored."
    }
  ],
  "edgeCases": [
    "All equal values produce one permutation.",
    "Equal copies can coexist in a path once the earlier copy is used.",
    "Large searches may truncate displayed trace frames while still computing all results."
  ]
});
