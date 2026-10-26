export const palindromeNarrative = {
  goal: "Determine if a phrase is a palindrome by ignoring non-alphanumeric characters, case differences, and verifying symmetry using two pointers from the ends inward.",
  chapters: [
    "Clean and lowercase characters",
    "Two-pointer mirror check",
    "Validation result",
  ],
  ready: {
    why: "Palindrome verification requires ignoring spaces, punctuation, and letter casing so only relevant alphanumeric characters are compared.",
    achieved: "String has not been processed yet.",
    next: "Filter the input string to keep only lowercase alphanumeric characters.",
  },
  phases: {
    init: ({ step }) => ({
      chapter: 0,
      why: "Strip non-alphanumeric characters and lowercase letters, then place left (l) and right (r) pointers at the outer boundaries.",
      achieved:
        step.activeLine === 2
          ? `Cleaned string: "${step.cleaned}" (${step.cleaned.length} characters).`
          : `Pointers initialized: l = ${step.l} ('${step.cleaned[step.l] ?? ""}'), r = ${step.r} ('${step.cleaned[step.r] ?? ""}').`,
      next: "Begin comparing mirror characters from outside inward.",
    }),
    compare: ({ step }) => ({
      chapter: 1,
      why: "Compare characters at symmetric positions s[l] and s[r].",
      achieved: `Comparing s[${step.l}] ('${step.comparing?.leftChar}') and s[${step.r}] ('${step.comparing?.rightChar}'): ${step.comparing?.match ? "Match!" : "Mismatch!"}`,
      next: step.comparing?.match
        ? "Characters match: advance left pointer and retreat right pointer toward the center."
        : "Characters differ: symmetry is violated, return False.",
    }),
    update: ({ step }) => ({
      chapter: 1,
      why: "Move both pointers one step inward toward the middle of the string.",
      achieved: `Advanced pointers inward: l = ${step.l}, r = ${step.r}.`,
      next: "Check next pair of mirror characters.",
    }),
    done: ({ step }) => ({
      chapter: 2,
      why: "All character pairs matched without any mismatch, or an early mismatch concluded the check.",
      achieved: step.result
        ? `Valid palindrome! The cleaned string reads identical forward and backward.`
        : `Not a palindrome: character mismatch found.`,
      next: "Try another phrase or inspect pointer movements.",
    }),
  },
  lines: {
    2: ({ step }) => ({
      chapter: 0,
      why: "Filter raw input to lowercase alphanumeric characters.",
      achieved: `Cleaned string: "${step.cleaned}".`,
      next: "Initialize left and right pointers.",
    }),
    3: ({ step }) => ({
      chapter: 0,
      why: "Set l = 0 and r = len(s) - 1.",
      achieved: `l = ${step.l}, r = ${step.r}.`,
      next: "Enter while loop (while l < r).",
    }),
    5: ({ step }) => ({
      chapter: 1,
      why: "Check if s[l] != s[r].",
      achieved: `s[${step.l}] == s[${step.r}]? ${step.comparing?.match ? "Equal" : "Not equal"}.`,
      next: step.comparing?.match ? "Advance pointers." : "Return False.",
    }),
    6: ({ step }) => ({
      chapter: 1,
      why: "Move pointers inward: l += 1, r -= 1.",
      achieved: `l = ${step.l}, r = ${step.r}.`,
      next: "Re-evaluate while l < r.",
    }),
    7: ({ step }) => ({
      chapter: 2,
      why: "Return True when pointers meet or cross with no mismatch.",
      achieved: `Result: ${step.result ? "True (Valid Palindrome)" : "False"}.`,
      next: "Try another string.",
    }),
  },
};
