import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import PatternWindowView from "./PatternWindowView";

const definition = {
  number: "3078",
  phases: [
    { id: "start", label: "Setup", description: "Collect the literal digits." },
    { id: "window", label: "Window", description: "Try a window." },
    { id: "literal", label: "Literal", description: "A digit cell matches." },
    { id: "match", label: "Letter", description: "A mapped letter agrees." },
    { id: "map", label: "Map", description: "A new letter takes a digit." },
    { id: "fail", label: "Fail", description: "This window cannot match." },
    { id: "found", label: "Found", description: "Every cell passes." },
    { id: "done", label: "Result", description: "No window matches." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with board and pattern",
  url: "https://leetcode.com/problems/match-alphanumerical-pattern-in-matrix-i/",
  complexity: "O(R * C * p * q) time and O(p * q) extra space for a board of R by C and a pattern of p by q. The visualization caps the board at 6 by 6 and the pattern at 4 by 4.",
  examples: [
    { label: "Repeated pair", input: "{\"board\":[[1,2,3],[4,4,5]],\"pattern\":[\"aa\"]}" },
    { label: "Letter and literal", input: "{\"board\":[[7,1,7,2],[3,1,4,1]],\"pattern\":[\"a1a\"]}" },
    { label: "No match", input: "{\"board\":[[1,2],[3,4]],\"pattern\":[\"aa\"]}" },
    { label: 'Single cell', input: '{"board":[[1]],"pattern":["1"]}' },
    { label: 'Equal digits', input: '{"board":[[5,5],[5,5]],"pattern":["55"]}' },
    { label: 'Largest board', input: '{"board":[[9,9,9,9,9,9],[9,9,9,9,9,9],[9,9,9,9,9,9],[9,9,9,9,9,9],[9,9,9,9,9,9],[9,9,9,9,9,9]],"pattern":["99"]}' },
    { label: 'Long run: 6 by 6 board', input: '{"board":[[7,8,1,6,7,4],[1,2,5,4,7,8],[1,6,9,8,7,2],[1,8,5,2,9,8],[9,0,1,6,3,2],[7,6,5,6,5,4]],"pattern":["ab","1b"]}' },
  ],
};

export default function Problem3078Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PatternWindowView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
