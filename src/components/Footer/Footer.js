import React from "react";
import s from "./Footer.module.scss";

const Footer = () => {
  return (
    <div className={s.footer}>
      <span className={s.footerLabel}>2025 &copy; SMEC R&D Center</span>
      {/* <FooterIcon /> */}
    </div>
  )
}

export default Footer;
