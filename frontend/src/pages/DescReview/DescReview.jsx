import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import "./DescReview.css";
import { toast } from "react-toastify";
import { formatRp } from "../../utils/format";

const DescReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { foodList, user, orders, addReview, cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);


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

  if (!food) {
    return (
      <div className="desc-review-wrapper">
        <button onClick={() => navigate(-1)} className="desc-review-back">
          ⬅ Back
        </button>
        <p>
          <em>Food not found.</em>
        </p>
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
    await addReview(food._id || food.id, {
      rating,
      comment,
    });
    setSuccess(true);
    setError("");
    setComment("");
    setTimeout(() => setSuccess(false), 1500);
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
      <button className="desc-review-back" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
      <div className="desc-review-content">
        <img
          className="desc-review-img"
          src={`${url}${food.image}`}

          alt={food.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-food.png";
          }}
        />
        <div className="desc-review-info">
          <div className="desc-review-head-row">
            <h2>{food.name}</h2>
           <div style={{ marginTop: 12 }}>
  <span className={`simple-stock-badge ${foodStock === 0 ? "out" : ""}`}>
    {foodStock === 0 ? "Out" : `Stock: ${foodStock}`}
  </span>
</div>
          </div>
          <p className="desc-review-desc">{food.description}</p>
          <div className="desc-review-price-cart-row">
            <p className="desc-review-price">
              <strong>Price:</strong> {formatRp(food.price)}
            </p>
            <div className="desc-review-cart-action">
              {foodStock === 0 ? (
                <button className="add-btn-glow slim" disabled>Out</button>
              ) : !qtyInCart ? (
                <button className="add-btn-glow slim" onClick={handleAddToCart} title="Tambah ke cart">
                  <span className="icon-plus"></span>
                </button>
              ) : (
                <div className="food-item-counter-modern">
                  <button className="counter-btn-modern" onClick={() => removeFromCart(id)}>
                    <span className="icon-minus"></span>
                  </button>
                  <span className="counter-qty-modern">{qtyInCart}</span>
                  <button
                    className="counter-btn-modern"
                    onClick={qtyInCart >= foodStock ? null : handleAddToCart}
                    disabled={qtyInCart >= foodStock}
                  >
                    <span className="icon-plus"></span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="desc-review-reviews">
        <h3>User Reviews</h3>
        {food.reviews && food.reviews.length > 0 ? (
          food.reviews.map((review, i) => (
            <div key={i} className="desc-review-review">
              <strong>{review.user}</strong> <span style={{ color: "#ffb300" }}>★</span> {review.rating}/5
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="desc-review-noreview">No reviews yet.</p>
        )}
      </div>

      <div className="desc-review-add-review">
        <h3 style={{ marginTop: 24 }}>Add Your Review</h3>
        {userHasBought ? (
          !hasReviewed ? (
            <form className="desc-review-form" onSubmit={handleReview}>
              <label>
                Rating:
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((val) => (
                    <option value={val} key={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                rows={3}
              />
              {error && <div className="desc-review-error">{error}</div>}
              {success && (
                <div className="desc-review-success">
                  Thank you for your review!
                </div>
              )}
              <button type="submit">Submit Review</button>
            </form>
          ) : (
            <div className="desc-review-info" style={{ marginTop: 12 }}>
              You already reviewed this food. Thank you!
            </div>
          )
        ) : (
          <div className="desc-review-info" style={{ marginTop: 12 }}>
            Checkout to add your review.
          </div>
        )}
      </div>
    </div>
  );
};

export default DescReview;
