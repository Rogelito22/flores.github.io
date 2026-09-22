// Configuración de la animación global
let estado = "COLINAS"; // Estados: "COLINAS" -> "FLORES"
let progresoColinas = 0; // Progreso del trazado de las colinas (0 a 1)

let girasoles = [];

// Temporizadores e intervalos independientes para flores
let ultimoTiempoFlor = 0;
const INTERVALO_NUEVA_FLOR = 500; // Nueva flor cada 0.5 segundos

let ultimoTiempoDesvanecer = 0;
const INTERVALO_DESVANECER = 1000; // Desvanecimiento fluido de flores maduras

const MAX_FLORES = 50; // Hasta 50 flores activas simultáneamente

// Puntos para definir las líneas de las colinas
let colinaAtras = [];
let colinaAdelante = [];

// ==========================================
// CONFIGURACIÓN DE MÁQUINA DE ESCRIBIR
// ==========================================
const textoCompleto = 
`Pa que tu quieres las flores la plaza monumental si ninguna de esas flores es nada comparado con el cerro completo de flores que siento por ti.

Mi amor por ti es como cada flor de esta montaña, aumenta cada vez mas y mas, jamas deja de florecer y jamas se detiene.

Mi amor por ti florecera siempre que este repositorio este activo y publicado en internet.

Te amo demasiado Limelim <3

*Bota espuma por la boca*`;

let indiceTexto = 0;
let ultimoTiempoMeca = 0;
const VELOCIDAD_MECA = 75; // Milisegundos por letra

function setup() {
  createCanvas(400, 700);
  angleMode(DEGREES);

  // Parámetros aleatorios para senos/cosenos de la colina trasera (suave)
  let freqA1 = random(0.4, 0.8);
  let ampA1 = random(40, 70);
  let faseA1 = random(0, 360);
  let baseAtras = random(height * 0.62, height * 0.67);

  // Parámetros aleatorios para senos/cosenos de la colina frontal (suave)
  let freqA2 = random(0.6, 1.0);
  let ampA2 = random(50, 80);
  let faseA2 = random(0, 360);
  let baseAdelante = random(height * 0.76, height * 0.81);

  // Generar curvas suaves mediante funciones sinusoidales aleatorias
  for (let x = 0; x <= width; x += 5) {
    // Colina trasera
    let yAtras = baseAtras - sin(x * freqA1 + faseA1) * ampA1;
    colinaAtras.push(createVector(x, yAtras));

    // Colina frontal
    let yAdelante = baseAdelante - sin(x * freqA2 + faseA2) * ampA2;
    colinaAdelante.push(createVector(x, yAdelante));
  }

  ultimoTiempoMeca = millis();
}

function draw() {
  background(10, 15, 30); // Fondo oscuro

  // 1. Dibujar el Sol en la esquina superior izquierda
  dibujarSol();

  // 2. Efecto máquina de escribir respetando el margen del sol
  actualizarYDibujarTexto();

  // 3. Dibujar trazo animado de las colinas
  dibujarColinas();

  // 4. Gestionar y dibujar flores sobre las líneas
  if (estado === "FLORES") {
    gestionarCicloFlores();

    for (let i = girasoles.length - 1; i >= 0; i--) {
      let flor = girasoles[i];
      flor.actualizarYDibujar();

      if (flor.opacidad <= 0) {
        girasoles.splice(i, 1);
      }
    }
  }
}

// Dibujado del Sol en la esquina superior izquierda
function dibujarSol() {
  push();
  let solX = 55;
  let solY = 55;
  let radioSol = 35; // Tamaño máximo de flor (70% de la flor base)

  // Resplandor exterior (Glow)
  noStroke();
  fill(255, 220, 100, 25);
  ellipse(solX, solY, (radioSol * 2) + 35);
  fill(255, 230, 120, 45);
  ellipse(solX, solY, (radioSol * 2) + 18);

  // Núcleo del Sol
  fill(255, 225, 90);
  stroke(255, 190, 40);
  strokeWeight(2);
  ellipse(solX, solY, radioSol * 2);
  pop();
}

// Lógica de texto en pantalla con área de exclusión del sol
function actualizarYDibujarTexto() {
  let tiempoActual = millis();

  if (indiceTexto < textoCompleto.length) {
    if (tiempoActual - ultimoTiempoMeca >= VELOCIDAD_MECA) {
      indiceTexto++;
      ultimoTiempoMeca = tiempoActual;
    }
  }

  let textoVisible = textoCompleto.substring(0, indiceTexto);

  if (indiceTexto < textoCompleto.length && floor(tiempoActual / 400) % 2 === 0) {
    textoVisible += "▌";
  }

  push();
  fill(245, 245, 250);
  noStroke();
  textSize(14);
  textFont('Georgia, serif');
  textAlign(LEFT, TOP);

  drawingContext.shadowOffsetX = 1;
  drawingContext.shadowOffsetY = 2;
  drawingContext.shadowBlur = 4;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.7)';

  // El margen invisible de 1.5x desplaza el texto a x = 120 (55px + 52.5px de margen)
  text(textoVisible, 120, 35, 255, 360);
  pop();
}

// Dibujado paso a paso de las colinas suaves
function dibujarColinas() {
  noFill();
  strokeWeight(3);

  if (estado === "COLINAS") {
    progresoColinas += 0.015;
    if (progresoColinas >= 1) {
      progresoColinas = 1;
      estado = "FLORES";
      let t = millis();
      ultimoTiempoFlor = t;
      ultimoTiempoDesvanecer = t;
    }
  }

  let limite = floor(colinaAtras.length * progresoColinas);

  // Colina trasera / superior (verde claro)
  stroke(40, 180, 90);
  beginShape();
  for (let i = 0; i < limite; i++) {
    vertex(colinaAtras[i].x, colinaAtras[i].y);
  }
  endShape();

  // Colina frontal / inferior (verde intenso)
  stroke(30, 210, 80);
  beginShape();
  for (let i = 0; i < limite; i++) {
    vertex(colinaAdelante[i].x, colinaAdelante[i].y);
  }
  endShape();
}

// Controla la creación a 0.5s y desvanecimiento progresivo
function gestionarCicloFlores() {
  let tiempoActual = millis();

  if (tiempoActual - ultimoTiempoFlor >= INTERVALO_NUEVA_FLOR) {
    crearFlorAleatoriaEnArea();
    ultimoTiempoFlor = tiempoActual;
  }

  if (girasoles.length >= MAX_FLORES) {
    if (tiempoActual - ultimoTiempoDesvanecer >= INTERVALO_DESVANECER) {
      for (let f of girasoles) {
        if (f.fase === "FIN") {
          f.iniciarDesvanecimiento();
          ultimoTiempoDesvanecer = tiempoActual;
          break;
        }
      }
    }
  }
}

// Genera una flor con tamaño reducido (entre 20% y 70%)
function crearFlorAleatoriaEnArea() {
  let x = random(10, width - 10);
  
  let indiceColina = floor(map(x, 0, width, 0, colinaAtras.length - 1));
  let yLimiteSuperior = colinaAtras[indiceColina].y;
  
  let y = random(yLimiteSuperior, height - 40);

  let factorProfundidad = map(y, height * 0.5, height, 0.4, 1.0);
  let escalaBase = random(0.2, 0.7);
  let escalaFinal = escalaBase * factorProfundidad;

  girasoles.push(new Girasol(x, y, escalaFinal));
}

// CLASE GIRASOL
class Girasol {
  constructor(x, y, escala) {
    this.x = x;
    this.y = y;
    this.escala = escala;

    this.fase = "TALLO";
    this.progresoTallo = 0;
    this.numPetalos = 16;
    this.petaloActual = 0;
    this.progresoPetalo = 0;
    this.progresoCentro = 0;

    this.opacidad = 255;
  }

  iniciarDesvanecimiento() {
    this.fase = "DESVANECER";
  }

  actualizarYDibujar() {
    push();
    translate(this.x, this.y);
    scale(this.escala);

    if (this.fase === "FIN" || this.fase === "DESVANECER") {
      this.dibujarEstatico();
    } else {
      this.dibujarTallo();
      if (this.fase !== "TALLO") this.dibujarPetalosCompletos();
      if (this.fase === "PETALOS") this.animarPetaloActual();
      if (this.fase === "CENTRO") this.dibujarCentro();
    }

    pop();

    this.avanzarEstado();
  }

  dibujarEstatico() {
    stroke(30, 160, 60, this.opacidad);
    strokeWeight(6);
    noFill();
    line(0, 0, 0, 90);

    fill(40, 180, 70, this.opacidad);
    stroke(20, 120, 40, this.opacidad);
    strokeWeight(2);
    ellipse(-20, 50, 30, 15);
    ellipse(20, 60, 30, 15);

    fill(255, 204, 0, this.opacidad);
    stroke(210, 140, 0, this.opacidad);
    strokeWeight(2);
    let anguloPaso = 360 / this.numPetalos;
    for (let i = 0; i < this.numPetalos; i++) {
      push();
      rotate(i * anguloPaso);
      ellipse(0, -45, 18, 50);
      pop();
    }

    fill(90, 50, 20, this.opacidad);
    stroke(50, 25, 5, this.opacidad);
    strokeWeight(2);
    ellipse(0, 0, 50, 50);
  }

  dibujarTallo() {
    stroke(30, 160, 60, this.opacidad);
    strokeWeight(6);
    noFill();
    let altoTallo = map(this.progresoTallo, 0, 1, 0, 90);
    line(0, 90, 0, 90 - altoTallo);

    if (this.progresoTallo > 0.6) {
      fill(40, 180, 70, this.opacidad);
      stroke(20, 120, 40, this.opacidad);
      strokeWeight(2);
      let escalaHoja = map(this.progresoTallo, 0.6, 1, 0, 1);
      ellipse(-20, 50, 30 * escalaHoja, 15 * escalaHoja);
      ellipse(20, 60, 30 * escalaHoja, 15 * escalaHoja);
    }
  }

  animarPetaloActual() {
    let anguloPaso = 360 / this.numPetalos;
    let angulo = this.petaloActual * anguloPaso;

    push();
    rotate(angulo);
    fill(255, 204, 0, this.opacidad);
    stroke(210, 140, 0, this.opacidad);
    strokeWeight(2);
    let h = map(this.progresoPetalo, 0, 1, 0, 50);
    ellipse(0, -h / 2 - 20, 18 * this.progresoPetalo, h);
    pop();
  }

  dibujarPetalosCompletos() {
    let anguloPaso = 360 / this.numPetalos;
    fill(255, 204, 0, this.opacidad);
    stroke(210, 140, 0, this.opacidad);
    strokeWeight(2);

    for (let i = 0; i < this.petaloActual; i++) {
      push();
      rotate(i * anguloPaso);
      ellipse(0, -45, 18, 50);
      pop();
    }
  }

  dibujarCentro() {
    fill(90, 50, 20, this.opacidad);
    stroke(50, 25, 5, this.opacidad);
    strokeWeight(2);
    let diametro = map(this.progresoCentro, 0, 1, 0, 50);
    ellipse(0, 0, diametro, diametro);
  }

  avanzarEstado() {
    if (this.fase === "TALLO") {
      this.progresoTallo += 0.04;
      if (this.progresoTallo >= 1) this.fase = "PETALOS";
    } else if (this.fase === "PETALOS") {
      this.progresoPetalo += 0.2;
      if (this.progresoPetalo >= 1) {
        this.progresoPetalo = 0;
        this.petaloActual++;
        if (this.petaloActual >= this.numPetalos) this.fase = "CENTRO";
      }
    } else if (this.fase === "CENTRO") {
      this.progresoCentro += 0.05;
      if (this.progresoCentro >= 1) {
        this.fase = "FIN";
      }
    } else if (this.fase === "DESVANECER") {
      this.opacidad -= 2;
      if (this.opacidad < 0) this.opacidad = 0;
    }
  }
}