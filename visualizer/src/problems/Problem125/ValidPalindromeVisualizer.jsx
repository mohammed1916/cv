import authoredExamples0 from '../../config/examples/valid-palindrome.js';
import { palindromeNarrative } from './palindromeNarrative.js';

import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import PalindromeStory from "./PalindromeStory";
import { PALINDROME_CODE, buildPalindromeStory } from "./algorithm";
import "./ValidPalindromeVisualizer.css";

const EXAMPLES = authoredExamples0;

const definition = {
  narrative: palindromeNarrative,
  title: "Valid Palindrome",
  inputLabel: "Input string s",
  inputType: "string",
  initialInput: "A man, a plan, a canal: Panama",
  examples: EXAMPLES,
  code: PALINDROME_CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "loop",
    5: "compare",
    6: "update",
    7: "done",
  },
  patterns: ["init", "loop", "compare", "update", "done"],
  build: (input) => buildPalindromeStory(input),
  renderStory: ({ story, step }) => <PalindromeStory story={story} step={step} />,
};

export default function ValidPalindromeVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
