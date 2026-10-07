// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Forward backward self and null pointers",
    "nodes": [
      {
        "val": 4,
        "random": 3
      },
      {
        "val": 8,
        "random": 0
      },
      {
        "val": 12,
        "random": 2
      },
      {
        "val": 16,
        "random": null
      },
      {
        "val": 20,
        "random": 1
      },
      {
        "val": 24,
        "random": 4
      }
    ]
  },
  {
    "label": "All random pointers absent",
    "nodes": [
      {
        "val": 3,
        "random": null
      },
      {
        "val": 7,
        "random": null
      },
      {
        "val": 11,
        "random": null
      }
    ]
  },
  {
    "label": "One self-pointer",
    "nodes": [
      {
        "val": 17,
        "random": 0
      }
    ]
  },
  {
    "label": "Empty list",
    "nodes": []
  }
];
