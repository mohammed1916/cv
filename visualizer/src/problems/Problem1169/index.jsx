import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1169",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"transactions": ["name,time,amount,city", ...]}',
  url: "https://leetcode.com/problems/invalid-transactions/description/",
  complexity: "O(n^2) time and O(n) space for n transactions. The visualization caps n at 50.",
  examples: [
    { label: "Large amount", input: '{"transactions":["mia,5,1500,oslo","mia,900,20,oslo"]}' },
    { label: "Close trips", input: '{"transactions":["ren,10,300,kyoto","ren,40,200,kyoto","ren,100,400,lima"]}' },
    { label: "Same city", input: '{"transactions":["sam,0,90,nara","sam,30,90,nara"]}' },
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
          active={step.snapshot.i ?? -1}
          valueAt={index => run.input[index]}
          roleAt={index => (step.snapshot.flagged || []).includes(index) ? "invalid" : index === step.snapshot.j ? "compared" : ""}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
