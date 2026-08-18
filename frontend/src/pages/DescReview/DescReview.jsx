import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import "./DescReview.css";
import { toast } from "react-toastify";
import { formatRp } from "../../utils/format";
import { FiArrowLeft, FiPlus, FiMinus, FiShoppingBag, FiStar } from "react-icons/fi";

const DescReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    foodList,
    user,
    orders,
    addReview,
    cartItems,
    addToCart,
    removeFromCart,
    url,
  } = useContext(StoreContext);

  const food = foodList.find(
    (item) => String(item._id || item.id) === String(id)
  );

  const foodStock = food?.stock ?? 0;
  const qtyInCart = cartItems?.[id] || 0;

  const userHasBought = orders?.some((order) =>
    order.items.some((item) => String(item.id || item._id) === String(id))
  );

  const hasReviewed = food?.reviews?.some(
    (review) =>
      (user?.id && String(review.userId) === String(user.id)) ||
      review.user === (user?.name || "Anonymous")
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!food) {
    return (
      <div className="desc-review-wrapper">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="state-box">
          <div className="state-icon error">!</div>
          <h3>Makanan tidak ditemukan</h3>
          <p>Item yang kamu cari tidak tersedia atau sudah dihapus.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const handleReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Review cannot be empty!");
      return;
    }
    if (hasReviewed) {
      setError("You already reviewed this food!");
      return;
    }
    setSubmitting(true);
    try {
      await addReview(food._id || food.id, { rating, comment });
      setSuccess(true);
      setError("");
      setComment("");
      setTimeout(() => setSuccess(false), 1500);
    } catch {
      setError("Gagal mengirim review. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  const handleAddToCart = () => {
    if (qtyInCart + 1 > foodStock) {
      toast.error("Stock tidak cukup!");
      return;
    }
    addToCart(food._id || food.id);
  };

  return (
    <div className="desc-review-wrapper">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
        <FiArrowLeft size={15} /> Back
      </button>

      <div className="desc-review-content card">
        <div className="desc-review-img-wrap">
          <img
            className="desc-review-img"
            src={`${url}${food.image}`}
            alt={food.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-food.png";
            }}
          />
        </div>

        <div className="desc-review-info">
          {food.category && (
            <span className="badge badge-accent">{food.category}</span>
          )}
          <h2>{food.name}</h2>
          <p className="desc-review-desc">{food.description}</p>

          <div className="desc-review-meta">
            <span
              className={`badge ${
                foodStock === 0 ? "badge-error" : "badge-success"
              }`}
            >
              {foodStock === 0 ? "Out of stock" : `Stock: ${foodStock}`}
            </span>
            {food.reviews?.length > 0 && (
              <span className="badge badge-neutral">
                <FiStar size={12} /> {food.reviews.length} review
                {food.reviews.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <p className="desc-review-price">{formatRp(food.price)}</p>

          <div className="desc-review-cart-row">
            {foodStock === 0 ? (
              <button className="btn btn-ghost" disabled>
                Sold Out
              </button>
            ) : (
              <>
                <div className="food-item-counter desc-counter">
                  <button
                    className="counter-btn"
                    onClick={() => removeFromCart(id)}
                    disabled={!qtyInCart}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus size={15} />
                  </button>
                  <span className="counter-qty">{qtyInCart}</span>
                  <button
                    className="counter-btn"
                    onClick={handleAddToCart}
                    disabled={qtyInCart >= foodStock}
                    aria-label="Increase quantity"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                  <FiShoppingBag size={17} />
                  {qtyInCart > 0 ? "Add More" : "Add to Cart"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="desc-review-reviews">
        <h3>User Reviews</h3>
        {food.reviews && food.reviews.length > 0 ? (
          <div className="review-list">
            {food.reviews.map((review, i) => (
              <div key={i} className="review-card card">
                <div className="review-head">
                  <span className="review-avatar">
                    {(review.user || "U").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{review.user}</strong>
                    <span className="review-stars">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <FiStar
                          key={s}
                          size={13}
                          className={s < review.rating ? "filled" : ""}
                        />
                      ))}
                      <em>{review.rating}/5</em>
                    </span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="state-box review-empty">
            <div className="state-icon">
              <FiStar size={22} />
            </div>
            <p>Belum ada review untuk makanan ini. Jadilah yang pertama!</p>
          </div>
        )}
      </section>

      {/* Add review */}
      <section className="desc-review-add-review card">
        <h3>Add Your Review</h3>
        {userHasBought ? (
          !hasReviewed ? (
            <form className="desc-review-form" onSubmit={handleReview}>
              <div className="form-field">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  className="select"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((val) => (
                    <option value={val} key={val}>
                      {"★".repeat(val)}
                      {"☆".repeat(5 - val)} — {val}/5
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="review-comment">Your review</label>
                <textarea
                  id="review-comment"
                  className="textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  rows={3}
                />
              </div>
              {error && <p className="field-error">{error}</p>}
              {success && (
                <p className="review-success">Thank you for your review!</p>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="review-already">
              You already reviewed this food. Thank you!
            </div>
          )
        ) : (
          <div className="review-already">
            Checkout to add your review.
          </div>
        )}
      </section>
    </div>
  );
};

export default DescReview;
