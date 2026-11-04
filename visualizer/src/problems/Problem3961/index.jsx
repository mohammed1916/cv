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
