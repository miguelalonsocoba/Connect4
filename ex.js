const { Console } = require("console-mpds");
const console = new Console();

let cells = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  ["R", " ", " ", " ", " ", " ", " "],
  ["R", "Y", " ", " ", " ", " ", " "],
];

console.writeln(cells.length);
console.writeln(cells[0].length);

console.writeln(cells[5][0]);
