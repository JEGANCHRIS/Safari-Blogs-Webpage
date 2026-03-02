import { Outlet, useLocation } from "react-router-dom";
import { BannerSlider } from "../components/BannerSlider";

const Layout = () => {
  const location = useLocation();
  let sliderMode = null;

  // decide where to show sliders
  if (location.pathname === "/") {
    sliderMode = "home"; // published banners
  } else if (location.pathname === "/drafts") {
    sliderMode = "draft"; // draft banners
  }

  return (
    <>
      {sliderMode && <BannerSlider mode={sliderMode} />}
      <Outlet />
    </>
  );
};

export default Layout;
