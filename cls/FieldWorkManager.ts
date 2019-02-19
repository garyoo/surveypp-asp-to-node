import Chart from 'chart.js';

export default class FieldWorkManager{

    dateChart?: HTMLCanvasElement;
    dateChartWrapper?: HTMLDivElement;
    projectID: string;

    constructor ({projectID}: {projectID: string}) {

        this.projectID = projectID;

        if (document.getElementById('date-chart-wrapper')) {
            this.dateChart = document.createElement('canvas');
            this.dateChartWrapper = document.getElementById('date-chart-wrapper') as HTMLDivElement;
            this.getDateChartData();
        }
    }

    getDateChartData() {
        if (this.dateChartWrapper && this.dateChart) {
            this.dateChart.setAttribute('width', '400');
            this.dateChart.setAttribute('height', '400');
            this.dateChartWrapper.appendChild(this.dateChart);
            this.renderDateChart();
        }
    }

    renderDateChart() {
        if (this.dateChart && this.dateChartWrapper) {
            let chartData;
            try {
                chartData = this.dateChartWrapper.getAttribute('data-chart');
                if (chartData) chartData = JSON.parse(chartData);
            }
            catch(e) {}

            let backgroundColor = [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ];

            let borderColor = [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ];

            if (chartData === undefined) return;
            let dataSets: Array<object>= [];
            for(let key in chartData) {
                let item = chartData[key];
                let data = Object.values(item);

                if (key === 'Total') {
                    dataSets.push({
                        label: `${key}`,
                        data: data,
                        backgroundColor: backgroundColor.shift(),
                        borderColor: borderColor.shift(),
                        borderWidth: 1
                    });
                } else {
                    dataSets.push({
                        label: `${key}`,
                        data: data,
                        type: 'line',
                        fill: false,
                        backgroundColor: backgroundColor.shift(),
                        borderColor: borderColor.shift(),
                        borderWidth: 2
                    });
                }
            }

            let ctx = this.dateChart.getContext('2d');
            if (ctx) {
                let myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(chartData['Total']),
                        datasets: dataSets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
            }
        }
    }

}