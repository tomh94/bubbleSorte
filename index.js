


function handleButtonClick()
{
    let userInputValue = document.getElementById("input");
    let output = document.getElementById("output");

    output.innerHTML = BubbleSort(userInputValue.value.split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(Number));
}

function BubbleSort(a)
{
    for (let i = 0; i < a.length; i++)
    {
        for (let j = 0; j < a.length - i - 1; j++)
        {
            if (a[j] > a[j + 1])
            {
                let temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
    return a;
}

