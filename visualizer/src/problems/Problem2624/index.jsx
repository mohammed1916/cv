import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SnailGridView from "./SnailGridView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2624",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Snail input (e.g. {"arr":[1,2,3,4,5,6],"rowsCount":2,"colsCount":3})',
  url: "https://leetcode.com/problems/snail-traversal/description/",
  complexity: "O(rowsCount × colsCount) time and output space, one write per array value. The visualization caps the grid at 8 × 8 and the array at 64 values.",
  examples: [
    { label: "3 by 2 snail fill", input: '{"arr":[4,5,6,7,8,9],"rowsCount":3,"colsCount":2}' },
    { label: "One row", input: '{"arr":[1,2,3,4],"rowsCount":1,"colsCount":4}' },
    { label: "One column", input: '{"arr":[1,2,3,4],"rowsCount":4,"colsCount":1}' },
    { label: "Size mismatch", input: '{"arr":[1,2,3],"rowsCount":2,"colsCount":2}' },
    { label: 'Single cell', input: '{"arr":[9],"rowsCount":1,"colsCount":1}' },
    { label: 'Equal values in a two by two grid', input: '{"arr":[3,3,3,3],"rowsCount":2,"colsCount":2}' },
    { label: 'Largest eight by eight grid', input: '{"arr":[-32,-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],"rowsCount":8,"colsCount":8}' },
    { label: 'Long run: seven by eight grid', input: '{"arr":[-875,-896,-252,608,917,601,998,764,924,777,745,80,512,730,75,-803,970,593,-53,-402,54,-830,965,-385,388,-253,-921,-6,-815,585,532,-511,-287,607,-144,147,442,-849,571,-2,371,384,-357,-40,139,-93,-171,107,-972,156,192,728,-728,-467,-167,-801],"rowsCount":7,"colsCount":8}' },
  ],
};

export default function Problem2624Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SnailGridView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result.length === 0 ? "empty list" : `${run.result.length} row${run.result.length === 1 ? "" : "s"}`}.` : ""}
        </p>
      )}
    />
  );
}
