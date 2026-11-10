import authoredExamples from '../../config/examples/collection--1882.js';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';

const RETURN_LINE = 7;
const base = definitions[1882];

// Shared definition with this problem's examples and scheduling-only frames. The shared finisher stamps the final frame with a generic line; this problem's return is pseudocode line 7.
export const definition = { ...base, examples: authoredExamples, build(input) {
  const run = base.build(input);
  const frames = run.frames.filter(frame => frame.scheduling)
    .map(frame => (frame.phase === 'done' ? { ...frame, activeLine: RETURN_LINE } : frame));
  return { ...run, frames };
} };
