# Claude continuation: teach the actual problem mechanics

User direction: fix problems whose visuals are generic and do not explain their unique concept. Reuse existing shared components, compose them, or introduce a shared component where needed. Unique teaching does not require unique styling or duplicated infrastructure.

## Reference repair: 1882

The former visualization emitted only a post-assignment array/table and repeated one generic paragraph. It concealed waiting tasks, clock jumps, simultaneous releases, and the reason one server wins.

Implemented reference:
- `src/problems/families/collectionStories/expansionBroadAlgorithms.js`: 1882 now emits immutable Ready, Wait, Choose, Assign snapshots with concrete narration.
- `src/components/shared/TaskSchedulingView.jsx`: task queue, server cards, explicit eligible order, clock jump, task-to-server answer, and per-server execution bars. Composes IndexedSequence and IntervalView.
- `src/problems/Problem1882/index.jsx`: owns its domain view inside AlgorithmWorkspace. Other SequenceStory consumers are unchanged.
- `src/problems/Problem1882/algorithm.test.mjs`: simultaneous completion, weight/index tie, FIFO at the same time, immutable snapshots, preset/highlight checks.

The solver still uses direct scans/sorting; do not claim heap complexity. Its advertised bound is O(tasks * servers log servers). Weight is priority, not speed. The final clock means all tasks assigned, not all execution finished. Preserve those distinctions.

## Proceed in this order

1. Inspect 1834 (`expansionContinuedAlgorithms.js`). Confirmed source issue: one emit combines ready-set selection and execution, followed by a hidden clock advance. Show future arrivals, ready tasks sorted by duration then index, selected task, CPU busy interval, and idle jumps. Do not copy 1882's FIFO task selection: 1834 chooses the shortest available task and never preempts execution. Compose shared sequence/interval primitives; adapt or extract a scheduler component only if its props can accurately represent this different policy.
2. Inspect 1871 (`expansionBroadAlgorithms.js`). Current frames expose the destination and reachable output but hide which launch positions enter/leave the legal predecessor window. Display [i-maxJump, i-minJump], reachable contributors, blocked destination characters, and why the destination becomes reachable or remains blocked. Use IndexedSequence with meaningful roles or a focused shared window view.
3. Inspect 1879 in the same file. Current frames show the second array and mask metrics but no visible assignment or dependency between subset states. Show the next first-array position, unused candidates, chosen pair/XOR, old and candidate cost, and mask → next-mask dependency. Consider DPDependencyView plus a matching view; do not render numeric masks as unexplained decoration.
4. Audit other generic family visualizers incrementally. For each ID, record the exact missing teaching state before editing. Continue ready work; an uncertain problem should not block the queue. These are prioritized examples, not a claim that every other entry was reviewed.

## Per-problem design contract

Before coding, answer: what are the entities; what is the state; what choice is being made; what rule selects the winner; what changes; why is the result correct? Name the visible representation for each answer.

Reuse shared components when they express the concept. Compose them in the problem route when multiple concepts matter. Add a shared domain component when existing primitives cannot convey the relationship. Keep algorithms and policy decisions in the trace/model; views consume explicit immutable state. Do not add problem-ID branches throughout generic renderers or force every problem into one array/table layout.

Emit separate before-decision and after-change frames. Show rejected alternatives when they explain the decision. Narration must refer to actual values and visible highlights. A table may supplement a diagram; merely relabeling generic metrics does not resolve a missing concept. Initial and final frames must remain meaningful, and backward playback must restore the exact earlier state.

Use independently authored examples that expose the central rule, a tie, and an edge case. Do not publish copied statements or official examples. Verify only the affected solver and teaching states, then inspect routed playback if available. A passing answer test is not proof of a useful visualization. Report implementation, trace checks, and browser acceptance separately; avoid unrelated tests and cleanup.

## Acceptance example for 1882

Input `{servers:[3,1],tasks:[4,3,1,2]}`: T0 starts on S1 at 0; T1 starts on S0 at 1; T2 waits at 2; clock jumps to 4; BOTH servers are eligible; S1 wins on weight; T3 starts on S0 at the SAME time 4. Answer `[1,0,1,0]`. A learner should be able to explain this from the visible frames without reading code.

## Verification performed

Nine targeted checks passed (1882 trace/solver checks and shared interval-model tests). Definition groups regenerated without generated changes. Vite transformed the 1882 route and server-rendered every scheduling frame for the simultaneous-completion scenario. `git diff --check` passed. Interactive browser playback was not checked; do not label this browser acceptance.
