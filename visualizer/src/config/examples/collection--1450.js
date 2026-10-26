// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Intervals overlap at an interior query time",
    "input": "{\"startTime\":[2,5,1,8,4,10,6],\"endTime\":[7,12,3,11,9,14,10],\"queryTime\":8}"
  },
  {
    "label": "Query equals both interval boundaries",
    "input": "{\"startTime\":[4,2,4],\"endTime\":[4,4,8],\"queryTime\":4}"
  },
  {
    "label": "No interval has started",
    "input": "{\"startTime\":[5,7,9],\"endTime\":[8,11,12],\"queryTime\":1}"
  },
  {
    "label": "One active student",
    "input": "{\"startTime\":[3],\"endTime\":[9],\"queryTime\":6}"
  }
];
