import express from "express";
import cardInfo from "./routes/card/info.js";

const app = express();

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/card/info", cardInfo);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
