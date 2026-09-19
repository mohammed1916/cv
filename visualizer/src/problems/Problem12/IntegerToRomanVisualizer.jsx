import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import { LookupMap, AccumulationLane } from '../../components/shared/LookupAccumulator';
import { SOLUTION_CODE, LINE_PATTERN_MAP, I2R_PATTERNS, EXAMPLES, VALUE_SYMBOL_PAIRS, generateSteps } from './algorithm';

const definition = {
  title: 'Integer to Roman', code: SOLUTION_CODE, linePatterns: LINE_PATTERN_MAP, patterns: I2R_PATTERNS,
  fields: [{ key: 'num', label: 'Integer (1–3999)', type: 'string' }],
  initialValues: { num: '1994' }, initialLabel: '1994', examples: EXAMPLES.map(example => ({ ...example, values: { num: String(example.num) } })),
  build(values) {
    const num = Number(values.num);
    if (!/^\d+$/.test(String(values.num).trim()) || !Number.isInteger(num) || num < 1 || num > 3999) throw new Error('Enter a whole number between 1 and 3999.');
    return { input: { num }, frames: generateSteps(num) };
  },
  renderStory({ story, step }) {
    const appended = step.terms.reduce((sum, term) => sum + term.value, 0);
    return <div className="lookup-flow">
      <section className="lookup-story"><h3>{story.input.num} → {step.result || 'empty output'}</h3>
        <p>Remaining: <strong>{step.remainingNum}</strong> · Loop index: <strong>{step.currentIdx < 0 ? '—' : step.currentIdx}</strong></p>
        <progress aria-label="Value subtracted from input" max={story.input.num} value={story.input.num - step.remainingNum} />
      </section>
      <LookupMap title="Ordered values → symbols" entries={VALUE_SYMBOL_PAIRS.map(({ value, symbol }) => ({ key: value, value: symbol }))} activeKey={step.currentVal} />
      {step.currentVal != null && <section className="lookup-story"><h3>while: {step.remainingNum} ≥ {step.currentVal}?</h3>
        <p>{step.activeLine === 7 ? `Appended ${step.currentSymbol}; next subtract ${step.currentVal} from the remaining number.` : step.remainingNum >= step.currentVal ? `Use ${step.currentSymbol}; the inner loop stays at index ${step.currentIdx}.` : 'False: the for loop advances to the next pair.'}</p>
      </section>}
      <AccumulationLane title="Output tokens and their values" terms={step.terms} result={appended} />
      <p>{step.message}</p>
    </div>;
  },
};

export default function IntegerToRomanVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
