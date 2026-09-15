let steps = [];
let currentStep = 0;
let runTimer = null;

function generateSteps(arr)
{
    const a = arr.slice();
    const n = a.length;
    const sorted = new Set();
    const steps = [];

    steps.push({
        array: a.slice(),
        compare: [],
        swapped: false,
        sorted: new Set(sorted),
        message: `Načteno pole: [${a.join(', ')}]`
    });

    for (let i = 0; i < n - 1; i++)
    {
        for (let j = 0; j < n - i - 1; j++)
        {
            steps.push({
                array: a.slice(),
                compare: [j, j + 1],
                swapped: false,
                sorted: new Set(sorted),
                message: `Porovnávám indexy ${j} a ${j + 1} (${a[j]} vs ${a[j + 1]})`
            });

            if (a[j] > a[j + 1])
            {
                const temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;

                steps.push({
                    array: a.slice(),
                    compare: [j, j + 1],
                    swapped: true,
                    sorted: new Set(sorted),
                    message: `Prohazuji indexy ${j} a ${j + 1} → [${a.join(', ')}]`
                });
            }
        }
        sorted.add(n - i - 1);
        steps.push({
            array: a.slice(),
            compare: [],
            swapped: false,
            sorted: new Set(sorted),
            message: `Prvek na indexu ${n - i - 1} je na svém místě`
        });
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    steps.push({
        array: a.slice(),
        compare: [],
        swapped: false,
        sorted: new Set(sorted),
        message: `Pole je seřazené: [${a.join(', ')}]`
    });

    return steps;
}

function render()
{
    const grid = document.getElementById("grid");
    const status = document.getElementById("status");

    if (steps.length === 0)
    {
        grid.innerHTML = '';
        status.textContent = '';
        return;
    }

    const s = steps[currentStep];

    grid.innerHTML = '';
    s.array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (s.sorted.has(index)) cell.classList.add('sorted');
        if (s.compare.includes(index)) cell.classList.add(s.swapped ? 'swapping' : 'comparing');
        cell.textContent = value;
        grid.appendChild(cell);
    });

    status.textContent = `${s.message} (krok ${currentStep}/${steps.length - 1})`;
}

function stopRun()
{
    if (runTimer !== null)
    {
        clearInterval(runTimer);
        runTimer = null;
    }
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
    steps = generateSteps(numbers);
    currentStep = 0;
    render();
}

function step()
{
    if (steps.length === 0) return;
    stopRun();
    if (currentStep < steps.length - 1) currentStep++;
    render();
}

function handleRunClick()
{
    if (steps.length === 0) return;
    stopRun();
    runTimer = setInterval(() => {
        if (currentStep >= steps.length - 1)
        {
            stopRun();
            return;
        }
        currentStep++;
        render();
    }, 600);
}

function handleResetClick()
{
    stopRun();
    currentStep = 0;
    render();
}
