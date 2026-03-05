import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    description : {
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  },
  category: {
    type: String,
    required : true,
  },
  date: {
    type: Date,
    required : true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    default: "income",  
  },
})

const IncomeModel = mongoose.model("Income", incomeSchema); // Create a model named "Income" using the incomeSchema

export default IncomeModel;