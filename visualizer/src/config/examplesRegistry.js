import { AUTHORED_EXAMPLES } from './authoredExamples.js';

/** Tooling-only aggregate. Browser code must import a suite from ./examples. */
export const EXAMPLES_REGISTRY = AUTHORED_EXAMPLES;

export function getExamples(problemSlug) {
  return EXAMPLES_REGISTRY[problemSlug] || [];
}

export function getExamplesOr(problemSlug, fallback) {
  const examples = EXAMPLES_REGISTRY[problemSlug];
  return examples?.length ? examples : fallback;
}

export function getAllProblems() {
  return Object.keys(EXAMPLES_REGISTRY).filter(key => !key.startsWith('local:'));
}

export function getExamplesCount(problemSlug) {
  return getExamples(problemSlug).length;
}
