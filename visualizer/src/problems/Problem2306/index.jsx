import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero valid pairs.' },
    { id: 'group', label: 'Group', description: 'Collect suffixes under each first letter.' },
    { id: 'pair', label: 'Compare letters', description: 'Count suffixes unique to each of two groups.' },
    { id: 'done', label: 'Total', description: 'Report the number of valid ordered pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Names as JSON: {"ideas": [...]}',
  url: 'https://leetcode.com/problems/naming-a-company/',
  complexity: 'O(n * L + k^2 * n) time for n names of length L and k distinct first letters. The visualization caps input at 30 names.',
  examples: [
    { label: 'Example 1', input: '{"ideas":["coffee","donuts","time","toffee"]}' },
    { label: 'Example 2', input: '{"ideas":["lack","back"]}' },
    { label: 'Two names, anagram', input: '{"ideas":["ab","ba"]}' },
    { label: 'Three names, repeated letters', input: '{"ideas":["aa","ab","ba"]}' },
    { label: 'Thirty names, length 8', input: '{"ideas":["mbbyoeif","pzzucegg","jfykmoyi","cvkpwyyc","prgpnmxz","szvmcfds","rtkmgzbb","hpvssvna","prgvtrbs","qwpddwgt","ayvsmctx","qgpvcsns","bgljftti","cpatroxu","dyjtaira","qlaodetn","eadgexsx","vcjdamsu","hjbmcecs","xvvkwmcm","vzrwhojm","vemyiolg","idaghkbi","eyiqbptd","kpjungxd","copmpgdf","usinmwkf","gefglcdn","asnahqfa","uxjbuuci"]}' },
    { label: 'Long run: 20 names', input: '{"ideas":["aagdb","begg","abbbcbg","ddgc","fc","gggaee","edd","gfgfdaba","efcdbg","ac","ffffda","ebffea","egeaaf","fag","fdafgeb","fafdea","dcb","fcaeafe","gfagc","aceaeda"]}' },
  ],
}

export default function NamingCompany() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Valid pairs so far">{`Valid ordered pairs so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Swapping first letters only changes two names, and only the suffix set of each group matters. Two groups contribute the suffixes that appear in one group but not the other.</p>
    <p>A pair is counted in both orders, so each unordered letter pair adds twice its product of unique suffix counts.</p>
  </>} />
}
