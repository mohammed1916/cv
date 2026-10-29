import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import StockStory from "./StockStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./BestTimeBuySellStockVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with the first price as the lowest buy and zero profit." },
    { id: "scan", label: "Scan", description: "Visit each later day in order." },
    { id: "compare", label: "Compare", description: "Compare the price with the lowest buy so far." },
    { id: "update", label: "Update", description: "Record a new lowest buy or a better profit." },
    { id: "done", label: "Result", description: "Report the best single-trade profit." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Prices (JSON object, e.g. {\"prices\": [7,1,5,3,6,4]})",
  url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  complexity: "O(n) time and O(1) space for n prices. The visualization caps the trace at 60 prices.",
  examples: getExamples("best-time-to-buy-and-sell-stock").map(({ label, prices }) => ({ label, input: JSON.stringify({ prices }) })),
};

export default function BestTimeBuySellStockVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <StockStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
