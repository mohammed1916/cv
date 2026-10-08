export const wordBreak2Narrative = {
  goal: "Construct all possible valid sentences from string s such that each space-separated word exists in wordDict, using memoized DFS.",
  chapters: [
    "Initialize cache & word dictionary",
    "DFS prefix matching",
    "Recurse & memoize suffix completions",
    "Assemble complete sentences",
  ],
  ready: {
    why: "Memoized DFS explores all dictionary prefix cuts s[start:end], recurses on suffix s[end:], and caches the resulting sentences for each start index to eliminate redundant sub-tree searches.",
    achieved: "DFS has not started yet.",
    next: "Initialize memo cache and call dfs(0).",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Set up word hash set and initialize empty memo table.",
      achieved: "Initialized memoization dictionary.",
      next: "Begin recursive DFS exploration from index 0.",
    },
    check: ({ step }) => ({
      chapter: 1,
      why: "Check whether candidate substring s[start:end] exists in the dictionary.",
      achieved: `s[${step.start}:${step.end}] ("${step.currentWord}") is ${step.inDict ? "in dictionary ✓" : "not in dictionary ✗"}.`,
      next: step.inDict
        ? `Recurse on suffix starting at index ${step.end}.`
        : "Try longer prefix length.",
    }),
    recursive_search: ({ step }) => ({
      chapter: 1,
      why: "Branch into recursive call dfs(end) to find all valid sentence completions for the remainder of the string.",
      achieved: `Branching into dfs(${step.end}) with prefix "${step.currentWord}".`,
      next: "Explore suffix completions.",
    }),
    cache_hit: ({ step }) => ({
      chapter: 2,
      why: "Suffix at this start index was already computed; retrieve completions directly from memo cache in O(1) time.",
      achieved: `Cache hit for start=${step.start}! Reused ${step.memo?.[step.start]?.length || 0} cached sentence completion(s).`,
      next: "Return cached completions to parent caller.",
    }),
    solution: ({ step }) => ({
      chapter: 3,
      why:
        step.start === step.s.length
          ? "Base case reached: all characters consumed; return [[]] to let caller prepend words."
          : "Format and assemble the list of space-separated sentences.",
      achieved:
        step.start === step.s.length
          ? `Reached end of string s (index ${step.start}). Valid sentence path formed!`
          : `Formatted ${step.sentences?.length} valid sentence(s).`,
      next:
        step.start === step.s.length
          ? "Return base empty list [[]]."
          : "Return all sentences.",
    }),
    merge: ({ step }) => ({
      chapter: 2,
      why: "Prepend the current prefix word to each completion returned by the suffix search.",
      achieved: `Merged word "${step.currentWord}" with suffix completions.`,
      next: "Continue checking remaining candidate words or return accumulated results.",
    }),
    memo: ({ step }) => ({
      chapter: 2,
      why: "Store all sentence completions for suffix s[start:] in memo[start].",
      achieved: `Memoized index ${step.start}: saved ${step.currentRes?.length || 0} valid completion(s).`,
      next: "Return completions to parent caller.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All valid sentences assembled and returned.",
      achieved: `Found ${step.sentences?.length} valid sentence(s): [${step.sentences?.map((st) => `"${st}"`).join(", ")}].`,
      next: "Try another string or word dictionary.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "words = set(wordDict): store dictionary in hash set.",
      achieved: "Word set initialized.",
      next: "Initialize memo = {}.",
    },
    5: ({ step }) => ({
      chapter: 2,
      why: "if start in memo: return memo[start].",
      achieved: `Cache lookup at start=${step.start}.`,
      next: "Return cached list.",
    }),
    6: ({ step }) => ({
      chapter: 3,
      why: "if start == len(s): return [[]].",
      achieved: "Base case reached.",
      next: "Return [[]].",
    }),
    10: ({ step }) => ({
      chapter: 1,
      why: "if word in words: match found.",
      achieved: `Matched word "${step.currentWord}".`,
      next: "Recurse on dfs(end).",
    }),
    13: ({ step }) => ({
      chapter: 2,
      why: "memo[start] = res: cache results for start.",
      achieved: `Cached completions for index ${step.start}.`,
      next: "Return res.",
    }),
    16: ({ step }) => ({
      chapter: 3,
      why: "return sentences.",
      achieved: `All ${step.sentences?.length} sentences formatted.`,
      next: "Completed.",
    }),
  },
};
