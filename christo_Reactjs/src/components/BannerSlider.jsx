import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function BannerSlider({ mode = "home" }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    fetch(`${import.meta.env.VITE_API_URL}/api/getmyblogs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;

        let filtered = [];
        if (mode === "home") filtered = data.filter((b) => b.isPublished);
        if (mode === "draft") filtered = data.filter((b) => !b.isPublished);

        const slides = filtered
          .filter((b) => b.bannerImage)
          .sort((a, b) => {
            const at = new Date(a.updatedAt || a.createdAt).getTime();
            const bt = new Date(b.updatedAt || b.createdAt).getTime();
            return bt - at; // newest first
          })
          .slice(0, 5)
          .map((b) => ({
            id: b._id,
            title: b.title,
            img: b.bannerImage.startsWith("http")
              ? b.bannerImage
              : `${import.meta.env.VITE_API_URL}/${b.bannerImage.replace(/^\/+/, "")}`,
          }));

        setBanners(slides);
      })
      .catch((err) => console.error("Failed to fetch banners", err));
  }, [mode]);

  if (banners.length === 0) return null;

  return (
    <section className="BannerSliderSection">
      <div className="container">
        <div className="sliderContent">
          <Swiper
            spaceBetween={30}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            loop={true}
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            slidesPerView={1}
          >
            {banners.map((b) => (
              <SwiperSlide key={b.id} className="banner-slide">
                <a
                  title={b.title}
                  href={`/blog/${b.id}`}
                  className="banner-link"
                >
                  <img
                    className="bannerImg"
                    style={{ width: "100%", height: "1000" }}
                    src={b.img}
                    alt={b.title}
                    title={b.title}
                    loading="lazy"
                  />
                  <div className="bannerCaption">{b.title}</div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
