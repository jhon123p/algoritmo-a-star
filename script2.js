const fs = require('fs');
const pontos = JSON.parse(fs.readFileSync('pontos.json'));

function toRadians(graus) {
  return (graus * Math.PI) / 180;
}

function distancia(ponto1, ponto2) {
  const circTerra = 40075000;
  const distanciaY = (ponto1['latitude'] - ponto2['latitude']) * (circTerra / 360);

  const fatorPonto1 = Math.cos(toRadians(ponto1['latitude']));
  const fatorPonto2 = Math.cos(toRadians(ponto2['latitude']));

  const distanciaX = (ponto1['longitude'] - ponto2['longitude']) * (fatorPonto1 + fatorPonto2) * (circTerra / 720);

  const distancia = Math.sqrt(Math.pow(distanciaX, 2) + Math.pow(distanciaY, 2));
  return distancia;
}

function AStar(pontos, origem, destino) {
  const nosAbertos = [];
  const nosFechados = [];
  const caminho = [];

  function No(ponto, pai) {
    this.ponto = ponto;
    this.g = pai ? pai.g + distancia(pai.ponto, ponto) : 0;
    this.h = distancia(ponto, destino);
    this.f = this.g + this.h;
    this.pai = pai;
  }

  const origemNo = new No(origem, null);
  nosAbertos.push(origemNo);

  while (nosAbertos.length > 0) {
    nosAbertos.sort((a, b) => a.f - b.f);

    const noAtual = nosAbertos.shift();
    nosFechados.push(noAtual);

    if (noAtual.ponto === destino) {
      let no = noAtual;
      while (no !== null) {
        caminho.unshift(no.ponto);
        no = no.pai;
      }
      break;
    }

    for (const idAdjacente of noAtual.ponto.adjacentes) {
      const adjacente = pontos.find(p => p.id === idAdjacente);

      if (!adjacente || nosFechados.some(n => n.ponto === adjacente)) {
        continue;
      }

      const g = noAtual.g + distancia(noAtual.ponto, adjacente);
      const h = distancia(adjacente, destino);
      const f = g + h;
      const indexAberto = nosAbertos.findIndex(n => n.ponto === adjacente);

      if (indexAberto === -1) {
        nosAbertos.push(new No(adjacente, noAtual));
      } else if (g < nosAbertos[indexAberto].g) {
        nosAbertos[indexAberto].g = g;
        nosAbertos[indexAberto].f = g + nosAbertos[indexAberto].h;
        nosAbertos[indexAberto].pai = noAtual;
      }
    }
  }

  return caminho;
}

const origem = pontos.find(p => p.id === 1);
const destino = pontos.find(p => p.id === 7);
const caminho = AStar(pontos, origem, destino);
console.log(caminho);
