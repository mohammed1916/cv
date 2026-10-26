export const partitionNarrative = {
  goal: "Partition a string such that every substring in the partition is a palindrome, discovering all possible valid partition combinations using depth-first backtracking.",
  chapters: [
    "Explore substring cuts",
    "Check palindrome symmetry",
    "Recurse on suffix",
    "Save complete partition",
  ],
  ready: {
    why: "Backtracking tests all prefix cuts starting at index `start`. If prefix s[start:end] is a palindrome, we recurse on the suffix s[end:] and backtrack to try longer prefixes.",
    achieved: "Partitioning not started yet.",
    next: "Start backtracking from index 0 with an empty path.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Initialize empty result list and initiate backtracking from index 0.",
      achieved: "Search initialized.",
      next: "Examine candidate substring cuts starting at index 0.",
    },
    inspect: ({ step }) => ({
      chapter: 0,
      why: "Select candidate prefix substring s[start:end] to evaluate for palindrome properties.",
      achieved: step.candidate
        ? `Slicing candidate substring s[${step.start}:${step.end}] = "${step.candidate}".`
        : `At index ${step.start}: ready to test cuts up to end of string.`,
      next: step.candidate
        ? "Check if this candidate substring is a palindrome."
        : "Slice candidate prefix.",
    }),
    validate: ({ step }) => ({
      chapter: 1,
      why: "Check if candidate substring reads identically forward and backward (sub == sub[::-1]).",
      achieved: `"${step.candidate}" is ${step.isPalindrome ? "a valid palindrome!" : "NOT a palindrome."}`,
      next: step.isPalindrome
        ? `Valid palindrome: append "${step.candidate}" to path and recurse on suffix starting at index ${step.end}.`
        : "Prune this branch and try the next cut length.",
    }),
    branch: ({ step }) => ({
      chapter: 2,
      why: "Append valid palindrome to path and recurse on the remaining suffix.",
      achieved: `Recursing on suffix starting at index ${step.end}. Current path: [${step.path?.map((p) => `"${p}"`).join(", ")}].`,
      next: "Explore palindrome partitions of the remaining substring.",
    }),
    backtrack: ({ step }) => ({
      chapter: 2,
      why: "Each recursive call receives a new path. Returning restores the caller's unchanged path so it can try a different cut; no shared path is popped.",
      achieved: step.message,
      next: "Try next cut index.",
    }),
    complete: ({ step }) => ({
      chapter: 3,
      why: "Base case reached (start == len(s)): all characters in the string have been partitioned into palindromes.",
      achieved: `Found valid partition: [${step.path?.map((p) => `"${p}"`).join(", ")}]. Added to results!`,
      next: "Backtrack to discover alternative partitions.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All cut branches explored.",
      achieved: `Search finished. Found ${step.partitions?.length} total palindrome partition(s).`,
      next: "Try another string or inspect partition tree.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Keep completed partitions separate from the partial path currently being explored.",
      achieved: "Result list initialized.",
      next: "Start backtracking.",
    },
    5: ({ step }) => ({
      chapter: 3,
      why: "Base case: if start == len(s), append copy of path to result.",
      achieved: `Complete partition saved: [${step.path?.map((p) => `"${p}"`).join(", ")}].`,
      next: "Return from branch.",
    }),
    8: ({ step }) => ({
      chapter: 0,
      why: "Choose where the next palindrome would end before deciding whether that cut is valid.",
      achieved: `Candidate substring: "${step.candidate}".`,
      next: "Check palindrome condition.",
    }),
    9: ({ step }) => ({
      chapter: 1,
      why: "Only a symmetric substring can belong to a palindrome partition; reject this cut if its reverse differs.",
      achieved: `Palindrome check: ${step.isPalindrome ? "True" : "False"}.`,
      next: step.isPalindrome ? "Recurse on suffix." : "Advance end pointer.",
    }),
    10: ({ step }) => ({
      chapter: 2,
      why: step.phase === 'backtrack'
        ? "The suffix search has returned. The caller retains its own path and can try another cut."
        : "A valid palindrome fixes one piece; a separate child path explores every partition of the remaining suffix.",
      achieved: step.message,
      next: step.phase === 'backtrack' ? "Try a longer candidate at this depth, or return if none remain." : "Explore the remaining suffix.",
    }),
    12: ({ step }) => ({
      chapter: 3,
      why: "Every possible prefix cut has been explored; the saved complete paths are all valid partitions.",
      achieved: `All ${step.partitions?.length} palindrome partitions returned.`,
      next: "Try another string or inspect how alternative cuts formed each partition.",
    }),
  },
  edgeCases: [
    'One character has exactly one partition.',
    'A full-string palindrome is one solution, but smaller palindrome cuts can also be valid.',
    'When no multi-character palindrome exists, the all-single-character partition remains valid.',
    'The input accepts 1 to 16 characters; empty strings are rejected.',
  ],
};
