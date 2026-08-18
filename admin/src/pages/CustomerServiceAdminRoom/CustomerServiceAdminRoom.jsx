import React, { useEffect, useRef, useState } from "react";
import "./CustomerServiceAdminRoom.css";
import API from "../../api";
import { FiSend, FiX, FiCheckCircle, FiHeadphones } from "react-icons/fi";

const CustomerServiceAdminRoom = ({ email, onClose, onStatusChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("open");

  const chatEndRef = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/message/room/${email}`);
      if (isMountedRef.current && res.data.success) setMessages(res.data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    if (isMountedRef.current) setLoading(false);
  };

  const fetchStatus = async () => {
    try {
      const res = await API.get(`/message/room/${email}/status`);
      if (isMountedRef.current) setStatus(res.data.status);
    } catch (error) {
      console.error("Error fetching status:", error);
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
    if (!input.trim()) return;
    setSending(true);
    try {
      await API.post(`/message/room/${email}/admin`, { message: input });
      setInput("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  const handleDone = async () => {
    try {
      await API.patch(`/message/room/${email}/status`, { status: "done" });
      setStatus("done");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Error marking as done:", error);
    }
  };

  return (
    <div className="cs-admin-room-modal">
      <div className="cs-admin-room-box card">
        <div className="cs-admin-room-header">
          <span className="cs-admin-room-avatar">
            <FiHeadphones size={17} />
          </span>
          <div className="cs-admin-room-title">
            <strong>Chat: {email}</strong>
            <span className={`badge ${status === "done" ? "badge-neutral" : "badge-success"}`}>
              {status === "done" ? "Completed" : "Open"}
            </span>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close chat">
            <FiX size={18} />
          </button>
        </div>

        <div className="cs-admin-room-body">
          {loading && messages.length === 0 ? (
            <div className="state-box">
              <div className="spinner" />
              <p>Memuat pesan...</p>
            </div>
          ) : (
            <>
              <div className="cs-admin-room-messages">
                {messages.length === 0 && (
                  <div className="cs-room-empty">
                    <p>Belum ada pesan dalam percakapan ini.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    className={`msg-bubble ${
                      msg.sender === "admin" ? "admin" : "user"
                    }`}
                    key={msg._id}
                  >
                    <div className="msg-meta">
                      <span>{msg.name}</span>
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
                <div className="cs-admin-room-closed">
                  Chat is finished, can't reply anymore.
                </div>
              ) : (
                <form className="cs-admin-room-input" onSubmit={handleSend}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesan untuk user..."
                    disabled={sending || status === "done"}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                    aria-label="Message"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    aria-label="Send message"
                  >
                    <FiSend size={16} />
                  </button>
                  <button
                    type="button"
                    className="done-btn"
                    onClick={handleDone}
                    disabled={sending}
                  >
                    <FiCheckCircle size={15} />
                    Mark Complete
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

export default CustomerServiceAdminRoom;
