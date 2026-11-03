import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LinkedListLane from "../../components/shared/LinkedListLane";
import { meta } from "./meta";
import { code, python, pythonLineMap, phases, inputLabel, complexity, examples, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity,
  examples,
};

export default function DesignSkiplistWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => {
        const nodes = step.snapshot.values.map((value, index) => ({ id: `v${index}`, value }));
        const roles = step.touched !== undefined && step.touched >= 0 && step.touched < nodes.length
          ? { [`v${step.touched}`]: "active" }
          : {};
        return <LinkedListLane title="Bottom level (sorted)" nodes={nodes} roles={roles}
          note={`results: ${step.snapshot.results.map(value => (value === null ? "null" : String(value))).join(", ") || "none yet"}`} />;
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
