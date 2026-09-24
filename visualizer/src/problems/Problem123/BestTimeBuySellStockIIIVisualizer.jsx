import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import StockStory3 from "./StockStory3";
import { STOCK_CODE, buildStock3Story } from "./algorithm";
import "./BestTimeBuySellStockIIIVisualizer.css";

const EXAMPLES = getExamples("best-time-to-buy-and-sell-stock-iii");

const definition = {
  title: "Best Time to Buy and Sell Stock III",
  inputLabel: "Stock Prices (array)",
  inputType: "string",
  initialInput: "[3, 3, 5, 0, 0, 3, 1, 4]",
  examples: EXAMPLES,
  code: STOCK_CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "init",
    3: "init",
    4: "iterate",
    5: "buy1",
    6: "sell1",
    7: "buy2",
    8: "sell2",
    9: "done",
  },
  patterns: ["init", "iterate", "buy1", "sell1", "buy2", "sell2", "done"],
  build: (input) => buildStock3Story(input),
  renderStory: ({ story, step }) => <StockStory3 story={story} step={step} />,
};

export default function BestTimeBuySellStockIIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
