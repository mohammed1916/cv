// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Pills and worker selection interact across several difficulty levels",
    "input": "{\"tasks\":[6,11,4,15,9,18,7],\"workers\":[3,8,12,5,16,9],\"pills\":2,\"strength\":5}"
  },
  {
    "label": "No pills means only natural worker strength matters",
    "input": "{\"tasks\":[5,9,14],\"workers\":[4,8,13],\"pills\":0,\"strength\":20}"
  },
  {
    "label": "One large boost should cover the hardest reachable task",
    "input": "{\"tasks\":[4,10,12],\"workers\":[3,9,10],\"pills\":1,\"strength\":9}"
  },
  {
    "label": "Zero boost cannot change a failed assignment",
    "input": "{\"tasks\":[8,13],\"workers\":[6,7],\"pills\":2,\"strength\":0}"
  }
];
