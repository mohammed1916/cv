import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First window', description: 'Sum the first k values.' },
    { id: 'slide', label: 'Slide window', description: 'Add the entering value, remove the leaving value.' },
    { id: 'done', label: 'Answer', description: 'Divide the best window sum by k.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[4,-2,7,1,3,-5],"k":3}' },
    { label: 'Whole array', input: '{"nums":[2,6,4],"k":3}' },
    { label: 'Single value', input: '{"nums":[-7,-1,-3],"k":1}' },
    { label: 'One value', input: '{"nums":[5],"k":1}' },
    { label: 'Equal windows', input: '{"nums":[1,1,1,1],"k":2}' },
    { label: 'Extreme values', input: '{"nums":[-10000,10000,10000],"k":2}' },
    { label: 'Long run: 300 values', input: '{"nums":[-9711,3517,3395,-3879,-2090,9411,-7411,8388,-9027,-8430,1584,-3386,-2526,1027,2076,-9377,3512,6788,9083,622,-9265,9014,-2460,7564,3731,-4684,8209,3717,-7979,-8824,-9908,2329,-3247,-8478,-4774,6629,-7642,9349,8359,-5920,7973,8858,204,-4233,2033,8806,-8428,-2694,5599,5517,9819,2073,723,-2240,-2452,9731,-6474,8122,-1685,-8952,-9035,-1958,-7013,-3853,-8638,-9834,6334,-5623,-8743,9677,-6460,954,-3856,-911,-8728,7804,-1444,2603,4503,-2973,-3094,-8257,-9561,6420,-7854,313,6625,7898,-9384,9485,4358,-3436,940,4320,-4356,8388,7297,3663,4352,4674,-1361,-4632,-7371,-7629,2580,-2109,2650,3246,1247,-3708,3304,-8142,1490,-713,9018,4763,-2034,6303,8251,-2143,1806,3168,-5221,-5780,8862,-1569,-3645,-5187,-3211,-7026,3713,-1391,6067,7546,-2569,3198,-1707,5149,7533,5742,6719,-9008,-3473,9280,207,-8666,4638,-9443,4010,-6342,-8831,-3191,-5872,5964,8410,-7105,7661,-1472,3352,-6812,8361,-7160,5186,2680,1443,1829,3551,6665,-6927,-6128,-7947,-3565,-4700,7488,9013,-4707,-9224,-6464,9753,-5175,5585,5259,2371,3213,5547,-6489,9861,6161,2296,-7162,-4161,-7528,-7426,7543,2133,2337,1758,-5886,-9242,-4088,-4942,-9065,-4528,-6406,5807,9609,1567,-710,-1187,-8793,3890,-9154,1203,-6741,2495,-1173,-6986,-9582,5944,4161,4905,4139,-5392,6831,-2768,1446,8207,1662,2939,-2961,-1160,7023,200,-2235,-6531,1578,-2467,-5180,-117,-7436,-2687,-1335,-4640,-7447,-7879,-3929,7583,6934,7079,2244,-3766,-3631,-3732,-5235,-8099,3938,-4463,425,9028,-5451,6122,-4887,-5170,3499,-2561,-8716,2235,-9824,-7615,-6114,2361,1891,-1089,2066,6256,-6722,36,-5683,-9618,1719,969,-6014,7767,-8683,6247,9800,8930,4037,-9973,978,9029,-2135,5352,-6390,7594,-6505,-6577,-3,-7641,-4384],"k":100}' },
  ],
}

export default function MaxAverageSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Values (window of ${run.input.k})`} length={run.input.nums.length} active={-1}
      valueAt={i => run.input.nums[i]}
      roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i >= step.l && i <= step.r ? 'in window' : '')} />
    <output aria-label="Window sum">Window sum {step.sum} · best {step.best} from index {step.bestStart}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why slide:</strong> neighbouring windows share k − 1 values, so one addition and one subtraction give the next sum.</p>
  </>} />
}
