const Transaction = require("../models/Transaction");
const ExcelJS = require("exceljs");

// Add a new transaction (income/expense)
const addTransaction = async (req, res) => {
  const { type, category, amount, description, date } = req.body;

  try {
    if (!type || !category || !amount) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const transaction = new Transaction({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      date,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a transaction
// const deleteTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id);

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     if (transaction.user.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     await transaction.remove();
//     res.json({ message: "Transaction deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Replace .remove() with .findByIdAndDelete()
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Export transactions as Excel file
const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    // Define columns
    worksheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Add data
    transactions.forEach((tx) => {
      worksheet.addRow({
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        description: tx.description,
        date: new Date(tx.date).toLocaleDateString(),
      });
    });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");

    // Generate file and send response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { addTransaction, getTransactions, deleteTransaction, exportTransactions };