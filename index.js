let steps = [];
let currentStep = 0;
let runTimer = null;
let isAnimating = false;
let animationTimeoutId = null;
let cellEls = [];

function generateSteps(arr)
{
    const a = arr.slice();
    const n = a.length;
    const sorted = new Set();
    const steps = [];
    let comparisons = 0;
    let swaps = 0;

    steps.push({
        array: a.slice(),
        compare: [],
        swapped: false,
        sorted: new Set(sorted),
        phase: 'init',
        comparisons,
        swaps,
        message: `Načteno pole: [${a.join(', ')}]`
    });

    for (let i = 0; i < n - 1; i++)
    {
        for (let j = 0; j < n - i - 1; j++)
        {
            comparisons++;
            steps.push({
                array: a.slice(),
                compare: [j, j + 1],
                swapped: false,
                sorted: new Set(sorted),
                phase: 'compare',
                i, j,
                comparisons,
                swaps,
                message: `Porovnávám indexy ${j} a ${j + 1} (${a[j]} vs ${a[j + 1]})`
            });

            if (a[j] > a[j + 1])
            {
                const temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
                swaps++;

                steps.push({
                    array: a.slice(),
                    compare: [j, j + 1],
                    swapped: true,
                    sorted: new Set(sorted),
                    phase: 'swap',
                    i, j,
                    comparisons,
                    swaps,
                    message: `Prohazuji indexy ${j} a ${j + 1} -> [${a.join(', ')}]`
                });
            }
        }
        const markedIndex = n - i - 1;
        sorted.add(markedIndex);
        steps.push({
            array: a.slice(),
            compare: [],
            swapped: false,
            sorted: new Set(sorted),
            phase: 'mark',
            i, markedIndex,
            comparisons,
            swaps,
            message: `Prvek na indexu ${markedIndex} je na svém místě`
        });
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    steps.push({
        array: a.slice(),
        compare: [],
        swapped: false,
        sorted: new Set(sorted),
        phase: 'done',
        comparisons,
        swaps,
        message: `Pole je seřazené: [${a.join(', ')}]`
    });

    return steps;
}

function ensureCells(n)
{
    if (cellEls.length === n) return;

    const grid = document.getElementById("grid");
    const labels = document.getElementById("indexLabels");
    grid.innerHTML = '';
    labels.innerHTML = '';
    cellEls = [];

    for (let idx = 0; idx < n; idx++)
    {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
        cellEls.push(cell);

        const label = document.createElement('div');
        label.className = 'index-label';
        label.textContent = idx;
        labels.appendChild(label);
    }
}

function applyStepVisuals(s)
{
    cellEls.forEach((cell, idx) => {
        cell.textContent = s.array[idx];
        cell.classList.toggle('sorted', s.sorted.has(idx));
        cell.classList.toggle('comparing', s.compare.includes(idx) && !s.swapped);
        cell.classList.toggle('swapping', s.compare.includes(idx) && s.swapped);
    });
}

function animateSwapPositions(j, k, onDone)
{
    const cellJ = cellEls[j];
    const cellK = cellEls[k];
    const dx = cellK.getBoundingClientRect().left - cellJ.getBoundingClientRect().left;

    cellJ.style.transition = 'none';
    cellK.style.transition = 'none';
    cellJ.style.transform = `translateX(${dx}px)`;
    cellK.style.transform = `translateX(${-dx}px)`;
    cellJ.style.zIndex = '2';
    cellK.style.zIndex = '2';

    void cellJ.offsetWidth;

    requestAnimationFrame(() => {
        cellJ.style.transition = 'transform 0.35s ease';
        cellK.style.transition = 'transform 0.35s ease';
        cellJ.style.transform = 'translateX(0)';
        cellK.style.transform = 'translateX(0)';
    });

    animationTimeoutId = setTimeout(() => {
        animationTimeoutId = null;
        cellJ.style.transition = 'none';
        cellK.style.transition = 'none';
        cellJ.style.transform = '';
        cellK.style.transform = '';
        cellJ.style.zIndex = '';
        cellK.style.zIndex = '';
        onDone();
    }, 350);
}

function cancelAnimation()
{
    if (animationTimeoutId !== null)
    {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
    }
    isAnimating = false;
}

function updatePseudocodeHighlight(s)
{
    ['pc-outer', 'pc-inner', 'pc-if', 'pc-swap'].forEach(id => document.getElementById(id).classList.remove('active'));

    if (s.phase === 'compare')
    {
        document.getElementById('pc-inner').classList.add('active');
        document.getElementById('pc-if').classList.add('active');
    }
    else if (s.phase === 'swap')
    {
        document.getElementById('pc-if').classList.add('active');
        document.getElementById('pc-swap').classList.add('active');
    }
    else if (s.phase === 'mark')
    {
        document.getElementById('pc-outer').classList.add('active');
    }
}

function updateControlsDisabled()
{
    const noSteps = steps.length === 0;
    const atEnd = !noSteps && currentStep >= steps.length - 1;

    document.getElementById("step").disabled = noSteps || atEnd || isAnimating;
    document.getElementById("run").disabled = noSteps || atEnd || isAnimating;
    document.getElementById("reset").disabled = noSteps;
}

function getSpeed()
{
    return Number(document.getElementById("speed").value);
}

function handleSpeedChange()
{
    document.getElementById("speedLabel").textContent = `${getSpeed()} ms`;
    if (runTimer !== null)
    {
        clearInterval(runTimer);
        runTimer = setInterval(advance, getSpeed());
    }
}

function render()
{
    const status = document.getElementById("status");
    const progressFill = document.getElementById("progressFill");
    const indices = document.getElementById("indices");

    if (steps.length === 0)
    {
        document.getElementById("grid").innerHTML = '';
        document.getElementById("indexLabels").innerHTML = '';
        cellEls = [];
        status.textContent = '';
        progressFill.style.width = '0%';
        indices.textContent = 'i = –    j = –';
        document.getElementById("statCompare").textContent = '0';
        document.getElementById("statSwap").textContent = '0';
        updatePseudocodeHighlight({ phase: null });
        updateControlsDisabled();
        return;
    }

    const s = steps[currentStep];

    status.textContent = `${s.message} (krok ${currentStep}/${steps.length - 1})`;
    progressFill.style.width = steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%';
    indices.textContent = `i = ${s.i ?? '–'}    j = ${s.j ?? '–'}`;
    document.getElementById("statCompare").textContent = s.comparisons;
    document.getElementById("statSwap").textContent = s.swaps;
    updatePseudocodeHighlight(s);

    const isNewGrid = cellEls.length !== s.array.length;
    ensureCells(s.array.length);

    if (isNewGrid || s.phase !== 'swap')
    {
        applyStepVisuals(s);
        updateControlsDisabled();
        return;
    }

    const [j, k] = s.compare;
    cellEls[j].classList.add('swapping');
    cellEls[k].classList.add('swapping');
    isAnimating = true;
    updateControlsDisabled();

    animateSwapPositions(j, k, () => {
        applyStepVisuals(s);
        isAnimating = false;
        updateControlsDisabled();
    });
}

function stopRun()
{
    if (runTimer !== null)
    {
        clearInterval(runTimer);
        runTimer = null;
    }
}

function advance()
{
    if (isAnimating || steps.length === 0) return;
    if (currentStep >= steps.length - 1)
    {
        stopRun();
        return;
    }
    currentStep++;
    render();
}

function handleLoadClick()
{
    const input = document.getElementById("input");
    const numbers = input.value.split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(Number);

    if (numbers.length === 0 || numbers.some(isNaN))
    {
        document.getElementById("status").textContent = "Zadej platný seznam čísel oddělených čárkou.";
        return;
    }

    stopRun();
    cancelAnimation();
    steps = generateSteps(numbers);
    currentStep = 0;
    cellEls = [];
    render();
}

function step()
{
    if (steps.length === 0) return;
    stopRun();
    advance();
}

function handleRunClick()
{
    if (steps.length === 0) return;
    stopRun();
    runTimer = setInterval(advance, getSpeed());
}

function handleResetClick()
{
    stopRun();
    cancelAnimation();
    currentStep = 0;
    render();
}
