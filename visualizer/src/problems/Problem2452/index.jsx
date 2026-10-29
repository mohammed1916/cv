import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2452",
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty result list." },
    { id: "query", label: "Query", description: "Take the next query word in order." },
    { id: "word", label: "Dictionary", description: "Pick a dictionary word to compare with." },
    { id: "reset", label: "Reset", description: "Start the mismatch count." },
    { id: "count", label: "Count", description: "Count the positions where the two words differ." },
    { id: "check", label: "Check", description: "Decide whether at most two letters differ." },
    { id: "record", label: "Record", description: "Keep the query and stop checking its other words." },
    { id: "done", label: "Result", description: "Return the kept queries in their original order." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"queries": ["word","note"], "dictionary": ["wood","joke"]}',
  url: "https://leetcode.com/problems/words-within-two-edits-of-dictionary/",
  complexity: "O(q * d * L) time and O(1) extra space beyond the result, for q queries, d dictionary words and word length L. The visualization caps each list at 50 words of up to 20 letters.",
  examples: [{ label: "Example 1", input: '{"queries":["word","note","ants","wood"],"dictionary":["wood","joke","moat"]}' }],
};

export default function WordsWithinTwoEditsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="queries"
            length={run.input.queries.length}
            active={step.q ?? -1}
            valueAt={index => run.input.queries[index]}
            roleAt={index => (run.result.includes(run.input.queries[index]) && index <= (step.q ?? -1) ? "counted" : "")}
          />
          <IndexedSequence
            label="dictionary"
            length={run.input.dictionary.length}
            active={step.w ?? -1}
            valueAt={index => run.input.dictionary[index]}
          />
          <p>Differing positions for this pair: {step.diff ?? 0}. Kept so far: {step.result.join(", ") || "none"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
