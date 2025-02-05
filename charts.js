let ctx = document.getElementById('statsChart').getContext('2d');
new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Wins', 'Losses', 'Draws'],
        datasets: [{
            data: [10, 5, 2],
            backgroundColor: ['green', 'red', 'blue']
        }]
    }
});