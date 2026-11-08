import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import EmptyKeysView from "./EmptyKeysView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2727",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object or array (e.g. {\"a\":null})",
  url: "https://leetcode.com/problems/is-object-empty/",
  complexity: "O(1) time for the count of a list and O(k) time to count k keys of an object. The visualization caps the top level at 12 keys or elements; the page keeps the input small for teaching.",
  examples: [
    { label: "Empty object", input: "{}" },
    { label: "Null value is a key", input: '{"a":null}' },
    { label: "Empty array", input: "[]" },
    { label: 'Single key', input: '{"x":1}' },
    { label: 'Falsy values', input: '{"a":0,"b":false,"c":""}' },
    { label: 'Single null element', input: '[null]' },
    { label: 'Long run: 12 keys', input: '{"k0":null,"k1":7,"k2":null,"k3":9,"k4":null,"k5":1,"k6":null,"k7":3,"k8":null,"k9":5,"k10":null,"k11":7}' },
  ],
};

export default function Problem2727Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <EmptyKeysView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
