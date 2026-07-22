import express from "express";
const app = express();
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/does-not-exist.html");
});
app.listen(3333, () => console.log("running"));
