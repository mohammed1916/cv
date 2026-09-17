import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parsePartitionInput,
  isPalindrome,
  buildPartitionStory,
} from "./algorithm.js";

test("CODE exports expected lines matching backtracking solution", () => {
  assert.ok(Array.isArray(CODE));
  assert.equal(CODE.length, 12);
  assert.match(CODE[0], /def partition\(s\):/);
  assert.match(CODE[1], /result = \[\]/);
  assert.match(CODE[2], /def backtrack\(start, path\):/);
  assert.match(CODE[3], /if start == len\(s\):/);
  assert.match(CODE[4], /result\.append\(path\[:\]\)/);
  assert.match(CODE[5], /return/);
  assert.match(CODE[6], /for end in range\(start \+ 1, len\(s\) \+ 1\):/);
  assert.match(CODE[7], /sub = s\[start:end\]/);
  assert.match(CODE[8], /if sub == sub\[::-1\]:/);
  assert.match(CODE[9], /backtrack\(end, path \+ \[sub\]\)/);
  assert.match(CODE[10], /backtrack\(0, \[\]\)/);
  assert.match(CODE[11], /return result/);
});

test("isPalindrome correctly checks strings", () => {
  assert.equal(isPalindrome(""), true);
  assert.equal(isPalindrome("a"), true);
  assert.equal(isPalindrome("aa"), true);
  assert.equal(isPalindrome("aba"), true);
  assert.equal(isPalindrome("racecar"), true);
  assert.equal(isPalindrome("ab"), false);
  assert.equal(isPalindrome("abc"), false);
  assert.equal(isPalindrome("aab"), false);
});

test("parsePartitionInput validates strictly", () => {
  // Valid strings
  assert.equal(parsePartitionInput("aab"), "aab");
  assert.equal(parsePartitionInput("a"), "a");
  assert.equal(parsePartitionInput("racecar"), "racecar");
  assert.equal(parsePartitionInput({ s: "aab" }), "aab");

  const exact16 = "a".repeat(16);
  assert.equal(parsePartitionInput(exact16), exact16);

  // Invalid types
  assert.throws(() => parsePartitionInput(null), /Input must be a string/);
  assert.throws(() => parsePartitionInput(undefined), /Input must be a string/);
  assert.throws(() => parsePartitionInput(123), /Input must be a string/);
  assert.throws(() => parsePartitionInput(true), /Input must be a string/);
  assert.throws(() => parsePartitionInput([]), /Input must be a string/);
  assert.throws(() => parsePartitionInput({ foo: "bar" }), /Input must be a string/);

  // Invalid lengths
  assert.throws(() => parsePartitionInput(""), /between 1 and 16 characters/);
  assert.throws(() => parsePartitionInput("a".repeat(17)), /between 1 and 16 characters/);
});

test("standard example 'aab' produces correct partitions", () => {
  const story = buildPartitionStory("aab");
  assert.equal(story.s, "aab");
  assert.deepEqual(story.partitions, [
    ["a", "a", "b"],
    ["aa", "b"],
  ]);
});

test("single-character string 'a' produces [['a']]", () => {
  const story = buildPartitionStory("a");
  assert.equal(story.s, "a");
  assert.deepEqual(story.partitions, [["a"]]);

  const completeFrame = story.frames.find((f) => f.phase === "complete");
  assert.ok(completeFrame);
  assert.deepEqual(completeFrame.path, ["a"]);
  assert.deepEqual(completeFrame.partitions, [["a"]]);
});

test("palindrome string 'racecar' produces all 4 palindrome partitions", () => {
  const story = buildPartitionStory("racecar");
  assert.equal(story.s, "racecar");
  assert.deepEqual(story.partitions, [
    ["r", "a", "c", "e", "c", "a", "r"],
    ["r", "a", "cec", "a", "r"],
    ["r", "aceca", "r"],
    ["racecar"],
  ]);
});

test("strings with no multi-char palindromes produce only single-character cuts", () => {
  const storyAbc = buildPartitionStory("abc");
  assert.deepEqual(storyAbc.partitions, [["a", "b", "c"]]);

  const storyXyz = buildPartitionStory("xyz");
  assert.deepEqual(storyXyz.partitions, [["x", "y", "z"]]);
});

test("strings with duplicate characters like 'aaa' produce all combinations", () => {
  const story = buildPartitionStory("aaa");
  assert.deepEqual(story.partitions, [
    ["a", "a", "a"],
    ["a", "aa"],
    ["aa", "a"],
    ["aaa"],
  ]);
});

test("strings with even-length palindromes like 'abba' produce correct partitions", () => {
  const story = buildPartitionStory("abba");
  assert.deepEqual(story.partitions, [
    ["a", "b", "b", "a"],
    ["a", "bb", "a"],
    ["abba"],
  ]);
});

test("frames are immutable and correctly snapshot backtracking state evolution", () => {
  const story = buildPartitionStory("aab");
  assert.ok(story.frames.length > 5);

  // Check initial frame
  const f0 = story.frames[0];
  assert.equal(f0.activeLine, 2);
  assert.equal(f0.phase, "init");
  assert.deepEqual(f0.path, []);
  assert.deepEqual(f0.partitions, []);

  // Check second frame (call backtrack)
  const f1 = story.frames[1];
  assert.equal(f1.activeLine, 11);
  assert.equal(f1.phase, "init");

  // Check an inspect frame
  const inspectFrame = story.frames.find((f) => f.phase === "inspect" && f.candidate === "aa");
  assert.ok(inspectFrame);
  assert.equal(inspectFrame.activeLine, 8);
  assert.equal(inspectFrame.start, 0);
  assert.equal(inspectFrame.end, 2);
  assert.deepEqual(inspectFrame.path, []);

  // Check a validate frame
  const validateFrame = story.frames.find((f) => f.phase === "validate" && f.candidate === "aa");
  assert.ok(validateFrame);
  assert.equal(validateFrame.activeLine, 9);
  assert.equal(validateFrame.isPalindrome, true);

  // Check a complete frame
  const completeFrame = story.frames.find((f) => f.phase === "complete");
  assert.ok(completeFrame);
  assert.equal(completeFrame.activeLine, 5);
  assert.deepEqual(completeFrame.path, ["a", "a", "b"]);
  assert.deepEqual(completeFrame.partitions, [["a", "a", "b"]]);

  // Check a backtrack frame
  const backtrackFrame = story.frames.find((f) => f.phase === "backtrack");
  assert.ok(backtrackFrame);

  // Check terminal frame
  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.activeLine, 12);
  assert.deepEqual(lastFrame.partitions, story.partitions);

  // Verify immutability: mutating arrays cannot affect earlier snapshots
  assert.deepEqual(f0.path, []);
  assert.deepEqual(f0.partitions, []);
  assert.deepEqual(f1.path, []);
});
