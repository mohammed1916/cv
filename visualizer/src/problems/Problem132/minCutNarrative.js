export const minCutNarrative = {
  goal: "Find the minimum cuts needed to partition a string into palindrome substrings using 1D dynamic programming combined with center-expansion.",
  chapters: [
    "Initialize worst-case cuts",
    "Center-expand palindromes",
    "Relax cut counts via DP",
    "Minimum cut result",
  ],
  ready: {
    why: "Instead of finding all partitions (exponential), 1D DP where dp[i] is the minimum cuts for prefix s[0..i] can be updated in O(n²) time by expanding odd and even palindromes outward from each center index.",
    achieved: "DP table not initialized yet.",
    next: "Initialize dp[i] = i (worst-case: cut between every character).",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Initialize dp[i] = i as the upper bound (each single character is a palindrome).",
      achieved: `Initialized dp = [${step.dp?.join(", ")}].`,
      next: "Iterate through all center indices mid from 0 to n-1.",
    }),
    loop: ({ step }) => ({
      chapter: 1,
      why: "Pick center index and expand left (l) and right (r) pointers outward for odd or even palindromes.",
      achieved: `Center mid = ${step.mid} ('${step.s[step.mid]}'), mode: ${step.expansionType || "center scan"}. Pointers: l = ${step.l ?? "—"}, r = ${step.r ?? "—"}.`,
      next: "Check if characters at left and right pointers match.",
    }),
    check: ({ step }) => ({
      chapter: 1,
      why: "Verify if s[l] == s[r] to maintain palindrome symmetry.",
      achieved: `s[${step.l}] ('${step.comparing?.leftChar}') ${step.isMatch ? "==" : "≠"} s[${step.r}] ('${step.comparing?.rightChar}'): ${step.isMatch ? "Palindrome span confirmed!" : "Mismatch (expansion stops)."}.`,
      next: step.isMatch
        ? `Update DP: dp[${step.r}] = 0 if l == 0 else min(dp[${step.r}], dp[${step.l - 1}] + 1).`
        : "Stop expanding from this center and proceed to next mode/center.",
    }),
    dp: ({ step }) => ({
      chapter: 2,
      why: "Update DP transition: if palindrome starts at index 0, 0 cuts needed; otherwise 1 cut after optimal prefix s[0..l-1].",
      achieved: `dp[${step.r}] = ${step.dp?.[step.r]}${step.improved ? " (new minimum!)" : ""}.`,
      next: "Widen pointers (l -= 1, r += 1) to test larger palindrome substring.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "All centers and palindrome spans evaluated.",
      achieved: `Minimum cuts needed for "${step.s}" is ${step.minCuts}.`,
      next: "Try another string to see different palindrome centers.",
    }),
  },
  lines: {
    3: {
      chapter: 0,
      why: "dp = list(range(n)): set worst case cuts.",
      achieved: "dp array initialized.",
      next: "Start center expansion loop.",
    },
    7: ({ step }) => ({
      chapter: 1,
      why: "Odd palindrome expansion check: s[l] == s[r].",
      achieved: `Odd check at l=${step.l}, r=${step.r}: ${step.isMatch ? "Match" : "Mismatch"}.`,
      next: step.isMatch ? "Update dp[r]." : "Finish odd expansion.",
    }),
    8: ({ step }) => ({
      chapter: 2,
      why: "dp[r] = 0 if l == 0 else min(dp[r], dp[l - 1] + 1).",
      achieved: `dp[${step.r}] = ${step.dp?.[step.r]}.`,
      next: "Expand pointers.",
    }),
    12: ({ step }) => ({
      chapter: 1,
      why: "Even palindrome expansion check: s[l] == s[r].",
      achieved: `Even check at l=${step.l}, r=${step.r}: ${step.isMatch ? "Match" : "Mismatch"}.`,
      next: step.isMatch ? "Update dp[r]." : "Finish even expansion.",
    }),
    13: ({ step }) => ({
      chapter: 2,
      why: "dp[r] = 0 if l == 0 else min(dp[r], dp[l - 1] + 1).",
      achieved: `dp[${step.r}] = ${step.dp?.[step.r]}.`,
      next: "Expand pointers.",
    }),
    15: ({ step }) => ({
      chapter: 3,
      why: "return dp[-1].",
      achieved: `Final minimum cuts: ${step.minCuts}.`,
      next: "Completed.",
    }),
  },
};
