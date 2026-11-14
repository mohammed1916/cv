// Iterative "Fix with AI": suggest → verify → retry with the failure added to the prompt.
// The user is asked after every round, and also at this attempt count. There is no hard limit.
export const ASK_AT_ATTEMPTS = 5
export const ROUND_SIZES = [1, 2, 3]

function feedbackLines(attempts) {
  return attempts
    .filter((attempt) => attempt.status === 'failed' && attempt.reason)
    .map((attempt) => `Attempt ${attempt.n} did not work. Result: ${attempt.reason}`)
}

/**
 * @param {object} options
 * @param {object} options.base  { source, inputSource, entry, error, instruction }
 * @param {number} options.roundSize  attempts per round before the user is asked to continue
 * @param {(opts: object) => Promise<object>} options.suggest  returns a proposal (may carry raw text)
 * @param {(proposal: object) => Promise<void>} options.verify  resolves when the proposal runs; rejects with the runtime error
 * @param {(attempts: object[]) => void} options.onUpdate
 * @param {(attemptCount: number) => Promise<'continue'|'stop'>} options.askToContinue
 * @param {AbortSignal} options.signal
 * @returns {Promise<{status: 'fixed'|'stopped'|'setup'|'empty', proposal?: object, attempts: object[], message?: string}>}
 */
export async function runAiFixLoop({ base, roundSize, suggest, verify, onUpdate, askToContinue, signal }) {
  const attempts = []
  const size = ROUND_SIZES.includes(roundSize) ? roundSize : 1
  const publish = () => onUpdate(attempts.map((attempt) => ({ ...attempt })))

  while (true) {
    if (signal.aborted) return { status: 'stopped', attempts }

    const attempt = { n: attempts.length + 1, status: 'running', reason: '', raw: '', summary: '' }
    attempts.push(attempt)
    publish()

    const previous = feedbackLines(attempts)
    const instruction = [base.instruction, ...previous.map((line) => `${line}. Propose a different fix.`)]
      .filter(Boolean)
      .join('\n')

    try {
      const proposal = await suggest({ ...base, instruction })
      attempt.raw = proposal.raw ?? ''
      attempt.summary = proposal.summary ?? ''
      await verify(proposal)
      attempt.status = 'fixed'
      publish()
      return { status: 'fixed', proposal, attempts }
    } catch (failure) {
      if (signal.aborted) {
        attempt.status = 'failed'
        attempt.reason = 'Stopped by you.'
        publish()
        return { status: 'stopped', attempts }
      }
      attempt.status = 'failed'
      attempt.reason = failure?.message || 'The fix could not be checked.'
      attempt.raw = attempt.raw || failure?.raw || ''
      publish()
      if (failure?.code === 'MISSING_AI_SETUP') {
        return { status: 'setup', attempts, message: attempt.reason }
      }
      // The agent answered with nothing; asking again would only repeat that.
      if (failure?.raw === '') {
        return { status: 'empty', attempts, message: 'The AI returned no response text, so the loop stopped. Check the connection or model, then try again.' }
      }
    }

    const done = attempts.length
    if (done % size === 0 || done === ASK_AT_ATTEMPTS) {
      const decision = await askToContinue(done)
      if (decision !== 'continue' || signal.aborted) return { status: 'stopped', attempts }
    }
  }
}
