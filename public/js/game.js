//Variaveis

import { Sprite } from "../classes/Sprite.js";

const socket = io('http://localhost:5500');
const canvas = document.getElementById("game");
const contexto = canvas.getContext('2d');
const pincel = new Sprite(contexto, 0, 0, 5, 'black');
var suaVezDesenhar = false;
var tempoJogo = 0;

// Canvas

canvas.width = 800;
canvas.height = 600;

contexto.fillStyle = 'white';
contexto.fillRect(0, 0, canvas.width, canvas.height);

const botaoEsquerdo = {
    pressionado: false
}

canvas.addEventListener('mousedown', function (evento) {
    botaoEsquerdo.pressionado = true;
});

canvas.addEventListener('mouseup', function (evento) {
    botaoEsquerdo.pressionado = false;
});

canvas.addEventListener('mousemove', function (evento) {
    if (botaoEsquerdo.pressionado && suaVezDesenhar) {
        pincel.desenhar(evento.offsetX, evento.offsetY, 'black');

        var coordenadas = {
            x: evento.offsetX,
            y: evento.offsetY
        }

        socket.emit('coordenadas', coordenadas);
    }
});

// Conexão

socket.on('mensagensAnteriores', function (objetoMensagens) {
    for (mensagem of objetoMensagens) {
        renderizarMensagens(mensagem);
    }
});

socket.on('mensagensRecebidas', function (objetoMensagem) {
    renderizarMensagens(objetoMensagem);
});

socket.on('suaVezDesenhar', function () {
    suaVezDesenhar = true;
});

socket.on('terminouVezDesenhar', function () {
    suaVezDesenhar = false;
});

socket.on('coordenadasRecebidas', function (coordenadasDesenho) {
    pincel.desenhar(coordenadasDesenho.x, coordenadasDesenho.y, 'black');
})

socket.on('tempoRestante', function (tempoRestante) {
    tempoJogo = tempoRestante;

    atualizarTempo(tempoJogo);
});

socket.on('limparTela', function () {
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    contexto.fillStyle = 'white';
    contexto.fillRect(0, 0, canvas.width, canvas.height);
});

// Funções

if (!$('#nomeJogador').text()) {
    $('#modal').css('display', 'flex');

    $('#modalEnviar').on('click', function () {
        var nickname = $('input[name=nickname]').val();

        $('#nomeJogador').append(nickname);
        $('input[name=nickname]').val('');
        $('#modal').css('display', 'none');

        socket.emit('jogadorConectado', nickname);
    });
}

document.addEventListener('keyup', function (evento) {
    if (evento.key === 'Enter') {
        var enviar = document.querySelector("#enviar");
        var modalEnviar = document.querySelector("#modalEnviar");

        var modal = $('#modal').css('display');
        var autor = $('#nomeJogador').text();
        var mensagem = $('input[name=mensagem]').val();

        if (autor && mensagem && modal === 'none') {
            $('input[name=nickname]').val(autor);

            enviar.click();
        } else if (modal === 'flex') {
            modalEnviar.click();
        }
    }
});

$('#chat').submit(function (evento) {
    evento.preventDefault();

    var autor = $('input[name=nickname]').val();
    var mensagem = $('input[name=mensagem]').val();

    if (autor.length && mensagem.length) {
        var objetoMensagem = {
            autor: autor,
            mensagem: mensagem
        };

        $('input[name=nickname]').val('');
        $('input[name=mensagem]').val('');

        renderizarMensagens(objetoMensagem);

        socket.emit('mensagemEnviada', objetoMensagem);
    }
});

function renderizarMensagens(objetoMensagem) {
    $('#mensagens').append('<div class="mensagem"><strong>' + objetoMensagem.autor + '</strong><br>' + objetoMensagem.mensagem + '</div>')
}

function atualizarTempo(tempo) {
    ;
    $('#tempoJogo').empty();
    $('#tempoJogo').append(tempo);
}