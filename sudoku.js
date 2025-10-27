// Creamos dinámica del tablero de Sudoku



const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');

for(let r = 0 ; r < 9 ; r++){
    for( let c = 0 ; c< 9 ; c++){
        const idx = r*9 + c;
        const cell = document.createElement('div');
        cell.className = 'cell';
        // añadimos bordes mas gruesos para separar las regiones 3x3

        if(c % 3 === 2) cell.style.borderRight = '2px solid rgba(255,255,255,0.06)';
        if(c % 3 === 0) cell.style.borderLeft = '2px solid rgba(255,255,255,0.02)';
        if(r % 3 === 2) cell.style.borderBottom = '2px solid rgba(255,255,255,0.06)';
        if(r % 3 === 0) cell.style.borderTop = '2px solid rgba(255,255,255,0.02)';

        const input = document.createElement('input');
        input.maxLength = 1;
        input.inputMode = 'numeric';
        input.pattern = '[1-9]';
        input.dataset.r = r; //esto nos ayuda a identificar la fila porque no tenemos acceso a r y c despues
        input.dataset.c = c;
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);
        cell.appendChild(input);
        gridEl.appendChild(cell);

    }
} 


function onInput(e){
    const v = e.target.value.replace(/[^1-9]/g,''); //solo permitimos numeros del 1 al 9
    //el e contiene la informacion del evento como el target.
    e.target.value = v; 
    console.log(`Input en fila ${e.target.dataset.r} columna ${e.target.dataset.c}: ${v}`);
}

function onKeyDown(e){
    const k = e.key;
    const r = parseInt(e.target.dataset.r, 10);
    const c = parseInt(e.target.dataset.c, 10);

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)) {
        e.preventDefault();
        let nr = r, nc = c;

        if (k === 'ArrowUp') {
            nr = (r + 8) % 9;
            console.log(`Mover hacia arriba: fila ${nr}, columna ${nc}`);
        }
        if (k === 'ArrowDown') {
            nr = (r + 1) % 9;
            console.log(`Mover hacia abajo: fila ${nr}, columna ${nc}`);
        }
        if (k === 'ArrowLeft') {
            nc = (c + 8) % 9;
            console.log(`Mover hacia la izquierda: fila ${nr}, columna ${nc}`);
        }
        if (k === 'ArrowRight') {
            nc = (c + 1) % 9;
            console.log(`Mover hacia la derecha: fila ${nr}, columna ${nc}`);
        }

        const pos = nr * 9 + nc;
        gridEl.children[pos].querySelector('input').focus();
    }
}


function readBoard(){
    const board = [];
    for(let r = 0 ; r <9 ; r++){
        board[r] = [];
        for(let c = 0 ; c< 9 ; c++){
            const val = gridEl.children[r*9 + c ].querySelector('input').value;
            board[r][c]= val ===''?0 : parseInt(val,10); //si la celda esta vacia, ponemos 0 sino el valor numerico
        }
    }
    return board;
}

function writeBoard(board, markGiven = false){
    for(let r = 0; r < 9 ; r++){
        for(let c = 0 ; c < 9 ; c++){
            const input = gridEl.children[r*9 +c].querySelector('input');
            input.value = board[r][c] === 0 ? '' : board[r][c];
            if(markGiven){
                input.disabled = board[r][c] !== 0; //deshabilita las celdas que tienen un valor dado
            } else{
                input.disabled = false;
            }
        }
    }
}

function isValid(board, row, col, num){
    // Verificar fila
    for(let c = 0 ; c < 9 ; c++){if (board[row][c] === num) return false;}
    // Verificar columna
    for(let r = 0 ; r < 9 ; r++){if (board[r][col] === num) return false;}
    // Verificar caja 3x3
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;

    for(let r = br; r < br + 3; r++){
        for(let c = bc; c < bc + 3; c++){
            if (board[r][c] === num) return false;
        }
    }
    return true;
}

function validateBoard(board){
    // Recorrer todas las celdas y comprobar cada número si hay conflicto
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const v = board[r][c];
            if (v === 0) continue; // celda vacía -> nada que validar

            // Para no chocar con la propia celda, comprobamos usando isValid
            // sobre una copia temporal de la casilla vaciada:
            board[r][c] = 0;
            const ok = isValid(board, r, c, v);
            board[r][c] = v; // restaurar

            if (!ok) {
                return { ok: false, row: r, col: c, val: v };
            }
        }
    }
    return { ok: true };
}


function findEmpty(board){
    for(let r = 0 ; r < 9 ; r++){
        for(let c = 0 ; c < 9 ; c++){
            if(board[r][c] === 0) return [r,c];
        }
    }
    return null;
}

function solveBoard(board){
    const spot = findEmpty(board);
    if(!spot) return true; //no hay mas espacios vacios, hemos terminado

    const [r,c] = spot;

    for(let n = 1 ; n <= 9 ; n++){
        if(isValid(board, r, c, n)){
            board[r][c] = n;
            if(solveBoard(board)) return true;
            board[r][c] = 0; //backtrack
            
        }
    }

    return false; //no se pudo resolver
}

function* stepSolver(initialBoard){
    //el * indica que es un generador de funciones que sirve para pausar y reanudar la ejecucion 
    const board = initialBoard.map(row => row.slice()); //clonamos el tablero
    const steps = [];

    function helper(){
        const spot = findEmpty(board);
        if(!spot) return true;
        const [r,c] = spot;

        for(let n = 1 ; n <= 9 ; n++){
            if(isValid(board, r, c, n)){
                board[r][c] = n;
                steps.push({r,c,n});
                
                if(helper()) return true;

                //backtrack
                board[r][c] = 0;
                steps.push({r,c, n: 0});
                board[r][c] = 0;
            }
        }
        return false;
    }
    helper();

    for(const s of steps) yield s; //pausa y devuelve el siguiente paso 
    
}

// Buttons 

document.getElementById('clear').addEventListener('click', () => {
    for(let i = 0 ; i < 81 ; i++){

        const inp = gridEl.children[i].querySelector('input');
        inp.value = '';
        inp.disabled = false;
    }
    statusEl.textContent = '';
});

document.getElementById('fillExample').addEventListener('click', () => {

    const ex = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],

        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],

        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9],
    ]

    writeBoard(ex, true);
    statusEl.textContent = 'Ejemplo cargado.';
});

document.getElementById('validate').addEventListener('click', () => {
    const b = readBoard();
    const res = validateBoard(b);

    if(res.ok){
        statusEl.textContent = 'El tablero es válido no se detectaron conflictos.';

    }else{
        statusEl.textContent = `Conflicto en fila ${res.row + 1}, columna ${res.col + 1} con el valor ${res.val}.`;
    }

});

document.getElementById('solve').addEventListener('click', () => {
    const board = readBoard();
    const v = validateBoard(board);
    if(!v.ok){
        statusEl.textContent = `No se puede resolver. Conflicto en fila ${v.row + 1}, columna ${v.col + 1} con el valor ${v.val}.`;
        return;
    }

    const copy = board.map(r => r.slice());
    const ok = solveBoard(copy);

    if(ok){
        writeBoard(copy, true);
        statusEl.textContent = 'Tablero resuelto.';
    } else{
        statusEl.textContent = 'El tablero no tiene solución.';
    }

});

let stepIter = null;

document.getElementById('stepSolve').addEventListener('click', () => {

    if(!stepIter){
        const initial = readBoard();
        const res = validateBoard(initial);

        if(!res.ok){
            statusEl.textContent = `No se puede resolver. Conflicto en fila ${res.row + 1}, columna ${res.col + 1} con el valor ${res.val}.`;
            return;
        }
        stepIter = stepSolver(initial);
        statusEl.textContent = 'Iniciando solución paso a paso.';
    }

    const next = stepIter.next();
    if(next.done){
        statusEl.textContent = 'Solución completada.';
        stepIter = null;
    }else{
        const s = next.value;
        const pos = s.r * 9 + s.c;
        gridEl.children[pos].querySelector('input').value = s.n === 0 ? '' : s.n;
        statusEl.textContent = `Colocando ${s.n} en fila ${s.r + 1}, columna ${s.c + 1}.`;
    }
});

//---------------------------------------------------------------

// Creamos dinámica del tablero de Sudoku

function shuffle(a){
    for(let i = a.length -1 ; i > 0 ; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

function generateEasy(){
    const board = Array.from({length:9}, () => Array(9).fill(0));

    // Ponemos una diagonal de 3x3 cajas aleatorias para garantizar solvencia
    for(let k = 0; k < 9; k += 3){
        const nums = [1,2,3,4,5,6,7,8,9];
        shuffle(nums);
        for(let r = 0; r < 3; r++){
            for(let c = 0; c < 3; c++){
                board[k+r][k+c] = nums[r*3 + c];
            }
        }
    }

    // Resolvemos el Sudoku completo a partir de esa base
    solveBoard(board);

    // Ahora eliminamos algunas celdas para crear un puzzle
    const positions = Array.from({length:81}, (_,i) => i);
    shuffle(positions);
    const holes = 45; // cantidad de celdas vacías (dificultad)
    for(let i = 0; i < holes; i++){
        const pos = positions[i];
        const r = Math.floor(pos / 9);
        const c = pos % 9;
        board[r][c] = 0;
    }

    return board;
}



document.getElementById('generate').addEventListener('click', () => {
    const g = generateEasy();

    if(g){
        writeBoard(g, true);
        statusEl.textContent = 'Tablero generado.';
    } else{
        statusEl.textContent = 'Error al generar el tablero. Vuelva a intentar';
    }
});





















