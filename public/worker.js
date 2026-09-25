importScripts("scoricomb.js?v4");
onmessage = raw => {
	if(Object.keys(raw.data).includes("prestoredScorePaths")) {
		let p = raw.data.computeScore.join("-");
		console.log(`${p}: Prestored scores retrieved`);
		prestoredScorePaths = raw.data.prestoredScorePaths;
		postMessage({
			success: true
		});
		return;
	};
	let message = raw.data;
	let [a,b] = message.computeScore;
	if(Object.keys(prestoredScorePaths).includes(`${a}-${b}`) || containsArray([a,b],deadEnds)) return;
	let p = message.computeScore.join("-");
	console.log(`${p}: starting computing`);
	let newMessage = {computeScore:[a,b],combed:[]};
	newMessage.combed = scoriperm(a,b);
	console.log(`${p}: computing done, sending`);
	postMessage(newMessage);
	console.log(`${p}: sending done`);
};
