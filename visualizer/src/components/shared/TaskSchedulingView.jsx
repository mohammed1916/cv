
import { useMemo } from 'react';
import './TaskSchedulingView.css';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function getServerId(item) {
  if (typeof item === 'number') return item;
  if (Array.isArray(item)) {
    return item.findLast?.((value) => Number.isInteger(value)) ?? item.at(-1);
  }
  if (!item || typeof item !== 'object') return null;

  return item.server ?? item.serverId ?? item.id ??
    item.index ?? item.idx ?? null;
}

function heapKey(item, index) {
  if (typeof item === 'number') return `server-${item}`;
  if (Array.isArray(item)) return `tuple-${index}-${item.join('-')}`;
  return `heap-${index}-${getServerId(item) ?? ''}`;
}

function describeHeapItem(item, type, serverMap) {
  const id = getServerId(item);
  const server = serverMap.get(Number(id));

  if (type === 'idle') {
    return {
      primary: server ? `w${server.weight}` :
        Array.isArray(item) ? String(item[0]) :
          typeof item === 'object' && item !== null
            ? String(item.weight ?? item.priority ?? id ?? '?')
            : String(item),
      secondary: id != null ? `S${id}` : '',
    };
  }

  let finish = server?.freeAt;

  if (Array.isArray(item)) {
    finish = item[0];
  } else if (item && typeof item === 'object') {
    finish = item.freeAt ?? item.end ?? item.finish ??
      item.finishTime ?? item.time ?? finish;
  }

  return {
    primary: finish != null ? `t${finish}` : '?',
    secondary: id != null ? `S${id}` : '',
  };
}

function HeapPanel({ heap, type, servers, selected }) {
  const items = Array.isArray(heap?.items) ? heap.items : [];
  const serverMap = useMemo(
    () => new Map(servers.map((s) => [Number(s.id), s])),
    [servers]
  );

  const visible = items.slice(0, 31);
  const depth = Math.min(
    5,
    Math.max(1, Math.ceil(Math.log2(visible.length + 1)))
  );

  return (
    <div className={`ts-heap ts-heap--${type}`}>
      <div className="ts-heap__heading">
        <div className="ts-heap__heading-text">
          <span className="ts-heap__dot" />
          <strong>
            {type === 'idle' ? 'Available heap' : 'Busy heap'}
          </strong>
        </div>
        <span className="ts-count">{items.length}</span>
      </div>

      <p className="ts-heap__rule">
        {type === 'idle'
          ? 'Minimum weight → minimum index'
          : 'Earliest finish → weight → index'}
      </p>

      <div
        className="ts-heap__viewport"
        role="group"
        aria-label={type === 'idle'
          ? 'Available server min heap'
          : 'Busy server min heap'}
      >
        {visible.length ? (
          <div className="ts-heap__tree">
            {Array.from({ length: depth }, (_, level) => {
              const start = 2 ** level - 1;
              const end = Math.min(
                start + 2 ** level,
                visible.length
              );
              const levelItems = visible.slice(start, end);

              return (
                <div
                  className="ts-heap__level"
                  key={level}
                >
                  {levelItems.map((item, offset) => {
                    const index = start + offset;
                    const id = getServerId(item);
                    const details = describeHeapItem(
                      item, type, serverMap
                    );
                    const isRoot = index === 0;
                    const isSelected =
                      selected != null &&
                      Number(id) === Number(selected);

                    return (
                      <div
                        key={heapKey(item, index)}
                        className={[
                          'ts-heap__node',
                          isRoot ? 'is-root' : '',
                          isSelected ? 'is-selected' : '',
                        ].join(' ')}
                        title={`${details.primary} ${details.secondary}`}
                      >
                        <strong>{details.primary}</strong>
                        <small>{details.secondary}</small>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ts-heap__empty">
            No servers in heap
          </div>
        )}
      </div>

      <div className="ts-heap__footer">
        {items.length > visible.length ? (
          <span>+{items.length - visible.length} more</span>
        ) : (
          <span>{items.length ? 'Root is the next candidate' : 'Empty'}</span>
        )}
        {items.length > 0 && <span>Root ↑</span>}
      </div>
    </div>
  );
}

function ClockComparator({ time, nextTask, tasks, jumpTo, event }) {
  const task = tasks.find(
    (t) => Number(t.id) === Number(nextTask)
  );

  const arrival = task
    ? toNumber(task.arrival, toNumber(nextTask))
    : null;

  const current = toNumber(time);
  const hasArrival = arrival !== null;
  const maxResult = hasArrival
    ? Math.max(current, arrival)
    : current;

  const arrivalWins = hasArrival && arrival > current;
  const clockWins = !hasArrival || current > arrival;
  const tie = hasArrival && current === arrival;

  const hasJump = jumpTo != null &&
    Number.isFinite(Number(jumpTo)) &&
    Number(jumpTo) > current;

  return (
    <div className="ts-clock">
      <div className="ts-clock__top">
        <span className="ts-eyebrow">Simulation clock</span>
        <div className="ts-clock__time">
          <span className="ts-clock__pulse" />
          <strong>t = {time}</strong>
        </div>
      </div>

      <div className="ts-clock__flow">
        <div className={[
          'ts-clock__source',
          'ts-clock__source--current',
          clockWins || tie ? 'is-winning' : '',
        ].join(' ')}>
          <small>Current time</small>
          <strong>{time}</strong>
        </div>

        <div className="ts-clock__operator">
          <span>MAX</span>
          <small>ts, i</small>
        </div>

        <div className={[
          'ts-clock__source',
          'ts-clock__source--arrival',
          arrivalWins || tie ? 'is-winning' : '',
        ].join(' ')}>
          <small>Task arrival</small>
          <strong>{hasArrival ? arrival : '—'}</strong>
        </div>
      </div>

      <div className="ts-clock__result">
        <span className="ts-clock__result-line" />
        <div>
          <code>
            ts = max({time}, {hasArrival ? arrival : '—'})
          </code>
          <strong>
            {hasArrival ? `= ${maxResult}` : 'No next task'}
          </strong>
        </div>
      </div>

      <p className="ts-clock__explanation">
        {hasJump
          ? `All servers busy. Advance from ${time} to ${jumpTo}, the earliest finish.`
          : arrivalWins
            ? `Task T${nextTask} arrives later. Advance the clock to ${arrival}.`
            : tie
              ? `Task T${nextTask} arrives exactly at the current time.`
              : clockWins && hasArrival
                ? `Task T${nextTask} has already arrived. Keep time ${time}.`
                : event === 'All tasks assigned'
                  ? 'All tasks have been assigned.'
                  : 'Waiting for the next scheduling event.'}
      </p>

      {hasJump && (
        <div className="ts-clock__jump">
          <span>Busy heap minimum</span>
          <strong>{time} → {jumpTo}</strong>
        </div>
      )}
    </div>
  );
}

function ServerPanel({ servers, time, selected, eligible, event }) {
  const eligibleSet = new Set(
    eligible.map((id) => Number(id))
  );

  return (
    <div className="ts-servers">
      <div className="ts-section-label">
        <span className="ts-eyebrow">Servers</span>
        <span className="ts-muted">
          Weight controls priority, not speed
        </span>
      </div>

      <div className="ts-servers__track">
        {servers.map((server) => {
          const isSelected =
            selected != null &&
            Number(server.id) === Number(selected);
          const isEligible = eligibleSet.has(Number(server.id));
          const isBusy = Number(server.freeAt) > Number(time);

          return (
            <div
              key={server.id}
              className={[
                'ts-server',
                isSelected ? 'is-selected' : '',
                isBusy ? 'is-busy' : 'is-idle',
              ].join(' ')}
            >
              <div className="ts-server__identity">
                <strong>S{server.id}</strong>
                <span>w{server.weight}</span>
              </div>
              <div className="ts-server__state">
                <span className="ts-server__indicator" />
                <span>
                  {isSelected
                    ? event === 'Choose' ? 'Chosen' : 'Assigned'
                    : isBusy
                      ? `Until ${server.freeAt}`
                      : isEligible ? 'Eligible' : 'Available'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchedulingTimeline({ servers, assignments, time }) {
  const maximum = Math.max(
    Number(time) || 0,
    ...assignments.map((a) => Number(a.end) || 0),
    1
  );
  const width = Math.max(100, maximum + 1);
  const marker = Math.max(
    0,
    Math.min(100, (Number(time) / width) * 100)
  );

  return (
    <div className="ts-timeline">
      <div className="ts-section-label">
        <span className="ts-eyebrow">Execution timeline</span>
        <span className="ts-muted">
          [start, finish)
        </span>
      </div>

      <div className="ts-timeline__body">
        {servers.map((server) => {
          const intervals = assignments.filter(
            (a) => Number(a.server) === Number(server.id)
          );

          return (
            <div className="ts-timeline__lane" key={server.id}>
              <span className="ts-timeline__name">
                S{server.id}
              </span>
              <div className="ts-timeline__track">
                <span
                  className="ts-timeline__marker"
                  style={{ left: `${marker}%` }}
                />

                {intervals.map((assignment, index) => {
                  const start = Number(assignment.start);
                  const end = Number(assignment.end);
                  const left = Math.max(
                    0, (start / width) * 100
                  );
                  const barWidth = Math.max(
                    0.5, ((end - start) / width) * 100
                  );
                  const completed = end <= Number(time);

                  return (
                    <div
                      key={`${assignment.task}-${index}`}
                      className={[
                        'ts-timeline__bar',
                        completed ? 'is-complete' : 'is-active',
                      ].join(' ')}
                      style={{
                        left: `${left}%`,
                        width: `${barWidth}%`,
                      }}
                      title={`T${assignment.task}: ${start}–${end}`}
                    >
                      <span>T{assignment.task}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ts-timeline__axis">
        <span>0</span>
        <span>Clock {time}</span>
        <span>{maximum}</span>
      </div>
    </div>
  );
}

function ArrivalQueue({ tasks, time, nextTask, assignments }) {
  const assignmentMap = new Map(
    assignments.map((a) => [Number(a.task), a])
  );

  const currentIndex = Math.max(
    0,
    tasks.findIndex((t) => Number(t.id) === Number(nextTask))
  );

  const windowSize = 12;
  const windowStart = Math.max(
    0,
    Math.min(
      currentIndex - 3,
      Math.max(0, tasks.length - windowSize)
    )
  );
  const visibleTasks = tasks.slice(
    windowStart, windowStart + windowSize
  );

  const futureCount = tasks.filter(
    (t) => Number(t.arrival) > Number(time) &&
      !assignmentMap.has(Number(t.id))
  ).length;

  return (
    <div className="ts-arrivals">
      <div className="ts-section-label">
        <span className="ts-eyebrow">Task arrivals</span>
        <span className="ts-muted">
          {futureCount} future · FIFO
        </span>
      </div>

      <div className="ts-arrivals__viewport">
        {windowStart > 0 && (
          <span className="ts-arrivals__overflow">
            +{windowStart} earlier
          </span>
        )}

        <div className="ts-arrivals__track">
          {visibleTasks.map((task) => {
            const id = Number(task.id);
            const assignment = assignmentMap.get(id);
            const isCurrent =
              Number(nextTask) === id && !assignment;
            const isFuture =
              Number(task.arrival) > Number(time) &&
              !assignment;
            const isComplete =
              assignment && Number(assignment.end) <= Number(time);

            const state = isComplete
              ? 'complete'
              : assignment
                ? 'assigned'
                : isCurrent
                  ? 'current'
                  : isFuture
                    ? 'future'
                    : 'waiting';

            return (
              <div
                key={task.id}
                className={`ts-task ts-task--${state}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <strong>T{task.id}</strong>
                <span>d{task.duration}</span>
                <small>
                  {state === 'current'
                    ? 'NEXT'
                    : state === 'future'
                      ? `at ${task.arrival}`
                      : state === 'complete'
                        ? 'Done'
                        : state === 'assigned'
                          ? `S${assignment.server}`
                          : 'Waiting'}
                </small>
              </div>
            );
          })}
        </div>

        {windowStart + visibleTasks.length < tasks.length && (
          <span className="ts-arrivals__overflow">
            +{tasks.length - windowStart - visibleTasks.length} later
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskSchedulingView({
  time = 0,
  event = '',
  tasks = [],
  servers = [],
  eligible = [],
  eligibleCount,
  assignments: allAssignments = [],
  assignmentCount,
  nextTask = 0,
  selected = null,
  jumpTo = null,
  output: allOutput = [],
  outputCount,
  idle = null,
  busy = null,
}) {
  const assignments = allAssignments.slice(
    0, assignmentCount ?? allAssignments.length
  );

  const output = allOutput.slice(
    0, outputCount ?? allOutput.length
  );

  const visibleEligibleCount = eligibleCount ?? eligible.length;

  return (
    <section
      className="task-scheduling"
      aria-label="Task scheduling visualization"
    >
      <div className="task-scheduling__main">
        <ClockComparator
          time={time}
          event={event}
          nextTask={nextTask}
          tasks={tasks}
          jumpTo={jumpTo}
        />

        <div className="task-scheduling__heaps">
          <HeapPanel
            heap={idle}
            type="idle"
            servers={servers}
            selected={selected}
          />
          <HeapPanel
            heap={busy}
            type="busy"
            servers={servers}
            selected={selected}
          />
        </div>
      </div>

      <div className="ts-comparison">
        <span className="ts-comparison__label">
          Priority comparison
        </span>
        <div className="ts-comparison__content">
          <strong>
            {selected != null
              ? `S${selected} selected`
              : visibleEligibleCount
                ? `${visibleEligibleCount} eligible server${visibleEligibleCount === 1 ? '' : 's'}`
                : 'No eligible servers'}
          </strong>
          <span>
            {selected != null
              ? 'Choose the smallest (weight, index) pair.'
              : visibleEligibleCount
                ? `Order: ${eligible.slice(0, 8).map((id) => `S${id}`).join(' → ')}${eligible.length > 8 ? ' …' : ''}`
                : 'Release servers at the earliest finish before choosing.'}
          </span>
        </div>
      </div>

      <ServerPanel
        servers={servers}
        time={time}
        selected={selected}
        eligible={eligible}
        event={event}
      />

      <SchedulingTimeline
        servers={servers}
        assignments={assignments}
        time={time}
      />

      <div className="ts-output">
        <span className="ts-eyebrow">Assigned servers</span>
        <div className="ts-output__values">
          {output.length
            ? output.map((id, index) => (
              <span key={index}>
                <small>T{index}</small>
                <strong>S{id}</strong>
              </span>
            ))
            : <span className="ts-muted">No assignments yet</span>}
        </div>
      </div>

      <ArrivalQueue
        tasks={tasks}
        time={time}
        nextTask={nextTask}
        assignments={assignments}
      />
    </section>
  );
}
