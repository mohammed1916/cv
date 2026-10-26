// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Arrivals accumulate during long running tasks",
    "input": "{\"tasks\":[[4,7],[2,5],[3,2],[15,4],[8,1],[8,3],[25,2],[16,1]]}"
  },
  {
    "label": "Equal durations use original index",
    "input": "{\"tasks\":[[5,3],[5,3],[5,3]]}"
  },
  {
    "label": "Long idle gaps jump to next arrival",
    "input": "{\"tasks\":[[2,1],[20,2],[50,1]]}"
  },
  {
    "label": "A running task is not preempted",
    "input": "{\"tasks\":[[1,10],[2,1],[3,2]]}"
  }
];
