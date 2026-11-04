import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BinaryToggleTreeView from "./BinaryToggleTreeView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2445",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n and queries (e.g. {"n":5,"queries":[1,2]})',
  url: "https://leetcode.com/problems/number-of-nodes-with-value-one/description/",
  complexity: "O(n + q) time and O(n) space for n nodes and q queries, using the parent rule 2i and 2i+1. The visualization caps n at 31 and q at 10.",
  examples: [
    { label: "Example", input: '{"n":5,"queries":[1,2]}' },
    { label: "Repeat", input: '{"n":7,"queries":[2,2,3]}' },
  ],
};

export default function NumberNodesValueOne() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BinaryToggleTreeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          A query toggles its subtree. Instead of toggling many nodes, each query marks only its own node. A node's value is then the XOR of marks on itself and its ancestors, which a single top-down pass computes.
          {run ? ` Final answer: ${run.result} node${run.result === 1 ? "" : "s"} with value one.` : ""} {step.message}
        </p>
      )}
    />
  );
}
