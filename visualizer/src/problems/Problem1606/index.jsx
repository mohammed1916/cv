import { serverTutorial } from './tutorial';

import { useMemo, useState } from 'react';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import TabSwitch from '../../components/shared/TabSwitch';
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

import { examples } from './presets.js';

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
  { id: 'free-pop', label: 'Reserve server', description: 'Remove the selected server from the free structure.' },
  { id: 'timeline-create', label: 'Execution interval', description: 'Create the request rectangle on its server timeline.' },
  { id: 'assign', label: 'Count request', description: 'Increment the selected server count.' },
  { id: 'busy-push', label: 'Schedule finish', description: 'Push finish time into the busy heap.' },
  { id: 'sift-compare', label: 'Sift comparison', description: 'Compare one heap pair; swap only when the item belongs above its parent.' },
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
    goalDiagram: (
      <svg className="goal-diagram" width="360" viewBox="0 0 360 130" role="img" aria-label="Timeline of the worked example: server 0 handles request 1 from time 1 to 11; server 1 handles request 2 from time 2 to 7 and request 4 from time 8 to 9; request 3 at time 3 is dropped because both servers are busy.">
        <text x="4" y="34" fontSize="12" fill="currentColor">S0</text>
        <text x="4" y="74" fontSize="12" fill="currentColor">S1</text>
        <rect x="66" y="20" width="260" height="22" rx="4" fill="currentColor" opacity=".18" />
        <text x="72" y="35" fontSize="12" fill="currentColor">request 1 · time 1 → 11</text>
        <rect x="92" y="60" width="130" height="22" rx="4" fill="currentColor" opacity=".18" />
        <text x="98" y="75" fontSize="12" fill="currentColor">request 2 · 2 → 7</text>
        <rect x="248" y="60" width="26" height="22" rx="4" fill="currentColor" opacity=".45" />
        <text x="254" y="75" fontSize="12" fill="currentColor">4</text>
        <text x="118" y="102" fontSize="12" fill="#c0392b">request 3 at time 3: dropped</text>
        <line x1="40" y1="112" x2="352" y2="112" stroke="currentColor" opacity=".4" />
        {[0,4,8,12].map(t => <text key={t} x={40 + t * 26 - 4} y="126" fontSize="10" fill="currentColor">{t}</text>)}
      </svg>
    ),
    question: "For k servers and a stream of requests, find which servers handled the most requests.",
    approaches: [
      { name: "Sorted free list with binary search", intuition: "Keep free servers in a sorted list, search it with binary search, and keep busy servers in a heap ordered by finish time.", time: "O(m log k)", space: "O(k + m)" },
      { name: "Virtual keys in two heaps", intuition: "Encode the circular order as numeric keys in a heap of free servers, with a second heap for busy ones.", time: "O(m log k)", space: "O(k + m)" },
    ],
    goal: {"summary": "Given k servers and a list of requests, find which server handled the most requests.", "requirement": ["Request i arrives at time arrival[i] and needs load[i] time units on one server.", "Each request tries the server at index i mod k first, then the next indexes in order, wrapping around to 0. It goes to the first server that is free at its arrival time.", "If every server is busy, the request is dropped and counts for no server.", "Return the indexes of the server or servers with the highest number of handled requests, in increasing order.", "Input limits used by this visualizer: 1–6 servers, 1–12 requests, arrival times strictly increasing from 1 to 60, loads from 1 to 20."], "example": "k = 2, arrival = [1, 2, 3, 8], load = [10, 5, 1, 1]. Request 1 takes server 0 (busy until 11). Request 2 takes server 1 (busy until 7). Request 3 finds both busy and is dropped. Request 4 starts at server 0, which is still busy, then moves to server 1, which is free at time 8. Server 1 handled two requests, so the answer is [1]."},
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
      <TabSwitch label="Choose solution" value={approach} onChange={setApproach}
        options={[{value:'bisect',label:'Solution 1 · Binary search'},{value:'virtual',label:'Solution 2 · Virtual keys'}]} />
      <AlgorithmWorkspace
        key={approach}
        definition={definition}
        tutorial={serverTutorial}
        narration={`1606-${approach}`}
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
