importScripts("scoricomb.min.js?v4");

interface CombProgressMessage {
	latestScore: number[];
	latestScorePathCount: number;
	queued: number;
	completed: number;
}

let workers: any[] = [];
let workerIndex: number = 0;
function until(conditionFunction: () => boolean) {
	const poll = (resolve: (value?: unknown) => void) => {
		if(conditionFunction()) resolve();
		else setTimeout(() => poll(resolve), 400);
	}

	return new Promise(poll);
}
onmessage = async (raw: any) => {
	let maxScore = raw.data.maxScore;
	let workerMax: number = raw.data.workerMax;
	let tasks: any[] = [];
	let prev: string = "";
	let [queuedTotal,completedTotal]: number[] = [(maxScore+1)*(maxScore+2)/2, 0];
	const initPrestored = Object.assign({},prestoredScorePaths);
	retrieveData();
	await until(() => prestoredScorePaths != initPrestored);
	for(let i=0; i<workerMax; i++) workers.push(new Worker("worker.min.js?v1"));
	for(let i=0; i<=maxScore; i++) for(let j=0; j<=i; j++) {
		if(Object.keys(prestoredScorePaths).includes(`${i}-${j}`) || containsArray([i,j],deadEnds)) { completedTotal++; continue; }
		tasks.push(async () => {
			if(Object.keys(prestoredScorePaths).includes(`${i}-${j}`) || containsArray([i,j],deadEnds)) return completedTotal++;
			
			let completed = false;
			let success = false;

			let worker = workers[workerIndex];
			worker.postMessage({
				prestoredScorePaths: prestoredScorePaths,
				computeScore: [i,j]
			});
			
			worker.onmessage = (message: any) => {
				if(message.data.success) return worker.postMessage({
					computeScore: [i,j],
					combed: {}
				});
				prestoredScorePaths[`${i}-${j}`] = message.data.combed;
				sendData();
				completedTotal++; completed = true;
				postMessage({
					latestScore: [i,j],
					latestScorePathCount: message.data.combed.length,
					queued: queuedTotal,
					completed: completedTotal
				});
			};
			workerIndex = (workerIndex+1)%workerMax;

			await until(() => completed);
		});
	}
	batchCollect(tasks,workerMax);
	sendData();
}
