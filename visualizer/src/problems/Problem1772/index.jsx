import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FeatureRankView from './FeatureRankView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1772',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with features and responses (lowercase words separated by single spaces)',
  url: 'https://leetcode.com/problems/sort-features-by-popularity/',
  complexity: 'O(R * (W + F)) time for R responses with W words and F features, plus an O(F log F) sort. Words are matched exactly as lowercase tokens, with case and tokenization taken as written in the input.',
  examples: [
    { label: 'Ties keep order', input: '{"features":["cooler","lock","touch"],"responses":["i like cooler cooler","lock touch cool","locker like tap"]}' },
    { label: 'Repeated words', input: '{"features":["a","bb","c"],"responses":["bb a","c","bb"]}' },
  { label: 'Single feature', input: "{\"features\":[\"cool\"],\"responses\":[\"cool cool\"]}" },
  { label: 'Equal counts keep feature order', input: "{\"features\":[\"ab\",\"cd\"],\"responses\":[\"ab cd\",\"cd ab\"]}" },
  { label: 'Eight features, six responses', input: "{\"features\":[\"alpha\",\"beta\",\"gamma\",\"delta\",\"epsilon\",\"zeta\",\"eta\",\"theta\"],\"responses\":[\"alpha beta gamma\",\"delta delta\",\"zeta eta theta eta\",\"beta\",\"epsilon zeta\",\"theta\"]}" },
  { label: 'Long run: pooled features', input: "{\"features\":[\"ab\",\"bc\",\"cd\",\"de\",\"ef\",\"fg\",\"gh\",\"hi\"],\"responses\":[\"fg ef fg fg ef\",\"hi de de ab\",\"bc hi ef de de\",\"cd fg\",\"gh gh bc\",\"bc\"]}" },
  ],
}

export default function SortFeaturesByPopularityVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FeatureRankView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>A response counts a feature at most once, so the words are gathered into a set before the feature checks.</p>
        </>
      )}
    />
  )
}
