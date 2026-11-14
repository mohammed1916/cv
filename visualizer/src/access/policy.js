// While the site is in beta, Pro problems are free after sign-in; the playground remains free for everyone.
// The cloud-function access checks are skipped while this is true. Set it to
// false to require an active Pro account for the playground.
export const BETA_FREE_ACCESS = false;
// Reference paid prices are retained for display; nothing is charged during free beta.
const BETA = { monthly: 99, annual: 799 };
const REGULAR = { monthly: 199, annual: 1499 };
export const PLANS = {
  monthly: { label: 'month (30 days)', amount: BETA.monthly * 100, days: 30, display: `₹${BETA.monthly}`, regular: `₹${REGULAR.monthly}`, regularAmount: REGULAR.monthly * 100 },
  annual: { label: 'year (365 days)', amount: BETA.annual * 100, days: 365, display: `₹${BETA.annual}`, regular: `₹${REGULAR.annual}`, regularAmount: REGULAR.annual * 100 },
};
// A useful sample of the next step after Easy: arrays, windows, lists, trees,
// graphs, backtracking and dynamic programming. Basics always remain free.
export const FREE_MEDIUM = new Set(['2', '3', '11', '15', '33', '49', '53', '56', '62', '78', '98', '102', '198', '200', '238', '2333']);
// Every implemented visualizer is free. Pro unlocks the playground only.
export function isFreeProblem() {
  return true;
}
export function accessLabel(problem, pro = false) {
  if (!problem.implemented) return 'Coming soon';
  if (BETA_FREE_ACCESS) return isFreeProblem(problem) ? 'Free' : pro ? 'Beta · Unlocked' : 'Free beta · Sign in';
  return isFreeProblem(problem) ? 'Free' : pro ? 'Pro · Unlocked' : '🔒 Pro';
}

export function hasProAccess({ user, realPro = false, debugPro = false }, beta = BETA_FREE_ACCESS) {
  return beta ? Boolean(user) : Boolean(realPro || debugPro);
}
