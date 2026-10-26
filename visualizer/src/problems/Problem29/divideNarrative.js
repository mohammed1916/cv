export const divideNarrative = {
  goal: "Divide two integers without using multiplication, division, or modulo operators by repeatedly doubling the divisor to subtract exponential chunks.",
  chapters: [
    "Handle signs and overflow",
    "Find doubling chunk",
    "Accumulate quotient",
    "Return clamped result",
  ],
  ready: {
    why: "Division by repeated subtraction of 1 is too slow (O(n)). Doubling the divisor (bit shifts) allows subtracting powers-of-two multiples in O(log² n) time.",
    achieved: "Division has not started yet.",
    next: "Check for 32-bit integer overflow edge cases and initialize working magnitudes.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Extract the sign of the result and convert dividend and divisor into positive magnitudes.",
      achieved:
        step.activeLine === 8
          ? `New doubling cycle: base divisor chunk = ${step.chunk} (count = ${step.count}).`
          : `Sign determined (${step.negative ? "negative" : "positive"}). Remaining magnitude to divide is ${step.remaining}.`,
      next: "Check if remaining magnitude is at least the base divisor.",
    }),
    check: ({ step }) => ({
      chapter: 1,
      why: "Verify whether the current chunk (or doubled chunk) fits within the remaining magnitude.",
      achieved:
        step.activeLine === 9
          ? `Testing if doubled chunk (${step.chunk * 2}) fits in remaining magnitude (${step.remaining}).`
          : `Testing if remaining (${step.remaining}) >= base divisor (${step.chunk || step.remaining}).`,
      next:
        step.activeLine === 9
          ? step.chunk * 2 <= step.remaining
            ? "Chunk fits: double it via left bit shift."
            : "Doubled chunk too large: stop doubling and subtract current chunk."
          : step.remaining >= (step.chunk || 1)
            ? "Find largest fitting doubled chunk."
            : "No more full divisors fit: finalize quotient.",
    }),
    build: ({ step }) => ({
      chapter: 1,
      why: "Double the chunk and its corresponding quotient count using left bit shifts (<< 1).",
      achieved: `Doubled chunk to ${step.chunk} (representing ${step.count} copies of the divisor).`,
      next: "Check if another doubling can still fit in the remaining magnitude.",
    }),
    subtract: ({ step }) => ({
      chapter: 2,
      why: "Subtract the largest fitting chunk from the remaining dividend magnitude.",
      achieved: `Subtracted chunk ${step.chunk}. Remaining magnitude is now ${step.remaining}.`,
      next: `Add ${step.count} to the accumulated quotient.`,
    }),
    add: ({ step }) => ({
      chapter: 2,
      why: "Add the number of divisors in this chunk to the quotient.",
      achieved: `Added ${step.count} to quotient. Current quotient magnitude is ${step.quotient}.`,
      next: "Check if another subtraction pass is needed.",
    }),
    done: ({ step }) => ({
      chapter: 3,
      why: "No further full divisors fit in the remaining magnitude; apply the correct sign and clamp within 32-bit limits.",
      achieved: `Division complete: quotient = ${step.result}. Remaining remainder: ${step.remaining}.`,
      next: "Try another dividend/divisor pair or step backward to inspect bit shifts.",
    }),
  },
  lines: {
    2: {
      chapter: 0,
      why: "Check for the single 32-bit signed integer overflow case: -2^31 / -1 = 2^31 (which exceeds INT_MAX 2^31 - 1).",
      achieved: "Inspecting input bounds for overflow.",
      next: "Clamp to 2147483647 if overflow, otherwise proceed.",
    },
    3: ({ step }) => ({
      chapter: 3,
      why: "Return INT_MAX to prevent 32-bit signed overflow.",
      achieved: `Overflow case triggered: result clamped to ${step.result}.`,
      next: "Division finished.",
    }),
    4: ({ step }) => ({
      chapter: 0,
      why: "Result is negative if and only if the signs of dividend and divisor differ.",
      achieved: `Signs differ? ${step.negative ? "Yes (negative result)" : "No (positive result)"}.`,
      next: "Take absolute values of dividend and divisor.",
    }),
    6: ({ step }) => ({
      chapter: 0,
      why: "Initialize working magnitude remaining = |dividend|, base = |divisor|, and quotient = 0.",
      achieved: `Working with magnitude ${step.remaining}, divisor ${step.chunk || step.remaining}, quotient = 0.`,
      next: "Enter outer division loop while remaining >= base.",
    }),
    7: ({ step }) => ({
      chapter: 1,
      why: "Outer loop condition: continue while remaining dividend is greater than or equal to the divisor.",
      achieved: `Remaining magnitude is ${step.remaining}.`,
      next:
        step.remaining >= (step.chunk || 1)
          ? "Start a new doubling round."
          : "Exit loop and return signed quotient.",
    }),
    8: ({ step }) => ({
      chapter: 1,
      why: "Initialize chunk = base and count = 1 for the current doubling pass.",
      achieved: `Initialized chunk = ${step.chunk}, count = ${step.count}.`,
      next: "Test if (chunk << 1) fits in remaining.",
    }),
    9: ({ step }) => ({
      chapter: 1,
      why: "Check if doubling the chunk ((chunk << 1) <= remaining) fits without exceeding remaining magnitude.",
      achieved: `Testing chunk * 2 = ${step.chunk * 2} <= ${step.remaining}: ${step.chunk * 2 <= step.remaining ? "True" : "False"}.`,
      next:
        step.chunk * 2 <= step.remaining
          ? "Double chunk via bit shift."
          : "Subtract this maximum fitting chunk.",
    }),
    10: ({ step }) => ({
      chapter: 1,
      why: "Double the chunk size: chunk <<= 1.",
      achieved: `chunk doubled to ${step.chunk}.`,
      next: "Double the divisor count (count <<= 1).",
    }),
    11: ({ step }) => ({
      chapter: 1,
      why: "Double the count of divisors: count <<= 1.",
      achieved: `count doubled to ${step.count}.`,
      next: "Check if another doubling is possible.",
    }),
    12: ({ step }) => ({
      chapter: 2,
      why: "Subtract the largest doubled chunk from remaining magnitude.",
      achieved: `Subtracted ${step.chunk}; remaining magnitude is now ${step.remaining}.`,
      next: `Add count (${step.count}) to quotient.`,
    }),
    13: ({ step }) => ({
      chapter: 2,
      why: "Add count to quotient.",
      achieved: `quotient += ${step.count} → quotient = ${step.quotient}.`,
      next: "Check outer while loop condition for further chunks.",
    }),
    14: ({ step }) => ({
      chapter: 3,
      why: "Apply sign to quotient and return the truncated integer answer.",
      achieved: `Final signed result is ${step.result}.`,
      next: "Try another example.",
    }),
  },
};
