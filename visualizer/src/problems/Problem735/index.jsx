import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty stack', description: 'No survivors yet.' },
    { id: 'explode', label: 'Collision', description: 'The smaller asteroid explodes.' },
    { id: 'both', label: 'Equal', description: 'Equal sizes explode together.' },
    { id: 'push', label: 'Survive', description: 'The asteroid moves on.' },
    { id: 'done', label: 'Complete', description: 'Return the survivors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Asteroids (JSON object with an asteroids array)',
  url: 'https://leetcode.com/problems/asteroid-collision/',
  complexity: 'O(n) time and O(n) space: each asteroid is pushed and popped at most once.',
  examples: [
    { label: 'Chain', input: '{"asteroids":[6,-3,-4,5,-9]}' },
    { label: 'Equal', input: '{"asteroids":[7,-7,-2,3]}' },
    { label: 'Long run', input: '{"asteroids":[-2,-1,1,2]}' },
    { label: 'Single asteroid', input: '{"asteroids":[5]}' },
    { label: 'Equal opposite sizes', input: '{"asteroids":[7,-7]}' },
    { label: 'Largest sizes', input: '{"asteroids":[1000,-1000,-999]}' },
    { label: 'Long run: 200 asteroids', input: '{"asteroids":[42,892,-840,750,-527,-622,-688,-976,-173,613,-430,-851,214,-58,654,-811,-448,-32,687,-143,-52,-558,-958,908,-401,994,-22,-175,390,716,-537,-926,-189,-850,-878,692,-617,-313,-330,-490,228,925,780,788,945,19,765,526,-548,544,-13,-737,948,906,409,614,639,-169,175,344,417,-22,652,263,-896,-825,-187,-293,459,-656,390,-96,-431,-374,-318,991,810,742,448,-27,-985,121,766,413,12,-170,-714,-897,-817,-169,771,-462,-786,-403,-670,442,677,-369,-730,145,-400,896,-66,90,706,705,-522,-763,-566,102,956,-328,448,256,637,171,743,-98,965,-975,40,368,-958,-96,-390,-796,80,-984,-815,-33,-314,384,110,168,-579,482,-602,-73,523,42,-152,371,-807,-705,-138,-713,-629,-570,-854,89,-609,-440,924,602,-574,971,-162,711,-865,926,-803,412,-592,834,-302,269,626,25,315,844,331,947,488,101,-274,46,-723,334,896,-882,-364,639,-832,419,454,-529,-488,-706,-462,312,388,638,-816,-27,943,-63,482,-414,-22,197]}' },
  ],
}

export default function AsteroidCollision() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Asteroids in order (the current one is marked)" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]}
      roleAt={i => (i < step.index ? 'done' : '')} />
    <StackLane title="Survivors moving right (bottom to top)" items={step.stack.map(String)} note={step.value === undefined ? undefined : `incoming ${step.value}`} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only a left-mover can collide, and only with right-movers on top of the stack. Collisions repeat until the incoming asteroid is safe or gone.</p>
    <p>Two left-movers never meet, so the stack never holds a left-mover below a right-mover on the same side.</p>
  </>} />
}
