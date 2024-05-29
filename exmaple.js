const { Console } = require("console-mpds");
const console = new Console();

// console.writeln(isConnect4());

function isConnect4() {
  let tokens = [
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", "R", " ", " "],
    [" ", " ", " ", "Y", "R", " ", " "],
    [" ", " ", " ", "Y", "R", " ", " "],
    [" ", " ", " ", "Y", "R", " ", " "],
  ];

  let countRows = [0, 0, 0, 0, 0, 0];
  let countColumns = [0, 0, 0, 0, 0, 0, 0];

  for (let i = tokens.length - 1; i > 0; i--) {
    for (let j = tokens[i].length; j > 0; j--) {
      if (tokens[i][j] === "R") {
        countRows[i]++;
        countColumns[j]++;
      }
    }
  }
  for (let i = 0; i < countRows.length; i++) {
    if (countRows[i] === 4) {
      return true;
    }
    if (countColumns[i] === 4) {
      return true;
    }
  }
  return false;
}

// console.writeln(isConnect4DiagonalInvert());

function isConnect4DiagonalInvert() {
  let tokens2 = [
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
  ];

  let tokens3 = [
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", "R", "R", " ", " ", "R"],
    ["Y", "Y", "R", "Y", "Y", "R", "R"],
    ["R", "Y", "Y", "R", "R", "Y", "Y"], //
    ["R", "R", "Y", "R", "Y", "Y", "Y"],
  ];

  let tokens4 = [
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", "R", " "],
    [" ", " ", " ", " ", "R", "Y", " "],
    [" ", " ", "R", "R", "Y", "R", " "],
    [" ", " ", "R", "Y", "Y", "Y", " "],
  ];

  //Que solo verifique hasta la fila 3, ya que antes de la fila 3 no se puede ganar ya que no se completa la diagonal.
  let tokens5 = [
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", "R"],
    [" ", " ", " ", " ", "R", "R", "Y"],
    [" ", " ", " ", " ", "R", "R", "Y"],
    [" ", " ", " ", "R", "Y", "Y", "Y"],
  ];

  let tokens = [
    ["R", " ", " ", " ", " ", " ", " "],
    ["Y", "R", " ", " ", " ", " ", " "],
    ["Y", "Y", "R", "R", " ", " ", " "],
    ["R", "Y", "Y", "R", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " "],
  ];

  let isConnect4 = false;
  for (let i = tokens.length - 1; !isConnect4 && i >= 0; i--) {
    console.writeln(`Value I = ${i}`);
    for (let j = tokens[i].length - 1; !isConnect4 && j >= 0; j--) {
      console.write(` Value J = ${j}\n`);
      if (tokens[i][j] === "R") {
        let countInverseDiagonal = 1; // 4
        let positionColumn = j; // 3
        isConnect4 = true; // true
        for (let k = i - 1; isConnect4 && k >= i - 3; k--) {
          positionColumn--;
          if (tokens[k][positionColumn] === "R") {
            countInverseDiagonal++;
            if (countInverseDiagonal === 4) {
              return true;
            }
          } else {
            isConnect4 = false;
          }
        }
      }
    }
  }
  return false;
}

let cells4 = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
];

add("R", 6);
showCells();

function add(token, column) {
  let placedToken = false;
  for (let i = cells.length - 1; !placedToken && i >= 0; i--) {
    if (cells[i][column] === " ") {
      cells[i][column] = token;
      placedToken = true;
    }
  }
}

function showCells() {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      console.write(`${cells[i][j]},`);
    }
    console.writeln();
  }
}
