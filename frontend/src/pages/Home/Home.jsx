import React, { useContext, useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { StoreContext } from "../../context/StoreContextProvider";
import { FiSearch, FiShoppingBag, FiTruck } from "react-icons/fi";

const STEPS = [
  {
    icon: FiSearch,
    title: "Browse the menu",
    text: "Explore categories and find dishes you love.",
  },
  {
    icon: FiShoppingBag,
    title: "Place your order",
    text: "Add to cart and checkout in a few taps.",
  },
  {
    icon: FiTruck,
    title: "Fast delivery",
    text: "Track your order right to your doorstep.",
  },
];

const Home = () => {
  const [category, setCategory] = useState("All");
  const { foodList } = useContext(StoreContext);

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay foods={foodList} selectedCategory={category} />

      <section className="how-it-works">
        <div className="section-head section-head-center">
          <div>
            <h2>How it works</h2>
            <p>Ordering your favorite meal has never been this simple.</p>
          </div>
        </div>
        <div className="how-it-works-grid">
          {STEPS.map((step, idx) => (
            <div className="how-step card" key={idx}>
              <span className="how-step-num">0{idx + 1}</span>
              <span className="how-step-icon">
                <step.icon size={22} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <AppDownload />
    </div>
  );
};

export default Home;
