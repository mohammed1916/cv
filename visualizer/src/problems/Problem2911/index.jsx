
import React from "react";

import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MinimumChangesVisualizer from "./MinimumChangesVisualizer";

import {
  code,
  python,
  parseInput,
  buildTrace
} from "./algorithm";

const definition = {
  number: "2911",

  phases: [
    {
      id: "setup",
      label: "Setup",
      description: "Initialize the substring cost matrix and recurrence buffers."
    },
    {
      id: "divisor",
      label: "Divisors",
      description: "Choose a divisor and establish its independent sequences."
    },
    {
      id: "blocks",
      label: "Blocks",
      description: "Process substrings with increasing numbers of blocks."
    },
    {
      id: "recurrence",
      label: "Recurrence",
      description: "Read the inner result from two_back."
    },
    {
      id: "offset",
      label: "Compare",
      description: "Compare corresponding characters in the outer blocks."
    },
    {
      id: "store",
      label: "Store",
      description: "Write the computed cost into current and the cost matrix."
    },
    {
      id: "rotate",
      label: "Rotate",
      description: "Rotate two_back, one_back and current references."
    },
    {
      id: "dpSetup",
      label: "DP Setup",
      description: "Initialize the partition dynamic programming table."
    },
    {
      id: "dpPieces",
      label: "Parts",
      description: "Calculate legal minimum start and end boundaries."
    },
    {
      id: "dpCandidate",
      label: "Candidates",
      description: "Evaluate possible final partitions."
    },
    {
      id: "dpStore",
      label: "DP Update",
      description: "Store the cheapest candidate."
    },
    {
      id: "result",
      label: "Result",
      description: "Reconstruct the optimal partition."
    }
  ],

  parse: parseInput,
  build: buildTrace,

  code,
  python,

  inputLabel:
    'JSON object with keys s and k (e.g. {"s":"abcac","k":2})',

  url:
    "https://leetcode.com/problems/minimum-changes-to-make-k-semi-palindromes/",

  complexity:
    "O(n^3 + k*n^2) time and O(n^2) auxiliary space. Detailed visualization is capped at 12 characters.",

  question: "Find the fewest character changes needed to split a string into k pieces where each piece is a semi-palindrome.",
  approaches: [
    { name: "Precompute semi-palindrome costs then dynamic programming", intuition: "Compute the cost to make each substring a semi-palindrome, then combine these costs over the k pieces with dynamic programming.", time: "O(n^3)", space: "O(n^2)" },
    { name: "Brute force over splits", intuition: "Try every way to split the string into k pieces.", time: "exponential", space: "O(n)" },
  ],
  examples: [
    {
      label: "Two parts",
      input: '{"s":"abcac","k":2}'
    },
    {
      label: "One semi-palindrome",
      input: '{"s":"abcc","k":1}'
    },
    {
      label: "Repeated characters",
      input: '{"s":"rrrr","k":1}'
    },
    {
      label: "Two characters",
      input: '{"s":"ab","k":1}'
    },
    {
      label: "All characters equal",
      input: '{"s":"aaaa","k":2}'
    },
    {
      label: "Multiple divisors",
      input: '{"s":"abcabcabcabc","k":4}'
    },
    {
      label: "Longer example",
      input: '{"s":"jiakmfcojvpf","k":4}'
    }
  ]
};

export default function Problem2911() {
  return (
    <AlgorithmWorkspace
      definition={definition}

      renderVisual={({ run, step }) => (
        <MinimumChangesVisualizer
          run={run}
          step={step}
        />
      )}

      renderReasoning={({ step }) => (
        // The visual already shows this step's message, so explain the phase here instead of repeating it.
        <div className="mc-reasoning">
          <strong>Why this step</strong>
          <p>{definition.phases.find(phase => phase.id === step.phase)?.description ?? ''}</p>
        </div>
      )}
    />
  );
}

export const meta = {
  number: "2911",
  title: "Minimum Changes to Make K Semi-palindromes",
  slug: "minimum-changes-to-make-k-semi-palindromes",
  difficulty: "Hard",

  tags: [
    "String",
    "Dynamic Programming",
    "Partitioning",
    "Recurrence"
  ],

  description:
    "Visualize divisor-based semi-palindrome costs, three rotating recurrence buffers, offset comparisons and partition DP.",

  accent: "#a78bfa"
};
