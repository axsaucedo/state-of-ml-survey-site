import 'https://code.jquery.com/jquery-3.6.0.min.js'


//const colNames = ["time", "job", "role", "company", "industry", "org_size", "models_now", "models_future", "modality", "usecase", "components", "registry", "featurestore", "vector", "etl", "training", "platform", "serving", "infra", "time_taken", "org_setup", "lib_use", "cloud", "pct", "challenges", "satisfied", "important", "mature", "gender", "age", "country", "monitoring", "foundation"];

let dt = await aq.loadCSV('data.csv'); 

const origColNames = dt.columnNames().slice(1, -2);
const multiChoiceCols = [7, 8, 17, 19, 23];
// Drop first and last columns
dt = dt.select(...origColNames);
//// Rename columns
//dt = dt.select(aq.names(...colNames));
//// Drop columns
//dt = dt.select(...colNames.slice(1));

// window.colNames = colNames;
window.dt = dt;


// Global charts object
var charts = [];

for (let i = 0; i < origColNames.length; i++) {
	const chartContainer = $("<div class='col-md-3'></div>");
	chartContainer.append("<h4>"+origColNames[i]+"</h4>")
    $("#charts").append(chartContainer);

	const chartCanvas = $("<canvas id='chart-"+i+"'></canvas>");
	chartContainer.append(chartCanvas)

    const chartType = multiChoiceCols.includes(i) ? "bar"  : "pie";

	console.log($("#chart-"+i));

    const chart = new Chart($("#chart-"+i), {
      type: chartType,
      options: {
        plugins: {
            colors: {
                forceOverride: true
            }
        }
      }
    });

    charts.push(chart);
}
console.log(charts);

$('#table').html(dt.toHTML()).children().attr('id', 'demo').ready(function() { loadTable() });

function loadTable() {

    var tfConfig = {
        base_path: 'https://unpkg.com/tablefilter@0.7.2/dist/tablefilter/',
        alternate_rows: true,
        rows_selected: {
            text: 'Displayed rows: '
        },
        loader: true,
        status: true,
        status_bar: true,

        auto_filter: {
            delay: 500 //milliseconds
        },

        /* sorting feature */
        extensions: [{ name: 'sort' }]

    };

    // Adding column filters
    for (let i = 0; i < origColNames.length; i++) {
        if (multiChoiceCols.includes(i)) continue;
        tfConfig["col_" + i] = "checklist";
    }


    var tf = new TableFilter('demo', tfConfig);

    tf.emitter.on([
        'after-filtering',
        "after-clearing-filters",
        "initialized"
        ], afterFilter(tf));

    tf.init();

    // Run once
    //afterFilter();

}

function afterFilter(tf) {
	return function () {
		const data = tf.getFilteredData();
        window.data = data;
        let chartData = [];
        for (let i = 0; i < origColNames.length; i++) {
            chartData.push({});
        }
        for (let i = 0; i < data.length; i++) {
            let row = data[i][1];
            for (let j = 0; j < origColNames.length; j++) {
                // Split the multi choice options
                if (multiChoiceCols.includes(j)) {
                    let multiValues = row[j].split(",");
                    for (let k = 0; k < multiValues.length; k++) {
                        if (multiValues[k] in chartData[j]) {
                            chartData[j][multiValues[k]] += 1;
                        } else {
                            chartData[j][multiValues[k]] = 1;
                        }
                    }
                }
                else {
                    if (row[j] in chartData[j]) {
                        chartData[j][row[j]] += 1;
                    } else {
                        chartData[j][row[j]] = 1;
                    }
                }
            }
        }
        window.chartData = chartData;
        for (let chartIndex = 0; chartIndex < chartData.length; chartIndex++) {
            console.log(charts[chartIndex]);
            updateChart(charts[chartIndex], Object.keys(chartData[chartIndex]), Object.values(chartData[chartIndex]))
        }
	}

}

function updateChart(chart, labels, data) {
    chart.data = {
        labels: labels,
        datasets: [{
          data: data,
        }]
    }
    chart.update()
}

window.aq = aq
