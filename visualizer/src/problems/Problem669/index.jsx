import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start at root', description: 'Each node is compared with the range [low, high].' },
    { id: 'cut', label: 'Cut a node', description: 'A node outside the range is replaced by one of its subtrees.' },
    { id: 'keep', label: 'Keep a node', description: 'A node in range stays, and both children are trimmed.' },
    { id: 'done', label: 'Trimmed', description: 'The remaining tree is in range.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'BST and range (JSON object with root, low and high)',
  url: 'https://leetcode.com/problems/trim-a-binary-search-tree/',
  complexity: 'O(n) time for n nodes and O(h) recursion space.',
  examples: [
    { label: 'Left cut', input: '{"root":[6,2,8,1,4,null,9],"low":3,"high":7}' },
    { label: 'Right cut', input: '{"root":[5,1,9,null,3,8],"low":2,"high":6}' },
    { label: 'Whole kept', input: '{"root":[4,2,5],"low":1,"high":9}' },
    { label: 'Single node kept', input: '{"root":[1],"low":0,"high":1}' },
    { label: 'Equal bounds', input: '{"root":[2,1,3],"low":2,"high":2}' },
    { label: 'Full range keeps all', input: '{"root":[5000,0,10000],"low":0,"high":10000}' },
    { label: 'No node in range', input: '{"root":[1,0,2],"low":3,"high":4}' },
    { label: 'Long run: 511 nodes', input: '{"root":[150,134,8867,45,null,3049,9025,24,65,2676,4879,9009,9075,null,null,null,null,280,2852,4098,5624,8958,null,9059,9937,279,1264,2768,2858,3357,4681,5188,8843,8944,9002,9047,9071,9936,9942,257,null,355,2656,2682,2793,2855,2942,3205,3470,4633,4832,5117,5425,6001,null,8883,null,8960,null,null,null,null,null,9419,null,9939,null,196,null,342,1185,1929,2675,2681,2684,2791,2797,null,null,2914,3022,3186,3229,3452,3972,4457,null,4714,4839,4923,5170,5371,5491,5937,7116,null,8934,null,null,9185,9900,null,null,null,null,334,354,985,1252,1816,2564,2673,null,null,null,null,2719,null,null,null,2844,2886,null,2943,3039,3109,null,3220,3302,3407,null,3575,4036,4289,4576,null,4782,null,4857,4903,5022,null,null,5248,5387,5432,5537,5703,5995,6630,8357,null,null,9173,9318,9537,9912,null,null,null,null,653,999,null,null,1740,1872,2015,2573,null,null,2702,null,2808,null,null,null,null,3021,3030,null,3073,3182,null,null,3297,null,3364,3426,3536,3658,4008,4050,4175,4416,4569,4614,4777,4807,4855,4877,null,4918,4999,5108,5244,null,5373,null,null,null,null,5601,5678,5863,5987,null,6384,6790,7615,8562,9131,null,9193,9352,9519,9814,9907,9932,469,780,null,1063,1539,1752,1844,1898,1935,2250,null,null,2701,null,null,null,2975,null,null,null,null,null,3147,null,3294,null,null,3373,null,null,3486,3557,3616,3696,4000,null,null,null,4133,4285,4410,4440,4501,4574,4610,null,4743,4779,null,null,null,null,null,null,null,null,4980,null,5087,null,5228,null,null,null,null,null,5641,5691,5858,5903,5986,null,6177,6517,6641,7035,7452,7640,8524,8600,9082,9136,null,9204,9332,9411,9422,9520,9747,9893,null,null,null,null,439,517,757,939,1057,null,1419,1654,1744,1773,null,null,1880,null,null,1945,2206,2511,null,null,2965,3018,null,null,null,null,null,null,3484,3488,3550,3573,null,3618,null,3853,null,null,4120,4161,4266,null,4304,null,4424,null,4492,4555,null,null,4601,null,null,null,null,null,4953,null,5049,null,5199,5241,null,null,5682,5694,5751,null,5890,5921,null,null,6046,6245,6512,6606,null,6747,7005,7096,7137,7565,null,7645,8481,8539,null,8790,null,9118,null,null,null,9282,null,null,9393,9414,null,9434,null,null,9544,9795,null,null,375,452,507,617,656,771,890,942,null,null,1278,null,1605,1704,null,null,null,1801,null,null,null,null,2074,2242,2253,null,2950,null,2984,3020,null,null,null,null,3539,null,null,null,null,null,3705,3942,null,null,null,null,4234,null,null,4346,null,null,4479,null,null,4563,null,null,4931,null,null,null,null,null,null,null,null,null,null,null,null,5774,null,5896,5913,null,6034,6065,6219,6262,6427,null,6554,6611,6655,6753,6876,null,7056,null,7131,7257,7474,7576,null,7964,8369,8488,8532,8543,8694,8824,null,null,9253,null,9378,null,null,null,null,9494,9539,9632,9763,null,null,null,440,null,470,null,519,626,null,741,null,773,822,931,null,953,1273,1389,1571,1608,1684,1733,1779,1806,2026,2084,2223,null,null,2364,null,null,null,null,null,null,null,null,null,3714,3871,3970,4200,4248,null,4392,null,null,null,null,null,null,null,5840,null,null,null,null,6023,null,null,6149,null,null,null,6365,null,6462,null,6589,null,null,6644,6746,null,null,6843,6960,7043,7092,null,null,7254,7388,7466,7510,null,null,7807,8219,null,8399,null,8503,null,null,null,null,8612,8706,8819,8831,9220,9254,null,null,null,9497,null,null,null,9683,null,null,null,null,null,472,null,null,null,null,663,null,null,null,810,null,911,937,null,968,null,1276,1325,null,null,null,null,1645,null,null,1709,null,1777,null,null,null,null,2030,null,2106,null,null,2332,2403,null,3792,null,3889,null,null,null,null,null,null,4367,null,null,null,null,6024,6137,null,6339,6383,null,null,null,null,null,6650,6711,null,6838,6855,6920,6975,null,7047,null,null,7184,null,7357,7414,null,null,7499,7522,7746,7890,8212,8298,8387,8473,null,null,null,8689,8701,8740,8810,null,null,null,null,null,null,null,null,null,9669,9697,null,null,null,null,null,null,null,null,null,null,null,973,null,null,null,null,1635,null,1705,1717,null,null,null,2067,null,2151,2267,null,null,2445,3777,3824,null,null,null,null,null,null,6102,null,null,null,null,null,null,null,6671,6736,6808,null,6849,6856,6913,null,null,6990,null,null,7175,7193,7339,7375,7403,7451,null,null,null,7560,7717,7791,7853,7961,8186,8213,8266,8351,null,null,8412,8479,null,null,null,null,8731,8778,null,null,null,null,null,9711,null,null,1628,1639,null,null,null,null,null,null,null,2180,null,2303,null,null,null,null,null,null,null,null,null,6680,null,null,6794,null,null,null,null,6859,null,6918,null,null,null,null,null,null,7338,null,null,null,null,null,null,null,7542,7563,7709,7729,7765,null,7826,null,7912,null,7982,null,null,null,8238,null,null,null,8406,8454,null,null,8707,null,8775,null,9705,null,null,null,null,null,null,null,null,2314,null,6703,null,null,null,null,null,null,null,null,null,7546,null,7564,7650,null,null,7742,null,7778,null,null,null,7948,null,8081,8225,null,null,null,null,null,null,null,8773,null,null,9709,null,null,6702,null,null,null,null,null,null,null,null,null,null,null,7946,7955,8002,8160,null,null,null,null,null,null,null,null,null,null,null,null,null,null,8109,8171,8094],"low":2000,"high":7000}' },
  ],
}

export default function TrimBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.removed.forEach(id => { roles[id] = 'removed' })
    if (step.current !== null) roles[step.current] = step.phase === 'cut' ? 'current-cut' : 'current'
    return <>
      <BinaryTreeLane title={`Original tree, keep ${run.input.low} to ${run.input.high}`} root={run.original} roles={roles}
        note={step.phase === 'done' ? `trimmed to [${step.result.map(v => (v === null ? 'null' : v)).join(', ')}]` : `${step.removed.length} removed`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one subtree survives:</strong> the BST order means a node out of range can only have the other side's subtree still in range.</p>
  </>} />
}
