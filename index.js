import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import ejs from 'ejs';

const app = express();
const httpServer = createServer(app);
const socket = new Server(httpServer);
const __dirname = path.resolve();

const porta = 5500;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

httpServer.listen(porta, function () {
    console.log("Server inicializado na porta: " + porta);
});

let jogadoresConectados = [];
let proximoJogador = 0;
let jogadorAtual = 0;

let mensagensRecebidas = [];

let jogoComecou = false;
let tempoJogo = 60;

socket.on("connection", function (socket) {
    socket.emit('mensagensAnteriores', mensagensRecebidas);

    socket.on('mensagemEnviada', objetoMensagem => {
        mensagensRecebidas.push(objetoMensagem);

        socket.broadcast.emit('mensagensRecebidas', objetoMensagem);
    });

    socket.on('jogadorConectado', (nomeJogador) => {
        console.log('Um jogador conectado');

        jogadoresConectados.push({
            id: socket.id,
            nome: nomeJogador
        });

        if (jogadoresConectados.length >= 2) {
            comecarJogo();
        }

        socket.emit('atualizarJogadores', jogadoresConectados);
    });

    socket.on('coordenadas', function (coordenadasDesenho) {
        socket.broadcast.emit('coordenadasRecebidas', coordenadasDesenho);
    });

    socket.on('disconnect', () => {
        console.log('Um jogador desconectado');

        jogadoresConectados = jogadoresConectados.filter((jogador) => jogador.id !== socket.id);

        socket.broadcast.emit('atualizarJogadores', jogadoresConectados);
    });
});

function comecarJogo() {
    if (!jogoComecou) {
        jogoComecou = true;

        definirProximoJogador();

        const contagem = setInterval(() => {
            tempoJogo--;

            for (var i = 0; i < jogadoresConectados.length; i++) {
                socket.to(jogadoresConectados[i].id).emit('tempoRestante', tempoJogo);
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(contagem);

            jogoComecou = false;
            tempoJogo = 60;

            comecarJogo();
        }, 60000);
    }
}

function definirProximoJogador() {
    if (jogadoresConectados.length >= 2) {
        if (proximoJogador >= jogadoresConectados.length) {
            jogadorAtual = jogadoresConectados.length - 1;
            proximoJogador = 0;
        } else {
            if (proximoJogador == 0) {
                jogadorAtual = jogadoresConectados.length - 1;
            } else {
                jogadorAtual = proximoJogador - 1;
            }
        }

        const jogador = jogadoresConectados[proximoJogador];
        const jogadorAnterior = jogadoresConectados[jogadorAtual];

        socket.to(jogador.id).emit('suaVezDesenhar');
        socket.to(jogadorAnterior.id).emit('terminouVezDesenhar');

        for (var i = 0; i < jogadoresConectados.length; i++) {
            socket.to(jogadoresConectados[i].id).emit('limparTela', tempoJogo);
        }

        proximoJogador++;
    }
}