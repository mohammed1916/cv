
import { useMemo, useState } from 'react';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import BusiestServersVisual from './BusiestServersVisual';
import {
  parseInput,
  buildTrace,
  buildAlternativeTrace,
  code,
  python,
  alternativeCode,
  alternativePython,
} from './algorithm';
import './BusiestServersVisual.css';

const examples = [
  {
    label: 'Official: server 1 wins',
    input: '{"k":3,"arrival":[1,2,3,4,5],"load":[5,2,3,3,3]}',
  },
  {
    label: 'Wraparound',
    input: '{"k":2,"arrival":[1,2,3,5],"load":[1,10,1,1]}',
  },
  {
    label: 'All busy: dropped requests',
    input: '{"k":3,"arrival":[1,2,3,4,5,6],"load":[20,20,20,20,20,20]}',
  },
  {
    label: 'Three servers, four requests',
    input: '{"k":3,"arrival":[1,7,12,20],"load":[5,9,2,6]}',
  },
  {
    label: 'Two servers, two bursts',
    input: '{"k":2,"arrival":[10,11,30,31],"load":[7,8,4,6]}',
  },
  {
    label: 'Single request',
    input: '{"k":1,"arrival":[1],"load":[2]}',
  },
  {
    label: 'Multimode: tied servers',
    input: '{"k":3,"arrival":[1,2,3],"load":[10,12,11]}',
  },
  {
    label: 'Twelve requests, six servers',
    input: '{"k":6,"arrival":[1,6,11,16,21,26,31,36,41,46,51,56],"load":[20,20,20,20,20,20,20,20,20,20,20,20]}',
  },
  {
    label: 'Long run: 12 requests, 3 servers',
    input: '{"k":3,"arrival":[1,5,9,13,15,17,19,20,23,25,30,31],"load":[9,13,4,2,6,14,4,9,17,17,3,19]}',
  },
];

const phases = [
  { id: 'start', label: 'Initialize', description: 'All servers begin free.' },
  { id: 'loop-check', label: 'Loop condition', description: 'Evaluate a request, release, or binary-search loop.' },
  { id: 'arrival', label: 'Arrival', description: 'Read request arrival time and load.' },
  { id: 'busy-pop', label: 'Release', description: 'Pop a completed server from the busy heap.' },
  { id: 'key-calc', label: 'Virtual key', description: 'Calculate the next circular turn.' },
  { id: 'free-insert', label: 'Free pool', description: 'Return a completed server to the free structure.' },
  { id: 'preferred', label: 'Preference', description: 'Compute request index modulo k.' },
  { id: 'bisect-compare', label: 'Binary search', description: 'Compare midpoint and shrink the search interval.' },
  { id: 'bisect-result', label: 'Select', description: 'Choose the lower-bound server or wrap around.' },
  { id: 'key-select', label: 'Heap minimum', description: 'Choose the minimum virtual key.' },
  { id: 'free-pop', label: 'Free heap pop', description: 'Remove the selected free-server key.' },
  { id: 'timeline-create', label: 'Execution interval', description: 'Create the request rectangle on its server timeline.' },
  { id: 'assign', label: 'Count request', description: 'Increment the selected server count.' },
  { id: 'busy-push', label: 'Schedule finish', description: 'Push finish time into the busy heap.' },
  { id: 'drop', label: 'Drop', description: 'No free server is available.' },
  { id: 'frequency', label: 'Frequencies', description: 'Find the highest handled count.' },
  { id: 'multimode', label: 'Multimode', description: 'Identify every server tied for the maximum.' },
  { id: 'done', label: 'Complete', description: 'Return the busiest server IDs.' },
];

function makeDefinition(approach) {
  const virtual = approach === 'virtual';
  return {
    phases,
    parse: parseInput,
    build: virtual ? buildAlternativeTrace : buildTrace,
    code: virtual ? alternativeCode : code,
    python: virtual ? alternativePython : python,
    inputLabel: 'JSON {"k": servers, "arrival": [...], "load": [...]}',
    url: 'https://leetcode.com/problems/find-servers-that-handled-most-number-of-requests/',
    complexity: virtual
      ? 'O(m log k) time with two min-heaps; O(k + m) space including stored assignment history.'
      : 'O(mk + m log k) worst-case time with a sorted Python list and busy min-heap; O(k + m) space including stored assignment history.',
    examples,
  };
}

function Reasoning({ approach }) {
  return (
    <div className="bs-reasoning">
      {approach === 'virtual' ? (
        <>
          <h3>Virtual-key heap intuition</h3>
          <p>
            Each free server receives a priority representing its next
            turn in the circular request schedule.
          </p>
          <p>
            For request index i and server s, calculate
            i + (s - i) mod k. The smallest key identifies the
            first eligible server in circular order.
          </p>
          <p>
            When a server finishes, remove it from the busy
            finish-time heap, compute its new virtual key, and
            insert that key into the free heap.
          </p>
          <p>
            When a request arrives, pop the minimum free key
            and take key modulo k to recover the server ID.
          </p>
          <p>
            Both heaps use sift-up and sift-down operations.
            The heap visualizations show their comparisons
            and movements.
          </p>
        </>
      ) : (
        <>
          <h3>Binary search intuition</h3>
          <p>
            Maintain available server IDs in sorted order.
            Request i prefers server i modulo k.
          </p>
          <p>
            Binary search finds the first free server ID
            greater than or equal to the preference.
          </p>
          <p>
            During bisect_left, the active interval is
            [left, right). Each comparison removes half
            of the remaining search space.
          </p>
          <p>
            If the insertion position equals the length
            of the free list, wrap around and select
            its first element.
          </p>
          <p>
            A busy min-heap tracks when servers finish.
            Finished servers return to the sorted free list.
          </p>
        </>
      )}
      <h3>Why multimode?</h3>
      <p>
        The answer includes every server tied for the highest
        handled-request count, not just one server. Counting
        the assignments gives the same result as finding all
        modes of the assigned-server sequence.
      </p>
    </div>
  );
}

export default function BusiestServers() {
  const [approach, setApproach] = useState('bisect');
  const definition = useMemo(
    () => makeDefinition(approach),
    [approach]
  );

  return (
    <div className="bs-page">
      <div className="bs-solution-switch"
        role="group" aria-label="Choose solution">
        <button type="button"
          className={approach === 'bisect' ? 'is-selected' : ''}
          aria-pressed={approach === 'bisect'}
          onClick={() => setApproach('bisect')}>
          <strong>Solution 1</strong>
          <span>Binary search + busy heap</span>
        </button>
        <button type="button"
          className={approach === 'virtual' ? 'is-selected' : ''}
          aria-pressed={approach === 'virtual'}
          onClick={() => setApproach('virtual')}>
          <strong>Solution 2</strong>
          <span>Virtual-key heap + busy heap</span>
        </button>
      </div>

      <AlgorithmWorkspace
        key={approach}
        definition={definition}
        renderVisual={({ run, step }) => (
          <BusiestServersVisual
            input={run.input}
            step={step}
          />
        )}
        renderReasoning={() => (
          <Reasoning approach={approach} />
        )}
      />
    </div>
  );
}
