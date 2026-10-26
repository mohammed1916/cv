import { IMPLEMENTED_PROBLEMS } from '../data/implementedProblems';
import { matchCatalog } from '../data/catalogCoverage';
import catalog from '../../public/data/leetcodeCatalog.json';

// Route presence, never an assertion that every catalog problem is complete.
const matches = matchCatalog(catalog.problems, IMPLEMENTED_PROBLEMS);
const solved = new Set(matches.filter(({ route }) => route).map(({ problem }) => problem.slug));
const unsolved = matches.filter(({ route }) => !route).map(({ problem }) => problem.slug);
export const isProblemSolved = slug => solved.has(slug);
export const getSolvedSlugs = () => [...solved];
export const getUnsolvedProblems = () => [...unsolved];
export function getRegistryStats() {
  return {
    totalSolved: solved.size,
    totalUnsolved: unsolved.length,
    percentSolved: Math.round(solved.size / matches.length * 100),
    unsolvedProblems: [...unsolved],
  };
}
