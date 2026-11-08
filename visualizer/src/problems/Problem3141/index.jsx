import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HammingPairView from "./HammingPairView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Read", description: "Read the numbers as m-bit strings." },
  { id: "row", label: "Row", description: "Choose the number to find a partner for." },
  { id: "pair", label: "Compare", description: "XOR the pair and count the differing bits." },
  { id: "improve", label: "Improve", description: "This partner is farther than any before." },
  { id: "store", label: "Store", description: "Save the best distance for this number." },
  { id: "done", label: "Result", description: "Report every answer." },
];

const definition = {
  number: "3141",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and m (e.g. {"nums":[1,2,3],"m":2})',
  url: "https://leetcode.com/problems/maximum-hamming-distances/",
  complexity: "O(n² × m) time with the pair scan, O(n) extra space for the answers. The visualization accepts up to 10 numbers and m up to 10; the bounds shown are this visualization's own limits, and a faster solution is not traced.",
  examples: [
    { label: "Three numbers", input: '{"nums":[2,5,9,12],"m":4}' },
    { label: "Repeated values", input: '{"nums":[7,0,7],"m":3}' },
    { label: "Single number", input: '{"nums":[4],"m":3}' },
    { label: "Single number", input: "{\"nums\":[5],\"m\":3}" },
    { label: "One bit values", input: "{\"nums\":[0,1,1],\"m\":1}" },
    { label: "Largest m, ten bits", input: "{\"nums\":[1023,0,512,1023,0],\"m\":10}" },
    { label: "Long run: 10 numbers", input: "{\"nums\":[512,512,512,512,512,512,512,512,512,512],\"m\":10}" },
  ],
};

export default function MaximumHammingDistancesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HammingPairView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          For each number, the scan keeps the largest count of differing bits against every other number. The answers for this input are [{run.result.join(", ")}].
        </p>
      )}
    />
  );
}
