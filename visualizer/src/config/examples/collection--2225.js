// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Players accumulate wins and several different loss totals",
    "input": "{\"matches\":[[11,23],[11,34],[23,45],[56,34],[56,67],[45,67],[78,23],[78,89],[11,89],[90,45]]}"
  },
  {
    "label": "One match separates an undefeated winner and one-loss player",
    "input": "{\"matches\":[[7,19]]}"
  },
  {
    "label": "A cycle leaves every player with one loss",
    "input": "{\"matches\":[[2,5],[5,9],[9,2]]}"
  },
  {
    "label": "A frequently losing player belongs to neither output group",
    "input": "{\"matches\":[[3,12],[6,12],[9,12],[3,15]]}"
  }
];
