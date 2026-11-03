import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '1401', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Circle and rectangle (JSON object)',
  url: 'https://leetcode.com/problems/circle-and-rectangle-overlapping/',
  complexity: 'O(1) time and space. The visualization accepts coordinates from -10000 to 10000.',
};

function Shape({ snapshot: s }) {
  const xs = [s.center[0] - s.radius, s.center[0] + s.radius, s.rect.left, s.rect.right, s.nearest[0]];
  const ys = [s.center[1] - s.radius, s.center[1] + s.radius, s.rect.bottom, s.rect.top, s.nearest[1]];
  const pad = 1, minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad, size = 240;
  const scale = size / Math.max(maxX - minX, maxY - minY);
  const X = x => (x - minX) * scale, Y = y => (maxY - y) * scale;
  return <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Circle and rectangle">
    <rect x={X(s.rect.left)} y={Y(s.rect.top)} width={(s.rect.right - s.rect.left) * scale}
      height={(s.rect.top - s.rect.bottom) * scale} fill="rgba(8,145,178,0.15)" stroke="#0891b2" />
    <circle cx={X(s.center[0])} cy={Y(s.center[1])} r={s.radius * scale} fill="rgba(234,88,12,0.12)" stroke="#ea580c" />
    <circle cx={X(s.center[0])} cy={Y(s.center[1])} r={3} fill="#ea580c" />
    <circle cx={X(s.nearest[0])} cy={Y(s.nearest[1])} r={4} fill="#0891b2" />
  </svg>;
}

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <Shape snapshot={step.snapshot} />
      <p>Centre ({run.input.cx}, {run.input.cy}), radius {run.input.radius}. Blue dot: nearest rectangle point.</p>
      {step.snapshot.dist2 !== null && <output>Squared distance {step.snapshot.dist2} against radius² {run.input.radius * run.input.radius}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
