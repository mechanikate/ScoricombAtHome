let graphMax = 50;
function startWorking(maxScore) {
	let worker = new Worker("overseer.min.js?v3");
	worker.postMessage({maxScore: maxScore});
}

function updatePrestoredScoreCounter() {
	document.getElementById("prestoredScoreCounter").innerHTML = Object.keys(prestoredScorePaths).length;
}

function updateChart() {
	plot = Plotly.newPlot('plotDiv', [{
		type: "heatmap",
	  	x: [...Array(graphMax).keys()],
	  	y: [...Array(graphMax).keys()],
		z: chartData()
	}], {
		xaxis: {
			side: "top",
			range: [-0.5,graphMax+0.5]
		},
		yaxis: {
			autorange: "reversed",
			scaleratio: 1,
			//scaleanchor: "x"
		}
	});
}
var plot = Plotly.newPlot('plotDiv', [{
	type: "heatmap",
	z: chartData(),
	x: [...Array(graphMax).keys()],
	y: [...Array(graphMax).keys()],
	colorscale: [
		['-1.0', 'rgb(0,0,0)'],
		['0.0', 'rgb(165,0,38)'],
		['0.111111111111', 'rgb(215,48,39)'],
		['0.222222222222', 'rgb(244,109,67)'],
		['0.333333333333', 'rgb(253,174,97)'],
		['0.444444444444', 'rgb(254,224,144)'],
		['0.555555555556', 'rgb(224,243,248)'],
		['0.666666666667', 'rgb(171,217,233)'],
		['0.777777777778', 'rgb(116,173,209)'],
		['0.888888888889', 'rgb(69,117,180)'],
		['1.0', 'rgb(49,54,149)']
	],
}], {
	xaxis: {
		side: "top",
		range: [-0.5,graphMax+0.5],
		showgrid: false,
		zeroline: false,
		showline: false
	},
	yaxis: {
		//autorange: "reversed",
		//scaleratio: 1,
		//scaleanchor: "x",
		range: [-0.5,graphMax+0.5]
	}
});

function chartData() {
	let data = [...Array(graphMax)].map(e => Array(graphMax).fill(null));
	Object.keys(prestoredScorePaths).forEach(p => {
		let [i,j] = p.split("-").map(x => parseInt(x));
		if(i<j || deadEnds.includes([i,j]) || !Object.keys(prestoredScorePaths).includes(p)) return;
		data[i][j]=prestoredScorePaths[p].length;
	});
	return data.map((val, index) => data.map(row => row[index]));
}
window.onload = () => {retrieveData(); updatePrestoredScoreCounter(); updateChart(); };
