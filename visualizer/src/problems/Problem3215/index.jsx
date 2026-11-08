import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ParityTallyView from "./ParityTallyView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3215",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arrays a, b and c (e.g. {"a":[1,2],"b":[3],"c":[0,4]})',
  url: "https://leetcode.com/problems/count-triplets-with-even-xor-set-bits-ii/",
  complexity: "O(|a| + |b| + |c|) time and O(1) extra space: each array is tallied once by set-bit parity, then the pair counts combine. The visualization caps each array at 40 values from 0 to 1023.",
  examples: [
    { label: "Mixed small arrays", input: '{"a":[1,2],"b":[3],"c":[0,4]}' },
    { label: "Parity split", input: '{"a":[0,5,6],"b":[7],"c":[1,2]}' },
    { label: "Single choice", input: '{"a":[9],"b":[12],"c":[3]}' },
    { label: 'Single values', input: '{"a":[0],"b":[0],"c":[0]}' },
    { label: 'Equal values in every array', input: '{"a":[512,512],"b":[512],"c":[512,512,512]}' },
    { label: 'Largest value 1023', input: '{"a":[1023],"b":[0,1023],"c":[1023,0,512,1,2,3,4,5]}' },
    { label: 'Long run: 40 values each', input: '{"a":[286,319,1016,259,947,96,535,159,343,100,589,552,292,802,721,953,251,559,732,604,819,513,194,703,120,275,734,178,733,751,349,966,636,451,229,869,650,930,541,303],"b":[990,496,35,802,411,74,544,503,88,99,191,394,464,957,907,281,400,292,932,619,308,745,406,60,508,983,345,889,732,763,282,586,708,65,150,979,234,932,948,93],"c":[149,877,149,464,658,231,640,328,41,995,323,115,134,915,297,538,465,368,800,205,56,639,531,159,764,348,715,277,18,142,398,146,369,512,568,266,552,7,204,559]}' },
  ],
};

export default function CountTripletsEvenXorII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ParityTallyView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
