


function handleButtonClick()
{
    let userInputValue = document.getElementById("input");
    let output = document.getElementById("output");
    let sortedArray = BubbleSort(userInputValue.value.split(',')
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
let array = [66,76,67,65,2,3];
BubbleSort(array);
console.log("sorted")
console.log(array);


