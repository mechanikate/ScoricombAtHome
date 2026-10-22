type BiScore = [number, number];
type ScorePath = [number[], number[]];
type ScorePathIdentifier = `${number}-${number}`;
type ScorePathStore = Record<ScorePathIdentifier, ScorePath[]>;
const scoreWays: BiScore[] = [
	[2,0],[3,0],[6,0],[6,1],[7,0],[8,0],
	[0,2],[0,3],[0,6],[1,6],[0,7],[0,8]
];
let deadEnds: BiScore[] = [
	[0,1],[1,0],[1,1],[2,1],[1,2],[3,1],[1,3],[4,1],[1,4],[5,1],[1,5]
];
let prestoredScorePaths: ScorePathStore = {};
for(let scoreWay of scoreWays) {
	prestoredScorePaths[`${scoreWay[0]}-${scoreWay[1]}`] = [[[scoreWay[0]],[scoreWay[1]]]];	
}
prestoredScorePaths["0-0"] = [[[0],[0]]];
prestoredScorePaths["6-0"] = [[[6],[0]],[[3,3],[0,0]],[[2,2,2],[0,0,0]]];
prestoredScorePaths["7-0"] = [[[7],[0]],[[3,2,2],[0,0,0]]];
prestoredScorePaths["8-0"] = [[[8],[0]],[[3,3,2],[0,0,0]],[[2,2,2,2],[0,0,0,0]],[[6,2],[0,0]]];

const recursion = (a: number, b: number, paths: ScorePath[], ap: number[], bp: number[], lvl: number,
		finalp: ScorePath[],
		resultant: ScorePath[]): [ScorePath[], ScorePath[]]=> {
	let [pprev,fls,finl]: [any,number[],ScorePath[]] = [[],[],[]];
	[ap,bp,pprev,fls,finl] = scoricombSubperm(a,b,paths,ap,bp,[0,0],lvl);
	[finalp,resultant] = [finl,[]];
	if(fls[1]==0) finalp.push([ap,bp]);
	if(fls[0]==0) resultant.push([ap,bp]);
	return [finalp, resultant];
};
/*
 * PATH SCHEMA (for finalp, finall, scoricombSubperm return, et al.)
 * {
 *    "<winningScore>-<losingScore>": [ // contains every path to this score
 *        [int[],int[]], // each array will be indexed in pairs. [element[0][n], elememnt[1][n]] MUST be in scoreWays.
 *    ]
 * }
 *
 * For example, this is the object containing only the path for the final score 6-0:
 * {
 *    "6-0": [
 *        [
 *            [6], // sums to 6
 *            [0] // sums to 0, same length as ["6-0"][0][0]
 *        ], 
 *        [
 *            [3,3], // sums to 6
 *            [0,0], // sums to 0, same length as ["6-0"][1][0]
 *        ],
 *        [
 *            [2,2,2], // sums to 6
 *            [0,0,0] // sums to 0, same length as ["6-0"][2][0]
 *        ]
 *   ]
 * }
 *
 * NOTES
 * aPath/bPath are in the same format as path[str][int][int]
 */
const scoricombSubperm = (a: number, b: number, 
			  paths: ScorePath[] = [],
			  aPath: number[] = [], bPath: number[] = [],
			  flags: number[] = [0,0],
			  lvl: number = 0): [number[],number[],ScorePath[],number[],ScorePath[]] => {
	let [finalp, resultant]: [ScorePath[], ScorePath[]]  = [[],[]]; 
	if(a<0 || b<0 || (a==0&&b==0) || deadEnds.includes([a,b])) return [[],[],paths,[1,1],finalp]; // if invalid final score, exit
	let [p,pRev]: ScorePathIdentifier[] = [`${a}-${b}`, `${b}-${a}`]; // dict key and reversed dict key
	const storedKeys = Object.keys(prestoredScorePaths);
	if(storedKeys.includes(p)) { // check for precalculated scores for dict key p
		for(let pathSub of prestoredScorePaths[p]) { // extend our score path unto the shorter path by 1 score way
			let [aPathClone, bPathClone]: number[][] = [[...aPath], [...bPath]];
			aPathClone = aPathClone.concat(pathSub[0]);
			bPathClone = bPathClone.concat(pathSub[1]);
			finalp.push([aPathClone,bPathClone]);
		}
		return [aPath,bPath,paths,[0,0],finalp];
	} else if(storedKeys.includes(pRev)) { // check for precalculated scores for reversed dict key pRev
		for(let pathSub of prestoredScorePaths[pRev]) { // extend our score path unto the shorter path by 1 score way
			let [aPathClone, bPathClone]: number[][] = [[...aPath], [...bPath]];
			aPathClone = aPathClone.concat(pathSub[1]);
			bPathClone = bPathClone.concat(pathSub[0]);
			finalp.push([aPathClone,bPathClone]);
		}
		return [aPath,bPath,paths,[0,0],finalp];
	}
	for(let p of scoreWays) {
		let [finall,resultantt]: [ScorePath[], ScorePath[]] = recursion(a-p[0], b-p[1], paths, [...aPath, p[0]], [...bPath, p[1]], lvl+1, finalp, resultant);
		finalp = finalp.concat(finall);
		resultant = resultant.concat(resultantt);
	}
	for(let r of resultant) {
		if(r[0].reduce((a,b) => a+b) == a && r[1].reduce((a,b)=>a+b) == b) {
			//paths.push([[[...aPath,r[0]],[...bPath,r[1]]]]);
		}
	}
	if(lvl > 0) return [aPath,bPath,paths,[0,1],finalp];
	return [[],[],paths,[2,2,-1],finalp];
}
const containsArray = (q: any[] ,b: any[][]): boolean => b.some(a => (a.length == q.length && a.every((e,i) => e==q[i])));
const filterDown = (res: ScorePath[], av: number, bv: number): ScorePath[] => { // clean out bad/invalid score paths
	let [seenA,seenB, include]: [number[][],number[][],number[]] = [[], [], []];
	res.forEach((v: ScorePath, i: number) => {
		let failed = true;
		try {
			failed = v.length != 2 || v[0].length == 0 || v[1].length == 0 || v[0].reduce((a,b)=>a+b) != av || v[1].reduce((a,b)=>a+b) != bv;
		} catch(e) {}
		if(failed) return;
		let [vc0,vc1]: ScorePath = [[...v[0]].sort(), [...v[1]].sort()];
		if(!containsArray(vc0,seenA) || !containsArray(vc1,seenB)) {
			seenA.push(vc0); seenB.push(vc1);
			seenA.push(vc1); seenB.push(vc0);
			include.push(i);
		}
	});
	return include.map(i => res[i]);
};
const scoriperm = (a: number, b: number): ScorePath[] => {
	let rawRes: [number[],number[],ScorePath[],number[],ScorePath[]] = scoricombSubperm(a,b);
	return filterDown(rawRes[4],a,b);
};
function retrieveData() {
	fetch("./prestoredPaths").then(r => r.json()).then((r: ScorePathStore) => prestoredScorePaths = Object.assign(prestoredScorePaths, r));
}
function filterExisting(paths: ScorePathStore, existingKeys: ScorePathIdentifier[]): ScorePathStore {
	let resultingObj: ScorePathStore = {};
	let keys: ScorePathIdentifier[] = (Object.keys(prestoredScorePaths) as ScorePathIdentifier[]);
	keys.forEach((k: ScorePathIdentifier) => {
		if(!existingKeys.includes(k)) resultingObj[k] = paths[k];
	});
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
const batchCollect = async (tasks: (() => void)[] = [], maxConcurrent=100) => {
	let remaining = tasks;
	let results: any[] = [];
	while(remaining.length > 0) {
		await Promise.all(remaining.splice(0, maxConcurrent).map(f => f())).then(res => results = results.concat(res));
	};
	return results;
};
// TODO: make sure reverse scores are added with their reverses too to prestored
