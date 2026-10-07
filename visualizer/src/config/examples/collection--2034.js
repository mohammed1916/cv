// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Old and current timestamps receive different corrections",
    "input": "{\"operations\":[[\"update\",8,47],[\"update\",12,63],[\"update\",5,29],[\"current\"],[\"maximum\"],[\"update\",12,35],[\"current\"],[\"maximum\"],[\"update\",5,72],[\"maximum\"],[\"minimum\"],[\"current\"]]}"
  },
  {
    "label": "Replacing the only timestamp changes every query",
    "input": "{\"operations\":[[\"update\",3,18],[\"update\",3,44],[\"current\"],[\"maximum\"],[\"minimum\"]]}"
  },
  {
    "label": "The latest operation need not have the latest timestamp",
    "input": "{\"operations\":[[\"update\",20,81],[\"update\",4,12],[\"current\"],[\"minimum\"]]}"
  },
  {
    "label": "Equal prices at distinct timestamps remain separate records",
    "input": "{\"operations\":[[\"update\",2,30],[\"update\",7,30],[\"update\",11,30],[\"update\",7,9],[\"maximum\"],[\"minimum\"],[\"current\"]]}"
  }
];
