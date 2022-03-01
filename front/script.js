var socket = io();
var name;
$(function () {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);

  socket.on("moveDone", function (data) {

    initTheNamePlayer(data);

    $("#" + data.position).text(data.name);

    if (data.name != name) {
      myTurn = true;
    } else {
      myTurn = false;
    }


    if (!isGameOver()) {
      if (gameTied()) {
        $("#notice").text("Game Drawn!");
        $(".board button").attr("disabled", true);
      } else {
        renderTurnMessage();
      }

    } else {
      $("#name_").text("Game Over ! ");

      if (myTurn) {
        $("#notice").css({ 'color': 'red', 'font-size': '150%' });
        if (data.name == "X") { $("#notice").text("YOU LOST ! X won !"); }
        else { $("#notice").text("YOU LOST ! O won !"); }

      } else {
        $("#notice").css({ 'color': 'blue', 'font-size': '150%' });
        if (data.name == "X") { $("#notice").text("YOU WON ! O lost !"); }
        else { $("#notice").text("YOU WON ! X lost !"); }

      }

      $(".board button").attr("disabled", true);
    }
  });



  socket.on("start", function (data) {
    name = data.name;

    if (name == "X") {
      myTurn = true;
    } else {
      myTurn = false;
    }
    renderTurnMessage();
  });



  socket.on("left", function () {
    $("#notice").text("There is no longer an opponent in the game.");
    $(".board button").attr("disabled", true);
  });



});

function initTheNamePlayer(data) {
  if (data.name == "X") {
    $("#name_").text("O Turn ");
  } else {
    $("#name_").text("X Turn ");
  }
}

function restBoard() {
  $(".board button").each(function () {
    $(this).text("");
  });
}

function getBoardState() {
  var object = {};

  $(".board button").each(function () {
    object[$(this).attr("id")] = $(this).text() || "";
  });
  return object;
}

function gameTied() {
  var state = getBoardState();
  if (
    state.A0 !== "" &&
    state.A1 !== "" &&
    state.A2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.B3 !== "" &&
    state.C0 !== "" &&
    state.C1 !== "" &&
    state.C2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState()

  // options to win 
  var matches = ["XXX", "OOO"];

  var rows = [
    state.A0 + state.A1 + state.A2,
    state.B0 + state.B1 + state.B2,
    state.C0 + state.C1 + state.C2,
    state.A0 + state.B1 + state.C2,
    state.A2 + state.B1 + state.C0,
    state.A0 + state.B0 + state.C0,
    state.A1 + state.B1 + state.C1,
    state.A2 + state.B2 + state.C2,
  ];

  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  if (!myTurn) {
    $("#notice").text("Your opponent's turn");
    $(".board button").attr("disabled", true);
  } else {
    $("#notice").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();

  if (!myTurn) {
    return;
  }

  if ($(this).text().length) {
    return;
  }

  socket.emit("move", {
    name: name,
    position: $(this).attr("id"),
  });

}
