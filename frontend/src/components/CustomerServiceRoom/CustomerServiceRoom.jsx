import React, { useEffect, useRef, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";
import "./CustomerServiceRoom.css";
import { toast } from "react-toastify";
import { FiSend, FiHeadphones } from "react-icons/fi";

const CustomerServiceRoom = () => {
  const { user } = useContext(StoreContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("open");
  const [cooldown, setCooldown] = useState(0);

  const chatEndRef = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);

  const email = user?.email;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMessages = async () => {
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/message/room/${email}`);
      if (isMountedRef.current && res.data.success) setMessages(res.data.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
    if (isMountedRef.current) setLoading(false);
  };

  const fetchStatus = async () => {
    if (!email) return;
    try {
      const res = await API.get(`/message/room/${email}/status`);
      if (isMountedRef.current) setStatus(res.data.status);

      if (res.data.status === "done") {
        const resMsgs = await API.get(`/message/room/${email}`);
        const lastUserMsg = (resMsgs.data.data || [])
          .filter((msg) => msg.sender === "user")
          .pop();

        if (lastUserMsg) {
          const diffMs = new Date() - new Date(lastUserMsg.createdAt);
          const diffMin = 10 - Math.floor(diffMs / 1000 / 60);
          setCooldown(diffMin > 0 ? diffMin : 0);
        }
      } else {
        setCooldown(0);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  };

  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!inputFocus) {
        await fetchMessages();
        await fetchStatus();
      }
      timer = setTimeout(poll, 10000);
    };
    poll();
    return () => clearTimeout(timer);
  }, [email, inputFocus]);

  useEffect(() => {
    if (!inputFocus && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, inputFocus]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !email) return;

    try {
      await API.post(`/message/room/${email}/user`, {
        name: user.name,
        message: input,
      });
      setInput("");
      fetchMessages();
      fetchStatus();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Gagal mengirim pesan. Silakan coba lagi."
      );
    }
  };

  return (
    <div className="cs-room">
      <div className="cs-room-box card">
        <div className="cs-room-header">
          <span className="cs-room-avatar">
            <FiHeadphones size={18} />
          </span>
          <div className="cs-room-header-info">
            <strong>Customer Service</strong>
            <span className="cs-room-status">
              <span className="status-dot" />
              {status === "done" ? "Sesi selesai" : "Online — balasan dalam beberapa menit"}
            </span>
          </div>
        </div>

        <div className="cs-room-body">
          {!email ? (
            <div className="state-box">
              <div className="state-icon">
                <FiHeadphones size={22} />
              </div>
              <p>
                Silakan login terlebih dahulu untuk menghubungi Customer
                Service.
              </p>
            </div>
          ) : loading && messages.length === 0 ? (
            <div className="state-box">
              <div className="spinner" />
              <p>Memuat percakapan...</p>
            </div>
          ) : (
            <>
              <div className="cs-room-messages">
                {messages.length === 0 && (
                  <div className="cs-room-empty">
                    <p>Mulai percakapan dengan admin KantinGo 👋</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    className={`msg-bubble ${
                      msg.sender === "user" ? "user" : "admin"
                    }`}
                    key={msg._id}
                  >
                    <div className="msg-meta">
                      <span>{msg.sender === "user" ? "Anda" : "Admin"}</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="msg-content">{msg.message}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {status === "done" ? (
                <div className="cs-room-closed">
                  Chat has been completed by admin.
                  <br />
                  {cooldown > 0
                    ? `Anda bisa kirim pesan baru dalam ${cooldown} menit lagi.`
                    : "Silakan reload untuk memulai chat baru."}
                </div>
              ) : (
                <form className="cs-room-input" onSubmit={handleSend}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesan ke admin..."
                    disabled={status === "done"}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                    aria-label="Message"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                  >
                    <FiSend size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceRoom;
