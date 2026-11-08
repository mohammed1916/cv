import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every distinct word needs its own reference.' },
    { id: 'cover', label: 'Covered', description: 'A word covers its proper suffixes.' },
    { id: 'scan', label: 'Scan', description: 'The word covers nothing else.' },
    { id: 'done', label: 'Complete', description: 'Add each kept word with its # sign.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON array of lowercase words)',
  url: 'https://leetcode.com/problems/short-encoding-of-words/',
  complexity: 'O(total length^2) for the suffix slices in this version; a trie gives O(total length).',
  examples: [
    { label: 'Suffix', input: '["time","me","bell"]' },
    { label: 'Repeat', input: '["pot","top","pot","opt"]' },
    { label: 'Single word', input: '["a"]' },
    { label: 'Duplicate word', input: '["pot","pot"]' },
    { label: 'Longest words and suffixes', input: '["abcdefg","defg","g"]' },
    { label: 'Long run: 200 words', input: '["cee","adecb","d","f","efade","bdadh","g","agfcba","dfecdhf","cfgeccc","a","debdd","ehe","eeab","a","bege","hch","g","agafa","cda","chg","hcdgbc","d","gffeca","hdg","fce","abc","dh","cedbbcb","ffhh","hhbcgd","dhchbbe","chghgd","dddh","cfcc","cadb","bhff","h","hehh","g","gf","a","fdfaggh","dfghgh","cbhhe","cbfa","cbaabdb","eag","fedgbgh","hc","ffb","ebdehc","fgfb","fgcgbfe","eedg","ceagb","hehc","ag","e","e","cddfga","a","ga","dee","cadgebc","gbh","edhcaac","gbbbfde","gggbcf","ffdcceb","dhcg","hddbg","fgbgbdh","hegeeb","cad","dhbeea","hehbg","c","eegagbh","afced","deaef","dcfeadf","gcbag","decbhb","ag","abeggga","d","gcba","hghbdhf","afb","ebfbbbh","bh","haghche","afgfde","aadfhgb","fcffeff","bdfcgbd","fg","gfgbf","ghefe","hhcfg","gcddd","baefffg","f","ddd","g","accdbda","dd","hfgh","bfdg","da","fabbh","fedghba","fbdhae","a","ae","f","bh","dfd","edfg","dbeb","bad","abd","dfda","ceace","eaceffg","b","ae","e","ca","acfghcg","dbad","bd","eahb","dffdbcb","a","becc","ffgdhfc","ccdeabh","behgg","fahd","bgcdea","ab","a","g","f","efh","fdf","g","efbeebh","d","hhfebc","hcbc","fece","fgffcb","ehcbcbf","dddcf","bddf","bheb","cagb","ebdcbg","cdahh","ecedh","ddaadg","gddhdb","e","bb","ghcde","hbeg","eg","d","habgba","gdgecf","aacbhhd","acaebaf","gfgg","dc","dgbcec","h","fcb","efdf","fefd","hdcff","fdh","fefdfd","aagfb","dahgfaf","gh","bdfced","eegab","fgca","hghd","fchha","affbchd","cgcdgb","deach","gbgg","accbhcc","bebbfhh","h"]' },
  ],
}

export default function ShortEncoding() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Words still needing a reference (kept)" columns={['word']}
      rows={step.kept.map(w => ({ word: w }))} activeRow={-1} />
    <p><strong>Just removed:</strong> {step.removed.length ? step.removed.join(', ') : 'nothing'}</p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>An encoding reference ends in #. A word that is a suffix of another word can be read from that longer reference, so it does not need one.</p>
    <p>Each kept word costs its letters plus one for the #.</p>
  </>} />
}
