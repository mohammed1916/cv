import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DeviceTransferView from './DeviceTransferView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { meta } from './meta'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with units, a rectangular grid of capacities',
  url: 'https://leetcode.com/problems/maximize-sum-of-device-ratings/',
  complexity: 'O(m · n log n) with the sort, or O(m · n) when the two smallest values of each row are found by a scan. The visualization caps units at 8 devices of 8 units.',
  examples: [
    { label: 'Three devices', input: '{"units":[[9,4,7],[8,2,6],[5,10,5]]}' },
    { label: 'Sink already holds the lowest', input: '{"units":[[3,9,4],[7,8,8]]}' },
    { label: 'One unit each', input: '{"units":[[3],[8],[5]]}' },
    { label: 'Only one device', input: '{"units":[[6,2,9]]}' },
    { label: 'Single unit', input: '{"units":[[1]]}' },
    { label: 'Equal capacities', input: '{"units":[[4,4],[4,4]]}' },
    { label: 'Largest capacities', input: '{"units":[[100000,1,100000],[1,100000,1],[50000,50000,50000]]}' },
    { label: 'Long run: 8 by 8', input: '{"units":[[70786,7984,63752,5545,1785,90541,19158,2687],[13426,7683,44150,48866,41893,409,20669,52067],[28123,40027,15901,14221,49033,56045,29185,37856],[63305,3211,98001,50811,42031,81793,45849,25570],[79537,50123,79840,94807,4687,93507,70805,89663],[38001,38537,73736,52357,64874,26872,71369,99665],[20224,87564,48728,38845,4888,71973,31438,62564],[79051,40345,45616,74395,3054,14115,82160,21436]]}' },
  ],
}

export default function MaximizeSumOfDeviceRatings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <DeviceTransferView step={step} />} renderReasoning={() => <>
    <p>A device's rating only rises when its lowest unit leaves, and one send can remove only one unit, so the best a device can ever rate is its second-lowest.</p>
    <p>Every unit that leaves has to land somewhere, and receiving can only lower a rating. So send them all to one device and accept one bad rating instead of many.</p>
    <p>That sink ends up rating the lowest unit overall, whether it received it or held it all along. Its loss is its second-lowest minus that value, so the device with the smallest second-lowest gives up the least.</p>
    <p>With a single unit per device, sending empties the sender and rates it 0, so no transfer can pay off. A lone device has nowhere to send, and the same formula gives its lowest unit.</p>
  </>} />
}
