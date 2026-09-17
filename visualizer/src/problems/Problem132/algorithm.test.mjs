import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseMinCutInput,
  buildMinCutStory,
} from "./algorithm.js";

test("CODE exports expected python code lines", () => {
  assert.ok(Array.isArray(CODE));
  assert.equal(CODE.length, 15);
  assert.match(CODE[0], /def minCut\(s\):/);
  assert.match(CODE[1], /n = len\(s\)/);
  assert.match(CODE[2], /dp = list\(range\(n\)\)/);
  assert.match(CODE[3], /for mid in range\(n\):/);
  assert.match(CODE[4], /# odd length palindromes/);
  assert.match(CODE[5], /l, r = mid, mid/);
  assert.match(CODE[6], /while l >= 0 and r < n and s\[l\] == s\[r\]:/);
  assert.match(CODE[7], /dp\[r\] = 0 if l == 0 else min\(dp\[r\], dp\[l - 1\] \+ 1\)/);
  assert.match(CODE[8], /l -= 1; r \+= 1/);
  assert.match(CODE[9], /# even length palindromes/);
  assert.match(CODE[10], /l, r = mid, mid \+ 1/);
  assert.match(CODE[11], /while l >= 0 and r < n and s\[l\] == s\[r\]:/);
  assert.match(CODE[12], /dp\[r\] = 0 if l == 0 else min\(dp\[r\], dp\[l - 1\] \+ 1\)/);
  assert.match(CODE[13], /l -= 1; r \+= 1/);
  assert.match(CODE[14], /return dp\[-1\] if n else 0/);
});

test("parseMinCutInput validates valid inputs strictly", () => {
  assert.equal(parseMinCutInput("a"), "a");
  assert.equal(parseMinCutInput("aab"), "aab");
  assert.equal(parseMinCutInput("RaceCar"), "racecar");
  assert.equal(parseMinCutInput('"aab"'), "aab");
  assert.equal(parseMinCutInput("'ab'"), "ab");
  assert.equal(parseMinCutInput({ s: "aab" }), "aab");
  assert.equal(parseMinCutInput({ input: "abacaba" }), "abacaba");

  const exact30 = "a".repeat(30);
  assert.equal(parseMinCutInput(exact30), exact30);
});

test("parseMinCutInput throws on invalid inputs", () => {
  assert.throws(() => parseMinCutInput(""), /String cannot be empty/);
  assert.throws(() => parseMinCutInput("   "), /String cannot be empty/);
  assert.throws(() => parseMinCutInput('""'), /String cannot be empty/);
  assert.throws(() => parseMinCutInput(null), /Input must be a string/);
  assert.throws(() => parseMinCutInput(undefined), /Input must be a string/);
  assert.throws(() => parseMinCutInput(12345), /Input must be a string/);
  assert.throws(() => parseMinCutInput(true), /Input must be a string/);
  assert.throws(() => parseMinCutInput([]), /Input must be a string/);
  assert.throws(() => parseMinCutInput({}), /Input must be a string/);
  assert.throws(() => parseMinCutInput("a".repeat(31)), /exceeds maximum limit of 30 characters/);
  assert.throws(() => parseMinCutInput("a b"), /String must contain English letters only/);
  assert.throws(() => parseMinCutInput("a1b"), /String must contain English letters only/);
  assert.throws(() => parseMinCutInput("a-b!"), /String must contain English letters only/);
});

test("buildMinCutStory for 'aab' gives 1 cut ('aa' | 'b')", () => {
  const story = buildMinCutStory("aab");
  assert.equal(story.s, "aab");
  assert.equal(story.minCuts, 1);
  assert.ok(Array.isArray(story.frames));
  assert.ok(story.frames.length > 5);

  const firstFrame = story.frames[0];
  assert.equal(firstFrame.phase, "init");
  assert.deepEqual(firstFrame.dp, [0, 1, 2]);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.minCuts, 1);
  assert.equal(lastFrame.activeLine, 15);
  assert.deepEqual(lastFrame.dp, [0, 0, 1]);
  assert.deepEqual(lastFrame.partitions[2], ["aa", "b"]);
});

test("buildMinCutStory for single char 'a' gives 0 cuts", () => {
  const story = buildMinCutStory("a");
  assert.equal(story.s, "a");
  assert.equal(story.minCuts, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.minCuts, 0);
  assert.deepEqual(lastFrame.dp, [0]);
  assert.deepEqual(lastFrame.partitions[0], ["a"]);
});

test("buildMinCutStory for 'ab' gives 1 cut ('a' | 'b')", () => {
  const story = buildMinCutStory("ab");
  assert.equal(story.s, "ab");
  assert.equal(story.minCuts, 1);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.minCuts, 1);
  assert.deepEqual(lastFrame.dp, [0, 1]);
  assert.deepEqual(lastFrame.partitions[1], ["a", "b"]);
});

test("buildMinCutStory for 'racecar' gives 0 cuts", () => {
  const story = buildMinCutStory("racecar");
  assert.equal(story.s, "racecar");
  assert.equal(story.minCuts, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.minCuts, 0);
  assert.equal(lastFrame.dp[6], 0);
  assert.deepEqual(lastFrame.partitions[6], ["racecar"]);
});

test("buildMinCutStory for 'abacaba' gives 0 cuts", () => {
  const story = buildMinCutStory("abacaba");
  assert.equal(story.s, "abacaba");
  assert.equal(story.minCuts, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.minCuts, 0);
  assert.equal(lastFrame.dp[6], 0);
  assert.deepEqual(lastFrame.partitions[6], ["abacaba"]);
});

test("buildMinCutStory for 'aabb' gives 1 cut ('aa' | 'bb')", () => {
  const story = buildMinCutStory("aabb");
  assert.equal(story.minCuts, 1);
  const lastFrame = story.frames[story.frames.length - 1];
  assert.deepEqual(lastFrame.partitions[3], ["aa", "bb"]);
});

test("buildMinCutStory for 'aaabbc' gives 2 cuts ('aaa' | 'bb' | 'c')", () => {
  const story = buildMinCutStory("aaabbc");
  assert.equal(story.minCuts, 2);
  const lastFrame = story.frames[story.frames.length - 1];
  assert.deepEqual(lastFrame.partitions[5], ["aaa", "bb", "c"]);
});

test("buildMinCutStory for 'abcde' gives 4 cuts", () => {
  const story = buildMinCutStory("abcde");
  assert.equal(story.minCuts, 4);
});

test("trace frames are immutable and have required metadata", () => {
  const story = buildMinCutStory("aab");
  const f0 = story.frames[0];
  const f1 = story.frames[1];

  // Modifying f0's dp array shouldn't mutate f1
  f0.dp[0] = 999;
  assert.equal(f1.dp[0], 0);

  // Check required frame properties
  for (const frame of story.frames) {
    assert.ok(typeof frame.activeLine === "number");
    assert.ok(typeof frame.phase === "string");
    assert.ok(typeof frame.explanation === "string");
    assert.ok(typeof frame.message === "string");
    assert.ok(Array.isArray(frame.dp));
    assert.ok(Array.isArray(frame.partitions));
    assert.ok(Array.isArray(frame.relatedLines));
  }
});
