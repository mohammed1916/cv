import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty set of flagged transactions." },
    { id: "scan", label: "Scan", description: "Visit each transaction in order." },
    { id: "check", label: "Amount", description: "Flag transactions whose amount is over 1000." },
    { id: "compare", label: "Compare", description: "Look for a same-name transaction in another city within 60 minutes." },
    { id: "done", label: "Result", description: "Return the flagged transactions." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"transactions": ["alice,20,800,mtv", ...]}',
  url: "https://leetcode.com/problems/invalid-transactions/description/",
  complexity: "O(n^2) time and O(n) space for n transactions. The visualization caps n at 50.",
  examples: [
    { label: "Example 1", input: '{"transactions":["alice,20,800,mtv","alice,50,100,beijing"]}' },
    { label: "Example 2", input: '{"transactions":["alice,20,800,mtv","alice,50,1200,mtv"]}' },
    { label: "Example 3", input: '{"transactions":["alice,20,800,mtv","bob,50,1200,mtv"]}' },
  ],
};

export default function InvalidTransactionsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="Transactions"
          length={run.input.length}
          active={step.i ?? -1}
          valueAt={index => run.input[index]}
          roleAt={index => (step.flagged || []).includes(index) ? "invalid" : index === step.j ? "compared" : ""}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
