const { Console } = require("console-mpds");
const console = new Console();

initConnect4View().play();

function initConnect4View() {
  return {
    play: function () {
      const continueDialogView = initYesNoDialogView("¿Desea continuar jugando? ");
      do {
        initGameView().play();
        continueDialogView.read();
      } while (continueDialogView.isAffirmative());
    },
  };
}

function initYesNoDialogView(question) {
  let answer;

  function isNegative() {
    return answer === "no";
  }

  return {
    read: function () {
      let error;
      do {
        answer = console.readString(question);
        error = !this.isAffirmative() && !isNegative();
        if (error) {
          console.writeln(`Por favor responada "si" o "no"`);
        }
      } while (error);
    },
    isAffirmative: function () {
      return answer === "si";
    },
  };
}

function initGameView() {
  const board = initBoard();
  const boardView = initBoardView(board);
  let tokens = ["R", "Y"];
  const players = [initPlayer(tokens[0]), initPlayer(tokens[1])];
  const playerView = initPlayerView();
  const turn = initTurn();

  function getValidAndNonFullColumn() {
    let columnComplete;
    let validColumn;
    do {
      validColumn = playerView.getValidColumn();
      columnComplete = board.isColumnComplete(validColumn);
      if (columnComplete) {
        console.writeln("La columna elegida ya esta completa. !!!ELIGUE OTRA COLUMNA!!!");
      }
    } while (columnComplete);
    return validColumn;
  }

  return {
    play: function () {
      let winner = false;
      while (!winner && !board.isTie()) {
        boardView.show();
        let columnToInsertToken = getValidAndNonFullColumn();
        let coordinateOfLastTokenPlaced = board.addInEmptyColumn(players[turn.getTurn()].getToken(), columnToInsertToken);
        winner = board.isConnect4(coordinateOfLastTokenPlaced);
        if (!winner && !board.isTie()) {
          turn.nextTurn();
        }
      }
      if (winner) {
        boardView.showWinningMessage();
      } else if (board.isTie()) {
        board.showTieMessage();
      }
    },
  };

  function initBoardView(board) {
    return {
      show: function () {
        console.writeln("----------------------");
        for (let i = 0; i < board.getNumberRows(); i++) {
          console.write("|");
          for (let j = 0; j < board.getNumberColumns(); j++) {
            console.write(`${board.getCells()[i][j]} |`);
          }
          console.writeln();
        }
        console.writeln("----------------------");
      },
      showWinningMessage: function () {
        console.writeln(`Falicidades gano el jugador ${turn.getTurn() + 1}`);
      },
    };
  }

  function initBoard() {
    const NUMBER_ROWS = 6; //Quitar los get de las constantes y ponerlas como atributos publicos, verificar una vez colocadas como publicas si se pueden acceder desde el metodo privado
    const NUMBER_COLUMNS = 7;
    const EMPTY_CHARACTER = " ";
    let cells;
    generateCells();

    return {
      getCells: function () {
        return cells;
      },
      getNumberAttempts: function (activePlayer) {
        const attempts = 3;
        let countAttempts = 0;
        for (let i = 0; i < NUMBER_ROWS; i++) {
          for (let j = 0; j < NUMBER_COLUMNS; j++) {
            if (cells[i][j] === activePlayer) {
              countAttempts++;
            }
          }
        }
        return countAttempts;
      },
      isConnect4: function (coordinateOfLastTokenPlaced) {
        // console.writeln(`Coordinate: ${coordinateOfLastTokenPlaced.getAxisX()}, ${coordinateOfLastTokenPlaced.getAxisY()}`);
        const HORIZONTAL = [initCoordinate(1, 0), initCoordinate(-1, 0)];
        const VERTICAL = [initCoordinate(0, 1), initCoordinate(0, -1)];
        const DIAGONAL = [initCoordinate(1, 1), initCoordinate(-1, -1)];
        const DIAGONAL_INVERTED = [initCoordinate(-1, 1), initCoordinate(1, -1)];
        const checker = initChecker(this.getCells());

        // Cambiar la condicionales por un ciclo for en el clual se repetira mientras no sea conecta4, la clase checker tendra un unico metodo review
        let isConnect4 = checker.review(HORIZONTAL, coordinateOfLastTokenPlaced);
        console.writeln(`Is Connect4: ${isConnect4}`);
      },
      isTie: function () {
        for (let i = 0; i < NUMBER_ROWS; i++) {
          for (let j = 0; j < NUMBER_COLUMNS; j++) {
            if (cells[i][j] === EMPTY_CHARACTER) {
              return false;
            }
          }
        }
        return true;
      },
      addInEmptyColumn: function (token, column) {
        let lastInsertedToken;
        let placedToken = false;
        for (let i = NUMBER_ROWS - 1; !placedToken && i >= 0; i--) {
          if (cells[i][column] === " ") {
            cells[i][column] = token;
            placedToken = true;
            lastInsertedToken = initCoordinate(column, i);
          }
        }
        return lastInsertedToken;
      },
      getNumberRows: function () {
        return NUMBER_ROWS;
      },
      getNumberColumns: function () {
        return NUMBER_COLUMNS;
      },
      isColumnComplete: function (columnNumber) {
        // Cambiar el nombre por "hay hueco en esta columna"
        let firstRow = 0;
        if (cells[firstRow][columnNumber] !== " ") {
          return true;
        }
        return false;
      },
    };

    function generateCells() {
      cells = [];
      for (let i = 0; i < NUMBER_ROWS; i++) {
        cells[i] = [];
        for (let j = 0; j < NUMBER_COLUMNS; j++) {
          cells[i][j] = EMPTY_CHARACTER;
        }
      }
    }
  }

  function initPlayer(token) {
    return {
      getToken: function () {
        return token;
      },
    };
  }

  function initPlayerView() {
    return {
      getValidColumn: function () {
        const MINIMUM_COLUMN = 1;
        const MAXIMUM_COLUMN = 7;
        let error;
        let columnNumber;
        do {
          columnNumber = console.readNumber("Selecciona una columna para insertar ficha: ");
          error = columnNumber < MINIMUM_COLUMN || MAXIMUM_COLUMN < columnNumber;
          if (error) {
            console.writeln("Error!!! - Por favor elige una columna entre 1 y 7");
          }
        } while (error);
        return columnNumber - 1;
      },
    };
  }

  function initTurn() {
    let turn = 0;
    const MAX_PLAYERS = 2;

    return {
      nextTurn: function () {
        turn = (turn + 1) % MAX_PLAYERS;
      },
      getTurn: function () {
        return turn;
      },
    };
  }

  function initChecker(cells) {
    return {
      review: function (directions, coordinateOfLastTokenPlaced) {
        console.writeln(
          `Coordinate of last token placed: ${coordinateOfLastTokenPlaced.getAxisX()}, ${coordinateOfLastTokenPlaced.getAxisY()}`
        );
        // [[1, 0], [-1, 0]], (3, 2)
        let copyCoordinate = coordinateOfLastTokenPlaced.generateCopy(); // 3, 2
        let isConnect4 = false; // false
        let counter = 1; // 4
        for (let i = 0; !isConnect4 && i < directions.length; i++) {
          // 0; false && true; 0
          copyCoordinate = copyCoordinate.asYouAreDisplacedIn(directions[i]); //(6, 2)
          console.writeln(`Copy coordinate: ${copyCoordinate.getAxisX()}, ${copyCoordinate.getAxisY()}`);
          if (
            cells[copyCoordinate.getAxisX()][copyCoordinate.getAxisY()] ===
            cells[coordinateOfLastTokenPlaced.getAxisX()][coordinateOfLastTokenPlaced.getAxisY()]
          ) {
            counter++;
          }
          if (counter === 4) {
            isConnect4 = true;
          }
        }
        return isConnect4;
      },
    };
  }

  function initCoordinate(axisX, axisY) {
    return {
      getAxisX: function () {
        return axisX;
      },
      getAxisY: function () {
        return axisY;
      },
      moveTo: function (coordinate) {
        return initCoordinate(axisX + coordinate.getAxisX(), axisY + coordinate.getAxisY());
      },
      generateCopy: function () {
        return initCoordinate(axisX, axisY);
      },
      asYouAreDisplacedIn: function (direction) {
        return initCoordinate(axisX + direction.getAxisX(), axisY + direction.getAxisY());
      },
    };
  }
}
