import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2828",
  phases: [
    { id: "length", label: "Length", description: "Compare the word count with the length of s." },
    { id: "scan", label: "Scan", description: "Visit each word in order." },
    { id: "compare", label: "Compare", description: "Compare the first letter with s." },
    { id: "result", label: "Result", description: "Report the answer." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "words and s (e.g. {\"words\": [\"alice\",\"bob\",\"charlie\"], \"s\": \"abc\"})",
  url: "https://leetcode.com/problems/check-if-a-string-is-an-acronym-of-words/",
  complexity: "O(n) time and O(1) extra space, where n is the number of words.",
  examples: [
    { label: "Example 1", input: "{\"words\": [\"alice\", \"bob\", \"charlie\"], \"s\": \"abc\"}" },
    { label: "Example 2", input: "{\"words\": [\"an\", \"apple\"], \"s\": \"a\"}" },
    { label: "Example 3", input: "{\"words\": [\"never\", \"gonna\", \"give\", \"up\", \"on\", \"you\"], \"s\": \"ngguoy\"}" },
  ],
};

const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)" };

// Each word's first letter lined up against the matching letter of s.
function PairTable({ words, s, step }) {
  const rows = words.map((word, i) => ({ word, first: word[0], target: s[i] ?? "-", state: step.roles?.[i] ?? "" }));
  return <table aria-label="Word first letters against s" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead><tr>{["index", "word", "first letter", "s letter", "match"].map(h => <th key={h} scope="col" style={{ ...cell, textAlign: "left", borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} data-current={step.active === i} style={{ background: step.active === i ? "var(--surface2)" : "transparent" }}>
      <td style={cell}>{i}</td><td style={cell}>{r.word}</td><td style={cell}><strong>{r.first}</strong></td><td style={cell}><strong>{r.target}</strong></td>
      <td style={cell}>{r.state === "mismatch" ? "no" : r.state === "match" ? "yes" : step.active === i ? "checking" : "-"}</td>
    </tr>)}</tbody>
  </table>
}

export default function Problem2828Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="words"
            length={step.values.length}
            valueAt={i => String(step.values[i])}
            active={step.active ?? -1}
            roleAt={i => step.roles?.[i] ?? ""}
          />
          <PairTable words={step.values} s={run.input.s} step={step} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
