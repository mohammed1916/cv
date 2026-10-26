export const CODE = [
  "def minCut(s):",
  "    n = len(s)",
  "    dp = list(range(n))  # max cuts",
  "    for mid in range(n):",
  "        # odd length palindromes",
  "        l, r = mid, mid",
  "        while l >= 0 and r < n and s[l] == s[r]:",
  "            dp[r] = 0 if l == 0 else min(dp[r], dp[l - 1] + 1)",
  "            l -= 1; r += 1",
  "        # even length palindromes",
  "        l, r = mid, mid + 1",
  "        while l >= 0 and r < n and s[l] == s[r]:",
  "            dp[r] = 0 if l == 0 else min(dp[r], dp[l - 1] + 1)",
  "            l -= 1; r += 1",
  "    return dp[-1] if n else 0",
];

export function parseMinCutInput(input) {
  let val = input;
  if (val !== null && typeof val === "object") {
    if (typeof val.s === "string") val = val.s;
    else if (typeof val.input === "string") val = val.input;
  }
  if (typeof val !== "string") {
    throw new Error("Input must be a string");
  }
  let str = val.trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  if (str.length < 1) {
    throw new Error("String cannot be empty (length must be between 1 and 30)");
  }
  if (str.length > 30) {
    throw new Error(`String length (${str.length}) exceeds maximum limit of 30 characters`);
  }
  if (!/^[a-zA-Z]+$/.test(str)) {
    throw new Error("String must contain English letters only");
  }
  return str.toLowerCase();
}

function makeFrame({
  activeLine,
  phase,
  explanation,
  message,
  mid = null,
  expansionType = null,
  l = null,
  r = null,
  comparing = null,
  palindromeSpan = null,
  isMatch = null,
  updatedIndex = null,
  prevValue = null,
  improved = false,
  dp,
  bestPartitions,
  s,
  minCuts = null,
  relatedLines = [activeLine],
}) {
  return {
    activeLine,
    phase,
    explanation,
    message,
    s,
    n: s.length,
    mid,
    expansionType,
    l,
    r,
    comparing: comparing ? { ...comparing } : null,
    palindromeSpan: palindromeSpan ? [...palindromeSpan] : null,
    isMatch,
    updatedIndex,
    prevValue,
    improved,
    dp: [...dp],
    partitions: bestPartitions.map((p) => [...p]),
    currentPartition:
      r !== null && r >= 0 && r < s.length ? [...bestPartitions[r]] : null,
    minCuts,
    relatedLines: [...relatedLines],
  };
}

export function buildMinCutStory(input) {
  const s = parseMinCutInput(input);
  const n = s.length;

  const dp = Array.from({ length: n }, (_, i) => i);
  const bestPartitions = Array.from({ length: n }, (_, i) =>
    s.slice(0, i + 1).split("")
  );
  const frames = [];

  // Frame 1: Init dp array
  frames.push(
    makeFrame({
      activeLine: 3,
      phase: "init",
      dp,
      bestPartitions,
      s,
      message: `Initialized dp = [${dp.join(", ")}]. Worst case cuts: each single character is a separate partition.`,
      explanation: `Prefix s[0..i] has at most i cuts when each individual letter is a palindrome of length 1. dp is initialized to [${dp.join(", ")}].`,
    })
  );

  for (let mid = 0; mid < n; mid++) {
    // Frame: Mid selection
    frames.push(
      makeFrame({
        activeLine: 4,
        phase: "loop",
        mid,
        dp,
        bestPartitions,
        s,
        message: `Center mid = ${mid} ('${s[mid]}'): expanding outward for palindromes.`,
        explanation: `Exploring all palindromes centered at or adjacent to index ${mid} ('${s[mid]}').`,
      })
    );

    // ── Odd-length palindromes ──────────────────────────────────────────
    let l = mid;
    let r = mid;

    frames.push(
      makeFrame({
        activeLine: 6,
        phase: "loop",
        mid,
        expansionType: "odd",
        l,
        r,
        dp,
        bestPartitions,
        s,
        message: `Odd-length expansion: center s[${mid}] = '${s[mid]}' (l = ${l}, r = ${r}).`,
        explanation: `Odd-length palindromes expand symmetrically from a single center character at index ${mid}.`,
      })
    );

    while (l >= 0 && r < n) {
      const match = s[l] === s[r];

      // Comparison check frame
      frames.push(
        makeFrame({
          activeLine: 7,
          phase: "check",
          mid,
          expansionType: "odd",
          l,
          r,
          isMatch: match,
          comparing: {
            l,
            r,
            leftChar: s[l],
            rightChar: s[r],
            match,
          },
          palindromeSpan: match ? [l, r] : null,
          dp,
          bestPartitions,
          s,
          message: match
            ? `s[${l}] ('${s[l]}') == s[${r}] ('${s[r]}'): "${s.slice(l, r + 1)}" is a palindrome!`
            : `s[${l}] ('${s[l]}') ≠ s[${r}] ('${s[r]}'): Mismatch! Odd expansion from mid = ${mid} stops.`,
          explanation: match
            ? `Characters at left pointer l = ${l} ('${s[l]}') and right pointer r = ${r} ('${s[r]}') match. Substring s[${l}..${r}] ("${s.slice(l, r + 1)}") is a palindrome.`
            : `Mismatch between s[${l}] ('${s[l]}') and s[${r}] ('${s[r]}'). Substring s[${l}..${r}] is not symmetric, so odd expansion terminates.`,
        })
      );

      if (!match) {
        break;
      }

      // Match found -> DP update frame
      const prevVal = dp[r];
      const newVal = l === 0 ? 0 : Math.min(dp[r], dp[l - 1] + 1);
      const improved = newVal < prevVal;
      dp[r] = newVal;

      if (l === 0) {
        bestPartitions[r] = [s.slice(0, r + 1)];
      } else if (
        improved ||
        bestPartitions[r].length > bestPartitions[l - 1].length + 1
      ) {
        bestPartitions[r] = [...bestPartitions[l - 1], s.slice(l, r + 1)];
      }

      frames.push(
        makeFrame({
          activeLine: 8,
          phase: "dp",
          mid,
          expansionType: "odd",
          l,
          r,
          isMatch: true,
          palindromeSpan: [l, r],
          updatedIndex: r,
          prevValue: prevVal,
          improved,
          dp,
          bestPartitions,
          s,
          message:
            l === 0
              ? `Prefix s[0..${r}] "${s.slice(0, r + 1)}" is a complete palindrome → dp[${r}] = 0.`
              : `Palindrome suffix s[${l}..${r}] "${s.slice(l, r + 1)}": dp[${r}] = min(dp[${r}], dp[${l - 1}] + 1) = min(${prevVal}, ${dp[l - 1]} + 1) = ${newVal}${improved ? ` (improved from ${prevVal}!)` : " (no change)"}.`,
          explanation:
            l === 0
              ? `Since l == 0, the entire prefix s[0..${r}] is a palindrome. It requires 0 cuts: dp[${r}] = 0.`
              : `Optimal partition of prefix s[0..${l - 1}] requires ${dp[l - 1]} cuts. Adding 1 cut before palindrome suffix s[${l}..${r}] gives ${dp[l - 1] + 1} cuts. dp[${r}] becomes min(${prevVal}, ${dp[l - 1] + 1}) = ${newVal}.`,
        })
      );

      // Expansion step
      l -= 1;
      r += 1;

      frames.push(
        makeFrame({
          activeLine: 9,
          phase: "loop",
          mid,
          expansionType: "odd",
          l,
          r,
          palindromeSpan: [l + 1, r - 1],
          dp,
          bestPartitions,
          s,
          message:
            l >= 0 && r < n
              ? `Widen odd wings: l = ${l}, r = ${r}.`
              : `Reached boundary (l = ${l}, r = ${r}). Odd expansion finishes.`,
          explanation:
            l >= 0 && r < n
              ? `Expanding pointers outward: decrement l to ${l} and increment r to ${r} to check the next outer pair.`
              : `One or both pointers moved outside string bounds (0 <= ${l} and ${r} < ${n}). Odd expansion ends for mid = ${mid}.`,
        })
      );
    }

    // ── Even-length palindromes ─────────────────────────────────────────
    l = mid;
    r = mid + 1;

    frames.push(
      makeFrame({
        activeLine: 11,
        phase: "loop",
        mid,
        expansionType: "even",
        l,
        r,
        dp,
        bestPartitions,
        s,
        message:
          r < n
            ? `Even-length expansion: center between s[${mid}] ('${s[mid]}') and s[${mid + 1}] ('${s[mid + 1]}') (l = ${l}, r = ${r}).`
            : `Even-length expansion: right index r = ${r} is beyond string end. No even palindromes.`,
        explanation:
          r < n
            ? `Even-length palindromes mirror across the seam between s[${mid}] and s[${mid + 1}]. Initializing l = ${mid}, r = ${mid + 1}.`
            : `Right pointer r = ${r} exceeds string length ${n}. Even expansion skipped for mid = ${mid}.`,
      })
    );

    while (l >= 0 && r < n) {
      const match = s[l] === s[r];

      frames.push(
        makeFrame({
          activeLine: 12,
          phase: "check",
          mid,
          expansionType: "even",
          l,
          r,
          isMatch: match,
          comparing: {
            l,
            r,
            leftChar: s[l],
            rightChar: s[r],
            match,
          },
          palindromeSpan: match ? [l, r] : null,
          dp,
          bestPartitions,
          s,
          message: match
            ? `s[${l}] ('${s[l]}') == s[${r}] ('${s[r]}'): "${s.slice(l, r + 1)}" is an even palindrome!`
            : `s[${l}] ('${s[l]}') ≠ s[${r}] ('${s[r]}'): Mismatch! Even expansion from mid = ${mid} stops.`,
          explanation: match
            ? `Characters at left pointer l = ${l} ('${s[l]}') and right pointer r = ${r} ('${s[r]}') match. Substring s[${l}..${r}] ("${s.slice(l, r + 1)}") is an even palindrome.`
            : `Mismatch between s[${l}] ('${s[l]}') and s[${r}] ('${s[r]}'). Substring s[${l}..${r}] is not symmetric, so even expansion terminates.`,
        })
      );

      if (!match) {
        break;
      }

      const prevVal = dp[r];
      const newVal = l === 0 ? 0 : Math.min(dp[r], dp[l - 1] + 1);
      const improved = newVal < prevVal;
      dp[r] = newVal;

      if (l === 0) {
        bestPartitions[r] = [s.slice(0, r + 1)];
      } else if (
        improved ||
        bestPartitions[r].length > bestPartitions[l - 1].length + 1
      ) {
        bestPartitions[r] = [...bestPartitions[l - 1], s.slice(l, r + 1)];
      }

      frames.push(
        makeFrame({
          activeLine: 13,
          phase: "dp",
          mid,
          expansionType: "even",
          l,
          r,
          isMatch: true,
          palindromeSpan: [l, r],
          updatedIndex: r,
          prevValue: prevVal,
          improved,
          dp,
          bestPartitions,
          s,
          message:
            l === 0
              ? `Prefix s[0..${r}] "${s.slice(0, r + 1)}" is an even palindrome → dp[${r}] = 0.`
              : `Palindrome suffix s[${l}..${r}] "${s.slice(l, r + 1)}": dp[${r}] = min(dp[${r}], dp[${l - 1}] + 1) = min(${prevVal}, ${dp[l - 1]} + 1) = ${newVal}${improved ? ` (improved from ${prevVal}!)` : " (no change)"}.`,
          explanation:
            l === 0
              ? `Entire prefix s[0..${r}] is an even palindrome. It requires 0 cuts: dp[${r}] = 0.`
              : `Prefix s[0..${l - 1}] requires ${dp[l - 1]} cuts. With 1 cut before palindrome suffix s[${l}..${r}], total is ${dp[l - 1] + 1} cuts. dp[${r}] becomes min(${prevVal}, ${dp[l - 1]} + 1) = ${newVal}.`,
        })
      );

      l -= 1;
      r += 1;

      frames.push(
        makeFrame({
          activeLine: 14,
          phase: "loop",
          mid,
          expansionType: "even",
          l,
          r,
          palindromeSpan: [l + 1, r - 1],
          dp,
          bestPartitions,
          s,
          message:
            l >= 0 && r < n
              ? `Widen even wings: l = ${l}, r = ${r}.`
              : `Reached boundary (l = ${l}, r = ${r}). Even expansion finishes.`,
          explanation:
            l >= 0 && r < n
              ? `Expanding even pointers outward: decrement l to ${l} and increment r to ${r}.`
              : `Pointer went out of bounds (0 <= ${l} and ${r} < ${n}). Even expansion ends for mid = ${mid}.`,
        })
      );
    }
  }

  const minCuts = n > 0 ? dp[n - 1] : 0;
  frames.push(
    makeFrame({
      activeLine: 15,
      phase: "done",
      dp,
      bestPartitions,
      s,
      minCuts,
      message: `Complete! Minimum cuts for "${s}" is ${minCuts} (partition: ${bestPartitions[n - 1]?.join(" | ")}).`,
      explanation: `All centers processed. dp[${n - 1}] holds the global minimum: ${minCuts} cuts required to partition "${s}" into palindromes.`,
    })
  );

  return {
    s,
    minCuts,
    frames,
  };
}
