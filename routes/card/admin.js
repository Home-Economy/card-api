import { card } from "./info.js";
import { transactions } from "./transact.js";
const router = express.Router();
import express from "express";
import chalk from "chalk";
import { parse } from "dotenv";

router.get("/add", async (req, res) => {
  const name = req.query.name;
  const amount = req.query.amount;
  if (!name || !amount) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }

  const clientCard = await card.findOne({
    where: { holder: name },
  });

  if (!clientCard) {
    res.status(500).json({ error: "Card not found" });
    return;
  }

  clientCard.balance = (
    parseFloat(clientCard.balance) + parseFloat(amount)
  ).toFixed(2);
  await clientCard.save();

  console.log(`Updated balance: ${clientCard.balance}`);
  id = clientCard.id;
  const newTransaction = await transactions.create({
    fromId: 999,
    to: id,
    amount: amount,
    statement: "Admin Deposit: ",
  });

  res.status(200).json({
    balance: clientCard.balance,
    id: clientCard.id,
    amount: amount,
    message: "Success",
  });
});

router.get("/adminLogin", async (req, res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  if (username === "na" && password === "gaon0317") {
    res.json({ message: "Success" });
  } else {
    res.status(500).json({ error: "Invalid Credentials" });
  }
});

router.get("/userLogin", async (req, res) => {
  const { number, cvv } = req.query;
  if (!number || !cvv) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const clientCard = await card.findOne({
    where: { number: number, cvv: cvv },
  });
  if (!clientCard) {
    res.status(500).json({ error: "Card not found" });
    return;
  }
  res.json({
    message: "Success",
    id: clientCard.id,
    balance: clientCard.balance,
    number: clientCard.number,
    cvv: clientCard.cvv,
    expiration: clientCard.expiration,
    holder: clientCard.holder,
  });
});

export default router;
