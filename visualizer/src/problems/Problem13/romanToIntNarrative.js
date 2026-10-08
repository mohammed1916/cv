export const romanToIntNarrative = {
  goal: "Convert a Roman numeral string into its integer value by scanning symbols left-to-right and applying subtractive or additive rules.",
  chapters: [
    "Inspect symbol & lookahead",
    "Apply additive/subtractive rule",
    "Result value",
  ],
  ready: {
    why: "Roman numerals usually decrease left-to-right (additive), but if a smaller symbol precedes a larger symbol (e.g. IV, IX, XL, XC, CD, CM), it is subtracted.",
    achieved: "Accumulator is not started yet.",
    next: "Start scanning the Roman numeral string from index 0.",
  },
  phases: {
    init: {
      chapter: 0,
      why: "Set up symbol value map and initialize accumulator res = 0.",
      achieved: "Result initialized to 0.",
      next: "Look up the value of the first symbol.",
    },
    loop: ({ step }) => ({
      chapter: 0,
      why: "Inspect the current Roman symbol and peek at the next symbol to decide whether to add or subtract.",
      achieved: step.currChar
        ? `Symbol '${step.currChar}' at index ${step.index} has value ${step.currVal}. Lookahead next_val is ${step.nextVal}.`
        : `End of string reached. Final accumulated value is ${step.res}.`,
      next: step.currChar
        ? step.currVal < step.nextVal
          ? "Smaller symbol before larger: subtract current value."
          : "Normal case: add current value."
        : "Return total integer result.",
    }),
    check: ({ step }) => ({
      chapter: 0,
      why: "Compare current symbol value with the next symbol value.",
      achieved: `Comparing curr_val (${step.currVal}) with next_val (${step.nextVal}): ${step.currVal < step.nextVal ? "curr_val < next_val (subtractive case)" : "curr_val >= next_val (additive case)"}.`,
      next:
        step.currVal < step.nextVal
          ? `Subtract ${step.currVal} from result.`
          : `Add ${step.currVal} to result.`,
    }),
    subtract: ({ step }) => ({
      chapter: 1,
      why: "When a smaller numeral appears before a larger one, subtract its value.",
      achieved: `Subtracted ${step.currVal} for '${step.currChar}'. New accumulator total is ${step.res}.`,
      next: "Advance to the next character in the string.",
    }),
    add: ({ step }) => ({
      chapter: 1,
      why: "When a numeral is followed by an equal or smaller numeral (or end of string), add its value.",
      achieved: `Added ${step.currVal} for '${step.currChar}'. New accumulator total is ${step.res}.`,
      next: "Advance to the next character in the string.",
    }),
    done: ({ step }) => ({
      chapter: 2,
      why: "All Roman numeral characters have been processed.",
      achieved: `Finished decoding numeral. Total integer value is ${step.res}.`,
      next: "Select another Roman numeral or step back to inspect decisions.",
    }),
  },
  lines: {
    6: {
      chapter: 0,
      why: "Initialize result sum to 0 before processing symbols.",
      achieved: "Accumulator res is 0.",
      next: "Begin iterating over characters in string s.",
    },
    8: ({ step }) => ({
      chapter: 0,
      why: "Look up the numeric value of the current symbol s[i].",
      achieved: `s[${step.index}] = '${step.currChar}' corresponds to value ${step.currVal}.`,
      next: "Check the value of the next symbol s[i+1].",
    }),
    9: ({ step }) => ({
      chapter: 0,
      why: "Get the lookahead value of s[i+1] (or 0 if at the end of the string).",
      achieved: `Next symbol value is ${step.nextVal}.`,
      next: `Compare ${step.currVal} < ${step.nextVal}.`,
    }),
    10: ({ step }) => ({
      chapter: 0,
      why: "Determine if this character is part of a subtractive pair.",
      achieved: `${step.currVal} < ${step.nextVal} is ${step.currVal < step.nextVal ? "True" : "False"}.`,
      next:
        step.currVal < step.nextVal
          ? `Subtract ${step.currVal}.`
          : `Add ${step.currVal}.`,
    }),
    11: ({ step }) => ({
      chapter: 1,
      why: "Subtractive pair detected: subtract curr_val from res.",
      achieved: `res -= ${step.currVal} → res = ${step.res}.`,
      next: "Continue loop with next symbol.",
    }),
    13: ({ step }) => ({
      chapter: 1,
      why: "Additive case: add curr_val to res.",
      achieved: `res += ${step.currVal} → res = ${step.res}.`,
      next: "Continue loop with next symbol.",
    }),
    14: ({ step }) => ({
      chapter: 2,
      why: "Return the computed integer value.",
      achieved: `Final integer result: ${step.res}.`,
      next: "Try another Roman numeral.",
    }),
  },
};
