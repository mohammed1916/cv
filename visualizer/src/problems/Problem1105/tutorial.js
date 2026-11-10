// Directed-tutorial scenes for shelf partitioning. Each scene explains one trace frame; focus names only the prefix costs and books that operation reads or writes.
const reasons = {
  start: ['Price the empty prefix at zero', 'dp[end] is the cheapest total height for the first end books. With no books there is no shelf to pay for, so dp[0] = 0. Every longer prefix is built from a shorter one, so this base case is what the recurrence starts from.'],
  prefix: ['Solve the prefix ending at this book', 'Books keep their order, so the last shelf is always a run of consecutive books that ends at this one. dp[end] starts unsolved and will take the cheapest choice of where that last run begins.'],
  grow: ['Extend the last shelf one book backward', 'Moving the start back adds this book to the last shelf. Its thickness uses up width, and the shelf is only as tall as its tallest book, so the height is the running maximum, not a sum.'],
  fit: ['Check that the shelf still fits', 'A book cannot be split or tilted, so the shelf is valid only while its total thickness is at most shelfWidth. This check decides whether books start..end can share one shelf. Nothing is priced yet.'],
  stop: ['Stop once the shelf overflows', 'Thicknesses are positive, so any earlier start adds more width. Once the run is too wide, no shorter prefix of this shelf can fit, and the inner loop can end here.'],
  candidate: ['Price the shelf that starts at this book', 'If the last shelf is books start..end, the books before it must be solved already, which is dp[start - 1]. The shelf adds its tallest book to that cost. This is the only way to finish prefix end with this shelf.'],
  improve: ['Keep the cheaper arrangement', 'Several starts may fit, and dp[end] stores the best total seen so far. The candidate replaces it only when it is strictly smaller, so the final value is the minimum over every valid last shelf.'],
  done: ['Return the cost of all books', 'dp[count] covers every book exactly once, because each prefix was built from the cheapest valid shelves before it. This is the minimum total height of the shelves.'],
};

// Focus lists only the DP cells and book positions that the current operation reads or writes.
export function shelfTutorial({ run, step, previousStep }) {
  const kind = step.kind ?? 'prefix';
  const [title, reason] = reasons[kind] ?? reasons.prefix;
  const s = step.snapshot;
  const count = run.input.books.length;
  const end = s.end ?? 0;
  const start = s.start ?? null;
  const limit = run.input.shelfWidth;
  const books = start === null ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const cells = kind === 'start' ? [0]
    : kind === 'done' ? [count]
    : kind === 'candidate' || kind === 'improve' ? [start - 1, end]
    : [end];
  const focus = {
    kind,
    cells,
    target: kind === 'done' ? count : end,
    source: kind === 'candidate' || kind === 'improve' ? start - 1 : null,
    // Book numbers are 1-based, as shown on the shelf.
    books,
    overflow: !!s.overflow,
    hiddenCells: count + 1 - cells.length,
    hiddenBooks: count - books.length,
  };
  const variables = {
    start: { 'books placed': 0, 'prefix cost': 0 },
    prefix: { 'books placed': end, 'prefix cost': s.dp[end] ?? 'unsolved' },
    grow: { 'shelf books': `${start}..${end}`, width: s.width, tallest: s.tallest, limit },
    fit: { width: s.width, limit, fits: 'yes' },
    stop: { width: s.width, limit, fits: 'no' },
    candidate: { 'cost before shelf': s.dp[start - 1], tallest: s.tallest, candidate: s.candidate, 'best so far': s.dp[end] ?? 'unsolved' },
    improve: { 'prefix cost': s.dp[end] },
    done: { 'minimum height': s.dp[count] },
  }[kind] ?? {};
  return { title, reason, action: step.message, variables, focus };
}
