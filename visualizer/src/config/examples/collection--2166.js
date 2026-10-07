// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Flips and repeated updates preserve logical values and counts",
    "input": "{\"size\":8,\"operations\":[[\"fix\",2],[\"fix\",6],[\"count\"],[\"flip\"],[\"toString\"],[\"unfix\",1],[\"fix\",2],[\"fix\",2],[\"one\"],[\"all\"],[\"flip\"],[\"count\"],[\"toString\"]]}"
  },
  {
    "label": "A single bit exercises all and one at both states",
    "input": "{\"size\":1,\"operations\":[[\"all\"],[\"one\"],[\"fix\",0],[\"all\"],[\"count\"],[\"unfix\",0],[\"toString\"]]}"
  },
  {
    "label": "Two flips restore the initial bit pattern",
    "input": "{\"size\":5,\"operations\":[[\"fix\",1],[\"fix\",4],[\"toString\"],[\"flip\"],[\"flip\"],[\"toString\"],[\"count\"]]}"
  },
  {
    "label": "Repeated unfix on an empty bitset keeps the count zero",
    "input": "{\"size\":4,\"operations\":[[\"unfix\",2],[\"unfix\",2],[\"count\"],[\"one\"],[\"all\"]]}"
  }
];
