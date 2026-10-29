import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import StockStory3 from "./StockStory3";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./BestTimeBuySellStockIIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start the four running states." },
    { id: "iterate", label: "Scan", description: "Visit each price in order." },
    { id: "buy1", label: "First buy", description: "Update the best cash after the first buy." },
    { id: "sell1", label: "First sell", description: "Update the best profit after one trade." },
    { id: "buy2", label: "Second buy", description: "Update the best cash after the second buy." },
    { id: "sell2", label: "Second sell", description: "Update the best profit after two trades." },
    { id: "done", label: "Result", description: "Report the best profit with at most two trades." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Prices (JSON object, e.g. {\"prices\": [3,3,5,0,0,3,1,4]})",
  url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
  complexity: "O(n) time and O(1) space for n prices. The visualization caps the trace at 60 prices.",
  examples: getExamples("best-time-to-buy-and-sell-stock-iii").map(({ label, input }) => ({ label, input: JSON.stringify({ prices: JSON.parse(input) }) })),
};

export default function BestTimeBuySellStockIIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <StockStory3 story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
