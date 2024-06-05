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
  const players = [initPlayer(initToken().getRedToken()), initPlayer(initToken().getYellowToken())];
  const playerView = initPlayerView();
  const turn = initTurn();

  function getValidAndNonFullColumn() {
    let columnComplete;
    let column;
    do {
      column = playerView.getValidColumn(players[turn.getTurn()]);
      columnComplete = board.isThereAGap(column);
      if (columnComplete) {
        console.writeln("La columna elegida ya esta completa. !!!ELIGUE OTRA COLUMNA!!!");
      }
    } while (columnComplete);
    return column;
  }

  return {
    play: function () {
      let winner = false;
      boardView.show();
      while (!winner && !board.isTie()) {
        let columnToInsertToken = getValidAndNonFullColumn();
        board.add(players[turn.getTurn()].getToken(), columnToInsertToken);
        let coordinateOfLastAddedToken = board.getCoordinateOfLastAddedToken(
          players[turn.getTurn()].getToken(),
          columnToInsertToken
        );
        winner = board.isConnect4(coordinateOfLastAddedToken);
        boardView.show();
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
        console.writeln(`Felicidades gano el jugador ${turn.getTurn() + 1}`);
      },
    };
  }

  function initBoard() {
    const NUMBER_ROWS = 6;
    const NUMBER_COLUMNS = 7; // Generar la constante como valor estatico, para que otra clase pueda acceder al valor sin la necesidad de crear un objeto.
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
        const checker = initChecker(this.getCells());
        let directions = [
          [initCoordinate(1, 0), initCoordinate(-1, 0)],
          [initCoordinate(0, 1), initCoordinate(0, -1)],
          [initCoordinate(1, 1), initCoordinate(-1, -1)],
          [initCoordinate(-1, 1), initCoordinate(1, -1)],
        ];
        for (let i = 0; i < directions.length; i++) {
          if (checker.review(directions[i], coordinateOfLastTokenPlaced)) {
            return true;
          }
        }
        return false;
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
      add: function (token, column) {
        let placedToken = false;
        for (let i = NUMBER_ROWS - 1; !placedToken && i >= 0; i--) {
          if (cells[i][column] === EMPTY_CHARACTER) {
            cells[i][column] = token;
            placedToken = true;
          }
        }
      },
      getCoordinateOfLastAddedToken: function (token, column) {
        for (let i = 0; i < NUMBER_COLUMNS; i++) {
          if (cells[i][column] === token) {
            return initCoordinate(column, i);
          }
        }
        return coordinateOfLastAddedToken;
      },
      getNumberRows: function () {
        return NUMBER_ROWS;
      },
      getNumberColumns: function () {
        return NUMBER_COLUMNS;
      },
      isThereAGap: function (column) {
        let firstRow = 0;
        if (cells[firstRow][column] !== EMPTY_CHARACTER) {
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
      getValidColumn: function (player) {
        let error;
        let columnNumber;
        do {
          columnNumber = console.readNumber(
            `Selecciona una columna para insertar FICHA ${player.getToken() === initToken().getRedToken() ? "ROJA" : "AMARILLA"}: `
          );
          error =
            columnNumber < initBoard().getNumberColumns() - initBoard().getNumberRows() ||
            initBoard().getNumberColumns() < columnNumber;
          if (error) {
            console.writeln("Error!!! - Por favor elige una columna entre 1 y 7"); // Remplazar los valores magicos por los valores estaticos de la clase initBoard()
          }
        } while (error);
        return columnNumber - (initBoard().getNumberColumns() - initBoard().getNumberRows());
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
    function isWithinTheRange(coordinate) {
      let RANGE_X = 6;
      let RANGE_Y = 5;
      let MINOR_RANGE = 0;
      return (
        MINOR_RANGE <= coordinate.getAxisX() &&
        coordinate.getAxisX() <= RANGE_X &&
        MINOR_RANGE <= coordinate.getAxisY() &&
        coordinate.getAxisY() <= RANGE_Y
      );
    }

    return {
      review: function (directions, coordinateOfLastTokenPlaced) {
        let count = 1; // 1
        let displacedCoordinate;
        for (let i = 0; i < directions.length; i++) {
          displacedCoordinate = coordinateOfLastTokenPlaced.asYouAreDisplacedIn(directions[i]);
          while (
            isWithinTheRange(displacedCoordinate) &&
            cells[coordinateOfLastTokenPlaced.getAxisY()][coordinateOfLastTokenPlaced.getAxisX()] ===
              cells[displacedCoordinate.getAxisY()][displacedCoordinate.getAxisX()]
          ) {
            count++;
            displacedCoordinate = displacedCoordinate.asYouAreDisplacedIn(directions[i]);
          }
          if (count === 4) {
            return true;
          }
        }
        return false;
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
      asYouAreDisplacedIn: function (direction) {
        return initCoordinate(axisX + direction.getAxisX(), axisY + direction.getAxisY());
      },
    };
  }

  function initToken() {
    const tokens = ["R", "Y"];

    return {
      getRedToken: function() {
        return tokens[0];
      },
      getYellowToken: function() {
        return tokens[1];
      }
    }
  }
}
