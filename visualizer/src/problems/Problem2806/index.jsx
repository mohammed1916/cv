import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "shift",
    "label": "Shift",
    "description": "Add 5 so that ties round up."
  },
  {
    "id": "round",
    "label": "Round",
    "description": "Round down to a multiple of 10."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Return the balance."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with purchaseAmount (JSON), e.g. {\"purchaseAmount\":37}",
  url: "https://leetcode.com/problems/account-balance-after-rounded-purchase/",
  complexity: "O(1) time and O(1) space. The input is a single integer from 0 to 100.",
  examples: [
  {
    "label": "Round down",
    "input": "{\"purchaseAmount\":23}"
  },
  {
    "label": "Tie rounds up",
    "input": "{\"purchaseAmount\":55}"
  },
  {
    "label": "Full amount",
    "input": "{\"purchaseAmount\":100}"
  },
    { label: "Zero purchase", input: "{\"purchaseAmount\":0}" },
    { label: "Tie at five rounds up", input: "{\"purchaseAmount\":5}" },
    { label: "Just below tie rounds down", input: "{\"purchaseAmount\":54}" },
    { label: "Tie at 95 rounds up", input: "{\"purchaseAmount\":95}" },
  ],
}

export default function AccountBalanceAfterRoundedPurchaseVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Multiples of 10 from 0 to 100" length={11} valueAt={i => i * 10}
      active={step.rounded === null ? -1 : step.rounded / 10} roleAt={i => (step.rounded !== null && i === step.rounded / 10 ? 'window' : '')} />
    <output aria-label="Balance">{`Purchase ${step.purchase}, rounded ${step.rounded ?? '-'}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
