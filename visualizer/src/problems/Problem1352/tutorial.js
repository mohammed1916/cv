// Reason-first script. One scene per line of the submitted solution, explaining why that line is needed.
const WHY = {
  3: ['The class needs somewhere to remember numbers in arrival order.', 'The class needs somewhere to remember the numbers. A plain list keeps them in arrival order, and that order matters because a query asks about the most recent numbers.'],
  5: ['Each new number is recorded at the end.', 'Each add call only records the new number at the end. The end holds the most recent numbers, and that is exactly where the queries look.'],
  7: ['A product starts from one.', 'Now a query arrives. A product needs a starting value that changes nothing when multiplied, and that value is one. Starting from zero would make every answer zero.'],
  8: ['The last k numbers are a slice.', 'The question is about the last k numbers. Slicing from negative k onward isolates exactly that window, so the loop only sees the numbers the question asks for.'],
  9: ['Multiply each number in the window into the product.', 'Each number in the window has to be multiplied in once. The running product grows one number at a time, so after the loop it covers the whole window.'],
  10: ['Return the product the loop built.', 'The loop has covered every number in the window, so the running product is the answer. Returning it now gives the query its result.'],
}

export function productTutorial({ step, previousStep }) {
  const entry = WHY[step.activeLine] ?? ['Next step.', 'This step moves the solution forward.']
  const stream = step.stream ?? []
  return {
    title: entry[0],
    reason: entry[1],
    spoken: { reason: entry[1] },
    action: step.message,
    variables: {
      numbers: stream.join(', ') || '(empty)',
      ...(step.k !== undefined ? { k: step.k } : {}),
      ...(step.product !== null && step.product !== undefined ? { product: step.product } : {}),
    },
    focus: [],
    previous: previousStep ? previousStep.activeLine : null,
  }
}
