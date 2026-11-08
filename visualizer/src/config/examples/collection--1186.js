// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One large loss can be removed from a profitable interval",
    "input": "{\"arr\":[4,-2,7,-15,6,3,-1,8,-4]}"
  },
  {
    "label": "All negative keeps one element",
    "input": "{\"arr\":[-9,-3,-7,-5]}"
  },
  {
    "label": "No deletion improves all-positive input",
    "input": "{\"arr\":[2,8,4,6]}"
  },
  {
    "label": "Single negative cannot be deleted to empty",
    "input": "{\"arr\":[-11]}"
  },
  {
    "label": "Single value",
    "input": "{\"arr\":[7]}"
  },
  {
    "label": "Single extreme negative",
    "input": "{\"arr\":[-10000]}"
  },
  {
    "label": "Largest magnitudes",
    "input": "{\"arr\":[10000,-10000,10000]}"
  },
  {
    "label": "Long run: 40 values",
    "input": "{\"arr\":[-2224,7516,3556,-5817,-381,754,-3426,8537,8615,683,-5803,-5307,-281,3524,-1848,2278,5910,4341,5190,8841,-7971,7014,-5249,-5758,9126,2528,-2469,-3697,-3909,8791,9861,-3928,-6725,724,5134,-8235,8961,-4428,3935,6314]}"
  }
];
