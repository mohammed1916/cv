import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import StockStory from "./StockStory";
import { STOCK_CODE, buildStock1Story } from "./algorithm";
import { getExamples } from "../../config/examplesRegistry";
import "./BestTimeBuySellStockVisualizer.css";

const registryExamples = getExamples("best-time-buy-sell-stock") || [];
const EXAMPLES = [
  ...registryExamples.map((ex) => ({
    label: ex.label,
    input: JSON.stringify(ex.prices),
  })),
  { label: "Single day", input: "[5]" },
  { label: "Flat prices", input: "[3, 3, 3, 3]" },
];

const definition = {
  title: "Best Time to Buy and Sell Stock",
  inputLabel: "Stock prices (JSON array or comma-separated)",
  inputType: "string",
  initialInput: "[7, 1, 5, 3, 6, 4]",
  examples: EXAMPLES,
  code: STOCK_CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "scan",
    5: "compare",
    6: "update",
    7: "compare",
    8: "update",
    9: "done",
  },
  patterns: ["init", "scan", "compare", "update", "done"],
  build: (input) => buildStock1Story(input),
  renderStory: ({ story, step }) => <StockStory story={story} step={step} />,
};

export default function BestTimeBuySellStockVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
