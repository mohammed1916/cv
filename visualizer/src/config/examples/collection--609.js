// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Content groups cross directories and filenames",
    "input": "{\"paths\":[\"archive/sketch a.txt(blue) b.txt(green) c.txt(amber)\",\"archive/final cover.txt(blue) notes.txt(gray)\",\"backup x.txt(green) y.txt(blue) z.txt(violet)\"]}"
  },
  {
    "label": "Identical filenames with different contents are not duplicates",
    "input": "{\"paths\":[\"one report.txt(red)\",\"two report.txt(teal)\"]}"
  },
  {
    "label": "Duplicates can share one directory",
    "input": "{\"paths\":[\"lab a.txt(orbit) b.txt(orbit) c.txt(orbit)\"]}"
  },
  {
    "label": "Every distinct content group can remain a singleton",
    "input": "{\"paths\":[\"desk first.txt(sun) second.txt(moon)\",\"shelf third.txt(star)\"]}"
  }
];
