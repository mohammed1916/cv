import { useState } from 'react';
import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import { buildPermutations, code, linePatterns, TRACE_LIMIT } from './algorithm';
import './PermutationStory.css';

function Results({ results, count }) {
  const [selectedPage, setSelectedPage] = useState(null);
  const last = Math.max(0, Math.ceil(count / 12) - 1);
  const page = Math.min(selectedPage ?? last, last);
  return <section className="permutation-card"><h3>Unique permutations found: {count}</h3>
    <div className="permutation-results">{results.slice(page * 12, Math.min(count, (page + 1) * 12)).map((result, index) => <code key={page * 12 + index}>[{result.join(', ')}]</code>)}</div>
    {count === 0 && <p>A result is saved only when every index is used.</p>}
    {count > 12 && <nav aria-label="Permutation results"><button disabled={page === 0} onClick={() => setSelectedPage(page - 1)}>Previous results</button><span>Page {page + 1} / {last + 1}</span><button disabled={page === last} onClick={() => setSelectedPage(page + 1)}>Next results</button><button onClick={() => setSelectedPage(null)}>Follow latest</button></nav>}
  </section>;
}

const definition = {
  title: 'Permutations II: unique backtracking', code, linePatterns,
  patterns: ['init', 'skip', 'add', 'remove', 'result', 'done'],
  fields: [{ key: 'nums', label: 'Numbers', type: 'string' }], initialValues: { nums: '[1,1,2]' },
  examples: ['[1,1,2]', '[1,2,3]', '[2,2,2]', '[-1,-1,2,2]'].map(nums => ({ label: nums, values: { nums } })),
  build: buildPermutations,
  renderStory({ story, step }) {
    return <div className="permutation-story">
      {story.truncated && <p role="status">All {story.results.length} results were computed. Playback shows the first {TRACE_LIMIT.toLocaleString()} events, then jumps to the final result. Use a smaller input to inspect every event.</p>}
      <section className="permutation-card"><h3>Sorted copies and used flags</h3><div className="permutation-cells">
        {story.nums.map((value, index) => <div key={index} className={`permutation-cell ${step.path.includes(index) ? 'used' : ''} ${step.candidate === index ? 'candidate' : ''} ${step.activeLine === 13 && index === step.candidate - 1 ? 'duplicate-source' : ''}`}>
          <small>index {index}</small><strong>{value}</strong><span>{step.path.includes(index) ? 'used' : 'available'}</span>
        </div>)}
      </div><p>Equal values are separate copies. Use the leftmost available copy first to avoid repeating a branch.</p></section>
      <section className="permutation-card"><h3>Current path · depth {step.path.length} / {story.nums.length}</h3><div className="permutation-cells">
        {story.nums.map((_, position) => <div className="permutation-cell" key={position}><small>slot {position}</small><strong>{step.path[position] === undefined ? '—' : story.nums[step.path[position]]}</strong><span>{step.path[position] === undefined ? 'empty' : `from [${step.path[position]}]`}</span></div>)}
      </div><p className="permutation-decision">{step.message}</p></section>
      <Results key={JSON.stringify(story.input)} results={story.results} count={step.resultCount} />
    </div>;
  },
};

export default function PermutationStory() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
