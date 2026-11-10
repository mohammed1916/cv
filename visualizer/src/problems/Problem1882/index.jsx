import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import ServerQueueVisual from './ServerQueueVisual';
import { serverQueueTutorial } from './tutorial';
import { definition } from './definition';

export default function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    tutorial={serverQueueTutorial}
    renderVisual={({ step }) => <ServerQueueVisual step={step} />}
    renderReasoning={() => <><p>Two orders matter: tasks wait by arrival index; idle servers compete by weight, then server index.</p><p>When every server is busy, jump to the earliest finish and release all servers finishing by that time before choosing. Several queued tasks can start at the same clock time.</p></>} />;
}
