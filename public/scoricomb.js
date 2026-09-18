const scoreWays = [
	[2,0],[3,0],[6,0],[6,1],[7,0],[8,0],
	[0,2],[0,3],[0,6],[1,6],[0,7],[0,8]
];
let deadEnds = [
	[0,1],[1,0],[1,1],[2,1],[1,2],[3,1],[1,3],[4,1],[1,4],[5,1],[1,5]
];
let prestoredScorePaths = {};
for(let scoreWay of scoreWays) {
	prestoredScorePaths[`${scoreWay[0]}-${scoreWay[1]}`] = [[[scoreWay[0]],[scoreWay[1]]]];	
}
prestoredScorePaths["0-0"] = [[[0],[0]]];
prestoredScorePaths["6-0"] = [[[6],[0]],[[3,3],[0,0]],[[2,2,2],[0,0,0]]];
prestoredScorePaths["7-0"] = [[[7],[0]],[[3,2,2],[0,0,0]]];
prestoredScorePaths["8-0"] = [[[8],[0]],[[3,3,2],[0,0,0]],[[2,2,2,2],[0,0,0,0]],[[6,2],[0,0]]];
const batchCollect = async (tasks=[], maxConcurrent=100) => {
	let remaining = tasks;
	let results = [];
	while(remaining.length > 0) {
		await Promise.all(remaining.splice(0, maxConcurrent).map(f => f())).then(res => results.push(...res));
	};
	return results;
};
const recursion = (a,b,paths,ap,bp,lvl,finalp,resultant) => {
	[ap,bp,pprev,fls,finl] = scoricombSubperm(a,b,paths,ap,bp,lvl);
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
const scoricombSubperm = (a,b, paths=[],aPath=[],bPath=[],flags=[0,0,0],lvl=0) => {
	let [finalp, resultant] = [[],[]]; 
	if(a<0 || b<0 || (a==0&&b==0) || deadEnds.includes([a,b])) return [[0],[0],paths,[1,1,flags[2]],finalp]; // if invalid final score, exit
	let [p,pRev] = [`${a}-${b}`, `${b}-${a}`]; // dict key and reversed dict key
	const storedKeys = Object.keys(prestoredScorePaths);
	if(storedKeys.includes(p)) { // check for precalculated scores for dict key p
		for(let pathSub of prestoredScorePaths[p]) { // extend our score path unto the shorter path by 1 score way
			const [aPathClone, bPathClone] = [[...aPath], [...bPath]];
			aPathClone.push(...pathSub[0]);
			bPathClone.push(...pathSub[1]);
			finalp.push([aPathClone,bPathClone]);
		}
		return [aPath,bPath,paths,[0,0,flags[2]],finalp];
	} else if(storedKeys.includes(pRev)) { // check for precalculated scores for reversed dict key pRev
		for(let pathSub of prestoredScorePaths[pRev]) { // extend our score path unto the shorter path by 1 score way
			const [aPathClone, bPathClone] = [[...aPath], [...bPath]];
			aPathClone.push(...pathSub[1]);
			bPathClone.push(...pathSub[0]);
			finalp.push([aPathClone,bPathClone]);
		}
		return [aPath,bPath,paths,[0,0,flags[2]],finalp];
	}
	for(let p of scoreWays) {
		let [finall,resultantt] = recursion(a-p[0], b-p[1], paths, [...aPath, p[0]], [...bPath, p[1]], lvl+1, finalp, resultant);
		finalp.push(...finall);
		resultant.push(...resultantt);
	}
	for(let r of resultant) {
		if(r[0].reduce((a,b) => a+b) == a && r[1].reduce((a,b)=>a+b) == b) {
			paths.push([[[...aPath,p[0]],[...bPath,p[1]]]]);
		}
	}
	if(lvl > 0) return [aPath,bPath,paths,[0,1,flags[2]],finalp];
	return [[],[],paths,[2,2],finalp];
}
const containsArray = (q,b) => b.some(a => (a.length == q.length && a.every((e,i) => e==q[i])));
const filterDown = (res,av,bv) => { // clean out bad/invalid score paths
	let [seenA,seenB, include] = [[], [], []];
	res.forEach((v,i) => {
		let condition = true;
		try {
			condition = v.length != 2 || v[0].length == 0 || v[1].length == 0 || v[0].reduce((a,b)=>a+b) != av || v[1].reduce((a,b)=>a+b) != bv;
		} catch(e) {}
		if(condition) return;
		let [vc0,vc1] = [[...v[0]].sort(), [...v[1]].sort()];
		if(!containsArray(vc0,seenA) || !containsArray(vc1,seenB)) {
			seenA.push(vc0); seenB.push(vc1);
			seenA.push(vc1); seenB.push(vc0);
			include.push(i);
		}
	});
	return include.map(i => res[i]);
};
const scoriperm = (a,b) => {
	let [_,__,___,____,res] = scoricombSubperm(a,b);
	return filterDown(res,a,b);
};
scoriperm(9,9);
// TODO: make sure reverse scores are added with their reverses too to prestored
