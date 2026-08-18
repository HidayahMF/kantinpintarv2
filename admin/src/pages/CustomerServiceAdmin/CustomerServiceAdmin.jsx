import React, { useEffect, useState } from "react";
import "./CustomerServiceAdmin.css";
import API from "../../api";
import CustomerServiceAdminRoom from "../CustomerServiceAdminRoom/CustomerServiceAdminRoom";
import { FiMessageSquare, FiChevronRight } from "react-icons/fi";

const ROOMS_PER_PAGE = 5;

const CustomerServiceAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await API.get("/message/users");
      if (res.data.success) {
        const sortedRooms = [...res.data.data].sort((a, b) => {
          if (a.lastMessageAt && b.lastMessageAt)
            return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
          if (a._id < b._id) return 1;
          if (a._id > b._id) return -1;
          return 0;
        });
        setRooms(sortedRooms);
      } else {
        setRooms([]);
      }
    } catch (e) {
      console.error("Error fetching rooms:", e);
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROOMS_PER_PAGE;
  const roomsPage = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE);

  const handleOpenRoom = async (email) => {
    setSelectedEmail(email);
    try {
      await API.patch(`/message/room/${email}/admin-read`, {});
      fetchRooms();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <div className="cs-admin">
      {loading ? (
        <div className="state-box">
          <div className="spinner" />
          <p>Memuat percakapan...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">
            <FiMessageSquare size={24} />
          </div>
          <h3>Belum ada chat</h3>
          <p>Percakapan dari pelanggan akan muncul di sini.</p>
        </div>
      ) : (
        <>
          <div className="cs-admin-list">
            {roomsPage.map((room) => {
              const isDone = room.status === "done";
              return (
                <button
                  className={`cs-room-card card ${isDone ? "done" : ""}`}
                  key={room.email}
                  onClick={() => handleOpenRoom(room.email)}
                >
                  <span className="cs-room-avatar">
                    {(room.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="cs-room-info">
                    <span className="cs-room-name">
                      <strong>{room.name}</strong>
                      <em>{room.email}</em>
                    </span>
                    <span className="cs-room-preview">{room.firstMessage}</span>
                  </span>
                  <span className="cs-room-meta">
                    <span className={`badge ${isDone ? "badge-neutral" : "badge-warning"}`}>
                      {isDone ? "Selesai" : "Baru"}
                    </span>
                    {room.unreadCount > 0 && (
                      <span className="unread-badge">{room.unreadCount}</span>
                    )}
                    <FiChevronRight size={16} />
                  </span>
                </button>
              );
            })}
          </div>

          {rooms.length > ROOMS_PER_PAGE && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &larr; Prev
              </button>
              <span className="pagination-info">
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {selectedEmail && (
        <CustomerServiceAdminRoom
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onStatusChange={fetchRooms}
        />
      )}
    </div>
  );
};

export default CustomerServiceAdmin;
