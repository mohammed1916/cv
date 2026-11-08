import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ListPointerView from '../../components/shared/ListPointerView'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty list', description: 'No nodes yet.' },
    { id: 'walk', label: 'Walk prev', description: 'Advance prev from the dummy node to the position before the target.' },
    { id: 'splice', label: 'Splice', description: 'Insert or delete at the target position.' },
    { id: 'get', label: 'get', description: 'Walk to the index and read its value.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/design-linked-list/',
  complexity: 'O(index) per operation, which is O(n) in the worst case, and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '[["addAtTail",5],["addAtHead",2],["addAtIndex",2,7],["get",2],["deleteAtIndex",1],["get",1],["get",9]]' },
    { label: 'Single head insert', input: '[["addAtHead",1],["get",0]]' },
    { label: 'Empty list read', input: '[["get",0]]' },
    { label: 'Largest value and index', input: '[["addAtTail",1000],["addAtIndex",0,-1000],["get",1],["deleteAtIndex",0],["get",0]]' },
    { label: 'Long run: 200 operations', input: '[["addAtTail",-188],["deleteAtIndex",0],["addAtTail",-493],["get",0],["get",0],["addAtTail",800],["addAtHead",641],["addAtTail",-912],["deleteAtIndex",0],["addAtTail",197],["get",2],["addAtHead",892],["get",3],["addAtIndex",5,-962],["addAtTail",558],["addAtIndex",3,-808],["deleteAtIndex",0],["addAtHead",-346],["get",1],["get",0],["addAtHead",-381],["get",5],["addAtIndex",9,772],["deleteAtIndex",1],["get",5],["get",5],["addAtHead",590],["addAtIndex",0,215],["addAtTail",692],["deleteAtIndex",3],["deleteAtIndex",7],["get",10],["get",4],["deleteAtIndex",0],["addAtTail",368],["deleteAtIndex",1],["deleteAtIndex",8],["addAtTail",-394],["addAtIndex",3,-280],["get",6],["get",9],["addAtTail",-792],["addAtTail",653],["get",0],["get",8],["addAtHead",-585],["deleteAtIndex",5],["addAtHead",508],["addAtTail",935],["get",8],["addAtIndex",3,-488],["deleteAtIndex",12],["deleteAtIndex",9],["addAtIndex",12,579],["deleteAtIndex",10],["get",4],["deleteAtIndex",0],["addAtIndex",3,407],["deleteAtIndex",11],["addAtIndex",12,-54],["addAtHead",-39],["get",4],["addAtTail",-490],["addAtIndex",12,46],["addAtTail",-478],["addAtTail",-269],["get",17],["deleteAtIndex",9],["addAtHead",215],["get",18],["addAtTail",327],["addAtHead",-62],["addAtTail",722],["addAtTail",39],["addAtIndex",1,-458],["addAtIndex",0,561],["get",5],["deleteAtIndex",23],["deleteAtIndex",4],["addAtIndex",12,474],["addAtHead",295],["addAtIndex",22,837],["get",2],["get",0],["addAtIndex",9,-178],["addAtIndex",2,46],["addAtTail",29],["deleteAtIndex",25],["addAtHead",-430],["addAtHead",204],["addAtHead",-257],["addAtTail",115],["addAtTail",230],["addAtHead",-499],["addAtIndex",10,817],["addAtIndex",29,-350],["addAtTail",-670],["addAtIndex",25,378],["get",21],["get",0],["addAtTail",772],["addAtIndex",23,-758],["addAtTail",-868],["addAtTail",-106],["get",23],["addAtHead",-6],["addAtIndex",36,642],["addAtHead",48],["get",18],["deleteAtIndex",42],["addAtIndex",34,-983],["get",10],["addAtIndex",16,236],["addAtTail",286],["addAtHead",-649],["addAtIndex",12,-633],["get",7],["addAtTail",-267],["addAtTail",-530],["addAtTail",-228],["addAtIndex",5,1000],["addAtHead",-604],["get",42],["deleteAtIndex",39],["addAtIndex",45,-896],["addAtHead",713],["addAtIndex",19,-661],["deleteAtIndex",18],["get",31],["addAtIndex",46,309],["get",10],["addAtTail",354],["addAtIndex",44,-26],["addAtHead",-536],["addAtIndex",20,788],["addAtIndex",50,384],["addAtIndex",54,-383],["addAtHead",989],["addAtTail",212],["addAtTail",315],["addAtTail",251],["addAtHead",-323],["addAtHead",-325],["addAtHead",-801],["addAtHead",-90],["deleteAtIndex",66],["addAtTail",-116],["get",69],["addAtTail",-192],["get",7],["deleteAtIndex",42],["deleteAtIndex",68],["addAtHead",235],["deleteAtIndex",55],["addAtTail",-117],["addAtIndex",28,224],["deleteAtIndex",28],["addAtTail",-87],["addAtIndex",57,-803],["addAtTail",788],["addAtTail",-870],["get",27],["addAtHead",-44],["addAtIndex",44,383],["deleteAtIndex",70],["addAtHead",-534],["addAtIndex",71,-905],["get",53],["addAtTail",-586],["addAtHead",-455],["get",33],["addAtIndex",36,-573],["deleteAtIndex",27],["addAtHead",-223],["get",27],["get",19],["addAtIndex",76,-54],["addAtIndex",12,660],["addAtHead",-258],["addAtTail",249],["addAtTail",-584],["addAtIndex",2,-618],["get",54],["addAtHead",-173],["addAtIndex",47,-29],["addAtTail",231],["addAtHead",-642],["get",20],["get",72],["addAtTail",754],["get",5],["get",66],["get",38],["addAtHead",-824],["addAtIndex",5,-409],["addAtTail",-53],["addAtIndex",3,-406],["addAtHead",729],["addAtTail",-904],["get",52]]' },
  ],
}

export default function LinkedListDesign() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ListPointerView {...step.view} />
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Index rule:</strong> an index equal to the length is a valid append, while larger indices are ignored.</p>
  </>} />
}
