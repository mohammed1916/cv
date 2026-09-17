import test from "node:test";
import assert from "node:assert/strict";
import { CODE, parseWordBreak2Input, buildWordBreak2Story } from "./algorithm.js";

test("CODE contains the exact 16-line Python solution", () => {
  assert.equal(CODE.length, 16);
  assert.match(CODE[0], /def wordBreak\(s, wordDict\):/);
  assert.match(CODE[1], /words = set\(wordDict\)/);
  assert.match(CODE[2], /memo = \{\}/);
  assert.match(CODE[3], /def dfs\(start\):/);
  assert.match(CODE[4], /if start in memo: return memo\[start\]/);
  assert.match(CODE[5], /if start == len\(s\): return \[\[\]\]/);
  assert.match(CODE[6], /res = \[\]/);
  assert.match(CODE[7], /for end in range\(start \+ 1, len\(s\) \+ 1\):/);
  assert.match(CODE[8], /word = s\[start:end\]/);
  assert.match(CODE[9], /if word in words:/);
  assert.match(CODE[10], /for rest in dfs\(end\):/);
  assert.match(CODE[11], /res\.append\(\[word\] \+ rest\)/);
  assert.match(CODE[12], /memo\[start\] = res/);
  assert.match(CODE[13], /return res/);
  assert.match(CODE[14], /sentences = \[' '\.join\(path\) for path in dfs\(0\)\]/);
  assert.match(CODE[15], /return sentences/);
});

test("parseWordBreak2Input validates inputs and parses diverse formats", () => {
  // Direct array
  const res1 = parseWordBreak2Input("catsanddog", ["cat", "cats", "and", "sand", "dog"]);
  assert.equal(res1.s, "catsanddog");
  assert.deepEqual(res1.wordDict, ["cat", "cats", "and", "sand", "dog"]);

  // JSON string
  const res2 = parseWordBreak2Input("catsanddog", '["cat", "cats", "and"]');
  assert.deepEqual(res2.wordDict, ["cat", "cats", "and"]);

  // Comma separated list
  const res3 = parseWordBreak2Input("catsanddog", "cat, cats, and");
  assert.deepEqual(res3.wordDict, ["cat", "cats", "and"]);

  // Object input
  const res4 = parseWordBreak2Input({
    s: "apple",
    wordDict: ["apple"],
  });
  assert.equal(res4.s, "apple");
  assert.deepEqual(res4.wordDict, ["apple"]);

  // Deduplication
  const res5 = parseWordBreak2Input("apple", ["apple", "apple", "pen"]);
  assert.deepEqual(res5.wordDict, ["apple", "pen"]);

  // Case normalization
  const res6 = parseWordBreak2Input("apple", ["APPLE", "pen"]);
  assert.deepEqual(res6.wordDict, ["apple", "pen"]);
});

test("parseWordBreak2Input throws on invalid inputs", () => {
  // Empty s
  assert.throws(() => parseWordBreak2Input("", ["cat"]), /between 1 and 25/);

  // s too long (>25)
  assert.throws(() => parseWordBreak2Input("a".repeat(26), ["cat"]), /between 1 and 25/);

  // Non-letter characters in s
  assert.throws(() => parseWordBreak2Input("cat123", ["cat"]), /lowercase English letters/);
  assert.throws(() => parseWordBreak2Input("cat dog", ["cat"]), /lowercase English letters/);

  // Empty wordDict
  assert.throws(() => parseWordBreak2Input("cat", []), /cannot be empty/);
  assert.throws(() => parseWordBreak2Input("cat", "[]"), /cannot be empty/);

  // Non-array JSON
  assert.throws(() => parseWordBreak2Input("cat", '{"a": 1}'), /must be an array/);

  // Invalid words
  assert.throws(() => parseWordBreak2Input("cat", ["cat", "123"]), /lowercase English letters/);
  assert.throws(() => parseWordBreak2Input("cat", ["cat", ""]), /cannot be empty/);
  assert.throws(() => parseWordBreak2Input(123, ["cat"]), /must be a string/);
});

test("buildWordBreak2Story handles s='catsanddog'", () => {
  const s = "catsanddog";
  const wordDict = ["cat", "cats", "and", "sand", "dog"];
  const story = buildWordBreak2Story(s, wordDict);

  assert.equal(story.s, s);
  assert.deepEqual(story.wordDict, wordDict);

  // Expect ["cat sand dog", "cats and dog"]
  const sortedSentences = [...story.sentences].sort();
  assert.deepEqual(sortedSentences, ["cat sand dog", "cats and dog"]);

  // Verify frames exist and progression is logical
  assert(story.frames.length > 10, "Should have sufficient trace frames");
  assert.equal(story.frames[0].phase, "init");
  assert.equal(story.frames[story.frames.length - 1].phase, "done");

  // Verify memo hit occurred for index 7 ('dog')
  const cacheHitFrames = story.frames.filter((f) => f.phase === "cache_hit");
  assert.equal(cacheHitFrames.length, 1);
  assert.equal(cacheHitFrames[0].start, 7);
});

test("buildWordBreak2Story handles s='pineapplepenapple'", () => {
  const s = "pineapplepenapple";
  const wordDict = ["apple", "pen", "applepen", "pine", "pineapple"];
  const story = buildWordBreak2Story(s, wordDict);

  const sortedExpected = [
    "pine apple pen apple",
    "pine applepen apple",
    "pineapple pen apple",
  ].sort();
  const sortedActual = [...story.sentences].sort();
  assert.deepEqual(sortedActual, sortedExpected);

  // Verify cache hit occurred in pineapple example
  const cacheHitFrames = story.frames.filter((f) => f.phase === "cache_hit");
  assert(cacheHitFrames.length >= 1, "Should have memo cache hits");
});

test("buildWordBreak2Story handles s='catsandog' (no valid sentences)", () => {
  const s = "catsandog";
  const wordDict = ["cats", "dog", "sand", "and", "cat"];
  const story = buildWordBreak2Story(s, wordDict);

  assert.deepEqual(story.sentences, []);
  assert(story.frames.length > 5);

  const finalFrame = story.frames[story.frames.length - 1];
  assert.equal(finalFrame.phase, "done");
  assert.deepEqual(finalFrame.sentences, []);
});

test("buildWordBreak2Story handles single word match", () => {
  const s = "apple";
  const wordDict = ["apple"];
  const story = buildWordBreak2Story(s, wordDict);

  assert.deepEqual(story.sentences, ["apple"]);
  assert(story.frames.some((f) => f.phase === "solution"));
});

test("buildWordBreak2Story frames are immutable snapshots", () => {
  const s = "catsanddog";
  const wordDict = ["cat", "cats", "and", "sand", "dog"];
  const story = buildWordBreak2Story(s, wordDict);

  // Check that early frames do not have full sentences
  assert.equal(story.frames[0].sentences.length, 0);
  assert.equal(story.frames[1].sentences.length, 0);

  // Check memo evolution
  const earlyMemoFrames = story.frames.filter((f) => Object.keys(f.memo).length === 0);
  const lateMemoFrames = story.frames.filter((f) => Object.keys(f.memo).length > 0);
  assert(earlyMemoFrames.length > 0);
  assert(lateMemoFrames.length > 0);

  // Mutating one frame snapshot shouldn't affect another
  const f1 = story.frames[10];
  const memoKeysBefore = Object.keys(f1.memo).length;
  f1.memo[999] = [["fake"]];
  assert.equal(Object.keys(story.frames[11].memo).includes("999"), false);
  delete f1.memo[999];
  assert.equal(Object.keys(f1.memo).length, memoKeysBefore);
});
