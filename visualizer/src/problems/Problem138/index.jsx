import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import CopyRandomStory from "./CopyRandomStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./CopyListRandomVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Build the list of original nodes." },
    { id: "interleave", label: "Interleave", description: "Insert a copy after each original node." },
    { id: "random", label: "Random", description: "Point each copy's random pointer at the matching copy." },
    { id: "decouple", label: "Decouple", description: "Split the interleaved list back apart." },
    { id: "copy", label: "Copy", description: "Create a copy node." },
    { id: "link", label: "Link", description: "Link the copy's pointers." },
    { id: "done", label: "Result", description: "Return the copied list." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Pairs (JSON object, e.g. {\"pairs\": [[7,null],[13,0]]})",
  url: "https://leetcode.com/problems/copy-list-with-random-pointer/",
  complexity: "O(n) time and O(1) extra space for n nodes, excluding the copy. The visualization caps the list at 30 nodes.",
  examples: getExamples("copy-list-with-random-pointer").map(({ label, nodes }) => ({ label, input: JSON.stringify({ pairs: nodes.map(node => [node.val, node.random ?? null]) }) })),
};

export default function CopyListRandomVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <CopyRandomStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
