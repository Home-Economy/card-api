import express from "express";
import { Sequelize, DataTypes } from "sequelize";
const router = express.Router();
import { db } from "./info.js";

const cash = db.define("cash", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hash: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

router.get("/verify", async (req, res) => {
  let info;
  let hash = req.query.hash;
  if (!hash) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }

  const validity = await cash.findOne({ where: { hash: hash } });

  if (!validity) {
    res.status(500).json({ error: "Invalid Hash" });
    return;
  }

  info = {
    hash: validity.hash,
    amount: validity.amount,
    message: "Success",
  };
  res.json(info);
});

router.get("/add", async (req, res) => {
  let hash = req.query.hash;
  let amount = req.query.amount;
  if (!hash || !amount) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }

  const validity = await cash.findOne({ where: { hash: hash } });

  if (validity) {
    res.status(500).json({ error: "Hash Already Exists" });
    return;
  }
  hash = parseInt(hash);

  const newCash = await cash.create({
    hash: hash,
    amount: amount,
  });

  res.json(newCash);
});
export default router;
