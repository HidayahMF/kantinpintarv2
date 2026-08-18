import React, { useEffect, useRef, useState, useContext } from "react";
import "./CustomerServiceAdminRoom.css";
import API from "../../api"; // pastikan path sesuai struktur project kamu
import { StoreContext } from "../../context/StoreContextProvider";

const CustomerServiceAdminRoom = ({ email, onClose, onStatusChange }) => {
  const { token } = useContext(StoreContext);
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
    return () => { isMountedRef.current = false; };
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
      <div className="cs-admin-room-box">
        <div className="cs-admin-room-header">
          <b>Chat: {email}</b>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        <div className="cs-admin-room-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* Pesan-pesan */}
              <div className="cs-admin-room-messages">
                {messages.map((msg) => (
                  <div
                    className={
                      msg.sender === "admin"
                        ? "msg-bubble admin"
                        : "msg-bubble user"
                    }
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

              {/* Jika status sudah done */}
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
                  />
                  <button type="submit" disabled={sending || !input.trim()}>
                    Send
                  </button>
                  <button
                    type="button"
                    className="done-btn"
                    onClick={handleDone}
                  >
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
