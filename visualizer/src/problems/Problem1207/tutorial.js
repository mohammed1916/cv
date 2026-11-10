// Authored teaching for the two-pass occurrence check. Each scene names the real values and counts behind the operation.
const reasons = {
  'init-map': ['Start with an empty map of counts', 'Nothing has been read yet, so no value has an occurrence count. The map will hold one entry per distinct value, and every later read adds to it.'],
  select: ['Take the next value from the list', 'The first pass only tallies. Each position contributes one occurrence to its value, so the list is read in order and nothing is decided yet.'],
  read: ['Read the value\'s current tally', 'A value may already have been seen earlier in the list. Its tally has to be read before it is incremented, or every repeat would restart at one.'],
  write: ['Store the new tally', 'This value now has one more occurrence. The tally is written back so that the next read of the same value continues from it.'],
  'init-set': ['Start the second pass with an empty set', 'Every count is final only after the whole list is read. The second pass checks counts against a set of counts already claimed by a value.'],
  'select-count': ['Take a finished count from the map', 'Only complete tallies can be compared. A partial tally could later grow into a count another value already claimed, so the comparison waits for the first pass to finish.'],
  'check-free': ['This count has not been claimed', 'The set holds the counts of values checked so far. This count is not among them, so no two values share it yet and the check passes without changing anything.'],
  clash: ['Two values share one count', 'Equal counts for two different values are the only way the answer can be false. The set already holds this count from another value, so the arrangement is not unique.'],
  claim: ['Claim this count for the value', 'The count is recorded as used by this value. A later value with the same count will find it in the set and return false.'],
  done: ['Decide from the completed checks', 'Every distinct value passed without a shared count, so the answer is true. When the check stopped early, the clashing pair already decided the answer.'],
}

export function uniqueOccurrencesTutorial({ step }) {
  const key = reasons[step.kind] ? step.kind : 'select'
  const [title, reason] = reasons[key]
  const focus = {
    kind: step.kind,
    position: step.snapshot.position ?? null,
    value: step.snapshot.value ?? null,
    old: step.snapshot.old ?? null,
    count: step.snapshot.count ?? null,
    clash: step.snapshot.clash ?? null,
    result: step.snapshot.result ?? null,
    counts: step.snapshot.counts,
    claimed: step.snapshot.claimed,
  }
  const variables = {
    'init-map': { counts: 'empty' },
    select: { position: focus.position, value: focus.value },
    read: { value: focus.value, tallySoFar: focus.old },
    write: { value: focus.value, newTally: focus.count },
    'init-set': { claimed: 'empty' },
    'select-count': { value: focus.value, count: step.snapshot.count },
    'check-free': { count: step.snapshot.count, claimed: step.snapshot.claimed.length },
    clash: { value: focus.value, count: step.snapshot.count, claimedBy: focus.clash },
    claim: { value: focus.value, count: step.snapshot.count },
    done: { result: focus.result },
  }[key] ?? {}
  return { title, reason, action: step.message, variables, focus }
}
