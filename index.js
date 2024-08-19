import express from "express";
import chalk from "chalk";
import cors from "cors";
import cardPayments from "./routes/card/transact.js";
import admin from "./routes/card/admin.js";
import cash from "./routes/card/cash.js";
import cardInfo from "./routes/card/info.js";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/card/info", cardInfo);
app.use("/card/transact", cardPayments);
app.use("/card/admin", admin);
app.use("/card/cash", cash);

app.listen(3000, () => {
  console.log(
    chalk.green.bold("INFO | "),
    chalk.white("Server is running on port 3000")
  );
});
