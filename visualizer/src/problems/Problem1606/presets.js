// Fixed presets for Problem 1606. Shared by the workspace and the narration builder.
export const examples = [
  {
    label: 'Official: server 1 wins',
    input: '{"k":3,"arrival":[1,2,3,4,5],"load":[5,2,3,3,3]}',
  },
  {
    label: 'Wraparound',
    input: '{"k":2,"arrival":[1,2,3,5],"load":[1,10,1,1]}',
  },
  {
    label: 'All busy: dropped requests',
    input: '{"k":3,"arrival":[1,2,3,4,5,6],"load":[20,20,20,20,20,20]}',
  },
  {
    label: 'Three servers, four requests',
    input: '{"k":3,"arrival":[1,7,12,20],"load":[5,9,2,6]}',
  },
  {
    label: 'Two servers, two bursts',
    input: '{"k":2,"arrival":[10,11,30,31],"load":[7,8,4,6]}',
  },
  {
    label: 'Single request',
    input: '{"k":1,"arrival":[1],"load":[2]}',
  },
  {
    label: 'Multimode: tied servers',
    input: '{"k":3,"arrival":[1,2,3],"load":[10,12,11]}',
  },
  {
    label: 'Twelve requests, six servers',
    input: '{"k":6,"arrival":[1,6,11,16,21,26,31,36,41,46,51,56],"load":[20,20,20,20,20,20,20,20,20,20,20,20]}',
  },
  {
    label: 'Long run: 12 requests, 3 servers',
    input: '{"k":3,"arrival":[1,5,9,13,15,17,19,20,23,25,30,31],"load":[9,13,4,2,6,14,4,9,17,17,3,19]}',
  },
];
