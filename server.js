const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes=require("./routes/user.js")
const connectDB = require("./config/db");
const infobyrole=require("./routes/user.js")


dotenv.config();

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});
// app.use("/userslog",userRoutes);
// app.use("/infobyrole",infobyrole);
// app.use("/allusers",userRoutes);

// One time only
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});