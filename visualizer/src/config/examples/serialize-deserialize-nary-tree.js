// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven nested child groups",
    "tree": {
      "val": 10,
      "children": [
        {
          "val": 20,
          "children": [
            {
              "val": 50
            },
            {
              "val": 60,
              "children": [
                {
                  "val": 90
                }
              ]
            }
          ]
        },
        {
          "val": 30
        },
        {
          "val": 40,
          "children": [
            {
              "val": 70
            },
            {
              "val": 80
            }
          ]
        }
      ]
    }
  },
  {
    "label": "Single node",
    "tree": {
      "val": 17
    }
  },
  {
    "label": "Wide root",
    "tree": {
      "val": 3,
      "children": [
        {
          "val": 5
        },
        {
          "val": 7
        },
        {
          "val": 9
        },
        {
          "val": 11
        }
      ]
    }
  }
];
