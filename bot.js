#!/usr/local/bin/node
var net = require('net');
var connected = false;
var c;

function parse(m) {
    // This function is reponsible for all the 
    // parsing we are going to do
    m = m.toString();
    var msg = {
        "cmd": undefined,
        "who": undefined,
        "tgt": undefined,
        "text": undefined,
        "raw": m
    }
    var t = m.split(":");
    if (!connected && m.split(" ")[1] == "001") {
        connected = true;
    } else if (!connected) {
        return msg;
    }
    msg.text = t[2];
    if (t[1] === undefined) {
        return msg;
    }
    t = t[1].split(" ");
    msg.who = t[0];
    msg.cmd = t[1];
    msg.tgt = t[2];
    return msg;
}

var server = new net.createServer(function (s) {
    client(s);
    s.write("Connected!\r\n");
    s.on('data', function (d) {
        c.write(d);
        socket = s;
    });
    s.on('close', function (d) {
       c.write("\r\nQUIT\r\n");
       connected == false;
    });
    s.on('error', function (e) {
        console.log(JSON.stringify(e));
    });
}).listen(4269, '0.0.0.0');

function client(socket) {
    if (!connected) {
        c = new net.Socket()
        console.log("connecting to freenode...");
        c.connect(6667, "chat.freenode.net", function () {
            c.write('USER olympicsbot 8 * :OlympicsBot\r\n');
            c.write('NICK olympicstest\r\n');
        });
    }
    c.on('data', function (d) {
        console.log(d.toString());
        m = d.toString().split('\r\n');
        for (i in m) {
            if (i === undefined) continue;
            socket.write(JSON.stringify(parse(m[i])) + "\n");
        }
    });
    c.on('close', function () {
        console.log("Connection closed");
    });
    c.on('error', function (e) {
        console.log(JSON.stringify(e));
    });
}
