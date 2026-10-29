import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { Scanner } from "./AtoiVisualizer";
import { INT_MIN, INT_MAX, code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./AtoiVisualizer.css";

const definition = {
  phases: [
    { id: "whitespace", label: "Spaces", description: "Skip leading spaces." },
    { id: "sign", label: "Sign", description: "Read an optional plus or minus sign." },
    { id: "digit", label: "Digits", description: "Accumulate digits into the number." },
    { id: "stop", label: "Stop", description: "Stop at the first non-digit or at the end." },
    { id: "clamp-min", label: "Clamp low", description: "Clamp a value below the 32-bit minimum." },
    { id: "clamp-max", label: "Clamp high", description: "Clamp a value above the 32-bit maximum." },
    { id: "final", label: "Result", description: "Return the clamped result." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input string (e.g. "   -042")',
  url: "https://leetcode.com/problems/string-to-integer-atoi/",
  complexity: "O(n) time and O(1) extra space for string length n. The visualization accepts strings up to 200 characters.",
  examples: getExamples("string-to-integer-atoi").map(example => ({ label: example.label, input: example.s ?? example.value })),
};

export default function StringToIntegerAtoiVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <Scanner input={run.input} step={step} />
          <div className="atoi-state-grid">
            <div className="atoi-card atoi-state-card">
              <div className="atoi-section-label">Parser State</div>
              <div className="atoi-kv-grid">
                <div className="atoi-kv"><span className="atoi-kv-key">Index</span><span className="mono atoi-kv-value">{step.index}</span></div>
                <div className="atoi-kv"><span className="atoi-kv-key">Current char</span><span className="mono atoi-kv-value">{step.currentChar == null ? "—" : step.currentChar === " " ? "␠" : step.currentChar}</span></div>
                <div className="atoi-kv"><span className="atoi-kv-key">Sign</span><span className="mono atoi-kv-value">{step.sign}</span></div>
                <div className="atoi-kv"><span className="atoi-kv-key">Digits read</span><span className="mono atoi-kv-value">{step.digits || "—"}</span></div>
                <div className="atoi-kv"><span className="atoi-kv-key">Unsigned value</span><span className="mono atoi-kv-value">{step.unsignedValue}</span></div>
                <div className="atoi-kv"><span className="atoi-kv-key">Clamped</span><span className="mono atoi-kv-value">{step.clamped || "no"}</span></div>
              </div>
            </div>
          </div>
          <p className="atoi-hint">Range [{INT_MIN}, {INT_MAX}]</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
