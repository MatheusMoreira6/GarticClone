export class Sprite {
    constructor(contexto, posicaoX, posicaoY, tamanho, cor) {
        this.contexto = contexto;
        this.posicaoX = posicaoX;
        this.posicaoY = posicaoY;
        this.tamanho = tamanho;
        this.cor = cor;
    }

    draw() {
        this.contexto.fillStyle = this.cor;
        this.contexto.fillRect(this.posicaoX, this.posicaoY, this.tamanho, this.tamanho);
    }

    desenhar(posicaoX, posicaoY, cor) {
        this.posicaoX = posicaoX;
        this.posicaoY = posicaoY;
        this.cor = cor;

        this.draw();
    }
}  