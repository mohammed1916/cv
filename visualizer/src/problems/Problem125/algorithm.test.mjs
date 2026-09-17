import test from "node:test";
import assert from "node:assert/strict";
import {
  PALINDROME_CODE,
  parsePalindromeInput,
  buildPalindromeStory,
} from "./algorithm.js";

test("PALINDROME_CODE exports expected lines", () => {
  assert.ok(Array.isArray(PALINDROME_CODE));
  assert.equal(PALINDROME_CODE.length, 7);
  assert.match(PALINDROME_CODE[0], /def isPalindrome\(s\):/);
  assert.match(PALINDROME_CODE[1], /join.*isalnum/);
  assert.match(PALINDROME_CODE[2], /l, r = 0, len\(s\) - 1/);
  assert.match(PALINDROME_CODE[3], /while l < r:/);
  assert.match(PALINDROME_CODE[4], /if s\[l\] != s\[r\]: return False/);
  assert.match(PALINDROME_CODE[5], /l \+= 1; r -= 1/);
  assert.match(PALINDROME_CODE[6], /return True/);
});

test("parsePalindromeInput validates strictly", () => {
  // Invalid types
  assert.throws(() => parsePalindromeInput(null), /Input must be a string/);
  assert.throws(() => parsePalindromeInput(undefined), /Input must be a string/);
  assert.throws(() => parsePalindromeInput(123), /Input must be a string/);
  assert.throws(() => parsePalindromeInput({}), /Input must be a string/);
  assert.throws(() => parsePalindromeInput([]), /Input must be a string/);

  // Length limits: <= 200 chars allowed
  const exact200 = "a".repeat(200);
  assert.equal(parsePalindromeInput(exact200), exact200);

  const over200 = "a".repeat(201);
  assert.throws(() => parsePalindromeInput(over200), /Input string exceeds maximum length/);

  // Valid inputs
  assert.equal(parsePalindromeInput(""), "");
  assert.equal(parsePalindromeInput(" "), " ");
  assert.equal(parsePalindromeInput("abc"), "abc");
});

test("standard example 'A man, a plan, a canal: Panama' is valid palindrome", () => {
  const story = buildPalindromeStory("A man, a plan, a canal: Panama");
  assert.equal(story.isValid, true);
  assert.equal(story.cleaned, "amanaplanacanalpanama");
  assert.equal(story.mapping.length, 21);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.result, true);
  assert.equal(lastFrame.activeLine, 7);
});

test("example 'race a car' detects mismatch and returns false", () => {
  const story = buildPalindromeStory("race a car");
  assert.equal(story.isValid, false);
  assert.equal(story.cleaned, "raceacar");

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "compare");
  assert.equal(lastFrame.result, false);
  assert.equal(lastFrame.activeLine, 5);
  assert.ok(lastFrame.comparing);
  assert.equal(lastFrame.comparing.match, false);
  assert.equal(lastFrame.comparing.leftChar, "e");
  assert.equal(lastFrame.comparing.rightChar, "a");
  assert.equal(lastFrame.comparing.l, 3);
  assert.equal(lastFrame.comparing.r, 4);
});

test("whitespace string ' ' evaluates to true", () => {
  const story = buildPalindromeStory(" ");
  assert.equal(story.isValid, true);
  assert.equal(story.cleaned, "");
  assert.equal(story.mapping.length, 0);

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.result, true);
  assert.equal(lastFrame.activeLine, 7);
});

test("alphanumeric mismatch '0P' evaluates to false", () => {
  const story = buildPalindromeStory("0P");
  assert.equal(story.isValid, false);
  assert.equal(story.cleaned, "0p");

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "compare");
  assert.equal(lastFrame.result, false);
  assert.equal(lastFrame.activeLine, 5);
  assert.deepEqual(lastFrame.comparing, {
    l: 0,
    r: 1,
    leftChar: "0",
    rightChar: "p",
    match: false,
  });
});

test("special characters only string evaluates to true", () => {
  const story = buildPalindromeStory(".,;:!? -_ #@$%^&*()");
  assert.equal(story.isValid, true);
  assert.equal(story.cleaned, "");

  const lastFrame = story.frames[story.frames.length - 1];
  assert.equal(lastFrame.phase, "done");
  assert.equal(lastFrame.result, true);
});

test("single char strings evaluate to true", () => {
  for (const s of ["a", "Z", "9", " .b. "]) {
    const story = buildPalindromeStory(s);
    assert.equal(story.isValid, true);
    assert.equal(story.frames[story.frames.length - 1].result, true);
  }
});

test("raw position mapping accurately maps original character indices", () => {
  const story = buildPalindromeStory("a # b C");
  // 'a' at 0 -> clean 0
  // ' ' at 1 -> skipped
  // '#' at 2 -> skipped
  // ' ' at 3 -> skipped
  // 'b' at 4 -> clean 1
  // ' ' at 5 -> skipped
  // 'C' at 6 -> clean 2 ('c')
  assert.equal(story.cleaned, "abc");
  assert.equal(story.mapping.length, 3);
  assert.deepEqual(story.mapping[0], {
    cleanIndex: 0,
    rawIndex: 0,
    rawChar: "a",
    cleanChar: "a",
  });
  assert.deepEqual(story.mapping[1], {
    cleanIndex: 1,
    rawIndex: 4,
    rawChar: "b",
    cleanChar: "b",
  });
  assert.deepEqual(story.mapping[2], {
    cleanIndex: 2,
    rawIndex: 6,
    rawChar: "C",
    cleanChar: "c",
  });
});

test("frames are immutable and correctly snapshot pointer evolution", () => {
  const story = buildPalindromeStory("aba");
  assert.ok(story.frames.length >= 4);

  // Check filter frame
  const f0 = story.frames[0];
  assert.equal(f0.activeLine, 2);
  assert.equal(f0.phase, "init");
  assert.equal(f0.cleaned, "aba");

  // Check init pointer frame
  const f1 = story.frames[1];
  assert.equal(f1.activeLine, 3);
  assert.equal(f1.phase, "init");
  assert.equal(f1.l, 0);
  assert.equal(f1.r, 2);

  // Check comparison frame
  const f2 = story.frames[2];
  assert.equal(f2.activeLine, 5);
  assert.equal(f2.phase, "compare");
  assert.equal(f2.comparing.match, true);
  assert.equal(f2.comparing.leftChar, "a");
  assert.equal(f2.comparing.rightChar, "a");

  // Check update frame
  const f3 = story.frames[3];
  assert.equal(f3.activeLine, 6);
  assert.equal(f3.phase, "update");
  assert.equal(f3.l, 1);
  assert.equal(f3.r, 1);

  // Ensure modifying later array does not affect earlier snapshots
  assert.deepEqual(f0.matchedIndices, []);
  assert.deepEqual(f1.matchedIndices, []);
});
