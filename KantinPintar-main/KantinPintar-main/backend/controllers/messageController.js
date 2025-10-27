import Message from "../models/messageModel.js";

// List all chat users with status & first message & unread
export const getAllChatUsers = async (req, res) => {
  // Ambil last message dan count unread per email
  const users = await Message.aggregate([
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$email",
        email: { $first: "$email" },
        name: { $first: "$name" },
        firstMessage: { $first: "$message" },
        status: { $first: "$status" },
        lastMessageAt: { $last: "$createdAt" }
      }
    }
  ]);
  // Hitung unread
  const unreadMsgs = await Message.find({ sender: "user", unreadForAdmin: true });
  const unreadMap = {};
  unreadMsgs.forEach(msg => {
    unreadMap[msg.email] = (unreadMap[msg.email] || 0) + 1;
  });

  // Gabungkan unreadCount ke users dan sort by lastMessageAt desc (terbaru ke terlama)
  const usersWithUnread = users.map(u => ({
    ...u,
    unreadCount: unreadMap[u.email] || 0
  })).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  res.json({ success: true, data: usersWithUnread });
};

// Get all messages in a chat room
export const getRoomMessages = async (req, res) => {
  try {
    const { email } = req.params;
    const msgs = await Message.find({ email }).sort({ createdAt: 1 });
    res.json({ success: true, data: msgs });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// Admin send message (ikuti status terakhir, kalau done tidak bisa chat)
export const sendAdminMessage = async (req, res) => {
  try {
    const { email } = req.params;
    const { message } = req.body;
    const lastMsg = await Message.findOne({ email }).sort({ createdAt: -1 });
    if (lastMsg && lastMsg.status === "done") {
      return res.status(403).json({ success: false, message: "Chat already closed." });
    }
    const name = lastMsg ? lastMsg.name : "User";
    const status = lastMsg ? lastMsg.status : "open";
    const msg = new Message({ name, email, message, sender: "admin", status });
    await msg.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: "Gagal kirim pesan admin" });
  }
};

// User send message (set unreadForAdmin: true)
export const sendUserMessage = async (req, res) => {
  try {
    const email = req.params.email || req.body.email;
    const { name, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Mohon lengkapi semua field." });
    }

    const lastMsg = await Message.findOne({ email }).sort({ createdAt: -1 });

    // Jika chat terakhir sudah done, cek 10 menit
    if (lastMsg && lastMsg.status === "done") {
      const now = new Date();
      const diffMs = now - lastMsg.createdAt;
      const diffMin = diffMs / 1000 / 60;
      if (diffMin < 10) {
        return res.status(403).json({
          success: false,
          message: `Silakan tunggu ${Math.ceil(10 - diffMin)} menit sebelum mengirim pesan baru.`
        });
      }
    }
    const status =
      lastMsg && lastMsg.status === "done"
        ? "open"
        : lastMsg
        ? lastMsg.status
        : "open";

    const msg = new Message({ name, email, message, sender: "user", status, unreadForAdmin: true });
    await msg.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: "Gagal mengirim pesan." });
  }
};

// Untuk update status chat (open/done)
export const updateChatStatus = async (req, res) => {
  const { email } = req.params;
  const { status } = req.body; // "open" or "done"
  try {
    await Message.updateMany({ email }, { $set: { status } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

// Hapus semua chat room milik email
export const deleteChatRoom = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await Message.deleteMany({ email });
    if (result.deletedCount > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "No chat found" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

export const getChatStatus = async (req, res) => {
  const { email } = req.params;
  try {
    const lastMsg = await Message.findOne({ email }).sort({ createdAt: -1 });
    const status = lastMsg ? lastMsg.status : "open";
    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: "Gagal mendapatkan status percakapan." });
  }
};

// ENDPOINT BARU: List semua pesan CS untuk admin panel
export const getAllMessages = async (req, res) => {
  try {
    const msgs = await Message.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: msgs });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// PATCH /api/message/room/:email/admin-read
export const adminReadChat = async (req, res) => {
  const { email } = req.params;
  try {
    await Message.updateMany({ email, sender: "user", unreadForAdmin: true }, { $set: { unreadForAdmin: false } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
