import { createTraceNarrative } from './createTraceNarrative.js';

export const pascalTriangleNarrative = createTraceNarrative({
  "goal": "Generate all requested rows of Pascal's triangle.",
  "strategy": "Preserve completed rows so each interior entry can add its two parents from the preceding row.",
  "chapters": [
    "Seed row boundaries",
    "Add two parents",
    "Save the completed row"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        4
      ],
      "why": "The two outside entries are one. Interior placeholders are not final until their parent sums are computed.",
      "next": "Fill the row interior."
    },
    {
      "chapter": 1,
      "lines": [
        6
      ],
      "why": "Each interior value combines the two adjacent entries above it, preserving the binomial recurrence.",
      "next": "Finish all interior entries before saving."
    },
    {
      "chapter": 2,
      "lines": [
        7,
        8
      ],
      "why": "A completed row becomes the source for the next row, and every completed row belongs in the output.",
      "next": "Build the next row or return all requested rows."
    }
  ],
  "edgeCases": [
    "One requested row returns [[1]].",
    "The first two rows have no interior sums.",
    "This visualizer accepts 1 through 30 rows."
  ]
});

export const pascalRowNarrative = createTraceNarrative({
  "goal": "Compute one indexed row of Pascal's triangle using a single reusable buffer.",
  "strategy": "Append a boundary one, then update from right to left so unread parent values remain from the previous row.",
  "chapters": [
    "Seed and grow the buffer",
    "Preserve old parents",
    "Return the requested row"
  ],
  "blocks": [
    {
      "chapter": 0,
      "lines": [
        2,
        4
      ],
      "why": "Row zero is [1]. Appending one provides the next right boundary before interior updates.",
      "next": "Start at the rightmost interior slot."
    },
    {
      "chapter": 1,
      "lines": [
        6
      ],
      "why": "Right-to-left updates read the old current and old left values; left-to-right would accidentally reuse a newly changed parent.",
      "next": "Continue leftward, then grow for the next row."
    },
    {
      "chapter": 2,
      "lines": [
        7
      ],
      "why": "Only the current row is stored; after the requested number of expansions it is the answer.",
      "next": "Return the buffer."
    }
  ],
  "edgeCases": [
    "Row index zero returns [1].",
    "The first expansion has no interior slot to update.",
    "Indices are zero-based; this visualizer accepts indices 0 through 33."
  ]
});
