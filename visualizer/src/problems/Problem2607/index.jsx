import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2607",
  phases: [
    { id: "setup", label: "Setup", description: "Compute n and g = gcd(n, k), the number of cycles." },
    { id: "loop", label: "Cycle", description: "Choose the next cycle start." },
    { id: "gather", label: "Gather", description: "Collect and sort the values of this cycle." },
    { id: "median", label: "Median", description: "Choose the median as the target value." },
    { id: "add", label: "Cost", description: "Add the cost of moving the cycle to its target." },
    { id: "done", label: "Result", description: "Report the total number of operations." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with arr and k (e.g. {"arr": [1, 4, 1, 3], "k": 2})',
  url: "https://leetcode.com/problems/make-k-subarray-sums-equal/",
  complexity: "O(n log n) time and O(n) space for n = arr.length. The visualization caps arr at 200 values.",
  examples: [
    { label: "[1,4,1,3], k=2", input: '{"arr": [1, 4, 1, 3], "k": 2}' },
    { label: "[2,5,5,7], k=3", input: '{"arr": [2, 5, 5, 7], "k": 3}' },
    { label: 'Single value', input: '{"arr":[5],"k":1}' },
    { label: 'Equal values', input: '{"arr":[3,3,3,3],"k":2}' },
    { label: 'Largest values at the limit', input: '{"arr":[1000000000,1,1000000000,1],"k":4}' },
    { label: 'Long run: 200 values', input: '{"arr":[58353603,192374842,667900997,728137940,700592663,882813566,245968825,218214328,127298475,503325442,832491117,184220380,250161279,175353286,92650593,684356160,212350611,32490698,406172053,70328804,810131943,592671246,993336841,831598024,293245051,287499666,842700733,620169196,178053199,3579222,971133617,829717584,119513443,39267674,59494629,996699892,997643191,558414750,976619609,300080088,678096203,487618594,857254669,394940156,289614367,611201254,199783169,953759328,575125043,677401066,221372981,118246916,702355335,762759982,83874985,23257576,662726171,970785458,130943069,692830732,842208239,564381302,26732369,847562864,40386307,410316410,364652933,775870740,913537879,917938366,258855673,840739832,661077739,433113410,879051693,37097756,618265535,546625542,459283361,23923328,722011603,885892362,708862677,488682020,595390759,586648654,318022985,415682056,545052091,340808146,324571901,83556396,4879759,709932438,16150001,100883088,471955107,877543322,37226533,222436660,651541751,72812510,407822233,683089944,724104331,230988898,335345229,68884796,778435423,860515622,659569729,365134496,277071731,290073130,269038453,183134788,644903623,67689838,936794601,938385960,634904411,127607538,176306077,194157644,529497903,694853814,432448145,630389936,863876163,690692282,571643077,855259988,582302359,360765182,32852537,105844792,756161579,482531202,441593581,778183516,627310847,330708038,30732513,736013504,73105683,609838922,932809237,90345572,699105383,960699534,885457033,481865288,278154491,476363282,216859709,936005740,119522511,787811798,620425521,175194832,169511907,777228762,387809125,965344628,358947895,396151326,972696793,233602136,707490251,434362530,306348429,552370556,747010207,44051814,884795265,298613472,626489011,832741482,771660981,756098180,953459207,66924462,928629033,257335912,61798043,767525682,280105693,140097164,203345007,41321718,186683345,57710832,730832771,447372538,356273669,500737940,96956375,839756606,65325945,741875832],"k":60}' },
  ],
};

export default function MakeKSubarraySumsEqualVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="Circular array"
          length={step.arr.length}
          active={step.start === null ? -1 : step.cycleIndices[0] ?? -1}
          valueAt={(index) => step.arr[index]}
          roleAt={(index) => (step.cycleIndices.includes(index) ? `cycle ${step.start}` : "")}
        />
      )}
      renderReasoning={({ step }) => <>
        <p>{step.message}</p>
        {step.cycleValues && step.cycleValues.length > 0 && <p aria-label="Sorted cycle with median">
          Sorted cycle: [{[...step.cycleValues].sort((a, b) => a - b).map((v, i, all) => i === Math.floor(all.length / 2) ? `(${v})` : String(v)).join(', ')}]. The median, in brackets, is the target.
        </p>}
      </>}
    />
  );
}
