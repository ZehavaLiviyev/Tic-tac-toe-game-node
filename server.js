var express = require('express')
var app = express()
const port = 5000
app.use(express.static('front'))
var server = require('http').createServer(app);
var io = require('socket.io')(server);



app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/screen.html');
});

server.listen(port, () => {
    console.log("listen to port = " + ` http://localhost:${port}`);
})


var players = {};
var secondPlayer;




io.sockets.on("connection", (socket) => {
    console.log("some socket connected ~ " + socket.id)
    socket.emit('connect')

    joinToGame(socket);

    if (getOpSocket(socket)) {
        socket.emit("start", {
            name: players[socket.id].name
        });
        getOpSocket(socket).emit("start", {
            name: players[getOpSocket(socket).id].name,
        });
    }

    socket.on("move", (data) => {
        if (!getOpSocket(socket)) {
            return;
        }
        socket.emit("moveDone", data);
        getOpSocket(socket).emit("moveDone", data);
    });

    socket.on("disconnect", function () {
        if (getOpSocket(socket)) {
            getOpSocket(socket).emit("left");
        }
    });
})

/**************************************** join to game ******************************/
function joinToGame(socket) {

    players[socket.id] = {
        opponent: secondPlayer,
        name: "X",
        socket: socket,
    };

    if (secondPlayer) {
        players[secondPlayer].opponent = socket.id;
        players[socket.id].name = "O";
        secondPlayer = null;
    } else {
        secondPlayer = socket.id;
    }
}

/**************************************** get opponent socket ******************************/


function getOpSocket(socket) {
    if (!players[socket.id].opponent) {
        return;
    }
    return players[players[socket.id].opponent].socket;
}