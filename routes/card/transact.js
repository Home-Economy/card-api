import express from "express";
const router = express.Router();
import chalk from "chalk";
import { card, db, DataTypes } from "./info.js";

const transactions = db.define("transactions", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  toId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  statement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
const storeStock = db.define("storeStock", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageURL: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

router.get("/pay", async (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  let amount = req.query.amount;
  let statement = req.query.statement;
  if (!from || !to || !amount || !statement) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const fromCard = await card.findOne({
    where: { id: from },
  });
  const toCard = await card.findOne({
    where: { id: to },
  });
  if (!fromCard || !toCard) {
    res.status(500).json({ error: "Card Not Found" });
    return;
  }
  fromCard.balance = parseFloat(fromCard.balance);
  toCard.balance = parseFloat(toCard.balance);
  amount = parseFloat(amount);
  if (fromCard.balance < amount) {
    res.status(500).json({ error: "Insufficient Funds" });
    console.log(fromCard.balance);

    return;
  }
  fromCard.balance -= amount;
  toCard.balance += amount;
  await fromCard.save();
  await toCard.save();
  const newTransaction = await transactions.create({
    fromId: from,
    toId: to,
    amount: amount,
    statement: `J-Pay: ${req.query.statement}`,
  });
  res.status(200).json({ message: "Transaction Successful" });
});

router.get("/storeItems", async (req, res) => {
  const items = await storeStock.findAll();
  res.status(200).json(items);
});

router.get("/buy", async (req, res) => {
  let from = req.query.from;
  let item = req.query.item;
  if (!from || !item) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const fromCard = await card.findOne({
    where: { id: from },
  });
  const storeItem = await storeStock.findOne({
    where: { item: item },
  });
  if (!fromCard) {
    res.status(500).json({ error: "Card Not Found" });
    return;
  }
  if (!storeItem) {
    res.status(500).json({ error: "Item Not Found" });
    return;
  }
  if (fromCard.balance < storeItem.price) {
    res.status(500).json({ error: "Insufficient Funds" });
    return;
  }
  fromCard.balance -= storeItem.price;
  storeItem.stock -= 1;
  if (storeItem.stock === 0) {
    await storeItem.destroy();
  }
  await fromCard.save();
  await storeItem.save();
  const newTransaction = await transactions.create({
    fromId: from,
    toId: 999,
    amount: storeItem.price,
    statement: `STORE: ${storeItem.item}`,
  });
  res.status(200).json({ message: "Transaction Successful" });
});

router.get("/add", async (req, res) => {
  let item = req.query.item;
  let price = req.query.price;
  let stock = req.query.stock;
  let imageURL = req.query.imageURL;
  if (!item || !price || !stock || !imageURL) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const existingItem = await storeStock.findOne({
    where: { item: item },
  });
  if (existingItem) {
    res.status(500).json({ error: "Item Already Exists" });
    return;
  }
  await storeStock.create({
    item: item,
    price: price,
    stock: stock,
    imageURL: imageURL,
  });
  res.status(200).json({ message: "Item Added" });
});

router.get("/edit", async (req, res) => {
  let item = req.query.item;
  let price = req.query.price;
  let stock = req.query.stock;

  if (!item) {
    res.status(500).json({ error: "Item is required" });
    return;
  }

  const existingItem = await storeStock.findOne({
    where: { item: item },
  });

  if (!existingItem) {
    res.status(500).json({ error: "Item Not Found" });
    return;
  }

  existingItem.price = price;
  existingItem.stock = stock;
  await existingItem.save();
  res.status(200).json({ message: "Item Edited" });
});

router.get("/listStatements", async (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const statements = await transactions.findAll({
    fromId: id,
    toId: id,
  });
  res.status(200).json(statements);
});

export default router;
