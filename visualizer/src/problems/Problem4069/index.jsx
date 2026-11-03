import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TradeTimelineView from "./TradeTimelineView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4069",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with prices, costs (one fee per holding length) and cooldown',
  url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown-ii/",
  complexity: "O(n^2) time and O(n) space: each sale day scans every earlier buy day. A buy and sale on the same day is never chosen here, because the holding fee is not negative. The visualization caps the timeline at 12 days; the official bounds are not verified in this draft.",
  examples: [
    { label: "Rising prices", input: '{"prices":[1,2,3],"costs":[0,0,0],"cooldown":0}' },
    { label: "Cooldown blocks a second trade", input: '{"prices":[1,5,2,8],"costs":[0,1,0,1],"cooldown":1}' },
    { label: "Fee too high", input: '{"prices":[4,3,2],"costs":[0,5,5],"cooldown":0}' },
  ],
};

export default function Problem4069Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TradeTimelineView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each sale day keeps the best profit so far that finished early enough for a purchase to start, so the cooldown is a single lookback.</p>}
    />
  );
}
