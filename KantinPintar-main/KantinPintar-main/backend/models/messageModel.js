import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  sender: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["open", "done"], default: "open" },
  unreadForAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
