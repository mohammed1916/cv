export function serverStatus(step, server, k) {
  const job = step.busy.find(item => item.server === server);
  if (job) return job.end > step.clock ? `Busy until ${job.end}` : 'Finished · awaiting release';
  const available = step.free.some(value => (step.approach === 'virtual' ? value % k : value) === server);
  if (available) return 'Available';
  return step.released === server ? 'Released · awaiting insertion' : 'Reserved';
}
