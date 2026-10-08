import test from "node:test";
import assert from "node:assert/strict";
import { resolveNarrative } from "./resolveNarrative.js";
import { stockNarrative } from "../../problems/Problem121/stockNarrative.js";
import { buildStock1Story } from "../../problems/Problem121/algorithm.js";
import { braceNarrative } from "../../problems/Problem1096/braceNarrative.js";
import { romanNarrative } from "../../problems/Problem12/romanNarrative.js";
import { generateSteps as generateRomanSteps } from "../../problems/Problem12/algorithm.js";
import { romanToIntNarrative } from "../../problems/Problem13/romanToIntNarrative.js";
import { generateSteps as generateRomanToIntSteps } from "../../problems/Problem13/algorithm.js";
import { divideNarrative } from "../../problems/Problem29/divideNarrative.js";
import { buildDivision } from "../../problems/Problem29/algorithm.js";
import { permuteUniqueNarrative } from "../../problems/Problem47/permuteUniqueNarrative.js";
import { buildPermutations } from "../../problems/Problem47/algorithm.js";
import { triangleNarrative } from "../../problems/Problem120/triangleNarrative.js";
import { buildTriangleStory } from "../../problems/Problem120/algorithm.js";
import { stock2Narrative } from "../../problems/Problem122/stock2Narrative.js";
import { buildStock2Story } from "../../problems/Problem122/algorithm.js";
import { stock3Narrative } from "../../problems/Problem123/stock3Narrative.js";
import { buildStock3Story } from "../../problems/Problem123/algorithm.js";
import { maxPathNarrative } from "../../problems/Problem124/maxPathNarrative.js";
import { buildMaxPathStory } from "../../problems/Problem124/algorithm.js";
import { palindromeNarrative } from "../../problems/Problem125/palindromeNarrative.js";
import { buildPalindromeStory } from "../../problems/Problem125/algorithm.js";
import { consecutiveNarrative } from "../../problems/Problem128/consecutiveNarrative.js";
import { buildConsecutiveStory } from "../../problems/Problem128/algorithm.js";
import { sumRootLeafNarrative } from "../../problems/Problem129/sumRootLeafNarrative.js";
import { buildSumNumbersStory } from "../../problems/Problem129/algorithm.js";
import { surroundedNarrative } from "../../problems/Problem130/surroundedNarrative.js";
import { buildSurroundedStory } from "../../problems/Problem130/algorithm.js";
import { partitionNarrative } from "../../problems/Problem131/partitionNarrative.js";
import { buildPartitionStory } from "../../problems/Problem131/algorithm.js";
import { minCutNarrative } from "../../problems/Problem132/minCutNarrative.js";
import { buildMinCutStory } from "../../problems/Problem132/algorithm.js";
import { cloneGraphNarrative } from "../../problems/Problem133/cloneGraphNarrative.js";
import { buildCloneGraphStory } from "../../problems/Problem133/algorithm.js";
import { gasStationNarrative } from "../../problems/Problem134/gasStationNarrative.js";
import { buildGasStationStory } from "../../problems/Problem134/algorithm.js";
import { candyNarrative } from "../../problems/Problem135/candyNarrative.js";
import { buildCandyStory } from "../../problems/Problem135/algorithm.js";
import { singleNumberNarrative } from "../../problems/Problem136/singleNumberNarrative.js";
import { buildSingleNumberStory } from "../../problems/Problem136/algorithm.js";
import { singleNumber2Narrative } from "../../problems/Problem137/singleNumber2Narrative.js";
import { buildSingleNumber2Story } from "../../problems/Problem137/algorithm.js";
import { copyRandomNarrative } from "../../problems/Problem138/copyRandomNarrative.js";
import { buildCopyRandomListStory } from "../../problems/Problem138/algorithm.js";
import { wordBreakNarrative } from "../../problems/Problem139/wordBreakNarrative.js";
import { buildWordBreakStory } from "../../problems/Problem139/algorithm.js";
import { wordBreak2Narrative } from "../../problems/Problem140/wordBreak2Narrative.js";
import { buildWordBreak2Story } from "../../problems/Problem140/algorithm.js";
import { hasCycleNarrative } from "../../problems/Problem141/hasCycleNarrative.js";
import { buildCycleStory } from "../../problems/Problem141/algorithm.js";
import { detectCycle2Narrative } from "../../problems/Problem142/detectCycle2Narrative.js";
import { buildCycle2Story } from "../../problems/Problem142/algorithm.js";
import {
  perfectPointerNarrative,
  sparsePointerNarrative,
} from "./nextPointerNarrative.js";
import { buildNextPointerStory } from "./nextPointerStory.js";
import {
  pascalTriangleNarrative,
  pascalRowNarrative,
} from "./pascalNarrative.js";
import { buildPascalStory } from "./pascalTrace.js";

test("missing definitions opt out without creating placeholder explanations", () => {
  assert.equal(resolveNarrative(undefined, { step: null }), null);
  assert.equal(
    resolveNarrative(() => null, { step: null }),
    null,
  );
});

test("ready content is restored on reset; line overrides refine a phase", () => {
  const definition = {
    goal: "Goal",
    ready: { achieved: "Not started" },
    phases: { scan: { why: "Scan purpose", achieved: "Phase outcome" } },
    lines: { 7: ({ step }) => ({ achieved: `Value ${step.value}` }) },
  };
  const frame = resolveNarrative(definition, {
    step: { phase: "scan", activeLine: 7, value: 3 },
  });
  assert.equal(frame.goal, "Goal");
  assert.equal(frame.why, "Scan purpose");
  assert.equal(frame.achieved, "Value 3");
  assert.equal(frame.activeLine, 7);
  assert.equal(
    resolveNarrative(definition, { step: null }).achieved,
    "Not started",
  );
  assert.equal(
    resolveNarrative(definition, { step: null }).activeLine,
    undefined,
  );
});

test("every stock frame has purposeful content for gains, losses, ties and one day", () => {
  for (const input of ["[7,1,5,3,6,4]", "[5,4,3]", "[3,3,3]", "[5]"]) {
    const story = buildStock1Story(input);
    for (const step of story.frames) {
      const narrative = resolveNarrative(stockNarrative, { step, story });
      for (const key of ["goal", "why", "achieved", "next"]) {
        assert.ok(
          narrative[key],
          `${input}: line ${step.activeLine} missing ${key}`,
        );
        assert.ok(!narrative[key].includes("undefined"));
      }
    }
    const done = resolveNarrative(stockNarrative, {
      step: story.frames.at(-1),
      story,
    });
    assert.ok(
      done.achieved.includes(
        story.maxProfit > 0 ? String(story.maxProfit) : "zero",
      ),
    );
  }
});

test("standalone callback definitions receive current input after reset", () => {
  const first = resolveNarrative(braceNarrative, {
    step: null,
    input: "{a,b}",
  });
  const reset = resolveNarrative(braceNarrative, {
    step: null,
    input: "{x,y}",
  });
  assert.ok(first.next.includes("{a,b}"));
  assert.ok(reset.next.includes("{x,y}"));
  assert.equal(reset.activeLine, undefined);
});

function verifyNarrative(narrativeDef, story, label) {
  const ready = resolveNarrative(narrativeDef, { step: null, story });
  for (const key of ["goal", "why", "achieved", "next"]) {
    assert.ok(ready[key], `${label} ready state missing ${key}`);
    assert.ok(
      !ready[key].includes("undefined"),
      `${label} ready state has undefined in ${key}`,
    );
  }
  for (const step of story.frames) {
    const frameNarrative = resolveNarrative(narrativeDef, { step, story });
    for (const key of ["goal", "why", "achieved", "next"]) {
      assert.ok(
        frameNarrative[key],
        `${label} (line ${step.activeLine}, phase ${step.phase}) missing ${key}`,
      );
      assert.ok(
        !frameNarrative[key].includes("undefined"),
        `${label} (line ${step.activeLine}, phase ${step.phase}) has undefined in ${key}: "${frameNarrative[key]}"`,
      );
    }
  }
}

test("every Problem 12 (Integer to Roman) frame has valid narrative", () => {
  for (const input of [3749, 58, 1994]) {
    const story = { input: { num: input }, frames: generateRomanSteps(input) };
    verifyNarrative(romanNarrative, story, `Problem12 (${input})`);
  }
});

test("every Problem 13 (Roman to Integer) frame has valid narrative", () => {
  for (const input of ["III", "LVIII", "MCMXCIV"]) {
    const story = {
      input: { s: input },
      frames: generateRomanToIntSteps(input),
    };
    verifyNarrative(romanToIntNarrative, story, `Problem13 (${input})`);
  }
});

test("every Problem 29 (Divide Two Integers) frame has valid narrative", () => {
  for (const values of [
    { dividend: "10", divisor: "3" },
    { dividend: "7", divisor: "-3" },
    { dividend: "-2147483648", divisor: "-1" },
  ]) {
    const story = buildDivision(values);
    verifyNarrative(
      divideNarrative,
      story,
      `Problem29 (${values.dividend}/${values.divisor})`,
    );
  }
});

test("every Problem 47 (Permutations II) frame has valid narrative", () => {
  for (const input of ["[1,1,2]", "[1,2,3]"]) {
    const story = buildPermutations({ nums: input });
    verifyNarrative(permuteUniqueNarrative, story, `Problem47 (${input})`);
  }
});

test("every Problem 120 (Triangle) frame has valid narrative", () => {
  const story = buildTriangleStory("[[2],[3,4],[6,5,7],[4,1,8,3]]");
  verifyNarrative(triangleNarrative, story, "Problem120");
});

test("every Problem 122 (Stock II) frame has valid narrative", () => {
  for (const input of ["[7,1,5,3,6,4]", "[1,2,3,4,5]", "[7,6,4,3,1]"]) {
    const story = buildStock2Story(input);
    verifyNarrative(stock2Narrative, story, `Problem122 (${input})`);
  }
});

test("every Problem 123 (Stock III) frame has valid narrative", () => {
  for (const input of ["[3,3,5,0,0,3,1,4]", "[1,2,3,4,5]", "[7,6,4,3,1]"]) {
    const story = buildStock3Story(input);
    verifyNarrative(stock3Narrative, story, `Problem123 (${input})`);
  }
});

test("every Problem 124 (Binary Tree Max Path Sum) frame has valid narrative", () => {
  for (const input of ["[1,2,3]", "[-10,9,20,null,null,15,7]"]) {
    const story = buildMaxPathStory(input);
    verifyNarrative(maxPathNarrative, story, `Problem124 (${input})`);
  }
});

test("every Problem 125 (Valid Palindrome) frame has valid narrative", () => {
  for (const input of [
    '"A man, a plan, a canal: Panama"',
    '"race a car"',
    '" "',
  ]) {
    const story = buildPalindromeStory(input);
    verifyNarrative(palindromeNarrative, story, `Problem125 (${input})`);
  }
});

test("every Problem 128 (Longest Consecutive Sequence) frame has valid narrative", () => {
  for (const input of ["[100,4,200,1,3,2]", "[0,3,7,2,5,8,4,6,0,1]", "[]"]) {
    const story = buildConsecutiveStory(input);
    verifyNarrative(consecutiveNarrative, story, `Problem128 (${input})`);
  }
});

test("every Problem 129 (Sum Root to Leaf Numbers) frame has valid narrative", () => {
  for (const input of ["[1,2,3]", "[4,9,0,5,1]"]) {
    const story = buildSumNumbersStory(input);
    verifyNarrative(sumRootLeafNarrative, story, `Problem129 (${input})`);
  }
});

test("every Problem 130 (Surrounded Regions) frame has valid narrative", () => {
  const input =
    '[["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]';
  const story = buildSurroundedStory(input);
  verifyNarrative(surroundedNarrative, story, "Problem130");
});

test("every Problem 131 (Palindrome Partitioning) frame has valid narrative", () => {
  for (const input of ['"aab"', '"a"']) {
    const story = buildPartitionStory(input);
    verifyNarrative(partitionNarrative, story, `Problem131 (${input})`);
  }
});

test("every Problem 132 (Palindrome Partitioning II) frame has valid narrative", () => {
  for (const input of ['"aab"', '"a"', '"ab"']) {
    const story = buildMinCutStory(input);
    verifyNarrative(minCutNarrative, story, `Problem132 (${input})`);
  }
});

test("every Problem 133 (Clone Graph) frame has valid narrative", () => {
  for (const input of ["[[2,4],[1,3],[2,4],[1,3]]", "[[]]", "[]"]) {
    const story = buildCloneGraphStory(input);
    verifyNarrative(cloneGraphNarrative, story, `Problem133 (${input})`);
  }
});

test("every Problem 134 (Gas Station) frame has valid narrative", () => {
  const story = buildGasStationStory("[1,2,3,4,5]", "[3,4,5,1,2]");
  verifyNarrative(gasStationNarrative, story, "Problem134");
});

test("every Problem 135 (Candy) frame has valid narrative", () => {
  for (const input of ["[1,0,2]", "[1,2,2]"]) {
    const story = buildCandyStory(input);
    verifyNarrative(candyNarrative, story, `Problem135 (${input})`);
  }
});

test("every Problem 136 (Single Number) frame has valid narrative", () => {
  for (const input of ["[2,2,1]", "[4,1,2,1,2]"]) {
    const story = buildSingleNumberStory(input);
    verifyNarrative(singleNumberNarrative, story, `Problem136 (${input})`);
  }
});

test("every Problem 137 (Single Number II) frame has valid narrative", () => {
  for (const input of ["[2,2,3,2]", "[0,1,0,1,0,1,99]"]) {
    const story = buildSingleNumber2Story(input);
    verifyNarrative(singleNumber2Narrative, story, `Problem137 (${input})`);
  }
});

test("every Problem 138 (Copy List with Random Pointer) frame has valid narrative", () => {
  const story = buildCopyRandomListStory(
    "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
  );
  verifyNarrative(copyRandomNarrative, story, "Problem138");
});

test("every Problem 139 (Word Break) frame has valid narrative", () => {
  const story = buildWordBreakStory("leetcode", '["leet","code"]');
  verifyNarrative(wordBreakNarrative, story, "Problem139");
});

test("every Problem 140 (Word Break II) frame has valid narrative", () => {
  const story = buildWordBreak2Story(
    "catsanddog",
    '["cat","cats","and","sand","dog"]',
  );
  verifyNarrative(wordBreak2Narrative, story, "Problem140");
});

test("every Problem 141 (Linked List Cycle) frame has valid narrative", () => {
  for (const input of [
    "[3,2,0,-4] | pos = 1",
    "[1,2] | pos = 0",
    "[1] | pos = -1",
    "[]",
  ]) {
    const story = buildCycleStory(input);
    verifyNarrative(hasCycleNarrative, story, `Problem141 (${input})`);
  }
});

test("every Problem 142 (Linked List Cycle II) frame has valid narrative", () => {
  for (const input of [
    { nodes: "[3,2,0,-4]", pos: 1 },
    { nodes: "[1,2]", pos: 0 },
    { nodes: "[1]", pos: -1 },
    { nodes: "[]", pos: -1 },
  ]) {
    const story = buildCycle2Story(input.nodes, input.pos);
    verifyNarrative(
      detectCycle2Narrative,
      story,
      `Problem142 (${input.nodes}, pos=${input.pos})`,
    );
  }
});

test("every Next Pointer (Problems 116 & 117) frame has valid narrative", () => {
  const perfectStory = buildNextPointerStory("[1,2,3,4,5,6,7]", "perfect");
  verifyNarrative(
    perfectPointerNarrative,
    perfectStory,
    "Problem116 (perfect)",
  );
  const sparseStory = buildNextPointerStory("[1,2,3,4,5,null,7]", "sparse");
  verifyNarrative(sparsePointerNarrative, sparseStory, "Problem117 (sparse)");
});

test("every Pascal (Problems 118 & 119) frame has valid narrative", () => {
  const triStory = buildPascalStory("5", "triangle");
  verifyNarrative(pascalTriangleNarrative, triStory, "Problem118 (triangle)");
  const rowStory = buildPascalStory("4", "row");
  verifyNarrative(pascalRowNarrative, rowStory, "Problem119 (row)");
});
