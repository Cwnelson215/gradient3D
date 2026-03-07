import express from "express";
import path from "path";

const port = parseInt(process.env.PORT || "3000");
const app = express();

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.use(express.static(path.join(__dirname, "../client")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(port, () => {
  console.log(`gradient listening on port ${port}`);
});
