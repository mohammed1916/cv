import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import UncoveredRangesView from "./UncoveredRangesView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2655",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n and ranges (e.g. {"n":12,"ranges":[[3,5],[1,2],[8,8]]})',
  url: "https://leetcode.com/problems/find-maximal-uncovered-ranges/",
  complexity: "O(k log k) time for k covered ranges, dominated by the sort; the sweep itself is O(k). O(k) extra space for the sorted copy and the gap list. The visualization caps n at 30 and ranges at 12 pairs. Ranges are read as inclusive on both ends, and a gap that touches or overlaps another covered range is not reported.",
  examples: [
    { label: "Gap before, between and after", input: '{"n":12,"ranges":[[3,5],[1,2],[8,8]]}' },
    { label: "Fully covered", input: '{"n":6,"ranges":[[0,5]]}' },
    { label: "Overlapping ranges", input: '{"n":8,"ranges":[[4,4],[1,6],[7,7]]}' },
    { label: "Nothing covered", input: '{"n":5,"ranges":[]}' },
  ],
};

export default function FindMaximalUncoveredRanges() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <UncoveredRangesView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>
          {step.message} The cursor only moves forward, so overlapping and adjacent covered ranges merge without a separate step.
        </p>
      )}
    />
  );
}
