import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={assets.logokantin} alt="KantinGo" className="footer-logo" />
            <p>
              Welcome to Kantin Pintar — your one-stop solution for ordering
              delicious meals online! Browse your favorite dishes, place an order
              in seconds, and enjoy fast, reliable delivery right to your doorstep.
            </p>
            <div className="footer-social-icons">
              <a href="#" aria-label="Facebook">
                <FiFacebook size={16} />
              </a>
              <a href="#" aria-label="Twitter">
                <FiTwitter size={16} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FiLinkedin size={16} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Company</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/#explore-menu">Menu</a></li>
              <li><a href="/myorder">My Orders</a></li>
              <li><a href="/customer-service">Customer Service</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Get In Touch</h3>
            <ul>
              <li>
                <FiPhone size={14} />
                <a href="tel:+6282125630770">+62-8212-5630-770</a>
              </li>
              <li>
                <FiMail size={14} />
                <a href="mailto:contact@HidayahMF.com">contact@HidayahMF.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 HidayahMF.com — All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
