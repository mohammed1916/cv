import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import StockStory2 from "./StockStory2";
import { STOCK_CODE, buildStock2Story } from "./algorithm";
import "./BestTimeToBuyAndSellStockIIVisualizer.css";

const EXAMPLES = getExamples("best-time-to-buy-and-sell-stock-ii");

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
