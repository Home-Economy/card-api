import express from "express";
const router = express.Router();
import { card, db, DataTypes } from "./info.js";
import { parse } from "dotenv";

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
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
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
    type: DataTypes.DECIMAL(10, 2),
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
  if (!from || !to || !amount) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const fromCard = await card.findOne({
    where: { id: from },
  });
  const toCard = await card.findOne({
    where: { holder: to },
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
    toId: toCard.id,
    amount: amount,
    statement: `J-Pay from ${fromCard.holder} to ${toCard.holder}`,
  });
  res.status(200).json({ message: "Transaction Successful" });
});

router.get("/storeItems", async (req, res) => {
  const items = await storeStock.findAll();
  res.status(200).json(items);
});

router.get("/buy", async (req, res) => {
  let from = req.query.from;
  let itemID = req.query.itemID;
  let amount = req.query.amount;
  if (!from || !itemID || !amount) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const fromCard = await card.findOne({
    where: { number: from },
  });
  const storeItem = await storeStock.findOne({
    where: { id: itemID },
  });
  const goverment = await card.findOne({
    where: { holder: "Jiayang Chen" },
  });
  if (!fromCard) {
    res.status(500).json({ error: "Card Not Found" });
    return;
  }
  if (!storeItem) {
    res.status(500).json({ error: "Item Not Found" });
    return;
  }
  let totalCost = storeItem.price * amount;
  let tax = totalCost * 0.0625;
  if (fromCard.balance < totalCost + tax) {
    res.status(500).json({ error: "Insufficient Funds" });
    return;
  }
  if (storeItem.stock < amount) {
    res.status(500).json({ error: "Insufficient Stock" });
    return;
  }
  fromCard.balance -= totalCost + tax;
  storeItem.stock -= amount;
  goverment.balance += tax;
  if (storeItem.stock === 0) {
    await storeItem.destroy();
  }
  await fromCard.save();
  await storeItem.save();
  await transactions.create({
    fromId: fromCard.id,
    toId: 999,
    amount: storeItem.price,
    statement: `STORE: ${storeItem.item} x${amount}`,
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
  let imageURL = req.query.imageURL;
  let itemID = req.query.itemID;

  if (!itemID) {
    res.status(500).json({ error: "ItemID is required" });
    return;
  }

  const existingItem = await storeStock.findOne({
    where: { id: itemID },
  });

  if (!existingItem) {
    res.status(500).json({ error: "Item Not Found" });
    return;
  }

  if (parseInt(stock, 10) === 0) {
    await existingItem.destroy();
    res.status(200).json({ message: "Item Edited" });
    return;
  }

  if (item) existingItem.item = item;
  if (price) existingItem.price = parseFloat(price);
  if (stock) existingItem.stock = parseInt(stock, 10);
  if (imageURL) existingItem.imageURL = imageURL;

  await existingItem.save();
  res.status(200).json({ message: "Item Edited" });
});

router.get("/listStatements", async (req, res) => {
  const id = req.query.id;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  if (!id) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  }
  const offset = (page - 1) * pageSize;

  const statements = await transactions.findAll({
    fromId: id,
    toId: id,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: offset,
  });

  res.status(200).json(statements);
});

export default router;
export { transactions, storeStock };
