import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import { LookupMap, AccumulationLane } from '../../components/shared/LookupAccumulator';
import { getExamples } from '../../config/examplesRegistry';
import { SOLUTION_CODE, LINE_PATTERN_MAP, R2I_PATTERNS, VAL_MAP, generateSteps } from './algorithm';

const definition = {
  title: 'Roman to Integer', code: SOLUTION_CODE, linePatterns: LINE_PATTERN_MAP, patterns: R2I_PATTERNS,
  fields: [{ key: 's', label: 'Roman numeral', type: 'string' }], initialValues: { s: 'MCMXCIV' }, initialLabel: 'Complex',
  examples: getExamples('roman-to-integer').map(example => ({ ...example, values: { s: example.s } })),
  build(values) {
    const s = values.s.toUpperCase();
    if (!s || !/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s)) throw new Error('Enter a valid Roman numeral from I to MMMCMXCIX.');
    return { input: { s }, frames: generateSteps(s) };
  },
  renderStory({ story, step, stepIndex }) {
    const terms = story.frames.slice(0, Math.max(0, stepIndex) + 1)
      .filter(frame => frame.operation === 'add' || frame.operation === 'subtract')
      .map(frame => ({ label: `${frame.currChar} [${frame.index}]`, value: frame.operation === 'subtract' ? -frame.currVal : frame.currVal }));
    return <div className="lookup-flow">
      <section className="lookup-story"><h3>Read s[i], then compare with s[i + 1]</h3><div className="lookup-map">
        {[...story.input.s].map((char, index) => <div key={index} className={`lookup-cell ${index === step.index ? 'is-current' : ''} ${index === step.index + 1 && step.index >= 0 ? 'is-next' : ''}`}><small>[{index}]</small><strong>{char}</strong></div>)}
      </div></section>
      <LookupMap title="val_map: key → value" entries={Object.entries(VAL_MAP).map(([key, value]) => ({ key, value }))}
        activeKey={step.currChar} nextKey={step.currChar ? story.input.s[step.index + 1] : null} />
      {step.currChar && <section className="lookup-story"><h3>{step.currVal} &lt; {step.nextVal}?</h3><p>{step.currVal < step.nextVal ? 'Subtract the current value: a larger symbol follows.' : 'Add the current value.'}</p>
        {['add', 'subtract'].includes(step.operation) && <strong>{step.res - (step.operation === 'add' ? step.currVal : -step.currVal)} {step.operation === 'add' ? '+' : '−'} {step.currVal} = {step.res}</strong>}
      </section>}
      <AccumulationLane title="Signed contributions, in scan order" terms={terms} result={step.res} />
      <p>{step.message}</p>
    </div>;
  },
};

export default function RomanToIntegerVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
