
import { TracedHeap } from '../../components/shared/heapModel.js';

export function parseInput(text) {
  const { k, arrival, load } = JSON.parse(text) ?? {};
  if (!Number.isInteger(k) || k < 1 || k > 6) {
    throw new Error('"k" must be between 1 and 6.');
  }
  if (!Array.isArray(arrival) || !Array.isArray(load) ||
    arrival.length !== load.length ||
    arrival.length < 1 || arrival.length > 12) {
    throw new Error('Provide 1–12 matching arrival and load values.');
  }
  if (arrival.some((t, i) =>
    !Number.isInteger(t) || t < 1 || t > 60 ||
    (i > 0 && t <= arrival[i - 1])
  )) {
    throw new Error('Arrival times must be strictly increasing, 1–60.');
  }
  if (load.some(d => !Number.isInteger(d) || d < 1 || d > 20)) {
    throw new Error('Each load must be an integer from 1 to 20.');
  }
  return { k, arrival, load };
}

const BASE_CODE = [
  'function busiestServers(k, arrival, load) {',
  '  const handled = Array(k).fill(0);',
  '  const free = Array.from({length:k}, (_,s)=>s);',
  '  const busy = new MinHeap();',
  '  for (let i = 0; i < arrival.length; i++) {',
  '    const t = arrival[i];',
  '    while (busy.size && busy.peek().end <= t) {',
  '      const job = busy.pop();',
  '      insertSorted(free, job.server);',
  '    }',
  '    if (!free.length) continue;',
  '    const target = i % k;',
  '    let left = 0, right = free.length;',
  '    while (left < right) {',
  '      const mid = Math.floor((left + right) / 2);',
  '      if (free[mid] < target) left = mid + 1;',
  '      else right = mid;',
  '    }',
  '    const pos = left === free.length ? 0 : left;',
  '    const server = free.splice(pos, 1)[0];',
  '    handled[server]++;',
  '    busy.push({end:t + load[i], server});',
  '  }',
  '  const best = Math.max(...handled);',
  '  return handled.flatMap((v,s)=>v===best?[s]:[]);',
  '}',
];

const VIRTUAL_CODE = [
  'function busiestServers(k, arrival, load) {',
  '  const handled = Array(k).fill(0);',
  '  const free = new MinHeap([0,1,...,k-1]);',
  '  const busy = new MinHeap();',
  '  for (let i = 0; i < arrival.length; i++) {',
  '    const t = arrival[i];',
  '    while (busy.size && busy.peek().end <= t) {',
  '      const job = busy.pop();',
  '      const key = i + ((job.server-i)%k+k)%k;',
  '      free.push(key);',
  '    }',
  '    if (!free.size) continue;',
  '    const key = free.pop();',
  '    const server = key % k;',
  '    handled[server]++;',
  '    busy.push({end:t + load[i], server});',
  '  }',
  '  const best = Math.max(...handled);',
  '  return handled.flatMap((v,s)=>v===best?[s]:[]);',
  '}',
];

export const code = BASE_CODE.map((text, i) => ({ line: i + 1, text }));
export const alternativeCode = VIRTUAL_CODE.map((text, i) => ({ line: i + 1, text }));

export const python = `import bisect
import heapq

def busiest_servers(k, arrival, load):
    handled = [0] * k
    free = list(range(k))
    busy = []

    for i, (t, d) in enumerate(zip(arrival, load)):
        while busy and busy[0][0] <= t:
            end, server = heapq.heappop(busy)
            bisect.insort(free, server)

        if not free:
            continue

        target = i % k
        left, right = 0, len(free)
        while left < right:
            mid = (left + right) // 2
            if free[mid] < target:
                left = mid + 1
            else:
                right = mid

        pos = 0 if left == len(free) else left
        server = free.pop(pos)
        handled[server] += 1
        heapq.heappush(busy, (t + d, server))

    best = max(handled)
    return [s for s in range(k) if handled[s] == best]
`;

export const alternativePython = `import heapq

def busiest_servers(k, arrival, load):
    free = list(range(k))
    busy = []
    handled = [0] * k

    for i, (t, d) in enumerate(zip(arrival, load)):
        while busy and busy[0][0] <= t:
            end, server = heapq.heappop(busy)
            key = i + (server - i) % k
            heapq.heappush(free, key)

        if not free:
            continue

        key = heapq.heappop(free)
        server = key % k
        handled[server] += 1
        heapq.heappush(busy, (t + d, server))

    best = max(handled)
    return [s for s in range(k) if handled[s] == best]
`;

const lookup = (lines, term) =>
  lines.findIndex(s => s.includes(term)) + 1;

function makeHeap(compare, format) {
  return new TracedHeap(compare, { order: 'min', format });
}

function createTrace(input, approach) {
  const { k, arrival, load } = input;
  const virtual = approach === 'virtual';
  const source = virtual ? VIRTUAL_CODE : BASE_CODE;
  const py = (virtual ? alternativePython : python).split('\n');

  const busy = makeHeap(
    (a, b) => a.end - b.end || a.server - b.server,
    job => `${job.end}:S${job.server}`
  );
  const freeHeap = virtual
    ? makeHeap((a, b) => a - b, String)
    : null;
  const freeList = virtual ? null : Array.from({ length: k }, (_, i) => i);
  if (virtual) {
    for (let s = 0; s < k; s++) freeHeap.push(s);
    freeHeap.takeOps();
  }

  const handled = Array(k).fill(0);
  const jobs = [];
  const assignments = [];
  const frames = [];
  let request = -1;
  let clock = 0;
  let server = -1;
  let target = -1;
  let search = null;
  let key = null;
  let transfer = null;
  let loop = null;
  let best = null;
  let released = null;

  const line = term => lookup(source, term);
  const pythonLine = term => lookup(py, term);

  const heapState = (heap, title, ops = []) => ({
    title,
    order: 'min',
    items: heap.data.map(heap.format),
    ops,
  });

  function emit(phase, message, jsTerm, pyTerm, options = {}) {
    const {
      busyOps = [],
      freeOps = [],
      ...extra
    } = options;

    frames.push({
      phase,
      stage: phase,
      activeLine: line(jsTerm),
      pythonLine: pythonLine(pyTerm),
      approach,
      request,
      clock,
      server,
      target,
      search: search ? { ...search } : null,
      key,
      released,
      loop: loop ? { ...loop } : null,
      transfer: transfer ? { ...transfer } : null,
      handled: [...handled],
      jobs: jobs.map(j => ({ ...j })),
      assignments: [...assignments],
      busy: busy.data.map(j => ({ ...j })),
      free: virtual
        ? [...freeHeap.data].sort((a, b) => a - b)
        : [...freeList],
      busyHeap: heapState(busy, 'Busy heap', busyOps),
      freeHeap: virtual
        ? heapState(freeHeap, 'Free virtual-key heap', freeOps)
        : null,
      best,
      message,
      ...extra,
    });
  }

  function flow(from, to, value) {
    transfer = { from, to, value: String(value) };
  }

  function loopFrame(id, iteration, condition, branch, message, js, py) {
    loop = { id, iteration, condition, branch };
    emit('loop-check', message, js, py);
  }

  function heapFrame(phase, message, js, py, heap) {
    const ops = heap.takeOps();
    emit(phase, message, js, py,
      heap === busy ? { busyOps: ops } : { freeOps: ops }
    );
  }

  emit('start', `${k} servers begin free.`,
    'const handled', 'handled =');

  for (let i = 0; i < arrival.length; i++) {
    request = i;
    clock = arrival[i];
    server = -1;
    target = i % k;
    key = null;
    search = null;
    released = null;

    flow('request', 'free', `R${i} · t=${clock}`);
    loopFrame('requests', i, true, 'repeat',
      `Outer loop: process request ${i} of ${arrival.length}.`,
      'for (let i', 'for i, (t, d)');

    loop = null;
    emit('arrival',
      `R${i} arrives at ${clock}; duration ${load[i]}; preferred S${target}.`,
      'const t =', 'for i, (t, d)');

    let releaseIteration = 0;
    while (true) {
      const canRelease = busy.size > 0 && busy.peek().end <= clock;
      flow('busy', 'free', canRelease
        ? `finish ${busy.peek().end} ≤ ${clock}`
        : 'exit release loop');
      loopFrame('release', releaseIteration, canRelease,
        canRelease ? 'repeat' : 'exit',
        canRelease
          ? `Release loop iteration ${releaseIteration + 1}: the earliest job is complete.`
          : 'Release loop exits: no completed job remains.',
        'while (busy.size', 'while busy and');

      if (!canRelease) break;
      loop = null;

      const job = busy.pop();
      released = job.server;
      flow('busy', 'free', `S${job.server}`);
      heapFrame('busy-pop',
        `Pop (${job.end}, S${job.server}) from the busy heap.`,
        'const job = busy.pop()', 'heapq.heappop(busy)', busy);

      if (virtual) {
        key = i + ((job.server - i) % k + k) % k;
        flow('busy', 'free', `${i}+(${job.server}-${i}) mod ${k}=${key}`);
        emit('key-calc',
          `S${job.server} gets virtual key ${key}, its next circular turn.`,
          'const key =', 'key = i +');

        freeHeap.push(key);
        flow('busy', 'free', `key ${key}`);
        heapFrame('free-insert',
          `Insert key ${key} into the free heap.`,
          'free.push(key)', 'heapq.heappush(free, key)', freeHeap);
      } else {
        // Trace bisect.insort on release, including comparisons.
        let left = 0, right = freeList.length, iteration = 0;
        while (left < right) {
          const mid = (left + right) >> 1;
          const value = freeList[mid];
          search = {
            purpose: 'insert',
            left, right, mid, value, target: job.server,
            nextLeft: value < job.server ? mid + 1 : left,
            nextRight: value < job.server ? right : mid,
          };
          flow('busy', 'free', `insert S${job.server}`);
          loopFrame('bisect-insert', iteration, true, 'repeat',
            `Insertion bisect: free[${mid}]=${value}, target=${job.server}.`,
            'insertSorted(free', 'bisect.insort(free');
          loop = null;
          emit('bisect-compare',
            `${value} < ${job.server}? ${value < job.server ? 'Yes: move left.' : 'No: move right.'}`,
            'insertSorted(free', 'bisect.insort(free');
          if (value < job.server) left = mid + 1;
          else right = mid;
          iteration++;
        }
        search = {
          purpose: 'insert', left, right, mid: -1,
          target: job.server, position: left
        };
        loopFrame('bisect-insert', iteration, false, 'exit',
          `Insertion bisect exits at index ${left}.`,
          'insertSorted(free', 'bisect.insort(free');
        loop = null;
        freeList.splice(left, 0, job.server);
        flow('busy', 'free', `S${job.server} → [${left}]`);
        emit('free-insert',
          `Released S${job.server} is inserted at sorted position ${left}.`,
          'insertSorted(free', 'bisect.insort(free');
      }
      key = null;
      released = null;
      releaseIteration++;
    }

    loop = null;
    search = null;
    flow('request', 'free', `${i} mod ${k}=${target}`);
    emit('preferred',
      `R${i} prefers S${target}.`,
      virtual ? 'if (!free.size)' : 'const target =',
      virtual ? 'if not free:' : 'target = i % k');

    const available = virtual ? freeHeap.size > 0 : freeList.length > 0;
    if (!available) {
      flow('request', 'result', 'DROPPED');
      emit('drop',
        `R${i} is dropped: all ${k} servers are busy.`,
        virtual ? 'if (!free.size)' : 'if (!free.length)',
        'if not free:');
      continue;
    }

    if (virtual) {
      key = freeHeap.peek();
      flow('free', 'servers', `${key} mod ${k}=S${key % k}`);
      emit('key-select',
        `The smallest virtual key is ${key}; select S${key % k}.`,
        'const key = free.pop()', 'key = heapq.heappop(free)');
      const popped = freeHeap.pop();
      server = popped % k;
      heapFrame('free-pop',
        `Pop key ${popped} and recover server ${server}.`,
        'const server = key % k', 'server = key % k', freeHeap);
    } else {
      let left = 0, right = freeList.length, iteration = 0;
      while (true) {
        const condition = left < right;
        search = {
          purpose: 'select',
          left, right,
          mid: condition ? (left + right) >> 1 : -1,
          target,
        };
        flow('request', 'free', `left ${left} · right ${right}`);
        loopFrame('bisect-select', iteration, condition,
          condition ? 'repeat' : 'exit',
          condition
            ? `Binary-search iteration ${iteration + 1}: left ${left} < right ${right}.`
            : `Binary search exits: left = right = ${left}.`,
          'while (left < right)', 'while left < right:');
        if (!condition) break;
        loop = null;

        const mid = search.mid;
        const value = freeList[mid];
        const moveRight = value < target;
        search = {
          ...search, value,
          nextLeft: moveRight ? mid + 1 : left,
          nextRight: moveRight ? right : mid,
        };
        flow('free', 'free', `${value} < ${target}?`);
        emit('bisect-compare',
          `free[${mid}] = ${value}. ${moveRight
            ? `Move left to ${mid + 1}.`
            : `Move right to ${mid}.`}`,
          'if (free[mid] < target)', 'if free[mid] < target:');
        if (moveRight) left = mid + 1;
        else right = mid;
        iteration++;
      }
      loop = null;

      const wrapped = left === freeList.length;
      const position = wrapped ? 0 : left;
      server = freeList[position];
      search = {
        purpose: 'select', left, right, mid: -1, target,
        position, wrapped, value: server
      };
      flow('free', 'servers',
        wrapped ? `wrap → S${server}` : `S${server}`);
      emit('bisect-result',
        wrapped
          ? `No free server ≥ ${target}; wrap to S${server}.`
          : `Select free[${position}] = S${server}.`,
        'const pos =', 'pos = 0 if');
      freeList.splice(position, 1);
    }

    handled[server]++;
    assignments.push(server);
    const end = clock + load[i];
    const job = { request: i, server, start: clock, end };
    jobs.push(job);

    search = null;
    loop = null;
    flow('servers', 'timeline', `R${i}: ${clock} → ${end}`);
    emit('timeline-create',
      `Create R${i}'s execution rectangle on S${server}: [${clock}, ${end}).`,
      'handled[server]++', 'handled[server] += 1',
      { timelineJob: i });

    flow('servers', 'result', `S${server}: +1`);
    emit('assign',
      `S${server} has now handled ${handled[server]} requests.`,
      'handled[server]++', 'handled[server] += 1');

    busy.push({ end, server });
    flow('timeline', 'busy', `(${end}, S${server})`);
    heapFrame('busy-push',
      `Push finish time ${end} and S${server} into the busy heap.`,
      'busy.push({end:', 'heapq.heappush(busy', busy);
    key = null;
  }

  request = -1;
  server = -1;
  search = null;
  loop = null;
  flow('request', 'result', 'all requests processed');
  loopFrame('requests', arrival.length, false, 'exit',
    'The outer request loop is complete.',
    'for (let i', 'for i, (t, d)');
  loop = null;

  best = Math.max(...handled);
  flow('servers', 'result', `max = ${best}`);
  emit('frequency',
    `Handled frequencies: [${handled.join(', ')}]; maximum = ${best}.`,
    'const best =', 'best = max(handled)');

  for (let s = 0; s < k; s++) {
    server = s;
    flow('servers', 'result', `S${s}: ${handled[s]} vs ${best}`);
    emit('multimode',
      `S${s}: ${handled[s]} ${handled[s] === best ? 'equals' : 'does not equal'} the maximum ${best}.`,
      'return handled.flatMap', 'return [s for s in range(k)');
  }

  const result = handled
    .map((count, s) => count === best ? s : -1)
    .filter(s => s >= 0);
  server = -1;
  transfer = null;
  emit('done',
    `Busiest servers: [${result.join(', ')}].`,
    'return handled.flatMap', 'return [s for s in range(k)',
    { result });

  return { input, result, frames };
}

export function buildTrace(input) {
  return createTrace(input, 'bisect');
}

export function buildAlternativeTrace(input) {
  return createTrace(input, 'virtual');
}
