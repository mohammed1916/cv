// A definition can be a context callback, or static content with phase/line overrides.
// Context: { step, stepIndex, story, input }. A null step means playback is ready/reset.
const evaluate = (value, context) => typeof value === 'function' ? value(context) : value;

export function resolveNarrative(definition, context) {
  if (!definition) return null;
  const resolved = evaluate(definition, context);
  if (!resolved) return null;
  const { ready, phases, lines, ...base } = resolved;
  const step = context.step;
  return {
    activeLine: step?.activeLine,
    ...base,
    ...evaluate(step ? phases?.[step.phase] : ready, context),
    ...(step ? evaluate(lines?.[step.activeLine], context) : {}),
  };
}
