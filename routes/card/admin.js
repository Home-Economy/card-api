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

export default router;
