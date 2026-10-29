import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import StockStory2 from "./StockStory2";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./BestTimeToBuyAndSellStockIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with zero profit." },
    { id: "compare", label: "Compare", description: "Compare today's price with yesterday's." },
    { id: "update", label: "Capture", description: "Add an upward move to the profit." },
    { id: "done", label: "Result", description: "Report the total profit from every rise." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Prices (JSON object, e.g. {\"prices\": [7,1,5,3,6,4]})",
  url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
  complexity: "O(n) time and O(1) space for n prices. The visualization caps the trace at 60 prices.",
  examples: getExamples("best-time-to-buy-and-sell-stock-ii").map(({ label, input }) => ({ label, input: JSON.stringify({ prices: JSON.parse(input) }) })),
};

export default function BestTimeToBuyAndSellStockIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <StockStory2 story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
