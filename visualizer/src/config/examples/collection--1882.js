// Independently authored walkthrough, boundary-case and long-run presets.
export default [
  {
    "label": "Tasks queue while differently weighted servers stay busy",
    "input": "{\"servers\":[5,2,7,2],\"tasks\":[8,6,9,7,2,4,3,10,1,5,2,6]}"
  },
  {
    "label": "Weight tie uses smaller index",
    "input": "{\"servers\":[3,3,3],\"tasks\":[5,5,5,1]}"
  },
  {
    "label": "One server serializes every task",
    "input": "{\"servers\":[8],\"tasks\":[4,2,7,1]}"
  },
  {
    "label": "Short tasks allow idle time",
    "input": "{\"servers\":[7,2],\"tasks\":[1,1,1,1,1]}"
  },
  {
    "label": "Single task on a single server",
    "input": "{\"servers\":[1],\"tasks\":[1]}"
  },
  {
    "label": "Simultaneous completions release together",
    "input": "{\"servers\":[2,2,2],\"tasks\":[3,3,3,3,3]}"
  },
  {
    "label": "A very heavy server is used only when needed",
    "input": "{\"servers\":[1,100],\"tasks\":[50,1,1,1]}"
  },
  {
    "label": "Long run: 12 servers and 80 tasks",
    "input": "{\"servers\":[2,9,9,8,6,12,3,10,20,13,17,20],\"tasks\":[1,10,11,13,5,14,5,3,13,10,3,8,10,10,3,3,15,1,13,2,8,1,7,4,11,6,8,8,1,7,9,8,11,2,3,11,1,1,3,13,12,12,13,10,6,7,10,6,7,13,10,1,11,3,2,7,12,15,2,1,10,1,15,1,6,8,15,8,13,1,10,7,2,1,8,14,2,13,12,2]}"
  }
];
