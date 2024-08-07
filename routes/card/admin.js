import { card } from "./info.js";
import { transactions } from "./transact.js";
const router = express.Router();
import chalk from "chalk";

router.get("/add", async (req, res) => {
  const id = req.query.id;
  const amount = req.query.amount;
  const statement = req.query.statement;
  if (!id || !amount || !statement) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const clientCard = await card.findOne({
    where: { id: id },
  });
  if (!clientCard) {
    res.status(500).json({ error: "Card not found" });
    return;
  }
  clientCard.balance += parseFloat(amount);
  await clientCard.save();
  const newTransaction = await transactions.create({
    from: 999,
    to: id,
    amount: amount,
    statement: "Admin Deposit: " + statement,
  });
  res.json({
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
