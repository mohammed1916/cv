// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several months and a missing month",
    "employees": [
      {
        "id": 11,
        "month": 1,
        "salary": 4100
      },
      {
        "id": 11,
        "month": 2,
        "salary": 4300
      },
      {
        "id": 11,
        "month": 4,
        "salary": 4700
      },
      {
        "id": 11,
        "month": 5,
        "salary": 4900
      },
      {
        "id": 12,
        "month": 1,
        "salary": 3800
      },
      {
        "id": 12,
        "month": 2,
        "salary": 4200
      },
      {
        "id": 12,
        "month": 3,
        "salary": 4600
      }
    ]
  },
  {
    "label": "Only latest month",
    "employees": [
      {
        "id": 21,
        "month": 7,
        "salary": 5300
      }
    ]
  },
  {
    "label": "Empty table",
    "employees": []
  }
];
