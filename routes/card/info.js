import express from "express";
import { Sequelize, DataTypes } from "sequelize";
import { generateCreditCard } from "credit-card-info-generator";
const router = express.Router();
import chalk from "chalk";

const db = new Sequelize("");

const card = db.define("card", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  number: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  holder: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cvv: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});
console.log(
  chalk.green.bold("INFO | "),
  chalk.white("Synchronizing models...")
);
db.sync()
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });

console.log(chalk.green.bold("INFO | "), chalk.white("Models synchronized"));
router.get("/new", async (req, res) => {
  let name = req.query.name;
  let code = req.query.code;
  if (!name || !code) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  } else if (
    !name.match(
      /^([a-zA-Z]{2,}\s[a-zA-Z]{1,}'?-?[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?)/gm
    )
  ) {
    res.status(500).json({ error: "Name Is Invalid" });
    return;
  } else if (!code === "chen") {
    res.status(500).json({ error: "Invalid Code" });
    return;
  }

  const existingCard = await card.findOne({ where: { holder: name } });
  if (existingCard) {
    res.status(500).json({ error: "Card with the same name already exists" });
    return;
  }
  let number = generateCreditCard("Visa");
  number = number.cardNumber;
  number = number.toString();
  let ccv = [number.charAt(4), number.charAt(8), number.charAt(12)];
  ccv = ccv.sort(function (a, b) {
    return Math.floor(Math.random() * 3 - 1);
  });
  ccv = ccv.join("");
  number = parseInt(number);
  const today = new Date();
  let expiration = `${String(today.getMonth() + 1).padStart(2, "0")}/${
    today.getFullYear() + 4
  }`;

  await card.create({
    number: number,
    holder: name,
    expiration: expiration,
    cvv: ccv,
    balance: 0.0,
  });

  const info = {
    number: number,
    holder: name,
    expiration: expiration,
    cvv: ccv,
    balance: 0.0,
    message: "Success",
  };
  res.json(info);
});

router.get("/balance", async (req, res) => {
  const { number } = req.query;
  if (!number) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  } else if (number.length <= 12) {
    res.status(500).json({ error: "Invalid Inputs" });
    return;
  }
  const clientCard = await card.findOne({
    where: { number: number },
  });
  if (!clientCard) {
    res.status(500).json({ error: "Card not found" });
    return;
  }
  res.json({ balance: clientCard.balance });
});

router.get("/lookup", async (req, res) => {
  const { number, cvv, id } = req.query;
  if (!number || !cvv || !id) {
    res.status(500).json({ error: "Not Enough Inputs" });
    return;
  } else if (number.length !== 13 || cvv.length !== 3) {
    res.status(500).json({ error: "Invalid Inputs" });
    return;
  }
  const clientCard = await card.findOne({
    where: { number: number, cvv: cvv, id: id },
  });
  if (!clientCard) {
    res.status(500).json({ error: "Card not found" });
    return;
  }
  res.json(clientCard);
});
export default router;
export { card, db, DataTypes };
