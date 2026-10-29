import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LinkedListLane from "../../components/shared/LinkedListLane";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Create an empty skiplist." },
    { id: "add", label: "Add", description: "Insert a value at its sorted position." },
    { id: "search", label: "Search", description: "Check whether a value is present." },
    { id: "erase", label: "Erase", description: "Remove one copy of a value if present." },
    { id: "done", label: "Result", description: "Return the results of every call." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Calls as JSON with operations and args (e.g. {"operations":["add","search"],"args":[1,1]})',
  url: "https://leetcode.com/problems/design-skiplist/",
  complexity: "The real skiplist runs in expected O(log n) per call. The visualization shows the sorted bottom level and accepts up to 40 calls.",
  examples: [
    {
      label: "Add, search, erase",
      input: JSON.stringify({
        operations: ["add", "add", "add", "search", "add", "search", "erase", "erase", "search"],
        args: [1, 2, 3, 0, 4, 1, 0, 1, 1],
      }),
    },
  ],
};

export default function DesignSkiplistWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => {
        const nodes = step.values.map((value, index) => ({ id: `v${index}`, value }));
        const roles = step.touched !== undefined && step.touched >= 0 && step.touched < step.values.length
          ? { [`v${step.touched}`]: "active" }
          : {};
        return <LinkedListLane title="Bottom level (sorted)" nodes={nodes} roles={roles}
          note={`results: ${step.results.map(value => (value === null ? "null" : String(value))).join(", ") || "none yet"}`} />;
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
