import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import API from "../../api";
import "./Profile.css";
import {
  FiMail,
  FiUser,
  FiCalendar,
  FiShield,
  FiLogOut,
  FiEdit2,
  FiCamera,
  FiSave,
  FiX,
} from "react-icons/fi";

const Profile = () => {
  const { url, token, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [uploadImg, setUploadImg] = useState(null);
  const [avatarBuster, setAvatarBuster] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const previewUrlRef = useRef(null);

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await API.get("/user/me");
      if (res.data.success && res.data.user) setUser(res.data.user);
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const avatar = previewImg
    ? previewImg
    : user?.avatar
    ? `${url}/uploads/${user.avatar}?v=${avatarBuster}`
    : null;

  const handleSave = async () => {
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }

    const oldEmail = user.email;
    const oldAvatar = user.avatar;

    const fd = new FormData();
    fd.append("email", newEmail);
    if (uploadImg) fd.append("avatar", uploadImg);

    setSaving(true);
    try {
      const res = await API.put("/user/update-profile", fd);

      if (res.data.success) {
        const emailChanged = res.data.user.email !== oldEmail;
        const avatarChanged =
          (res.data.user.avatar || "") !== (oldAvatar || "") &&
          !!res.data.user.avatar;

        if (avatarChanged && emailChanged)
          toast.success("Berhasil mengganti email & foto profile.");
        else if (avatarChanged) toast.success("Berhasil mengganti foto profile.");
        else if (emailChanged) toast.success("Berhasil mengganti email.");
        else toast.success("Profile updated.");

        setUser(res.data.user);
        setEditMode(false);
        setPreviewImg(null);
        setUploadImg(null);
        if (avatarChanged) setAvatarBuster(Date.now());
      } else {
        toast.error(res.data.message || "Failed to update profile.");
      }
    } catch {
      toast.error("Failed to update profile.");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    if (logout) logout();
    toast.success("Anda berhasil logout!");
  };

  // ===== NOT LOGGED IN STATE =====
  if (!token || !user) {
    return (
      <div className="profile-page">
        <div className="state-box">
          <div className="state-icon">
            <FiUser size={24} />
          </div>
          <h3>Kamu belum login</h3>
          <p>Masuk untuk melihat dan mengelola profilmu.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="profile-page">
      <div className="section-head">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Kelola informasi akunmu.</p>
        </div>
      </div>

      <div className="profile-card card">
        <div className="profile-header">
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt={`${user.name} avatar`} />
            ) : (
              <span className="profile-avatar-fallback">
                {(user.name || "U").charAt(0).toUpperCase()}
              </span>
            )}
            {editMode && (
              <button
                className="profile-avatar-edit"
                title="Change Photo"
                onClick={() => fileRef.current.click()}
                type="button"
              >
                <FiCamera size={15} />
              </button>
            )}
          </div>

          <div className="profile-header-info">
            <h2>{user.name || "No Name"}</h2>
            <span className={`badge ${user.isAdmin ? "badge-accent" : "badge-info"}`}>
              {user.isAdmin ? "Admin" : "Customer"}
            </span>
          </div>

          <div className="profile-header-actions">
            {editMode ? (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FiSave size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditMode(false);
                    setPreviewImg(null);
                    setUploadImg(null);
                    setNewEmail(user.email);
                  }}
                >
                  <FiX size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditMode(true);
                  setNewEmail(user.email);
                }}
              >
                <FiEdit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-icon">
              <FiMail size={16} />
            </span>
            <div>
              <label>Email</label>
              {editMode ? (
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input"
                  autoFocus
                  aria-label="New email"
                />
              ) : (
                <p>{user.email}</p>
              )}
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">
              <FiShield size={16} />
            </span>
            <div>
              <label>Role</label>
              <p>{user.isAdmin ? "Admin" : "User"}</p>
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">
              <FiCalendar size={16} />
            </span>
            <div>
              <label>Date Joined</label>
              <p>{joinedDate}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-danger" onClick={handleLogout}>
            <FiLogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            const objectUrl = URL.createObjectURL(e.target.files[0]);
            previewUrlRef.current = objectUrl;
            setPreviewImg(objectUrl);
            setUploadImg(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default Profile;
