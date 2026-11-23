import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ProxyCallView from './ProxyCallView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  question: "Given a method that can be called on an object without it existing ahead of time, return a proxy that records each call's method name.",
  approaches: [
    { name: "Proxy handler", intuition: "Intercept property access with a proxy, returning a function for any name.", time: "O(1)", space: "O(1)" },
  ],
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function InfiniteMethodObject() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <ProxyCallView step={step} />} renderReasoning={() => <>
    <p>There are endlessly many possible names, so no object can declare them all ahead of time. The answer has to be produced at the moment a name is read.</p>
    <p>A Proxy get trap runs on every property read and receives the name. It returns a closure, because the caller immediately adds parentheses, and the closure remembers the name to return.</p>
    <pre><code>{`function createInfiniteObject() {
  return new Proxy({}, {
    get: (target, name) => () => String(name),
  })
}`}</code></pre>
    <p>The trap also beats names a plain object inherits, such as toString, because it runs before the prototype chain is consulted.</p>
  </>} />
}
