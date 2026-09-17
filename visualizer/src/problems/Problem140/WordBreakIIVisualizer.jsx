import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import WordBreak2Story from "./WordBreak2Story";
import { CODE, buildWordBreak2Story } from "./algorithm";
import "./WordBreakIIVisualizer.css";

const EXAMPLES = [
  {
    label: "catsanddog (cats and dog)",
    values: {
      s: "catsanddog",
      wordDict: '["cat", "cats", "and", "sand", "dog"]',
    },
  },
  {
    label: "pineapplepenapple (multi-splits)",
    values: {
      s: "pineapplepenapple",
      wordDict: '["apple", "pen", "applepen", "pine", "pineapple"]',
    },
  },
  {
    label: "catsandog (no sentences)",
    values: {
      s: "catsandog",
      wordDict: '["cats", "dog", "sand", "and", "cat"]',
    },
  },
  {
    label: "apple (single word)",
    values: {
      s: "apple",
      wordDict: '["apple"]',
    },
  },
];

const definition = {
  title: "Word Break II",
  fields: [
    { key: "s", label: "s", type: "string" },
    { key: "wordDict", label: "wordDict", type: "string" },
  ],
  initialValues: {
    s: "catsanddog",
    wordDict: '["cat", "cats", "and", "sand", "dog"]',
  },
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "init",
    3: "init",
    4: "init",
    5: "cache_hit",
    6: "solution",
    7: "init",
    8: "candidate_loop",
    9: "check",
    10: "check",
    11: "recursive_search",
    12: "merge",
    13: "memo",
    14: "merge",
    15: "solution",
    16: "done",
  },
  patterns: [
    "init",
    "candidate_loop",
    "check",
    "recursive_search",
    "cache_hit",
    "solution",
    "memo",
    "merge",
    "done",
  ],
  build: (inputs) => buildWordBreak2Story(inputs.s, inputs.wordDict),
  renderStory: ({ story, step }) => <WordBreak2Story story={story} step={step} />,
};

export default function WordBreakIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
