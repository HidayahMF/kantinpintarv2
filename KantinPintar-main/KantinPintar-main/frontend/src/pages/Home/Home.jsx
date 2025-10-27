import React, { useContext, useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { StoreContext } from "../../context/StoreContextProvider";

const Home = () => {
  const [category, setCategory] = useState("All");
  const { foodList } = useContext(StoreContext);

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay foods={foodList} selectedCategory={category} />
      <AppDownload />
    </div>
  );
};

export default Home;
