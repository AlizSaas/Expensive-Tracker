import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db";
import userRouter from "./routes/userRoutes";
import incomeRouter from "./routes/incomeRoutes";

const app = express();
const port = 4000;
//middleware

app.use(cors());
app.use(express.json()); // any json data that we send to the backend will be parsed and available in req.body

app.use(express.urlencoded({ extended: true }));

//DB
connectDB();

//routes
app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/api/users", userRouter);
app.use("/api/income", incomeRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
