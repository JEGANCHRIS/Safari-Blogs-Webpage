import logoimg from "../assets/siteLog.svg";
import facebook from "../assets/facebook.svg";
import twitter from "../assets/twitter.svg";
import instagram from "../assets/instagram.svg";
import whatsapp from "../assets/whatsapp.svg";

export function Footer() {
  return (
    <section className="FooterSection">
      <div className="container">
        <div className="footerContainer">
          <div className="footerContent">
            <div className="logo">
              <img
                style={{ width: "75px", height: "72" }}
                className="main-logo"
                src={logoimg}
                alt="logoimg"
                title="logoImg"
                loading="lazy"
              />
            </div>
            <p className="f-content">
              A blog dedicated to navigating the endless world of knowledge —
              exploring ideas, facts, and insights that spark curiosity and
              inspire discovery
            </p>
          </div>
          <div className="FooterIcons">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mediaBtn"
              title="facebook"
            >
              <img
                style={{ width: "60px", height: "60" }}
                className="SocialMedia"
                src={facebook}
                alt="faceBook"
                title="faceBook"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mediaBtn"
              title="twitter"
            >
              <img
                style={{ width: "60px", height: "60" }}
                className="SocialMedia"
                src={twitter}
                alt="twitter"
                title="twitter"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mediaBtn"
              title="instagram"
            >
              <img
                style={{ width: "60px", height: "60" }}
                className="SocialMedia"
                src={instagram}
                alt="instagram"
                title="instagram"
                loading="lazy"
              />
            </a>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="mediaBtn"
              title="whatsapp"
            >
              <img
                style={{ width: "60px", height: "60" }}
                className="SocialMedia"
                src={whatsapp}
                alt="whatsapp"
                title="whatsapp"
                loading="lazy"
              />
            </a>
          </div>
        </div>
        <div className="CopyBox">
          <p className="CopyRights">© Copyright 2025, All Rights Reserved</p>
        </div>
      </div>
    </section>
  );
}
