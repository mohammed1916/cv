import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PointerRail from "../../components/shared/PointerRail";
import { getExamples } from "../../config/examplesRegistry";
import WaterContainerStory from "./WaterContainerStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./ContainerWithMostWaterVisualizer.css";

const definition = {
  phases: [
    { id: "start", label: "Setup", description: "Place the pointers at both ends of the array." },
    { id: "compute", label: "Area", description: "Measure the container between the two pointers." },
    { id: "move", label: "Move", description: "Move the shorter wall inward." },
    { id: "done", label: "Result", description: "Report the largest area found." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Heights array (e.g. [1,8,6,2,5,4,8,3,7])",
  url: "https://leetcode.com/problems/container-with-most-water/",
  complexity: "O(n) time and O(1) extra space for n heights. The visualization accepts 2 to 50 heights.",
  examples: getExamples("container-with-most-water").map(example => ({ label: example.label, input: JSON.stringify(example.height) })),
};

export default function ContainerWithMostWaterVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <PointerRail
            title="Two-pointer lane"
            values={run.input}
            pointers={[
              { id: "left", label: `L ${step.left}`, index: step.left, tone: "info" },
              { id: "right", label: `R ${step.right}`, index: step.right, tone: "warning" },
            ]}
            range={{ start: step.left, end: step.right }}
            note={step.message}
          />
          <WaterContainerStory heights={run.input} step={step} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
