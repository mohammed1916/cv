import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import TripletBarsView from "./TripletBarsView";

const definition = {
  number: "3073",
  phases: [
    { id: "start", label: "Setup", description: "Nothing has been scored." },
    { id: "left", label: "Left", description: "Find the best left value." },
    { id: "right", label: "Right", description: "Find the best right value." },
    { id: "candidate", label: "Score", description: "Score this middle value." },
    { id: "done", label: "Result", description: "Report the best value or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of integers",
  url: "https://leetcode.com/problems/maximum-increasing-triplet-value/",
  complexity: "O(n^2) time and O(1) extra space for n values, as the visualization scans each middle index. With no increasing triplet the answer is -1. The visualization caps the array at 20 values from 0 to 100.",
  examples: [
    { label: "Triplet found", input: "[5, 2, 8, 1, 6, 9]" },
    { label: "No increasing triplet", input: "[9, 8, 7]" },
    { label: 'Three values', input: '[1,2,3]' },
    { label: 'Equal values', input: '[4,4,4]' },
    { label: 'Descending', input: '[100,90,80,70]' },
    { label: 'Long run: 20 values', input: '[83,25,81,21,48,18,31,18,8,92,36,46,14,98,20,20,62,22,85,63]' },
  ],
};

export default function Problem3073Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripletBarsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
