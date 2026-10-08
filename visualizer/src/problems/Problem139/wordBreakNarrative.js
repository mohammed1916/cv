export const wordBreakNarrative = {
  goal: "Determine whether string s can be segmented into space-separated dictionary words using 1D dynamic programming.",
  chapters: [
    "Base case (dp[0] = True)",
    "Evaluate prefix length i",
    "Find dictionary word split",
    "Final segmentation decision",
  ],
  ready: {
    why: "dp[i] is True if prefix s[0:i] can be formed by dictionary words. To compute dp[i], we test if there exists a split point j < i where dp[j] is True and the suffix s[j:i] is in wordDict.",
    achieved: "DP table not initialized yet.",
    next: "Set dp[0] = True (empty prefix is always segmentable).",
  },
  phases: {
    init: {
      chapter: 0,
      why: "dp[0] = True serves as the base case: an empty prefix needs 0 words.",
      achieved: "dp[0] initialized to True; dictionary stored in a hash set.",
      next: "Iterate prefix length i from 1 to len(s).",
    },
    loop: ({ step }) => ({
      chapter: 1,
      why:
        step.j == null
          ? `Evaluate whether prefix s[0:${step.i}] ("${step.s.slice(0, step.i)}") can be segmented.`
          : `Test split boundary at j = ${step.j}: checking prefix s[0:${step.j}] + suffix s[${step.j}:${step.i}] ("${step.slice}").`,
      achieved:
        step.j == null
          ? `Inspecting prefix of length ${step.i}.`
          : `Testing split at j = ${step.j}. dp[${step.j}] is ${step.dpJ ? "True" : "False"}.`,
      next: `Check if dp[${step.j}] == True and "${step.slice}" is in wordDict.`,
    }),
    check: ({ step }) => ({
      chapter: 2,
      why: "Condition: dp[j] must be True (valid prefix) and s[j:i] must be in dictionary (valid word).",
      achieved: `dp[${step.j}] is ${step.dpJ ? "True" : "False"} and "${step.slice}" in dictionary is ${step.inDict ? "True" : "False"}. Condition met? ${step.isMatch ? "Yes!" : "No."}`,
      next: step.isMatch
        ? `Valid word split found! Set dp[${step.i}] = True and break inner loop.`
        : "Try next split point j.",
    }),
    dp: ({ step }) => ({
      chapter: 2,
      why: "Set dp[i] = True and break inner loop: this prefix is confirmed segmentable.",
      achieved: `dp[${step.i}] = True: prefix s[0:${step.i}] ("${step.s.slice(0, step.i)}") is segmentable!`,
      next: "Advance to the next prefix length i+1.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "dp[len(s)] gives the boolean decision for the full string.",
      achieved: step.result
        ? `True: string "${step.s}" CAN be segmented using dictionary words.`
        : `False: string "${step.s}" CANNOT be segmented using dictionary words.`,
      next: "Try another string or word dictionary.",
    }),
  },
  lines: {
    4: {
      chapter: 0,
      why: "dp = [False] * (len(s) + 1); dp[0] = True.",
      achieved: "DP array initialized.",
      next: "Start outer loop for prefix length i.",
    },
    5: ({ step }) => ({
      chapter: 1,
      why: "for i in range(1, len(s) + 1):",
      achieved: `Evaluating prefix of length ${step.i}.`,
      next: "Test inner split points j.",
    }),
    6: ({ step }) => ({
      chapter: 1,
      why: "for j in range(i):",
      achieved: `Split point j = ${step.j}.`,
      next: "Check condition: dp[j] and s[j:i] in words.",
    }),
    7: ({ step }) => ({
      chapter: 2,
      why: "if dp[j] and s[j:i] in words:",
      achieved: `Condition is ${step.isMatch ? "True" : "False"}.`,
      next: step.isMatch ? "Set dp[i] = True." : "Continue inner loop.",
    }),
    8: ({ step }) => ({
      chapter: 2,
      why: "dp[i] = True.",
      achieved: `dp[${step.i}] = True.`,
      next: "Break inner loop.",
    }),
    9: {
      chapter: 2,
      why: "break: prefix is already confirmed segmentable.",
      achieved: "Broke inner loop.",
      next: "Move to next prefix length.",
    },
    10: ({ step }) => ({
      chapter: 3,
      why: "return dp[len(s)].",
      achieved: `Final result: ${step.result ? "True" : "False"}.`,
      next: "Completed.",
    }),
  },
};
