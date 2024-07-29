import express from "express";
import chalk from "chalk";
import cardPayments from "./routes/card/transact.js";
import cardInfo from "./routes/card/info.js";

const app = express();

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/card/info", cardInfo);
app.use("/card/transact", cardPayments);

app.listen(3000, () => {
  console.log(
    chalk.green.bold("INFO | "),
    chalk.white("Server is running on port 3000")
  );
});
