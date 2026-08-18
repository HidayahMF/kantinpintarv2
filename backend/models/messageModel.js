import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100, trim: true },
  email: { type: String, required: true, maxlength: 254, trim: true, lowercase: true, index: true },
  message: { type: String, required: true, maxlength: 2000, trim: true },
  sender: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["open", "done"], default: "open" },
  unreadForAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
