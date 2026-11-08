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
  },
  {
    "label": "Add then count one point",
    "input": "[[\"add\",[0,0]],[\"count\",[0,0]]]"
  },
  {
    "label": "Corners of the grid",
    "input": "[[\"add\",[20,20]],[\"count\",[20,20]],[\"count\",[0,0]]]"
  },
  {
    "label": "Repeated adds to one point",
    "input": "[[\"add\",[3,3]],[\"add\",[3,3]],[\"count\",[3,3]]]"
  },
  {
    "label": "Long run: 40 operations",
    "input": "[[\"count\",[13,1]],[\"add\",[0,8]],[\"count\",[18,9]],[\"add\",[13,19]],[\"add\",[0,17]],[\"add\",[14,18]],[\"count\",[4,8]],[\"add\",[11,7]],[\"add\",[16,4]],[\"count\",[18,1]],[\"add\",[11,2]],[\"add\",[17,5]],[\"add\",[17,1]],[\"count\",[19,18]],[\"count\",[9,9]],[\"count\",[6,3]],[\"add\",[4,3]],[\"add\",[11,11]],[\"count\",[17,0]],[\"add\",[14,9]],[\"count\",[14,17]],[\"count\",[11,1]],[\"add\",[4,12]],[\"add\",[16,11]],[\"add\",[10,20]],[\"count\",[9,4]],[\"add\",[10,10]],[\"add\",[13,20]],[\"add\",[8,18]],[\"add\",[1,19]],[\"add\",[15,14]],[\"add\",[18,10]],[\"add\",[20,3]],[\"count\",[3,9]],[\"add\",[8,7]],[\"count\",[12,17]],[\"add\",[3,2]],[\"add\",[11,4]],[\"count\",[13,10]],[\"count\",[3,13]]]"
  }
];
