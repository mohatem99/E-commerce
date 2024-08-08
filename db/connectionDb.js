import mongoose from "mongoose";

const connectionDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URI_ONLLINE);
    console.log("Database connected");
  } catch (err) {
    console.log("Error connecting to Database", err);
  }
};

export default connectionDb;
