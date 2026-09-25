const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const sumVals = v => v.reduce((a,b)=>a+b);
let prestored = require("./prestored.json");
app.use("/", express.static("public"));
app.get("/", (req,res)=>{
	res.redirect("./index.html");	
});
app.use(fileUpload());
app.use(cors({
	origin: "*"
}));
app.post("/upload", (req,res) => {
	if(!req.files || Object.keys(req.files).length === 0) return res.status(400).send("No data uploaded.");
	const path = `${__dirname}/uploads/${req.files.uploadedJSON.name}`;
	req.files.uploadedJSON.mv(path).then((mvErr) => fs.readFile(path, (err,data) => {
		if(err) return res.status(500).send(err);
		if(mvErr) return res.status(500).send(mvErr);
		let parsed;
		try { parsed = JSON.parse(data); } catch(parseErr) { 
			console.error(parseErr);
			return res.status(500).send(parseErr);
		}
		if(
			!parsed ||
			!Object.keys(parsed).reduce((acc,k) => {
				let [a,b] = k.split("-").map(e => parseInt(e));
				let ret = (Array.isArray(parsed[k]) && parsed[k].reduce((sumAcc, v) => {
					return sumAcc && sumVals(v[0])===a && sumVals(v[1])===b;
				}, true));
				return acc && ret;
			}, true)
		) return res.status(400).send("Data not in correct format.");
		prestored = Object.assign(prestored, parsed);
		console.log(`Valid data retrieved up to ${Object.keys(parsed)[Object.keys(parsed).length-1]}`);
		fs.writeFileSync("prestored.json", JSON.stringify(prestored));
		res.send("Success!");
		fs.unlinkSync(path);
	}));

});
app.get("/prestoredPaths", (req,res)=>{
	res.json(require("./prestored.json"));
});
app.get("/prestoredKeys", (req,res)=>{
	res.json(Object.keys(require("./prestored.json")));
});
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
