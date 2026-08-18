import React, { useContext, useEffect, useState, useRef } from "react";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import API from "../../api";
import "./Profile.css";

const Profile = () => {
  const { url, token } = useContext(StoreContext);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [uploadImg, setUploadImg] = useState(null);
  const [avatarBuster, setAvatarBuster] = useState(Date.now());
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
    : "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user?.name || "User") +
      "&background=FF6834&color=fff&bold=true&size=128";

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
  };

  // ===== NOT LOGGED IN STATE =====
  if (!token || !user)
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Profile</h2>
          <div className="profile-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Guest&background=eee&color=FF6834"
              alt="avatar"
            />
          </div>
          <p style={{ margin: "24px 0", color: "#888" }}>
            You are not logged in.
          </p>
        </div>
      </div>
    );

  // ===== MAIN PROFILE UI =====
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          <img src={avatar} alt="avatar" />
          {editMode && (
            <button
              className="edit-btn"
              title="Change Photo"
              onClick={() => fileRef.current.click()}
              type="button"
            >
              ✏️
            </button>
          )}
        </div>

        <h2 style={{ color: "#232323", margin: "8px 0 4px" }}>
          {user?.name || "No Name"}
        </h2>

        <div className="profile-info">
          <div>
            <label>Email</label>
            {editMode ? (
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{
                  fontWeight: 500,
                  padding: "4px 10px",
                  border: "1px solid #eee",
                  borderRadius: "7px",
                  fontSize: "15px",
                  outline: "none",
                  width: "180px",
                }}
                autoFocus
              />
            ) : (
              <p>{user?.email}</p>
            )}
          </div>

          <div>
            <label>Role</label>
            <p>
              {user?.isAdmin ? (
                <span className="profile-role admin">Admin</span>
              ) : (
                <span className="profile-role user">User</span>
              )}
            </p>
          </div>

          <div>
            <label>Date Joined</label>
            <p>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US")
                : "-"}
            </p>
          </div>
        </div>

        {editMode ? (
          <div
            style={{
              width: "100%",
              marginTop: 18,
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <button
              className="profile-action-btn"
              style={{ background: "#ff6834" }}
              onClick={handleSave}
              type="button"
            >
              Save
            </button>
            <button
              className="profile-action-btn"
              style={{ background: "#f5f5f5", color: "#ff6834" }}
              onClick={() => {
                setEditMode(false);
                setPreviewImg(null);
                setUploadImg(null);
                setNewEmail(user.email);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="profile-action-btn"
            onClick={() => {
              setEditMode(true);
              setNewEmail(user.email);
            }}
          >
            Edit Profile
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
              const url = URL.createObjectURL(e.target.files[0]);
              previewUrlRef.current = url;
              setPreviewImg(url);
              setUploadImg(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
