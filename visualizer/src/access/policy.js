export const FREE_SECONDS = 30 * 60;
const MONTHLY_RUPEES = 19;
export const PLANS = {
  monthly: { label: 'month (30 days)', amount: MONTHLY_RUPEES * 100, days: 30, display: `₹${MONTHLY_RUPEES}` },
  annual: { label: 'year (365 days)', amount: MONTHLY_RUPEES * 12 * 100, days: 365, display: `₹${MONTHLY_RUPEES * 12}` },
};
// A useful sample of the next step after Easy: arrays, windows, lists, trees,
// graphs, backtracking and dynamic programming. Basics always remain free.
export const FREE_MEDIUM = new Set(['2', '3', '11', '15', '33', '49', '53', '56', '62', '78', '98', '102', '198', '200', '238', '2333']);
export function isFreeProblem(problem) {
  return !problem.implemented || problem.tags?.includes('Basics') ||
    problem.difficulty?.toLowerCase() === 'easy' ||
    (!problem.tags?.includes('Codeforces') && FREE_MEDIUM.has(String(problem.number)));
}
export function accessLabel(problem, pro = false) {
  if (!problem.implemented) return 'Coming soon';
  return isFreeProblem(problem) ? 'Free' : pro ? 'Pro · Unlocked' : '🔒 Pro';
}
