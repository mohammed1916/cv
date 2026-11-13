
import { useMemo, useState } from 'react';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import CountNonDecreasingVisual from './CountNonDecreasingVisual';
import {
  parseInput,
  buildTrace,
  buildAlternativeTrace,
  code,
  python,
  alternativeCode,
  alternativePython,
} from './algorithm';
import './CountNonDecreasingVisual.css';

const examples = [
  {
    label: 'Increment walkthrough',
    input: '{"nums":[4,1,5,2],"k":3}',
  },
  {
    label: 'Tight budget',
    input: '{"nums":[5,2,6,1],"k":2}',
  },
  {
    label: 'Single value',
    input: '{"nums":[3],"k":0}',
  },
  {
    label: 'Equal values',
    input: '{"nums":[4,4,4],"k":2}',
  },
  {
    label: 'Already non-decreasing',
    input: '{"nums":[1,2,3,4,5],"k":0}',
  },
  {
    label: 'Strictly decreasing',
    input: '{"nums":[9,7,5,3,1],"k":4}',
  },
  {
    label: 'Extreme values, large budget',
    input: '{"nums":[1,9,1,9,1,9,1,9],"k":20}',
  },
  {
    label: 'Long run: 8 values',
    input: '{"nums":[6,4,4,7,4,4,8,8],"k":12}',
  },
];

const phases = [
  {
    id: 'start',
    label: 'Initialize',
    description: 'Initialize the count and data structures.',
  },
  {
    id: 'loop-check',
    label: 'Loop condition',
    description: 'Show whether the current loop repeats or exits.',
  },
  {
    id: 'window',
    label: 'Subarray',
    description: 'Select a subarray using l and r.',
  },
  {
    id: 'increment',
    label: 'Increment',
    description: 'Raise the current value to the running maximum.',
  },
  {
    id: 'fits',
    label: 'Fits',
    description: 'The subarray requires at most k increments.',
  },
  {
    id: 'too-costly',
    label: 'Over budget',
    description: 'The subarray requires more than k increments.',
  },
  {
    id: 'merge',
    label: 'Merge blocks',
    description: 'Merge monotonic-deque blocks and update cost.',
  },
  {
    id: 'deque-push',
    label: 'Insert block',
    description: 'Insert the new left boundary into the deque.',
  },
  {
    id: 'shrink',
    label: 'Shrink window',
    description: 'Remove rightmost elements until cost fits.',
  },
  {
    id: 'count-window',
    label: 'Count windows',
    description: 'Add all valid endings for the current left boundary.',
  },
  {
    id: 'done',
    label: 'Result',
    description: 'Return the total number of valid subarrays.',
  },
];

function createDefinition(approach) {
  const optimized = approach === 'optimized';

  return {
    phases,
    parse: parseInput,
    build: optimized ? buildAlternativeTrace : buildTrace,
    code: optimized ? alternativeCode : code,
    python: optimized ? alternativePython : python,
    inputLabel: 'Object with nums (integers 1–9) and k (0–20)',
    url: 'https://leetcode.com/problems/count-non-decreasing-subarrays-after-k-operations/description/',
    complexity: optimized
      ? 'O(n) time with a monotonic deque and sliding window; O(n) auxiliary space. Visualization frames use additional memory.'
      : 'O(n³) time with nested subarray enumeration and linear scans; O(n) temporary space. Visualization frames use additional memory.',
    examples,
  };
}

function Reasoning({ approach }) {
  if (approach === 'optimized') {
    return (
      <div className="cs-reasoning">
        <h3>Why the monotonic deque works</h3>
        <p>
          Process left boundaries from right to left. Maintain a window
          [left, right) that can be made non-decreasing within k increments.
        </p>
        <p>
          The deque stores starting indices of blocks. Within each block,
          all values are raised to the block's required height.
          These heights decrease from the front to the back.
        </p>
        <p>
          When a new value enters from the left, any front block with a
          height no greater than that value is merged into the new block.
          The added cost is the number of affected positions multiplied
          by the increase in required height.
        </p>
        <p>
          If the cost exceeds k, remove values from the right, refunding
          their required increments. Once the window fits, all
          right - left possible ending positions are valid.
        </p>
        <p>
          Each index enters and leaves the deque at most once, so the
          algorithm runs in O(n) time.
        </p>
      </div>
    );
  }

  return (
    <div className="cs-reasoning">
      <h3>Why the running maximum gives the minimum cost</h3>
      <p>
        A non-decreasing array requires every element to be at least
        as large as the previous one. Since only increments are allowed,
        the cheapest choice is to raise each element only as far as
        the running maximum requires.
      </p>
      <p>
        For each subarray [l, r], scan from left to right. If nums[i]
        is below the current maximum, add their difference to the cost.
        Otherwise, update the maximum.
      </p>
      <p>
        If the final cost is at most k, increment the answer.
        The subarray matrix records every valid and invalid window.
      </p>
      <p>
        This straightforward approach examines O(n²) subarrays and
        spends O(n) time scanning each one, giving O(n³) time overall.
      </p>
    </div>
  );
}

export default function CountNonDecreasingSubarrays() {
  const [approach, setApproach] = useState('brute');

  const definition = useMemo(
    () => createDefinition(approach),
    [approach]
  );

  return (
    <div className="cs-page">
      <div className="cs-solution-switch"
        role="group" aria-label="Algorithm approach">
        <button
          type="button"
          className={approach === 'brute' ? 'is-selected' : ''}
          aria-pressed={approach === 'brute'}
          onClick={() => setApproach('brute')}
        >
          <strong>Solution 1 · Brute force</strong>
          <span>Nested loops + running maximum · O(n³)</span>
        </button>

        <button
          type="button"
          className={approach === 'optimized' ? 'is-selected' : ''}
          aria-pressed={approach === 'optimized'}
          onClick={() => setApproach('optimized')}
        >
          <strong>Solution 2 · Optimized</strong>
          <span>Monotonic deque + sliding window · O(n)</span>
        </button>
      </div>

      <AlgorithmWorkspace
        key={approach}
        definition={definition}
        renderVisual={({ run, step }) => (
          <CountNonDecreasingVisual run={run} step={step} />
        )}
        renderReasoning={() => (
          <Reasoning approach={approach} />
        )}
      />
    </div>
  );
}
