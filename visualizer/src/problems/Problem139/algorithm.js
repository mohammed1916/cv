export const CODE = [
  "def wordBreak(s, wordDict):",
  "    words = set(wordDict)",
  "    dp = [False] * (len(s) + 1)",
  "    dp[0] = True",
  "    for i in range(1, len(s) + 1):",
  "        for j in range(i):",
  "            if dp[j] and s[j:i] in words:",
  "                dp[i] = True",
  "                break",
  "    return dp[len(s)]",
];

export function parseWordBreakInput(sInput, dictInput) {
  let rawS = sInput;
  let rawDict = dictInput;

  // Support single argument input (object or delimited string)
  if (dictInput === undefined) {
    if (rawS !== null && typeof rawS === "object") {
      const obj = rawS;
      rawS = obj.s ?? obj.str ?? obj.input;
      rawDict = obj.wordDict ?? obj.words ?? obj.dict;
    } else if (typeof rawS === "string") {
      const trimmed = rawS.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          rawS = parsed.s ?? parsed.str ?? parsed.input;
          rawDict = parsed.wordDict ?? parsed.words ?? parsed.dict;
        } catch {
          // Fall through if not valid JSON
        }
      } else if (trimmed.includes("|")) {
        const parts = trimmed.split("|");
        rawS = parts[0].trim();
        rawDict = parts.slice(1).join("|").trim();
      } else if (trimmed.includes(";")) {
        const parts = trimmed.split(";");
        rawS = parts[0].trim();
        rawDict = parts.slice(1).join(";").trim();
      }
    }
  }

  // Validate sInput
  if (rawS === null || rawS === undefined || typeof rawS !== "string") {
    throw new Error("String s must be a string");
  }

  let s = rawS.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }

  if (s.length < 1) {
    throw new Error("String s cannot be empty (length must be between 1 and 50)");
  }
  if (s.length > 50) {
    throw new Error(`String s length (${s.length}) exceeds maximum limit of 50 characters`);
  }
  if (!/^[a-zA-Z]+$/.test(s)) {
    throw new Error("String s must contain English letters only");
  }
  s = s.toLowerCase();

  // Validate dictInput
  if (rawDict === null || rawDict === undefined) {
    throw new Error("wordDict must be provided");
  }

  let wordsList;
  if (Array.isArray(rawDict)) {
    wordsList = rawDict;
  } else if (typeof rawDict === "string") {
    let dictStr = rawDict.trim();
    if (dictStr.startsWith("[") && dictStr.endsWith("]")) {
      try {
        const parsed = JSON.parse(dictStr);
        if (Array.isArray(parsed)) {
          wordsList = parsed;
        } else {
          dictStr = dictStr.slice(1, -1).trim();
          wordsList = dictStr.split(",").map((w) => w.trim());
        }
      } catch {
        dictStr = dictStr.slice(1, -1).trim();
        wordsList = dictStr.split(",").map((w) => w.trim());
      }
    } else {
      wordsList = dictStr.split(",").map((w) => w.trim());
    }
  } else {
    throw new Error("wordDict must be an array of words or a comma-separated string");
  }

  if (wordsList.length === 0) {
    throw new Error("wordDict cannot be empty (must contain between 1 and 50 words)");
  }

  const cleanedWords = [];
  for (const item of wordsList) {
    if (item === null || item === undefined || typeof item !== "string") {
      throw new Error("Each word in wordDict must be a string");
    }
    let w = item.trim();
    if (
      (w.startsWith('"') && w.endsWith('"')) ||
      (w.startsWith("'") && w.endsWith("'"))
    ) {
      w = w.slice(1, -1).trim();
    }
    if (w.length < 1) {
      throw new Error("Words in wordDict cannot be empty");
    }
    if (w.length > 50) {
      throw new Error(`Word "${w}" length exceeds maximum limit of 50 characters`);
    }
    if (!/^[a-zA-Z]+$/.test(w)) {
      throw new Error(`Word "${w}" must contain English letters only`);
    }
    cleanedWords.push(w.toLowerCase());
  }

  if (cleanedWords.length < 1) {
    throw new Error("wordDict cannot be empty (must contain between 1 and 50 words)");
  }
  if (cleanedWords.length > 50) {
    throw new Error(`wordDict size (${cleanedWords.length}) exceeds maximum limit of 50 words`);
  }

  return {
    s,
    wordDict: cleanedWords,
  };
}

function makeFrame({
  activeLine,
  phase,
  explanation,
  message,
  s,
  wordDict,
  dp,
  i = null,
  j = null,
  slice = null,
  dpJ = null,
  inDict = null,
  isMatch = null,
  updatedIndex = null,
  matchedWord = null,
  segments = null,
  result = null,
  relatedLines = [activeLine],
}) {
  return {
    activeLine,
    phase,
    explanation,
    message,
    s,
    n: s.length,
    wordDict: [...wordDict],
    dp: [...dp],
    i,
    j,
    slice,
    dpJ,
    inDict,
    isMatch,
    updatedIndex,
    matchedWord,
    segments: segments ? [...segments] : null,
    result,
    relatedLines: [...relatedLines],
  };
}

export function buildWordBreakStory(sInput, dictInput) {
  const { s, wordDict } = parseWordBreakInput(sInput, dictInput);
  const n = s.length;
  const wordSet = new Set(wordDict);

  // dp[k] is true if prefix s[0:k] can be segmented
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  // Track reconstructed word segments for each prefix
  const segmentWords = Array.from({ length: n + 1 }, () => null);
  segmentWords[0] = [];

  const frames = [];

  // Frame 1: Base case (dp[0] = True)
  frames.push(
    makeFrame({
      activeLine: 4,
      phase: "init",
      explanation: `Base case: dp[0] = True. An empty string (length 0) is trivially segmentable using 0 words from the dictionary.`,
      message: `Base case: dp[0] = True (empty prefix s[0:0] is segmentable).`,
      s,
      wordDict,
      dp,
      i: null,
      j: null,
      slice: null,
      segments: segmentWords[0],
      relatedLines: [1, 2, 3, 4],
    })
  );

  for (let i = 1; i <= n; i++) {
    const currentPrefix = s.slice(0, i);

    // Frame: Start examining prefix s[0:i]
    frames.push(
      makeFrame({
        activeLine: 5,
        phase: "loop",
        explanation: `Outer loop: evaluating prefix s[0:${i}] ("${currentPrefix}") of length ${i}. We need to find a split point j (0 <= j < ${i}) where dp[j] is True and s[j:${i}] is in wordDict.`,
        message: `i = ${i}: examine prefix s[0:${i}] = "${currentPrefix}".`,
        s,
        wordDict,
        dp,
        i,
        j: null,
        slice: null,
        relatedLines: [5],
      })
    );

    let found = false;

    for (let j = 0; j < i; j++) {
      const slice = s.slice(j, i);
      const dpJ = dp[j];
      const inDict = wordSet.has(slice);
      const isMatch = dpJ && inDict;

      // Frame: Test candidate split j
      frames.push(
        makeFrame({
          activeLine: 6,
          phase: "loop",
          explanation: `Inner loop: testing split at boundary j = ${j}. Prefix is s[0:${j}] ("${s.slice(0, j) || "ε"}") and candidate suffix is s[${j}:${i}] ("${slice}").`,
          message: `j = ${j}: split prefix into s[0:${j}] ("${s.slice(0, j) || "ε"}") + suffix s[${j}:${i}] ("${slice}").`,
          s,
          wordDict,
          dp,
          i,
          j,
          slice,
          dpJ,
          inDict,
          isMatch,
          relatedLines: [6],
        })
      );

      // Frame: Check condition: dp[j] and s[j:i] in words
      let explanation;
      let message;

      if (isMatch) {
        explanation = `Condition satisfied! dp[${j}] is True (prefix "${s.slice(0, j) || "ε"}" is segmentable) and "${slice}" is in wordDict.`;
        message = `Match! dp[${j}] = True and "${slice}" ∈ wordDict.`;
      } else if (!dpJ && inDict) {
        explanation = `"${slice}" is in wordDict, but dp[${j}] is False. Since prefix s[0:${j}] ("${s.slice(0, j)}") cannot be formed, this split is invalid.`;
        message = `dp[${j}] = False (cannot reach split point), though "${slice}" ∈ wordDict.`;
      } else if (dpJ && !inDict) {
        explanation = `dp[${j}] is True, but candidate suffix "${slice}" is NOT in wordDict.`;
        message = `dp[${j}] = True, but "${slice}" ∉ wordDict.`;
      } else {
        explanation = `Neither condition is met: dp[${j}] is False and "${slice}" is NOT in wordDict.`;
        message = `dp[${j}] = False and "${slice}" ∉ wordDict.`;
      }

      frames.push(
        makeFrame({
          activeLine: 7,
          phase: "check",
          explanation,
          message,
          s,
          wordDict,
          dp,
          i,
          j,
          slice,
          dpJ,
          inDict,
          isMatch,
          relatedLines: [7],
        })
      );

      if (isMatch) {
        dp[i] = true;
        found = true;
        segmentWords[i] = [...(segmentWords[j] || []), slice];

        // Frame: dp[i] = True
        frames.push(
          makeFrame({
            activeLine: 8,
            phase: "dp",
            explanation: `dp[${i}] is set to True! Prefix s[0:${i}] ("${currentPrefix}") can be segmented as: ${segmentWords[i].map((w) => `"${w}"`).join(" + ")}.`,
            message: `dp[${i}] = True: prefix s[0:${i}] ("${currentPrefix}") is segmentable!`,
            s,
            wordDict,
            dp,
            i,
            j,
            slice,
            dpJ: true,
            inDict: true,
            isMatch: true,
            updatedIndex: i,
            matchedWord: slice,
            segments: segmentWords[i],
            relatedLines: [8],
          })
        );

        // Frame: break
        frames.push(
          makeFrame({
            activeLine: 9,
            phase: "dp",
            explanation: `Since dp[${i}] is already proven True, we break the inner loop early and advance to the next prefix.`,
            message: `Break inner loop early: dp[${i}] = True already confirmed.`,
            s,
            wordDict,
            dp,
            i,
            j,
            slice,
            dpJ: true,
            inDict: true,
            isMatch: true,
            updatedIndex: i,
            matchedWord: slice,
            segments: segmentWords[i],
            relatedLines: [9],
          })
        );

        break;
      }
    }

    if (!found) {
      frames.push(
        makeFrame({
          activeLine: 5,
          phase: "loop",
          explanation: `Exhausted all split points j < ${i} for prefix s[0:${i}] ("${currentPrefix}"). No valid segmentation exists, so dp[${i}] remains False.`,
          message: `No valid split found for prefix s[0:${i}] ("${currentPrefix}"). dp[${i}] = False.`,
          s,
          wordDict,
          dp,
          i,
          j: null,
          slice: null,
          relatedLines: [5],
        })
      );
    }
  }

  const result = dp[n];

  // Frame: Return dp[len(s)]
  frames.push(
    makeFrame({
      activeLine: 10,
      phase: "done",
      explanation: result
        ? `Algorithm complete! dp[${n}] = True. The entire string "${s}" can be segmented using wordDict: ${segmentWords[n].map((w) => `"${w}"`).join(" + ")}.`
        : `Algorithm complete! dp[${n}] = False. The string "${s}" cannot be segmented using words from wordDict.`,
      message: result
        ? `Return dp[${n}] = True. "${s}" CAN be segmented using wordDict.`
        : `Return dp[${n}] = False. "${s}" CANNOT be segmented using wordDict.`,
      s,
      wordDict,
      dp,
      i: n,
      j: null,
      slice: null,
      result,
      segments: result ? segmentWords[n] : null,
      relatedLines: [10],
    })
  );

  return {
    s,
    wordDict,
    result,
    frames,
  };
}
