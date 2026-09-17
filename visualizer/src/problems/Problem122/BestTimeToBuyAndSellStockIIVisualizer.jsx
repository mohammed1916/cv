import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import StockStory2 from "./StockStory2";
import { STOCK_CODE, buildStock2Story } from "./algorithm";
import "./BestTimeToBuyAndSellStockIIVisualizer.css";

const EXAMPLES = [
  { label: "Example 1 (Peaks & Valleys)", input: "[7, 1, 5, 3, 6, 4]" },
  { label: "Example 2 (Strictly Increasing)", input: "[1, 2, 3, 4, 5]" },
  { label: "Example 3 (Strictly Decreasing)", input: "[7, 6, 4, 3, 1]" },
  { label: "Example 4 (Flat Prices)", input: "[3, 3, 3, 3, 3]" },
  { label: "Example 5 (Single Peak)", input: "[2, 4, 1]" },
  { label: "Example 6 (Multiple Swings)", input: "[2, 1, 4, 5, 2, 9, 7]" },
];

const definition = {
  title: "Best Time to Buy and Sell Stock II",
  inputLabel: "Stock prices (JSON array or comma-separated)",
  inputType: "string",
  initialInput: "[7, 1, 5, 3, 6, 4]",
  examples: EXAMPLES,
  code: STOCK_CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "init",
    3: "loop",
    4: "compare",
    5: "update",
    6: "done",
  },
  patterns: ["init", "loop", "compare", "update", "done"],
  build: (input) => buildStock2Story(input),
  renderStory: ({ story, step, stepIndex }) => (
    <StockStory2 story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function BestTimeToBuyAndSellStockIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
