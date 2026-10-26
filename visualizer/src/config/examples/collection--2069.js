// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Commands visit corners and cross a full circuit",
    "input": "{\"width\":6,\"height\":4,\"operations\":[[\"getPos\"],[\"getDir\"],[\"step\",5],[\"getDir\"],[\"step\",3],[\"getPos\"],[\"getDir\"],[\"step\",8],[\"getPos\"],[\"getDir\"],[\"step\",19],[\"getPos\"],[\"getDir\"]]}"
  },
  {
    "label": "A full lap returns to the origin facing south",
    "input": "{\"width\":4,\"height\":3,\"operations\":[[\"step\",10],[\"getPos\"],[\"getDir\"]]}"
  },
  {
    "label": "Zero steps preserve the untouched initial direction",
    "input": "{\"width\":3,\"height\":3,\"operations\":[[\"step\",0],[\"getPos\"],[\"getDir\"]]}"
  },
  {
    "label": "Huge commands reduce modulo a small perimeter",
    "input": "{\"width\":2,\"height\":2,\"operations\":[[\"step\",1000000],[\"getPos\"],[\"getDir\"],[\"step\",1],[\"getDir\"]]}"
  }
];
