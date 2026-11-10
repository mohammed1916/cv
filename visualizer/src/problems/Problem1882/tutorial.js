// Directed-tutorial scenes for 1882. Each scene explains one trace frame, and its focus names the structures that operation changes.
const reasons = {
  Ready: ['Start with every server idle', 'Tasks are handled in arrival order, but the choice among idle servers depends on weight and then index. Put every server in the idle heap first, so the next choice is a single root read.'],
  Arrive: ['Move the clock to the arrival', 'A task cannot start before it arrives, and the clock never runs backward. max(clock, i) keeps time monotonic and skips any idle gap before this task.'],
  Release: ['Return servers that have finished', 'Only a server whose finish time is no later than the clock can take this task. Moving those servers from the busy heap to the idle heap keeps the idle heap an exact list of selectable servers.'],
  Wait: ['Jump to the earliest completion', 'When no server is idle, the next possible start is the smallest finish time. Nothing else can free a server sooner, so the clock jumps straight to it.'],
  Check: ['Confirm an idle server exists', 'This condition decides whether the task waits. With an idle server present, the task starts at the current clock and no time is skipped.'],
  Choose: ['Choose by weight, then index', 'The idle heap root is the lightest idle server, and equal weights break toward the smaller index. The heap keeps that order without scanning every server.'],
  Record: ['Take the server out of the pool', 'A server runs one task at a time, so it must leave the idle pool before it receives this task. Its index is the answer for this task.'],
  Assign: ['Schedule the finish time', 'The task duration, not the server weight, sets when the server becomes free again. Pushing clock + duration into the busy heap lets a later release find it.'],
  Return: ['Return the recorded servers', 'Each answer was appended in arrival order, so the returned array lists the server index for every task.'],
};

const focusByEvent = {
  Ready: ['idle', 'busy'],
  Arrive: ['clock'],
  Release: ['busy', 'idle'],
  Wait: ['clock', 'busy'],
  Check: ['idle'],
  Choose: ['idle'],
  Record: ['idle', 'answer'],
  Assign: ['busy', 'timeline'],
  Return: ['answer', 'timeline'],
};

export function serverQueueTutorial({ step, previousStep }) {
  const s = step.scheduling || {};
  const event = s.event || 'Ready';
  const [title, reason] = reasons[event] || reasons.Ready;
  const focus = [...(focusByEvent[event] || ['idle'])];
  // Idle-pool growth between frames is the number of servers this release returned.
  const released = previousStep?.scheduling ? s.eligibleCount - previousStep.scheduling.eligibleCount : 0;
  // A release that returns nothing is a condition-only frame: the idle pool is not part of its effect.
  if (event === 'Release' && released === 0) focus.splice(focus.indexOf('idle'), 1);
  const variables = {};
  if (event !== 'Return') variables.task = `T${event === 'Assign' ? s.nextTask - 1 : s.nextTask}`;
  variables.clock = event === 'Arrive' && previousStep?.scheduling ? `${previousStep.scheduling.time} → ${s.time}` : s.time;
  if (event === 'Wait') variables.jumpTo = s.jumpTo;
  if (event === 'Release') variables.released = released;
  if (['Check', 'Choose'].includes(event)) variables.idle = s.eligibleCount;
  if (['Choose', 'Record', 'Assign'].includes(event) && s.selected !== null) {
    variables.server = `S${s.selected}`;
    variables.weight = s.servers?.[s.selected]?.weight;
  }
  if (event === 'Assign') variables.finish = s.assignments?.at(-1)?.end;
  if (event === 'Return') variables.answered = s.outputCount;
  return { title, reason, action: step.message, variables, focus };
}
