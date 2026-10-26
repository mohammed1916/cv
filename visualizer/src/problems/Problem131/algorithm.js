export const CODE = [
  "def partition(s):",
  "    result = []",
  "    def backtrack(start, path):",
  "        if start == len(s):",
  "            result.append(path[:])",
  "            return",
  "        for end in range(start + 1, len(s) + 1):",
  "            sub = s[start:end]",
  "            if sub == sub[::-1]:",
  "                backtrack(end, path + [sub])",
  "    backtrack(0, [])",
  "    return result",
];

export function parsePartitionInput(input) {
  let s = input;
  if (typeof s === "object" && s !== null && "s" in s) {
    s = s.s;
  }
  if (typeof s !== "string") {
    throw new Error("Input must be a string");
  }
  if (s.length < 1 || s.length > 16) {
    throw new Error("Input string length must be between 1 and 16 characters");
  }
  return s;
}

export function isPalindrome(str) {
  let l = 0;
  let r = str.length - 1;
  while (l < r) {
    if (str[l] !== str[r]) return false;
    l++;
    r--;
  }
  return true;
}

function computeCuts(path) {
  let acc = 0;
  const cuts = [];
  for (const part of path) {
    acc += part.length;
    cuts.push(acc);
  }
  return cuts;
}

export function buildPartitionStory(input) {
  const s = parsePartitionInput(input);
  const frames = [];
  const partitions = [];
  let candidateCount = 0;

  // Frame 1: Line 2 - initialize result list
  frames.push({
    activeLine: 2,
    phase: "init",
    s,
    start: 0,
    end: null,
    candidate: null,
    isPalindrome: null,
    path: [],
    partitions: [],
    depth: 0,
    cuts: [],
    activeCut: null,
    candidateCount: 0,
    message: `Initialize result = [] for input "${s}".`,
    explanation: `Starting palindrome partitioning for string "${s}" (length ${s.length}). Initialize empty result list.`,
    relatedLines: [1, 2],
  });

  // Frame 2: Line 11 - start backtracking
  frames.push({
    activeLine: 11,
    phase: "init",
    s,
    start: 0,
    end: null,
    candidate: null,
    isPalindrome: null,
    path: [],
    partitions: [],
    depth: 0,
    cuts: [],
    activeCut: null,
    candidateCount: 0,
    message: `Call backtrack(start=0, path=[]).`,
    explanation: `Initiate backtracking from index 0 with an empty partition path.`,
    relatedLines: [3, 11],
  });

  function backtrack(start, path, depth) {
    const currentCuts = computeCuts(path);

    // Line 4: Check if start == len(s)
    if (start === s.length) {
      partitions.push([...path]);
      const partitionsSnapshot = partitions.map((p) => [...p]);

      // Line 5: result.append(path[:])
      frames.push({
        activeLine: 5,
        phase: "complete",
        s,
        start,
        end: null,
        candidate: null,
        isPalindrome: true,
        path: [...path],
        partitions: partitionsSnapshot,
        depth,
        cuts: [...currentCuts],
        activeCut: null,
        candidateCount,
        message: `Complete partition found: [${path.map((x) => `"${x}"`).join(", ")}]`,
        explanation: `Reached end of string (start = ${start} == len(s)). All substrings in current path are palindromes! Added partition #${partitionsSnapshot.length} to result.`,
        relatedLines: [4, 5],
      });

      // Line 6: return
      frames.push({
        activeLine: 6,
        phase: "backtrack",
        s,
        start,
        end: null,
        candidate: null,
        isPalindrome: null,
        path: [...path],
        partitions: partitionsSnapshot,
        depth,
        cuts: [...currentCuts],
        activeCut: null,
        candidateCount,
        message: `Return from completed branch to explore next candidates.`,
        explanation: `Backtrack from leaf node at index ${start}.`,
        relatedLines: [6],
      });
      return;
    }

    // Line 4: start < len(s)
    frames.push({
      activeLine: 4,
      phase: "inspect",
      s,
      start,
      end: null,
      candidate: null,
      isPalindrome: null,
      path: [...path],
      partitions: partitions.map((p) => [...p]),
      depth,
      cuts: [...currentCuts],
      activeCut: null,
      candidateCount,
      message: `start (${start}) < len(s) (${s.length}). Try candidate substrings starting at index ${start}.`,
      explanation: `start index is ${start}. Slicing candidate substrings from index ${start} to ${s.length}.`,
      relatedLines: [4, 7],
    });

    for (let end = start + 1; end <= s.length; end++) {
      candidateCount++;
      const sub = s.slice(start, end);
      const isPalin = isPalindrome(sub);

      // Line 8: sub = s[start:end]
      frames.push({
        activeLine: 8,
        phase: "inspect",
        s,
        start,
        end,
        candidate: sub,
        isPalindrome: null,
        path: [...path],
        partitions: partitions.map((p) => [...p]),
        depth,
        cuts: [...currentCuts],
        activeCut: end,
        candidateCount,
        message: `Candidate substring s[${start}:${end}] = "${sub}"`,
        explanation: `Slice candidate substring "${sub}" (range ${start} to ${end}). Check if it is a palindrome.`,
        relatedLines: [7, 8],
      });

      // Line 9: if sub == sub[::-1]:
      const reversed = sub.split("").reverse().join("");
      frames.push({
        activeLine: 9,
        phase: "validate",
        s,
        start,
        end,
        candidate: sub,
        isPalindrome: isPalin,
        path: [...path],
        partitions: partitions.map((p) => [...p]),
        depth,
        cuts: [...currentCuts],
        activeCut: end,
        candidateCount,
        message: isPalin
          ? `"${sub}" == "${reversed}" → Palindrome ✓`
          : `"${sub}" != "${reversed}" → Not a palindrome ✗`,
        explanation: isPalin
          ? `"${sub}" reads identically forwards and backwards. Valid palindrome cut! Recursing on remaining suffix.`
          : `"${sub}" is not a palindrome. Prune this branch and check next cut at end = ${end + 1}.`,
        relatedLines: [9],
      });

      if (isPalin) {
        const nextPath = [...path, sub];
        const nextCuts = computeCuts(nextPath);

        // Line 10: backtrack(end, path + [sub])
        frames.push({
          activeLine: 10,
          phase: "branch",
          s,
          start,
          end,
          candidate: sub,
          isPalindrome: true,
          path: nextPath,
          partitions: partitions.map((p) => [...p]),
          depth: depth + 1,
          cuts: nextCuts,
          activeCut: end,
          candidateCount,
          message: `Append "${sub}" to path. Recurse: backtrack(start=${end}, path=[${nextPath.map((x) => `"${x}"`).join(", ")}])`,
          explanation: `Added "${sub}" to path. Advancing start from ${start} to ${end} to partition suffix "${s.slice(end)}".`,
          relatedLines: [10],
        });

        backtrack(end, nextPath, depth + 1);

        // Backtrack after return
        frames.push({
          activeLine: 10,
          phase: "backtrack",
          s,
          start,
          end,
          candidate: sub,
          isPalindrome: null,
          path: [...path],
          partitions: partitions.map((p) => [...p]),
          depth,
          cuts: [...currentCuts],
          activeCut: null,
          candidateCount,
          message: `Backtrack from "${sub}". Restore path = [${path.map((x) => `"${x}"`).join(", ")}].`,
          explanation: `Returned from exploring branches with prefix "${sub}". Pop "${sub}" from path and continue loop.`,
          relatedLines: [10, 7],
        });
      }
    }
  }

  backtrack(0, [], 0);

  // Line 12: return result
  frames.push({
    activeLine: 12,
    phase: "done",
    s,
    start: s.length,
    end: null,
    candidate: null,
    isPalindrome: null,
    path: [],
    partitions: partitions.map((p) => [...p]),
    depth: 0,
    cuts: [],
    activeCut: null,
    candidateCount,
    message: `Done. Found ${partitions.length} valid palindrome partition(s).`,
    explanation: `Search complete. Explored all cut combinations for "${s}". Returning ${partitions.length} partition(s).`,
    relatedLines: [12],
  });

  return {
    s,
    partitions,
    frames,
  };
}
