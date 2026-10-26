import test from "node:test";
import assert from "node:assert/strict";
import {
  CODE,
  parseWordBreakInput,
  buildWordBreakStory,
} from "./algorithm.js";

test("CODE exports expected python code lines", () => {
  assert.ok(Array.isArray(CODE));
  assert.equal(CODE.length, 10);
  assert.match(CODE[0], /def wordBreak\(s, wordDict\):/);
  assert.match(CODE[1], /words = set\(wordDict\)/);
  assert.match(CODE[2], /dp = \[False\] \* \(len\(s\) \+ 1\)/);
  assert.match(CODE[3], /dp\[0\] = True/);
  assert.match(CODE[4], /for i in range\(1, len\(s\) \+ 1\):/);
  assert.match(CODE[5], /for j in range\(i\):/);
  assert.match(CODE[6], /if dp\[j\] and s\[j:i\] in words:/);
  assert.match(CODE[7], /dp\[i\] = True/);
  assert.match(CODE[8], /break/);
  assert.match(CODE[9], /return dp\[len\(s\)\]/);
});

test("parseWordBreakInput parses valid standard inputs", () => {
  const res1 = parseWordBreakInput("leetcode", ["leet", "code"]);
  assert.equal(res1.s, "leetcode");
  assert.deepEqual(res1.wordDict, ["leet", "code"]);

  const res2 = parseWordBreakInput("ApplePenApple", ["apple", "pen"]);
  assert.equal(res2.s, "applepenapple");
  assert.deepEqual(res2.wordDict, ["apple", "pen"]);

  const res3 = parseWordBreakInput("catsandog", "cats, dog, sand, and, cat");
  assert.equal(res3.s, "catsandog");
  assert.deepEqual(res3.wordDict, ["cats", "dog", "sand", "and", "cat"]);
});

test("parseWordBreakInput handles single-argument strings and objects", () => {
  const resDelim = parseWordBreakInput("leetcode | leet, code");
  assert.equal(resDelim.s, "leetcode");
  assert.deepEqual(resDelim.wordDict, ["leet", "code"]);

  const resSemi = parseWordBreakInput("cars; car, ca, rs");
  assert.equal(resSemi.s, "cars");
  assert.deepEqual(resSemi.wordDict, ["car", "ca", "rs"]);

  const resObj = parseWordBreakInput({
    s: "applepenapple",
    wordDict: ["apple", "pen"],
  });
  assert.equal(resObj.s, "applepenapple");
  assert.deepEqual(resObj.wordDict, ["apple", "pen"]);

  const resJson = parseWordBreakInput(
    JSON.stringify({ s: "catsandog", wordDict: ["cats", "dog"] })
  );
  assert.equal(resJson.s, "catsandog");
  assert.deepEqual(resJson.wordDict, ["cats", "dog"]);
});

test("parseWordBreakInput handles quotes and whitespace stripping", () => {
  const res = parseWordBreakInput('"leetcode"', '["leet", "code"]');
  assert.equal(res.s, "leetcode");
  assert.deepEqual(res.wordDict, ["leet", "code"]);

  const resSingle = parseWordBreakInput("'apple'", "['apple']");
  assert.equal(resSingle.s, "apple");
  assert.deepEqual(resSingle.wordDict, ["apple"]);
});

test("parseWordBreakInput handles boundary lengths and duplicates", () => {
  // Single character length 1
  const res1 = parseWordBreakInput("a", ["a"]);
  assert.equal(res1.s, "a");
  assert.deepEqual(res1.wordDict, ["a"]);

  // Max 50 characters for s
  const s50 = "a".repeat(50);
  const res50 = parseWordBreakInput(s50, ["a"]);
  assert.equal(res50.s, s50);

  // Duplicates in wordDict are preserved in array but allowed
  const resDup = parseWordBreakInput("leet", ["leet", "leet"]);
  assert.deepEqual(resDup.wordDict, ["leet", "leet"]);

  // 50 words in wordDict
  const words50 = Array.from({ length: 50 }, (_, i) => `word${String.fromCharCode(97 + (i % 26))}`);
  const resMaxWords = parseWordBreakInput("test", words50);
  assert.equal(resMaxWords.wordDict.length, 50);
});

test("parseWordBreakInput throws on invalid inputs", () => {
  // Empty or invalid string s
  assert.throws(() => parseWordBreakInput("", ["leet"]), /String s cannot be empty/);
  assert.throws(() => parseWordBreakInput("   ", ["leet"]), /String s cannot be empty/);
  assert.throws(() => parseWordBreakInput(null, ["leet"]), /String s must be a string/);
  assert.throws(() => parseWordBreakInput(undefined, ["leet"]), /String s must be a string/);
  assert.throws(() => parseWordBreakInput(12345, ["leet"]), /String s must be a string/);
  assert.throws(() => parseWordBreakInput([], ["leet"]), /String s must be a string/);

  // String length > 50
  assert.throws(() => parseWordBreakInput("a".repeat(51), ["a"]), /exceeds maximum limit of 50 characters/);

  // Non-letters in string s
  assert.throws(() => parseWordBreakInput("leet123", ["leet"]), /String s must contain English letters only/);
  assert.throws(() => parseWordBreakInput("leet code", ["leet"]), /String s must contain English letters only/);
  assert.throws(() => parseWordBreakInput("leet-code", ["leet"]), /String s must contain English letters only/);

  // Missing or empty wordDict
  assert.throws(() => parseWordBreakInput("leet", null), /wordDict must be provided/);
  assert.throws(() => parseWordBreakInput("leet", undefined), /wordDict must be provided/);
  assert.throws(() => parseWordBreakInput("leet", []), /wordDict cannot be empty/);
  assert.throws(() => parseWordBreakInput("leet", ""), /wordDict cannot be empty/);
  assert.throws(() => parseWordBreakInput("leet", 123), /wordDict must be an array of words or a comma-separated string/);

  // wordDict words with invalid content
  assert.throws(() => parseWordBreakInput("leet", [""]), /Words in wordDict cannot be empty/);
  assert.throws(() => parseWordBreakInput("leet", ["leet123"]), /must contain English letters only/);
  assert.throws(() => parseWordBreakInput("leet", ["a".repeat(51)]), /length exceeds maximum limit of 50 characters/);
  assert.throws(() => parseWordBreakInput("leet", [null]), /Each word in wordDict must be a string/);

  // More than 50 words
  const words51 = Array.from({ length: 51 }, () => "word");
  assert.throws(() => parseWordBreakInput("test", words51), /exceeds maximum limit of 50 words/);
});

test("buildWordBreakStory: Example 1 - s='leetcode', wordDict=['leet','code'] (True)", () => {
  const story = buildWordBreakStory("leetcode", ["leet", "code"]);
  assert.equal(story.s, "leetcode");
  assert.deepEqual(story.wordDict, ["leet", "code"]);
  assert.equal(story.result, true);
  assert.ok(Array.isArray(story.frames));
  assert.ok(story.frames.length > 5);

  const initFrame = story.frames[0];
  assert.equal(initFrame.phase, "init");
  assert.equal(initFrame.dp[0], true);
  assert.equal(initFrame.dp[8], false);

  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.result, true);
  assert.equal(doneFrame.dp[8], true);
  assert.deepEqual(doneFrame.segments, ["leet", "code"]);
});

test("buildWordBreakStory: Example 2 - s='applepenapple', wordDict=['apple','pen'] (True)", () => {
  const story = buildWordBreakStory("applepenapple", ["apple", "pen"]);
  assert.equal(story.result, true);
  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.result, true);
  assert.deepEqual(doneFrame.segments, ["apple", "pen", "apple"]);
});

test("buildWordBreakStory: Example 3 - s='catsandog', wordDict=['cats','dog','sand','and','cat'] (False)", () => {
  const story = buildWordBreakStory("catsandog", [
    "cats",
    "dog",
    "sand",
    "and",
    "cat",
  ]);
  assert.equal(story.result, false);
  const doneFrame = story.frames[story.frames.length - 1];
  assert.equal(doneFrame.phase, "done");
  assert.equal(doneFrame.result, false);
  assert.equal(doneFrame.segments, null);
});

test("buildWordBreakStory: single character edge cases", () => {
  // Single char match
  const storyMatch = buildWordBreakStory("a", ["a"]);
  assert.equal(storyMatch.result, true);
  assert.equal(storyMatch.frames[storyMatch.frames.length - 1].dp[1], true);

  // Single char mismatch
  const storyMismatch = buildWordBreakStory("a", ["b"]);
  assert.equal(storyMismatch.result, false);
  assert.equal(storyMismatch.frames[storyMismatch.frames.length - 1].dp[1], false);
});

test("buildWordBreakStory: multiple valid paths and word reuse", () => {
  // Overlapping prefixes: "cars" with ["car", "ca", "rs"]
  const storyCars = buildWordBreakStory("cars", ["car", "ca", "rs"]);
  assert.equal(storyCars.result, true);

  // Repeated letters: "aaaaaaa" with ["aaaa", "aaa"]
  const storyA = buildWordBreakStory("aaaaaaa", ["aaaa", "aaa"]);
  assert.equal(storyA.result, true);

  // Partial match that cannot finish: "ab" with ["a"]
  const storyPartial = buildWordBreakStory("ab", ["a"]);
  assert.equal(storyPartial.result, false);
});

test("buildWordBreakStory: works with single delimited input", () => {
  const story = buildWordBreakStory("leetcode | leet, code");
  assert.equal(story.s, "leetcode");
  assert.equal(story.result, true);
});

test("buildWordBreakStory: frame immutability and structure", () => {
  const story = buildWordBreakStory("leetcode", ["leet", "code"]);
  const f0 = story.frames[0];
  const f1 = story.frames[1];

  // Modifying f0's dp array shouldn't mutate f1
  f0.dp[0] = false;
  assert.equal(f1.dp[0], true);

  // Verify all frame properties
  for (const frame of story.frames) {
    assert.ok(typeof frame.activeLine === "number");
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10);
    assert.ok(typeof frame.phase === "string");
    assert.ok(["init", "loop", "check", "dp", "done"].includes(frame.phase));
    assert.ok(typeof frame.explanation === "string");
    assert.ok(typeof frame.message === "string");
    assert.ok(Array.isArray(frame.dp));
    assert.equal(frame.dp.length, 9); // "leetcode".length + 1
    assert.ok(Array.isArray(frame.wordDict));
    assert.ok(Array.isArray(frame.relatedLines));
  }
});
