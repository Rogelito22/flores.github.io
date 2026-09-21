// --- TEXTOS DE LA EXPERIENCIA ---
const INTRO_TEXTO = "Yo sé que no te gustan las flores porque se marchitan y se ponen chimbas y vainas, así que por eso, te acomodé unos píxeles que puedes disfrutar por siempre.";

const DECLARACION_BASE = "Mi amor por ti es tan intenso como los colores de esta flor, es tan duradero como este programa, es tan seguro como este código, cada píxel de esta flor representa un sol de mi amor brillando por ti con todas sus fuerzas, nunca me cansaría de decirte que te quiero";

function formatearTexto(texto, maxPalabras = 6) {
  const palabras = texto.split(' ');
  const lineas = [];
  for (let i = 0; i < palabras.length; i += maxPalabras) {
    lineas.push(palabras.slice(i, i + maxPalabras).join(' '));
  }
  return lineas.join('\n');
}

const TEXTO_INTRO_FORMATEADO = formatearTexto(INTRO_TEXTO, 6);

// --- ESTADOS Y CONTROL DE FLUJO ---
let escenaActual = 'INTRO'; // 'INTRO' o 'FLOR'
let idxIntro = 0;
let frameTimerIntro = 0;
let botonSeguirVisible = false;
let botonSalirVisible = false;

// Estado de la flor y declaración
let estadoDeclaracion = {
  textoCompleto: DECLARACION_BASE,
  indiceLetra: 0,
  tantosContados: 0,
  botonSalirPuesto: false,
  frameTimer: 0
};

// Progreso de dibujo de la flor
let dibujoPaso = 0; // 0: Tallo, 1: Hoja, 2: Pétalos trazo, 3: Pétalos relleno, 4: Centro
let progresoTallo = 0;
let progresoHoja = 0;
let petaloActual = 0;
let progresoPetaloArc = 0; // Ámbito de 0 a 120 grados para completar ida y vuelta

// --- SETUP P5.JS ---
function setup() {
  const canvas = createCanvas(800, 800);
  canvas.parent('canvas-container');
  frameRate(30);
}

// --- BUCLE PRINCIPAL DRAW ---
function draw() {
  background(0); // Fondo negro continuo

  if (escenaActual === 'INTRO') {
    dibujarEscenaIntro();
  } else if (escenaActual === 'FLOR') {
    dibujarEscenaFlor();
  }
}

// ==========================================
// ESCENA 1: INTRODUCCIÓN CON MÁQUINA DE ESCRIBIR
// ==========================================
function dibujarEscenaIntro() {
  fill(255);
  noStroke();
  textFont('Courier New');
  textStyle(BOLD);
  textSize(22);
  textAlign(CENTER, TOP);

  // Progresión de máquina de escribir cada 2 frames (~60ms)
  if (idxIntro <= TEXTO_INTRO_FORMATEADO.length) {
    frameTimerIntro++;
    if (frameTimerIntro % 2 === 0) {
      idxIntro++;
    }
  } else {
    botonSeguirVisible = true;
  }

  const textoParcial = TEXTO_INTRO_FORMATEADO.substring(0, idxIntro);
  const lineas = textoParcial.split('\n');
  let startY = 220;
  for (let i = 0; i < lineas.length; i++) {
    text(lineas[i], width / 2, startY);
    startY += 32;
  }

  if (botonSeguirVisible) {
    fill(255, 255, 0);
    textFont('Arial');
    textSize(24);
    textAlign(CENTER, CENTER);
    text("SEGUIR", width / 2, 540);
  }
}

// ==========================================
// ESCENA 2: LA FLOR Y MÁQUINA DE ESCRIBIR INFINITA
// ==========================================
function dibujarEscenaFlor() {
  // 1. Dibujar la Flor animada (en la parte superior)
  dibujarFlorPasoAPaso();

  // 2. Dibujar y animar la declaración en máquina de escribir (parte inferior)
  dibujarDeclaracionMaquinaEscribir();
}

function dibujarFlorPasoAPaso() {
  push();
  // iy = 180 en Turtle equivale a (400, 220) en p5.js
  const centroX = 400;
  const centroY = 220;

  // --- 1. TALLO ---
  if (dibujoPaso >= 0) {
    stroke(0, 128, 0);
    strokeWeight(12);
    const altoMaxTallo = 300;
    const altoActual = (dibujoPaso === 0) ? progresoTallo : altoMaxTallo;
    
    line(centroX, centroY + 50, centroX, centroY + 50 + altoActual);

    if (dibujoPaso === 0) {
      progresoTallo += 10;
      if (progresoTallo >= altoMaxTallo) {
        dibujoPaso = 1;
      }
    }
  }

  // --- 2. HOJA INCLINADA ---
  if (dibujoPaso >= 1) {
    push();
    translate(centroX, centroY + 220);
    rotate(radians(-20));
    fill(0, 128, 0);
    stroke(0, 128, 0);
    strokeWeight(2);

    const escalaHoja = (dibujoPaso === 1) ? progresoHoja : 1.0;
    
    beginShape();
    vertex(0, 0);
    bezierVertex(-50 * escalaHoja, -40 * escalaHoja, -100 * escalaHoja, -20 * escalaHoja, -120 * escalaHoja, 30 * escalaHoja);
    bezierVertex(-60 * escalaHoja, 50 * escalaHoja, -20 * escalaHoja, 30 * escalaHoja, 0, 0);
    endShape(CLOSE);
    pop();

    if (dibujoPaso === 1) {
      progresoHoja += 0.05;
      if (progresoHoja >= 1.0) {
        dibujoPaso = 2; // Pasar a contorno de pétalos
        petaloActual = 0;
        progresoPetaloArc = 0;
      }
    }
  }

  // --- 3. PÉTALOS (TRAZO Y RELLENO) ---
  if (dibujoPaso >= 2) {
    // Dibujar pétalos previamente completados
    for (let i = 0; i < 8; i++) {
      if (dibujoPaso > 3 || (dibujoPaso === 3 && i < petaloActual)) {
        // Rellenos
        dibujarGeometriaPetalo(centroX, centroY, i * 45, 120, true);
      } else if (dibujoPaso === 2 && i < petaloActual) {
        // Trazados completados
        dibujarGeometriaPetalo(centroX, centroY, i * 45, 120, false);
      }
    }

    // Dibujar el pétalo que se está animando lentamente
    if (dibujoPaso === 2) { // Trazado continuo pétalo a pétalo
      dibujarGeometriaPetalo(centroX, centroY, petaloActual * 45, progresoPetaloArc, false);
      progresoPetaloArc += 4; // Velocidad del trazo
      if (progresoPetaloArc > 120) { // 120° en total (60° ida + 60° vuelta)
        progresoPetaloArc = 0;
        petaloActual++;
        if (petaloActual >= 8) {
          dibujoPaso = 3; // Pasar a rellenar los pétalos
          petaloActual = 0;
        }
      }
    } else if (dibujoPaso === 3) { // Relleno uno a uno
      dibujarGeometriaPetalo(centroX, centroY, petaloActual * 45, 120, true);
      petaloActual++;
      if (petaloActual >= 8) {
        dibujoPaso = 4; // Pasar al centro
      }
    }
  }

  // --- 4. CENTRO MARRÓN DE LA FLOR ---
  if (dibujoPaso >= 4) {
    fill(92, 51, 23); // Color #5C3317
    noStroke();
    circle(centroX, centroY, 130); // Diámetro 130 (radio 65)
  }

  pop();
}

// Función auxiliar matemática que simula fielmente forma_petalo() de Turtle
function dibujarGeometriaPetalo(cx, cy, anguloDeg, progresoGrados, esRelleno) {
  push();
  translate(cx, cy);
  rotate(radians(anguloDeg));

  if (esRelleno) {
    fill(255, 255, 0);
    stroke(255, 255, 0);
    strokeWeight(2);
  } else {
    noFill();
    stroke(255, 255, 0);
    strokeWeight(8);
  }

  const R = 180; // Radio del arco igual que en Python: circle(180, 60)
  const maxArc1 = min(progresoGrados, 60);

  beginShape();
  // 1. Primer arco: de 0° a 60° (ida)
  for (let a = 0; a <= maxArc1; a += 2) {
    let rad = radians(a);
    let x = R * (1 - cos(rad));
    let y = -R * sin(rad);
    vertex(x, y);
  }

  // 2. Segundo arco (de regreso al centro) si el progreso supera los 60°
  if (progresoGrados > 60) {
    const progresoArc2 = min(progresoGrados - 60, 60);
    
    // Punto cumbre del pétalo a los 60°
    const rad60 = radians(60);
    const xPeak = R * (1 - cos(rad60));
    const yPeak = -R * sin(rad60);

    for (let a = 0; a <= progresoArc2; a += 2) {
      let rad = radians(a);
      // Simula el giro de 120° y el arco de retorno a la base
      let x = xPeak - R * (1 - cos(rad));
      let y = yPeak + R * sin(rad);
      vertex(x, y);
    }
  }

  endShape(esRelleno ? CLOSE : OPEN);
  pop();
}

// ==========================================
// MÁQUINA DE ESCRIBIR DE LA DECLARACIÓN
// ==========================================
function dibujarDeclaracionMaquinaEscribir() {
  estadoDeclaracion.frameTimer++;
  
  // Velocidad lenta: 1 letra cada 3 frames (~100ms)
  if (estadoDeclaracion.frameTimer % 3 === 0) {
    if (estadoDeclaracion.indiceLetra < estadoDeclaracion.textoCompleto.length) {
      estadoDeclaracion.indiceLetra++;
    } else {
      estadoDeclaracion.textoCompleto += " tanto";
      estadoDeclaracion.tantosContados++;

      if (estadoDeclaracion.tantosContados === 20 && !estadoDeclaracion.botonSalirPuesto) {
        estadoDeclaracion.botonSalirPuesto = true;
        botonSalirVisible = true;
      }
    }
  }

  const textoActual = estadoDeclaracion.textoCompleto.substring(0, estadoDeclaracion.indiceLetra);
  const textoF = formatearTexto(textoActual, 7);
  let lineas = textoF.split('\n');

  if (lineas.length > 7) {
    lineas = lineas.slice(lineas.length - 7);
  }

  fill(255);
  noStroke();
  textFont('Courier New');
  textStyle(BOLD);
  textSize(16);
  textAlign(CENTER, TOP);

  let startY = 620;
  for (let i = 0; i < lineas.length; i++) {
    text(lineas[i], width / 2, startY);
    startY += 20;
  }

  if (botonSalirVisible) {
    fill(255, 0, 0);
    textFont('Arial');
    textSize(18);
    textAlign(CENTER, CENTER);
    text("SALIR", width / 2, 770);
  }
}

// ==========================================
// INTERACCIÓN DE CLICS (BOTONES)
// ==========================================
function mousePressed() {
  const mouseXNorm = mouseX;
  const mouseYNorm = mouseY;

  if (escenaActual === 'INTRO' && botonSeguirVisible) {
    // Detección área botón SEGUIR
    if (mouseXNorm >= 300 && mouseXNorm <= 500 && mouseYNorm >= 515 && mouseYNorm <= 565) {
      escenaActual = 'FLOR';
      botonSeguirVisible = false;
    }
  } else if (escenaActual === 'FLOR' && botonSalirVisible) {
    // Detección área botón SALIR
    if (mouseXNorm >= 300 && mouseXNorm <= 500 && mouseYNorm >= 750 && mouseYNorm <= 790) {
      location.reload(); // Reiniciar la experiencia
    }
  }
}