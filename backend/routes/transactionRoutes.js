const express = require("express");
const { addTransaction, getTransactions, deleteTransaction, exportTransactions} = require("../controllers/transactionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, deleteTransaction);
router.get("/export", protect, exportTransactions);


module.exports = router;