export const CODE = [
  "def wordBreak(s, wordDict):",
  "    words = set(wordDict)",
  "    memo = {}",
  "    def dfs(start):",
  "        if start in memo: return memo[start]",
  "        if start == len(s): return [[]]",
  "        res = []",
  "        for end in range(start + 1, len(s) + 1):",
  "            word = s[start:end]",
  "            if word in words:",
  "                for rest in dfs(end):",
  "                    res.append([word] + rest)",
  "        memo[start] = res",
  "        return res",
  "    sentences = [' '.join(path) for path in dfs(0)]",
  "    return sentences",
];

export function parseWordBreak2Input(sInput, dictInput) {
  let rawS = sInput;
  let rawDict = dictInput;

  if (typeof sInput === "object" && sInput !== null) {
    if ("s" in sInput) {
      rawS = sInput.s;
    }
    if ("wordDict" in sInput) {
      rawDict = sInput.wordDict;
    }
  }

  if (typeof rawS !== "string") {
    throw new Error("Input string s must be a string");
  }

  const s = rawS.trim();
  if (s.length < 1 || s.length > 25) {
    throw new Error("Input string s length must be between 1 and 25 characters");
  }

  if (!/^[a-z]+$/.test(s)) {
    throw new Error("Input string s must only contain lowercase English letters");
  }

  let wordList;
  if (Array.isArray(rawDict)) {
    wordList = rawDict;
  } else if (typeof rawDict === "string") {
    const trimmed = rawDict.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          wordList = parsed;
        } else {
          throw new Error("wordDict JSON must be an array");
        }
      } catch (e) {
        throw new Error(
          e.message.includes("must be an array") ? e.message : `Invalid wordDict JSON: ${e.message}`,
          { cause: e }
        );
      }
    } else {
      wordList = trimmed
        .split(/[,\s]+/)
        .map((w) => w.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
  } else {
    throw new Error("wordDict must be an array of strings or valid list string");
  }

  if (wordList.length === 0) {
    throw new Error("wordDict cannot be empty");
  }

  const cleanedDict = [];
  const seen = new Set();
  for (let i = 0; i < wordList.length; i++) {
    const item = wordList[i];
    if (typeof item !== "string") {
      throw new Error(`wordDict items must be strings (found ${typeof item} at index ${i})`);
    }
    const cleanWord = item.trim().toLowerCase();
    if (cleanWord.length === 0) {
      throw new Error("Words in wordDict cannot be empty");
    }
    if (!/^[a-z]+$/.test(cleanWord)) {
      throw new Error(`Word "${cleanWord}" must only contain lowercase English letters`);
    }
    if (!seen.has(cleanWord)) {
      seen.add(cleanWord);
      cleanedDict.push(cleanWord);
    }
  }

  return { s, wordDict: cleanedDict };
}

function cloneMemo(memo) {
  const cloned = {};
  for (const [key, val] of Object.entries(memo)) {
    cloned[key] = val.map((path) => [...path]);
  }
  return cloned;
}

function cloneTreeNodes(nodes) {
  return nodes.map((node) => ({ ...node }));
}

export function buildWordBreak2Story(sInput, dictInput) {
  const { s, wordDict } = parseWordBreak2Input(sInput, dictInput);
  const words = new Set(wordDict);
  const memo = {};
  const frames = [];
  const allSentences = [];
  const treeNodes = [];
  let nodeIdCounter = 0;
  let cacheHitCount = 0;

  function addFrame({
    activeLine,
    phase,
    message,
    explanation,
    relatedLines = [activeLine],
    start = null,
    end = null,
    currentWord = null,
    inDict = null,
    depth = 0,
    path = [],
    activeNodeId = null,
    currentRes = null,
  }) {
    frames.push({
      frameIndex: frames.length,
      activeLine,
      phase,
      message,
      explanation,
      relatedLines,
      s,
      wordDict: [...wordDict],
      start,
      end,
      currentWord,
      inDict,
      depth,
      path: [...path],
      memo: cloneMemo(memo),
      cacheHitCount,
      sentences: [...allSentences],
      treeNodes: cloneTreeNodes(treeNodes),
      activeNodeId,
      currentRes: currentRes ? currentRes.map((r) => [...r]) : null,
    });
  }

  // Frame 1: Line 2 - words = set(wordDict)
  addFrame({
    activeLine: 2,
    phase: "init",
    message: `Convert wordDict to set: {${wordDict.map((w) => `"${w}"`).join(", ")}}`,
    explanation: `Starting Word Break II for string "${s}" (|s|=${s.length}). Initialize words set with ${wordDict.length} unique words for O(1) membership checks.`,
    relatedLines: [1, 2],
    depth: 0,
    path: [],
  });

  // Frame 2: Line 3 - memo = {}
  addFrame({
    activeLine: 3,
    phase: "init",
    message: "Initialize memoization cache: memo = {}",
    explanation: "Create an empty memo table. memo[start] will store all valid sentence completions starting from index start to avoid redundant DFS sub-tree explorations.",
    relatedLines: [3],
    depth: 0,
    path: [],
  });

  // Frame 3: Line 15 - Call dfs(0)
  addFrame({
    activeLine: 15,
    phase: "init",
    message: "Call dfs(0) to discover all valid sentence segmentations.",
    explanation: `Begin recursive DFS exploration from index 0 on full string "${s}".`,
    relatedLines: [4, 15],
    start: 0,
    depth: 0,
    path: [],
  });

  function dfs(start, currentPath = [], parentNodeId = null, leadingWord = "") {
    const depth = currentPath.length;
    const nodeId = `node-${nodeIdCounter++}`;

    const currentNode = {
      id: nodeId,
      parentId: parentNodeId,
      start,
      leadingWord,
      depth,
      status: "active", // active, cached, success, dead_end, complete
      completionsCount: 0,
    };
    treeNodes.push(currentNode);

    // Line 5: if start in memo: return memo[start]
    if (start in memo) {
      cacheHitCount++;
      currentNode.status = "cached";
      currentNode.completionsCount = memo[start].length;

      addFrame({
        activeLine: 5,
        phase: "cache_hit",
        message: `Cache hit at start=${start}! Reusing memo[${start}] (${memo[start].length} completion(s)).`,
        explanation: `Substring "${s.slice(start)}" at index ${start} was already evaluated. Reusing cached result: ${JSON.stringify(memo[start])}. No sub-search needed!`,
        relatedLines: [5],
        start,
        depth,
        path: currentPath,
        activeNodeId: nodeId,
      });
      return memo[start];
    }

    // Line 6: if start == len(s): return [[]]
    if (start === s.length) {
      currentNode.status = "success";
      currentNode.completionsCount = 1;
      const completedSentence = currentPath.join(" ");
      if (completedSentence && !allSentences.includes(completedSentence)) {
        allSentences.push(completedSentence);
      }

      addFrame({
        activeLine: 6,
        phase: "solution",
        message: `Base case reached! start=${start} == len(s). Formed: "${completedSentence}"`,
        explanation: `Reached end of string s (index ${start}). All characters consumed! Return [[]] as the base empty tail to let parent callers prepend their words.`,
        relatedLines: [6],
        start,
        depth,
        path: currentPath,
        activeNodeId: nodeId,
      });
      return [[]];
    }

    // Line 7: res = []
    const res = [];
    addFrame({
      activeLine: 7,
      phase: "init",
      message: `dfs(start=${start}): Initialize res = [] for suffix "${s.slice(start)}"`,
      explanation: `Exploring all valid prefixes starting at index ${start} (remaining suffix: "${s.slice(start)}"). Initialize empty res list.`,
      relatedLines: [7],
      start,
      depth,
      path: currentPath,
      activeNodeId: nodeId,
      currentRes: res,
    });

    // Line 8: for end in range(start + 1, len(s) + 1):
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.slice(start, end);
      const inDict = words.has(word);

      // Line 9 & 10: word = s[start:end]; if word in words:
      if (!inDict) {
        addFrame({
          activeLine: 9,
          phase: "check",
          message: `Check s[${start}:${end}] = "${word}": Not in dictionary.`,
          explanation: `Substring "${word}" is not in words. Increment end pointer to test longer prefix.`,
          relatedLines: [8, 9, 10],
          start,
          end,
          currentWord: word,
          inDict: false,
          depth,
          path: currentPath,
          activeNodeId: nodeId,
          currentRes: res,
        });
      } else {
        // Line 10: match found
        addFrame({
          activeLine: 10,
          phase: "check",
          message: `Match found! s[${start}:${end}] = "${word}" is in dictionary.`,
          explanation: `Prefix "${word}" matches dictionary! Next, recursively call dfs(end=${end}) for suffix "${s.slice(end) || "ε"}".`,
          relatedLines: [10],
          start,
          end,
          currentWord: word,
          inDict: true,
          depth,
          path: currentPath,
          activeNodeId: nodeId,
          currentRes: res,
        });

        // Line 11: for rest in dfs(end):
        addFrame({
          activeLine: 11,
          phase: "recursive_search",
          message: `Recurse: Call dfs(end=${end}) on suffix "${s.slice(end) || "ε"}".`,
          explanation: `Branching DFS into suffix starting at index ${end} after choosing word "${word}".`,
          relatedLines: [11],
          start,
          end,
          currentWord: word,
          inDict: true,
          depth,
          path: [...currentPath, word],
          activeNodeId: nodeId,
          currentRes: res,
        });

        const rest = dfs(end, [...currentPath, word], nodeId, word);

        // Line 12: res.append([word] + rest)
        for (const r of rest) {
          const combined = [word, ...r];
          res.push(combined);

          addFrame({
            activeLine: 12,
            phase: "merge",
            message: `dfs(${start}): Prepend "${word}" + [${r.join(", ")}] -> [${combined.join(", ")}]`,
            explanation: `Merged prefix "${word}" with suffix completion [${r.join(", ")}] to create sentence piece [${combined.join(", ")}].`,
            relatedLines: [11, 12],
            start,
            end,
            currentWord: word,
            inDict: true,
            depth,
            path: currentPath,
            activeNodeId: nodeId,
            currentRes: res,
          });
        }
      }
    }

    // Line 13: memo[start] = res
    memo[start] = res;
    currentNode.status = res.length > 0 ? "complete" : "dead_end";
    currentNode.completionsCount = res.length;

    addFrame({
      activeLine: 13,
      phase: "memo",
      message: `Memoize index ${start}: memo[${start}] = ${res.length} completion(s).`,
      explanation: `Finished checking all prefixes from index ${start}. Cached ${res.length} completion(s) in memo[${start}]: ${JSON.stringify(res)}.`,
      relatedLines: [13],
      start,
      depth,
      path: currentPath,
      activeNodeId: nodeId,
      currentRes: res,
    });

    // Line 14: return res
    addFrame({
      activeLine: 14,
      phase: "merge",
      message: `dfs(${start}) returns ${res.length} completion(s).`,
      explanation: `Return ${res.length} valid sentence completion(s) from index ${start} back to caller.`,
      relatedLines: [14],
      start,
      depth,
      path: currentPath,
      activeNodeId: nodeId,
      currentRes: res,
    });

    return res;
  }

  const rootCompletions = dfs(0, [], null, "root");
  const sentences = rootCompletions.map((path) => path.join(" "));

  // Line 15: sentences = [' '.join(path) for path in dfs(0)]
  addFrame({
    activeLine: 15,
    phase: "solution",
    message: `Format final sentences: ${sentences.length} found.`,
    explanation: `Join word tokens in each complete path with spaces: ${sentences.map((st) => `"${st}"`).join(", ") || "(none)"}.`,
    relatedLines: [15],
    start: 0,
    depth: 0,
    path: [],
  });

  // Line 16: return sentences
  addFrame({
    activeLine: 16,
    phase: "done",
    message: `Complete! Found ${sentences.length} valid sentence combination(s).`,
    explanation: `Word Break II execution finished. Total memoized states: ${Object.keys(memo).length}, cache hits: ${cacheHitCount}, valid sentences: ${sentences.length}.`,
    relatedLines: [16],
    start: 0,
    depth: 0,
    path: [],
  });

  return {
    s,
    wordDict,
    sentences,
    frames,
  };
}
