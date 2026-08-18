import React from "react";
import "./AppDownload.css";
import { assets } from "../../assets/assets";

const AppDownload = () => {
  return (
    <section className="app-download" id="app-download">
      <div className="app-download-card">
        <div className="app-download-copy">
          <h2>For a better experience, download the KantinGo app</h2>
          <p>
            Order faster, track your delivery, and get the latest menu updates
            right on your phone.
          </p>
          <div className="app-download-platforms">
            <a href="#" aria-label="Download on Google Play">
              <img src={assets.play_store} alt="Get it on Google Play" />
            </a>
            <a href="#" aria-label="Download on the App Store">
              <img src={assets.app_store} alt="Download on the App Store" />
            </a>
          </div>
        </div>
        <img
          src={assets.logokantin}
          alt=""
          className="app-download-logo"
          aria-hidden="true"
        />
      </div>
    </section>
  );
};

export default AppDownload;
