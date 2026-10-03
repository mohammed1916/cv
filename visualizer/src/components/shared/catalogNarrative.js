const label = value => String(value).replaceAll('_', ' ').replaceAll('-', ' ');

// Older traces contain escaped template placeholders. Resolve only property
// paths against the current frame; never eval source or consult future frames.
export function traceText(value, step) {
  if (typeof value !== 'string') return '';
  return value.replace(/\$\{([^}]+)\}/g, (_, path) => {
    const keys = path.trim().match(/^[a-zA-Z_$][\w$]*(?:\.[\w$]+|\[[\w$]+\])*$/);
    if (!keys) return `[${path.trim()}]`;
    const parts = path.replace(/\[([\w$]+)\]/g, '.$1').split('.');
    let current = step;
    for (const part of parts) {
      if (['__proto__','constructor','prototype'].includes(part)) return '[value]';
      const key = current === step || Object.hasOwn(current ?? {}, part) ? part : step?.[part];
      if (current == null || key == null || !Object.hasOwn(Object(current), key)) return `[${path.trim()}]`;
      current = current[key];
    }
    return typeof current === 'object' ? JSON.stringify(current) : String(current);
  });
}

export function catalogNarrative(guide, step, code = [], playback) {
  if (playback && (playback.stepIndex < 0 || playback.total === 0)) step = null;
  const phases = [...(guide.phases ?? [])];
  if (step?.phase && !phases.includes(step.phase)) phases.push(step.phase);
  const codeLines = code.map((row, index) => typeof row === 'string' ? { line: index + 1, text: row } : row);
  const active = codeLines.find(row => row?.line === step?.activeLine)?.text?.trim();
  const phasePurpose = guide.phasePurposes?.[step?.phase];
  const explanation = traceText(step?.explanation ?? step?.reason, step);
  const message = traceText(step?.message ?? step?.description, step);
  const done = playback ? playback.total > 0 && playback.stepIndex === playback.total - 1
    : /^(done|complete|completed|finish|finished)$/.test(step?.phase ?? '');
  const comments = active?.split('#').slice(1).join('#').trim();
  const purpose = explanation || phasePurpose || (comments?.length > 20 ? `${guide.strategy} ${comments}` : guide.strategy);
  return {
    goal: guide.goal,
    // A trace can visit a phase many times; these are chapters, not % complete.
    chapters: phases.map(label),
    chapter: step ? phases.indexOf(step.phase) : undefined,
    strategyLabel: 'Algorithm chapters; phases may repeat',
    scope: step ? `${guide.title}${step.phase ? ` · ${label(step.phase)}` : ''}` : 'Ready to begin',
    activeLine: step?.activeLine,
    why: purpose,
    achieved: step ? message || (active ? `Current code: ${active}` : 'Inspect the current visual state below.')
      : 'No steps have run yet. The strategy below explains what the computation is trying to establish.',
    next: done ? 'Check the final result against the goal, or try a boundary case to see which decisions change.'
      : step ? `Continue toward the goal: ${guide.strategy}` : guide.strategy,
    edgeCases: [
      ...(guide.edgeCases ?? []),
      ...(guide.checks ?? []).map(({ condition, outcome }) => `Decision boundary: when ${condition}, this solution executes ${outcome}.`),
      ...(guide.inputRules ?? []).map(rule => `Input requirement: ${rule}`),
    ],
  };
}
