// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several square sizes and duplicate corners coexist",
    "input": "{\"operations\":[[\"add\",2,2],[\"add\",2,6],[\"add\",6,2],[\"count\",6,6],[\"add\",2,6],[\"count\",6,6],[\"add\",6,10],[\"add\",10,6],[\"add\",10,10],[\"count\",6,6],[\"add\",2,10],[\"add\",10,2],[\"count\",2,2]]}"
  },
  {
    "label": "A query corner need not be stored",
    "input": "{\"operations\":[[\"add\",1,3],[\"add\",5,3],[\"add\",1,7],[\"count\",5,7]]}"
  },
  {
    "label": "Three collinear points make no square",
    "input": "{\"operations\":[[\"add\",2,4],[\"add\",5,4],[\"add\",8,4],[\"count\",5,7]]}"
  },
  {
    "label": "Counting an empty structure returns zero",
    "input": "{\"operations\":[[\"count\",7,9]]}"
  }
];
