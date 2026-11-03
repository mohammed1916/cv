import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import RoadRunsView from "./RoadRunsView";

const definition = {
  number: "3119",
  phases: [
    { id: "start", label: "Setup", description: "List the runs of potholes." },
    { id: "full", label: "Whole run", description: "Fix the whole run." },
    { id: "partial", label: "Partial run", description: "Fix part of the next run." },
    { id: "stop", label: "Stop", description: "No longer run fits." },
    { id: "done", label: "Result", description: "Report the total fixed." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with road and budget",
  url: "https://leetcode.com/problems/maximum-number-of-potholes-that-can-be-fixed/",
  complexity: "O(r log r) time for r runs, dominated by sorting the runs by length, and O(r) extra space. The visualization caps the road at 24 characters and the budget at 60.",
  examples: [
    { label: "Two runs fixed", input: "{\"road\":\"xx.xxxx.x\",\"budget\":5}" },
    { label: "Partial last run", input: "{\"road\":\"xxxxx.xxx\",\"budget\":7}" },
    { label: "Nothing affordable", input: "{\"road\":\"xxx\",\"budget\":3}" },
  ],
};

export default function Problem3119Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoadRunsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
