import {code,alternativeCode} from './algorithm.js';
const reasons = {
  start: ['Keep track of availability', 'To assign each request without checking every running job, separate free servers from busy servers.'],
  arrival: ['Read the next request', 'The arrival time decides which jobs have finished; the duration decides when a newly assigned server becomes free.'],
  'busy-pop': ['Recover a completed server', 'We need every eligible server back before selecting one. The smallest finish time is at the busy-heap root, so release it first.'],
  'key-calc': ['Represent circular priority', 'A min-heap needs a numeric order. Encode the next turn at or after this request index so the minimum key represents the first eligible server in circular order.'],
  'free-insert': ['Make this server selectable again', 'Later requests must be able to find this released server. Return it to the ordered free structure while preserving its selection order.'],
  preferred: ['Choose where the circular search starts', 'Request i starts its search at i modulo k. Search from there rather than always favoring server zero.'],
  'bisect-compare': ['Narrow the candidate interval', 'The free IDs are sorted. Comparing the midpoint with the target lets us discard half the search interval without skipping the first eligible ID.'],
  'bisect-result': ['Select or wrap around', 'We need the first free ID at least as large as the preferred ID. If none exists, the circular rule continues at the smallest free ID.'],
  'key-select': ['Read the next circular turn', 'The virtual keys encode circular order, so the minimum key identifies the next free server without scanning every ID.'],
  'free-pop': ['Reserve the selected server', 'A server cannot accept two requests at once. Remove its key from the free heap before adding it to the busy heap.'],
  'timeline-create': ['Record when the server is occupied', 'Future requests need to know when this assignment finishes. Its occupied interval starts now and ends at arrival plus duration.'],
  assign: ['Remember the work this server handled', 'The final answer compares handled counts, so record this successful assignment in the selected server’s counter.'],
  'busy-push': ['Remember when to release this server', 'We will need the earliest completion for the next request. Store (finish time, server ID) in the busy heap so that completion is available at the root.'],
  drop: ['Drop this request', 'There is no queue in this problem. When no server is available at arrival, the request must be dropped rather than delayed.'],
  frequency: ['Find the largest count', 'Busiest means the most accepted requests, not the longest running time. Compare the per-server handled counts.'],
  multimode: ['Keep every tied winner', 'Several servers can share the maximum count. Include every matching server, not just the first one.'],
  'sift-compare': ['Compare one heap pair', 'Each comparison decides whether an item belongs above its parent. Only this pair is highlighted; a swap changes exactly these two cells.'],
  done: ['Return the busiest servers', 'The answer includes all servers whose handled count equals the maximum.'],
};
// Spoken narration for the audio. Each entry opens with where we are in the big picture, then says why this step is needed.
const spokenReasons = {
  start: 'Here is the big picture. Requests arrive in time order. Each one goes to a free server if one exists, and is dropped otherwise. At the end we count how many requests each server handled and report the busiest ones. So the first thing to set up is which servers are free and which are busy.',
  'loop-check': 'Now the loop condition. We keep going only while there is something left to decide, so this check tells us whether another request or another search step remains.',
  arrival: 'Now the next request. Its arrival time tells us which running jobs have already finished, and its duration tells us how long the server it gets will stay busy.',
  'busy-pop': 'Before we assign anything, we need to know which servers are free right now. Busy servers sit in a heap ordered by finish time, so the one that finishes first is at the top. If it finished before this arrival, we take it out and return it to the free pool.',
  'key-calc': 'Requests wrap around the servers, so the order we pick servers in is circular. A heap can only compare numbers, so we turn each server into a single number that encodes its place in that circular order.',
  'free-insert': 'The server we just released has to be selectable again, otherwise later requests would never see it. We put it back in the free structure, keeping the order intact.',
  preferred: 'Every request starts its search at its own index modulo k. This spreads the work instead of always favouring server zero, so we begin the search at that preferred server.',
  'bisect-compare': 'The free server IDs are kept sorted, so we can search them quickly. Comparing the middle value with our target lets us throw away half of the remaining range each time.',
  'bisect-result': 'We need the first free server whose ID is at least the preferred one. If none exists, the circular rule means we wrap around to the smallest free ID.',
  'key-select': 'The keys already encode circular order, so the smallest key is the next free server in that order. We do not have to scan every server.',
  'free-pop': 'A server cannot take two requests at once. So we take the chosen server out of the free structure before we give it this request.',
  'timeline-create': 'We record when this server is busy. The request occupies it from now until arrival plus duration. Future requests will check this interval.',
  assign: 'The answer compares how many requests each server handled, so this successful assignment goes into that server\'s count.',
  'busy-push': 'This server now has a finish time, and we will need the earliest finish time for the next request. Putting it in the busy heap makes that earliest time available at the top.',
  drop: 'Here, no server is free at this arrival. There is no queue in this problem, so the request is dropped instead of waiting.',
  frequency: 'The busiest servers are the ones with the most accepted requests, not the longest running time. So we now compare the handled counts.',
  multimode: 'Several servers can share the highest count. Every one of them is part of the answer, so we keep all of the tied winners.',
  'sift-compare': 'This is one step of restoring heap order. The two items being compared decide whether the moved item rises above its parent.',
  done: 'That is the full answer. It is every server whose handled count equals the maximum.',
};
export function serverTutorial({run,step}) {
  let entry = reasons[step.phase];
  if (step.phase === 'sift-compare') entry = step.sift?.kind === 'child'
    ? ['Choose the child that can rise', 'A sift-down swaps with the better child, so compare the two children before comparing the moving item.']
    : step.sift?.heap === 'free'
      ? ['Compare virtual keys on the sift path', 'Keys are ordered circularly. This comparison decides whether the moved key rises above its parent.']
      : ['Compare finish times on the sift path', 'The earliest finish belongs nearest the root. This comparison decides whether the moved entry rises above its parent.'];
  if (step.phase === 'loop-check') entry = step.loop?.id === 'release'
    ? ['Check the earliest completion', 'Only finished jobs may rejoin the free pool. If even the minimum finish time is later than arrival, every remaining job is still busy.']
    : step.loop?.id?.startsWith('bisect')
      ? ['Check the remaining search interval', 'Continue while an undecided interval remains; its boundary becomes the insertion or selection position.']
      : ['Check whether another request remains', 'Process each request once in arrival order, then compare the final handled counts.'];
  // Author the camera for the operation, rather than inherit every dashboard panel.
  const focusByPhase = {
    start:['free'], arrival:['request'], 'busy-pop':['busy'],
    'key-calc':['free'], 'free-insert':['busy','free'], preferred:['request','free'],
    'bisect-compare':['free'], 'bisect-result':['free','servers'],
    'key-select':['free'], 'free-pop':['free','servers'],
    'timeline-create':['timeline'], assign:['servers'], 'busy-push':['timeline','busy'],
    drop:['request'], frequency:['result'], multimode:['result'], done:['result'],
  };
  const focus = step.phase === 'sift-compare'
    ? [step.sift?.heap === 'free' ? 'free' : 'busy']
    : step.phase === 'loop-check'
    ? [step.loop?.id === 'release' ? 'busy' : step.loop?.id?.startsWith('bisect') ? 'free' : step.loop?.condition === false ? 'result' : 'request']
    : focusByPhase[step.phase] || ['request'];
  if (step.phase === 'free-pop' && step.approach !== 'virtual') entry = ['Reserve the selected server', 'Remove the selected ID from the sorted free list so this server cannot accept a second request while busy.'];
  if (step.phase === 'preferred' && step.approach === 'virtual') entry = ['Check available capacity', 'If the free-key heap is empty, every server is occupied and this request must be dropped. Otherwise its minimum key will determine the server.'];
  const variables = {};
  if (step.request >= 0 && !['start','frequency','multimode','done'].includes(step.phase)) {
    variables.request = `R${step.request}`;
    variables.time = step.clock;
  }
  if ((focus.includes('request') || focus.includes('timeline')) && step.request >= 0 && step.request < run.input.load.length) variables.duration = run.input.load[step.request];
  if (step.search) { variables.target=step.search.target; variables.bounds=`[${step.search.left}, ${step.search.right})`; }
  if (['key-calc','key-select','free-pop'].includes(step.phase) && step.key !== null) variables.key=step.key;
  if (['assign','timeline-create','busy-push'].includes(step.phase) && step.server !== null) variables.server=`S${step.server}`;
  if (step.phase==='busy-pop' && step.released!==null) variables.released=`S${step.released}`;
  if (step.phase==='sift-compare' && step.sift) variables.indices=`${step.sift.index} and ${step.sift.other}`;
  if (step.phase==='preferred' && step.approach !== 'virtual') variables.preferred=`S${step.target}`;
  if (['frequency','multimode','done'].includes(step.phase) && step.best !== null) variables.maximum=step.best;
  const instruction = (step.approach === 'virtual' ? alternativeCode : code).find(line => line.line === step.activeLine)?.text;
  const spoken = spokenReasons[step.phase] ? { reason: spokenReasons[step.phase] } : undefined;
  return {code:instruction,title:entry?.[0] || step.phase,reason:entry?.[1] || step.message,action:step.message,focus,variables,spoken};
}
