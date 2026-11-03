import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '14', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Words (JSON object)',
  url: 'https://leetcode.com/problems/longest-common-prefix/',
  complexity: 'O(S) time for S total characters across all words, O(1) extra space beyond the prefix.',
};

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot;
      return <>
        <IndexedSequence label="Words" length={run.input.words.length} active={s.wordIndex}
          valueAt={i => run.input.words[i]} />
        <IndexedSequence label="Current prefix" length={s.prefix.length} active={s.prefix.length - 1}
          valueAt={i => s.prefix[i]} />
        {s.startsWith !== null && <output>{s.startsWith ? 'Word starts with prefix' : 'Word does not start with prefix'}</output>}
      </>;
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
