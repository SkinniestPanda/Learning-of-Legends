let num1 = Math.floor(Math.random() * 10);
let num2 = Math.floor(Math.random() * 10);
document.getElementById("question").innerText = `What is ${num1} + ${num2}?`;

function checkAnswer() {
    let userAnswer = document.getElementById("answer").value;
    if (parseInt(userAnswer) === num1 + num2) {
        alert("Correct!");
    } else {
        alert("Wrong answer!");
    }
}