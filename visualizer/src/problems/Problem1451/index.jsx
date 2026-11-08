import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1451',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentence of words',
  url: 'https://leetcode.com/problems/rearrange-words-in-a-sentence/',
  complexity: 'O(w^2 + total letters) time for w words, using insertion sort so equal lengths keep their order.',
  examples: [
    { label: 'Mixed lengths', input: 'Reading books keeps minds bright' },
    { label: 'Tie order', input: 'Tiny cat sat' },
    { label: 'One word', input: 'Ant' },
    { label: 'Single word', input: 'Hello' },
    { label: 'Equal lengths keep order', input: 'cat sat map' },
    { label: 'Largest: 50 words', input: 'w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w wo woo wooo woooo wooooo woooooo w' },
    { label: 'Long run: 50 words', input: 'light cat lampxxx sat satx doorxx teax cat longxx tiny keep sat keepxx sat doorx stone stonexx catx lightxx tiny satxx lightx keepxxx teax lamp longxx satxx cat catxxx river doorxx stonex riverxxx stone wordx doorxxx lampx wordxxx stonexxx doorxx doorx keepxx satx longxxx tiny keep long sat catx lampxxx' },
  ],
}

export default function RearrangeWordsInASentence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { order, hole, picked } = step.snapshot
    return <>
      <div role="list" aria-label="Words in current order" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 40 }}>
        {order.map((w, i) => <span key={i} role="listitem" style={{
          border: `${i === hole ? 2 : 1}px solid ${i === hole ? 'var(--text)' : 'var(--border)'}`,
          padding: '4px 8px', fontFamily: 'monospace', minWidth: 48, textAlign: 'center',
        }}>{w === null ? '·' : w}</span>)}
      </div>
      <p>Picked word: {picked ?? 'none'}{hole !== null ? ` · open place ${hole}` : ''}</p>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Order:</strong> words are sorted by length only. Equal lengths keep their original order, because a longer word moves right only when it is strictly longer.</p>
    <p><strong>Capitals:</strong> every word is lowercased first, then only the first word of the result is capitalized.</p>
    <p>{step.message}</p>
  </>} />
}
