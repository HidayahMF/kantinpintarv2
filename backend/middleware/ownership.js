// Guard kepemilikan resource. Reusable untuk resource lain
// yang dimiliki user (mis. room chat, alamat, dsb).

const normalize = (email = "") => String(email).trim().toLowerCase();

// Pastikan email pada request (body/params) milik user yang sedang login.
// getEmail: (req) => string | undefined
export const assertSameEmail = (getEmail) => (req, res, next) => {
  const candidate = normalize(getEmail(req));
  const owner = normalize(req.user?.email);

  if (!candidate || !owner || candidate !== owner) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: not your chat room",
    });
  }
  next();
};

// Akses room: admin boleh semua, user hanya room miliknya.
export const canAccessRoom = (req, res, next) => {
  if (req.isAdmin) return next();

  const owner = normalize(req.user?.email);
  if (!owner || normalize(req.params.email) !== owner) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: not your chat room",
    });
  }
  next();
};
