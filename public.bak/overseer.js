importScripts("scoricomb.min.js?v4");
const workerMax = 2;
let workers = [];
let workerIndex = 0;
onmessage = async (raw) => {
	let maxScore = raw.data.maxScore;
	let promises = [];
	let tasks = [];
	let prev = "";
	let [queuedTotal,completedTotal] = [0, 0];
	const initPrestored = Object.assign({},prestoredScorePaths);
	retrieveData();
	await until(() => prestoredScorePaths != initPrestored);
	for(let i=0; i<workerMax; i++) workers.push(new Worker("worker.min.js?v1"));
	for(let i=0; i<=maxScore; i++) for(let j=0; j<=i; j++) {
		if(Object.keys(prestoredScorePaths).includes(`${i}-${j}`) || containsArray([i,j],deadEnds)) continue;
		tasks.push(async () => {
			queuedTotal++;
			if(Object.keys(prestoredScorePaths).includes(`${i}-${j}`) || containsArray([i,j],deadEnds)) return completedTotal++;
			
			let completed = false;
			let success = false;

			let worker = workers[workerIndex];
			worker.postMessage({
				prestoredScorePaths: prestoredScorePaths,
				computeScore: [i,j]
			});
			
			worker.onmessage = message => {
				if(message.data.success) return worker.postMessage({
					computeScore: [i,j],
					combed: {}
				});
				prestoredScorePaths[`${i}-${j}`] = message.data.combed;
				sendData();
				completedTotal++; completed = true;
			};
			workerIndex = (workerIndex+1)%workerMax;

			await until(() => completed);
		});
	}
	batchCollect(tasks,workerMax);
	sendData();
}
