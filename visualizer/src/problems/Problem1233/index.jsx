import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "sort", label: "Sort", description: "Order the paths so each parent comes before its sub-folders." },
    { id: "scan", label: "Visit", description: "Look at the next path in sorted order." },
    { id: "check", label: "Check parent", description: "Test whether the path lies under the last kept folder." },
    { id: "keep", label: "Keep", description: "The path is not covered, so it stays in the answer." },
    { id: "done", label: "Result", description: "Return the kept folders." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Folder paths (e.g. {"folder":["/a","/a/b","/c/d","/c/d/e","/c/f"]})',
  url: "https://leetcode.com/problems/remove-sub-folders-from-the-filesystem/",
  complexity: "O(n log n) time for sorting plus the total path length, and O(n) extra space. The visualization accepts up to 64 paths.",
  examples: [
    { label: "Nested folders", input: JSON.stringify({ folder: ["/a", "/a/b", "/c/d", "/c/d/e", "/c/f"] }) },
    { label: "Prefix is not a parent", input: JSON.stringify({ folder: ["/a/b/c", "/a/b/ca", "/a/b/d"] }) },
  ],
};

export default function RemoveSubfoldersWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <IndexedSequence label="Sorted folder paths" length={step.ordered.length}
        active={step.index}
        valueAt={index => step.ordered[index]}
        roleAt={index => {
          const processed = step.index >= 0 ? index <= step.index : step.phase === "done";
          if (!processed) return "pending";
          return step.kept.includes(step.ordered[index]) ? "kept" : "removed";
        }} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
