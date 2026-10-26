// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shared prior values and duplicate locations",
    "data": [
      {
        "pid": 11,
        "tiv_2015": 120,
        "tiv_2016": 180,
        "lat": 1,
        "lon": 3
      },
      {
        "pid": 12,
        "tiv_2015": 120,
        "tiv_2016": 240,
        "lat": 2,
        "lon": 4
      },
      {
        "pid": 13,
        "tiv_2015": 170,
        "tiv_2016": 260,
        "lat": 1,
        "lon": 3
      },
      {
        "pid": 14,
        "tiv_2015": 170,
        "tiv_2016": 310,
        "lat": 5,
        "lon": 7
      },
      {
        "pid": 15,
        "tiv_2015": 220,
        "tiv_2016": 340,
        "lat": 8,
        "lon": 9
      }
    ]
  },
  {
    "label": "No shared prior value",
    "data": [
      {
        "pid": 21,
        "tiv_2015": 130,
        "tiv_2016": 200,
        "lat": 0,
        "lon": 1
      },
      {
        "pid": 22,
        "tiv_2015": 180,
        "tiv_2016": 300,
        "lat": 2,
        "lon": 3
      }
    ]
  },
  {
    "label": "Empty table",
    "data": []
  }
];
