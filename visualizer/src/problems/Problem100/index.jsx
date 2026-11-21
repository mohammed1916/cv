import {sameTreeTutorial} from './tutorial';
import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { SameTreeScene } from "./SameTreeVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./SameTreeVisualizer.css";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin the simultaneous walk from both roots." },
    { id: "check", label: "Position", description: "Look at the same position in both trees." },
    { id: "both-empty", label: "Both empty", description: "Both positions are empty, so they match." },
    { id: "one-empty", label: "Check structure", description: "Check whether exactly one position is empty." },
    { id: "mismatch", label: "Mismatch", description: "The values differ, so the answer is false." },
    { id: "match", label: "Compare values", description: "Check whether the current node values match." },
    { id: "left", label: "Left", description: "Compare the left children." },
    { id: "right", label: "Right", description: "Compare the right children." },
    { id: "return", label: "Return", description: "Combine the child results." },
    { id: "done", label: "Result", description: "Report whether the trees are the same." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Level-order arrays p and q (e.g. {"p":[1,2,3],"q":[1,2,3]})',
    goalDiagram: (
      <svg className="goal-diagram" width="300" viewBox="0 0 300 120" role="img" aria-label="Two trees. Both roots are 1 and both left children are 2. The right children differ: 3 in p and 4 in q, so the trees are not identical.">
        <g fill="none" stroke="currentColor" opacity=".5">
          <line x1="70" y1="22" x2="40" y2="58" /><line x1="70" y1="22" x2="100" y2="58" />
          <line x1="220" y1="22" x2="190" y2="58" /><line x1="220" y1="22" x2="250" y2="58" />
        </g>
        {[[70,22,'1'],[40,58,'2'],[100,58,'3'],[220,22,'1'],[190,58,'2'],[250,58,'4']].map(([x,y,v]) =>
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="13" style={{fill: v === '3' || v === '4' ? '#c0392b' : 'var(--surface2)'}} stroke="currentColor" strokeWidth="1.5" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill={v === '3' || v === '4' ? '#fff' : 'currentColor'}>{v}</text>
          </g>)}
        <text x="70" y="104" textAnchor="middle" fontSize="12" fill="currentColor">p</text>
        <text x="220" y="104" textAnchor="middle" fontSize="12" fill="currentColor">q</text>
        <text x="150" y="118" textAnchor="middle" fontSize="11" fill="#c0392b">3 ≠ 4 → false</text>
      </svg>
    ),
  goal: {"summary": "Decide whether two binary trees are identical: same shape and the same value at every matching position.", "requirement": ["Each tree is given as level-order values, with null for a missing child.", "Return true only if both trees have the same shape and equal values at every node.", "Two empty trees are the same. A tree and an empty tree are different.", "Input limit used by this visualizer: up to 15 entries per tree."], "example": "p = [1, 2, 3] and q = [1, 2, 4]. The shapes match, but the right child values are 3 and 4, so the answer is false."},
  url: "https://leetcode.com/problems/same-tree/",
  complexity: "O(min(n, m)) time and O(h) recursion depth for the two trees. The visualization accepts up to 15 entries per tree.",
  examples: getExamples("same-tree").map(example => ({ label: example.label, input: JSON.stringify({ p: example.p, q: example.q }) })),
};

export default function SameTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      tutorial={sameTreeTutorial}
      narration="100"
      renderVisual={({ step }) => <SameTreeScene step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
