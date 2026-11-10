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
  done: ['Return the busiest servers', 'The answer includes all servers whose handled count equals the maximum.'],
};
export function serverTutorial({run,step}) {
  let entry = reasons[step.phase];
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
  const focus = step.phase === 'loop-check'
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
  if (step.phase==='preferred' && step.approach !== 'virtual') variables.preferred=`S${step.target}`;
  if (['frequency','multimode','done'].includes(step.phase) && step.best !== null) variables.maximum=step.best;
  const instruction = (step.approach === 'virtual' ? alternativeCode : code).find(line => line.line === step.activeLine)?.text;
  return {code:instruction,title:entry?.[0] || step.phase,reason:entry?.[1] || step.message,action:step.message,focus,variables};
}
