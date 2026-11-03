import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BoxSuffixView from "./BoxSuffixView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3406",
  phases: [
    { id: "start", label: "Starts", description: "Place candidate starts i and j." },
    { id: "single", label: "One friend", description: "The whole word is the only part." },
    { id: "match", label: "Shared run", description: "The two candidates agree; extend the run." },
    { id: "jump", label: "Jump i", description: "The start at i loses; move past the run." },
    { id: "skip", label: "Skip j", description: "The start at j loses; move past its run." },
    { id: "slice", label: "Trim", description: "Keep the allowed length from the best start." },
    { id: "done", label: "Result", description: "Report the largest box string." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with word and numFriends (e.g. {"word":"dbca","numFriends":2})',
  url: "https://leetcode.com/problems/find-the-lexicographically-largest-string-from-the-box-ii/",
  complexity: "O(n) time and O(1) extra space: the two candidate starts only move forward. Every part from every split has length at most n - numFriends + 1 once the best suffix is trimmed. The visualization caps word at 12 letters.",
  examples: [
    { label: "Two friends", input: '{"word":"dbca","numFriends":2}' },
    { label: "Repeated letters", input: '{"word":"gggg","numFriends":2}' },
    { label: "One friend", input: '{"word":"zyxzw","numFriends":1}' },
  ],
};

export default function Problem3406Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BoxSuffixView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.phase === "done"
            ? `The largest box string is ${run.result}.`
            : "The largest part always begins at the largest suffix, so the search only needs to compare two starts at a time and discard the loser."}
        </p>
      )}
    />
  );
}
