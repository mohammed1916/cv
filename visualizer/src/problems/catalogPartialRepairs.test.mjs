import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
const inputs = {
  139:{s:'leetcode',wordDict:['leet','code']},140:{s:'catsanddog',wordDict:['cat','cats','and','sand','dog']},
  141:{values:[3,2,0,-4],pos:1},142:{values:[3,2,0,-4],pos:1},432:[['inc','a'],['getMaxKey']],
  3894:30,3895:{nums:[12,22],digit:2},3896:[1,2,3],3899:[3,4,5],3905:{n:2,m:2,sources:[[0,0,1]]},
  3908:{n:101,x:0},3909:[1,3,2],3910:{nums:[0,1],edges:[[0,1]]},3912:[5,5,5],3913:'uoauoa',3914:[3,3,2,1],3915:{nums:[1,3,2],k:1},
}
for(const [id,input] of Object.entries(inputs)) test(`${id}: language contracts and trace references`,async()=>{
 const m=await import(`./Problem${id}/algorithm.js`)
 const run=m.buildTrace(m.parseInput(JSON.stringify(input)))
 assert.ok(run.frames.length)
 assert.ok(m.python.startsWith('def ')||m.python.startsWith('import ')||m.python.startsWith('class '))
 assert.ok(m.code.every((line,i)=>line.line===i+1&&!/^\s*(def |for .*:|if .*:|while .*:)/.test(line.text)), 'pseudocode must not be mislabeled Python')
 for(const frame of run.frames) for(const line of [frame.activeLine,...frame.relatedLines||[]]) {
   assert.ok(Number.isInteger(line)&&line>=1&&line<=m.code.length,`${id}: invalid line ${line}`)
 }
 const names={139:'wordBreak',140:'wordBreak',3894:'signalColor',3895:'countDigitAppearances',3896:'minOperations',3899:'triangleAngles',3905:'floodFill',3908:'validNumber',3909:'compareSums',3910:'countSubgraphs',3912:'validElements',3913:'sortVowels',3914:'minOperations',3915:'maxAlternatingSum'}
 const argumentsById={139:[input.s,input.wordDict],140:[input.s,input.wordDict],3895:[input.nums,input.digit],3905:[input.n,input.m,input.sources],3908:[input.n,input.x],3910:[input.nums,input.edges],3915:[input.nums,input.k]}
 let driver
 if(id==='141'||id==='142') driver=`
class Node:
    def __init__(self, value): self.val, self.next = value, None
nodes = [Node(v) for v in payload['values']]
for i in range(len(nodes)-1): nodes[i].next = nodes[i+1]
if nodes and payload['pos'] >= 0: nodes[-1].next = nodes[payload['pos']]
answer = ${id==='141'?'hasCycle':'detectCycle'}(nodes[0] if nodes else None)
answer = ${id==='141'?'answer':'nodes.index(answer) if answer is not None else None'}
`
 else if(id==='432') driver=`
obj = AllOne()
answer = []
for operation in payload:
    value = getattr(obj, operation[0])(*operation[1:])
    if operation[0].startswith('get'): answer.append(value)
`
 else driver=`answer = ${names[id]}(*payload)`
 const payload=id==='141'||id==='142'||id==='432'?input:argumentsById[id]||[input]
 const executed=spawnSync('python3',['-c',m.python+'\nimport json,sys\npayload=json.loads(sys.stdin.read())\n'+driver+'\nprint(json.dumps(answer))'],{input:JSON.stringify(payload),encoding:'utf8'})
 assert.equal(executed.status,0,executed.stderr)
 const expected=id==='140'?run.sentences:id==='141'?run.hasCycle:id==='142'?run.cycleNode?.id??null:run.result
 const actual=JSON.parse(executed.stdout)
 if(id==='3899') actual.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-5))
 else assert.deepEqual(actual,expected)
 const compiled=spawnSync('python3',['-c','import ast,sys; ast.parse(sys.stdin.read())'],{input:m.python,encoding:'utf8'})
 assert.equal(compiled.status,0,compiled.stderr)
})
