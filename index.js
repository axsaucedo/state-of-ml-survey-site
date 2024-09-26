import 'https://code.jquery.com/jquery-3.6.0.min.js'


//const colNames = ["time", "job", "role", "company", "industry", "org_size", "models_now", "models_future", "modality", "usecase", "components", "registry", "featurestore", "vector", "etl", "training", "platform", "serving", "infra", "time_taken", "org_setup", "lib_use", "cloud", "pct", "challenges", "satisfied", "important", "mature", "gender", "age", "country", "monitoring", "foundation"];

let dt = await aq.loadCSV('data.csv'); 

const origColNames = dt.columnNames();
const multiChoiceCols = [7,17,19,23];
// Drop first and last columns
dt = dt.select(...origColNames.slice(1, -2));
//// Rename columns
//dt = dt.select(aq.names(...colNames));
//// Drop columns
//dt = dt.select(...colNames.slice(1));

// window.colNames = colNames;
window.dt = dt;

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

tf.emitter.on(['after-filtering', "after-clearing-filters"], afterFilter);

tf.init();

window.tf = tf;
}

function afterFilter() {
	const data = tf.getFilteredData();
	console.log(data);
}

window.aq = aq
