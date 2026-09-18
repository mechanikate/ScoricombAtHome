function updatePrestoredScoreCounter() {
	document.getElementById("prestoredScoreCounter").innerHTML = Object.keys(prestoredScorePaths).length;
}
function startWorking(maxScore=12) {
	let promises = [];
	let tasks = [];
	let prev = "";
	for(let i=0; i<=maxScore; i++) for(let j=0; j<=maxScore; j++) {
		document.getElementById("currentDisplay").innerHTML = prev; 
		window.setTimeout(() => {
			if(Object.keys(prestoredScorePaths).includes(`${i}-${j}`) || containsArray([i,j],deadEnds)) return;
			let finall = scoriperm(i,j);
			prev = `${i}-${j}: ${finall.length} paths`;
			console.log(prev);
			prestoredScorePaths[`${i}-${j}`] = finall;
		}, 50);
	}
	Promise.all(tasks);
	sendData();
}
function filterExisting(paths, existingKeys) {
	let resultingObj = {};
	for(let k of Object.keys(prestoredScorePaths))
		if(!existingKeys.includes(k)) resultingObj[k] = paths[k];
	return resultingObj;
}
function sendData() {
	fetch("./prestoredKeys").then(r => r.json()).then(existing => {
		let file = new File([JSON.stringify(filterExisting(prestoredScorePaths, existing))], `${Math.floor(Date.now()/1000)}.json`, {type: "application/json"});
		let formData = new FormData();
		formData.append("uploadedJSON", file);
		fetch("./upload", {body: formData,method:"POST"});
	});
}
function retrieveData() {
	fetch("./prestoredPaths").then(r => r.json()).then(r => prestoredScorePaths = Object.assign(prestoredScorePaths, r));
}
function chartData() {
	let data = [...Array(50)].map(e => Array(50).fill(null));
	Object.keys(prestoredScorePaths).forEach(p => {
		let [i,j] = p.split("-").map(x => parseInt(x));
		if(i<j || deadEnds.includes([i,j]) || !Object.keys(prestoredScorePaths).includes(p)) return;
		data[i][j]=prestoredScorePaths[p].length;
	});
	return data.map((val, index) => data.map(row => row[index]));
}
function updateChart() {
	Plotly.newPlot('plotDiv', [{
		type: "heatmap",
		z: chartData()
	}], {
		xaxis: {
			side: "top"
		},
		yaxis: {
			autorange: "reversed"
		},
		zaxis: {
			tickprefix: "1.e"
		}
	});
}
Plotly.newPlot('plotDiv', [{
	type: "heatmap",
	z: chartData(),
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
		side: "top"
	},
	yaxis: {
		autorange: "reversed"
	}
});
window.onload = () => {updatePrestoredScoreCounter(); updateChart(); retrieveData(); };
