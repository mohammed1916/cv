import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '1400', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'String s and palindrome count k (JSON object)',
  url: 'https://leetcode.com/problems/construct-k-palindrome-strings/',
  complexity: 'O(n + σ) time for n characters over an alphabet of size σ, O(σ) extra space. The visualization caps s at 200 letters.',
};

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot;
      const letters = Object.entries(s.counts);
      return <>
        <p>Target k = {run.input.k}; string length {s.length}.</p>
        <IndexedSequence label="Letter frequencies seen so far" length={letters.length}
          active={letters.findIndex(([letter]) => letter === s.letter)}
          valueAt={i => letters[i][0]} roleAt={i => `${letters[i][1]} × ${letters[i][1] % 2 ? 'odd' : 'even'}`} />
        <output>Odd letters: {s.odd}</output>
      </>;
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
