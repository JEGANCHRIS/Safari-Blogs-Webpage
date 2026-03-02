import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Canonical() {
  const location = useLocation();
  const baseUrl = "http://localhost:5173";
  const canonicalUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    let link =
      document.querySelector("link[rel = 'canonical']") ||
      document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", canonicalUrl);
    document.head.appendChild(link);
  }, [canonicalUrl]);
  
  return null;
}
