import React from "react";
import Slider from "react-slick";
import LiveWaveform from "./Waveform";
import Metronome from "./Metronome.jsx"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto',
    }}>
    <Slider {...settings}>
      <div className="h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <LiveWaveform />
        </div>
      </div>

      <div className="h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Metronome />
        </div>
      </div>

      <div className="h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-2xl font-semibold">Slide 3</h3>
        </div>
      </div>
    </Slider>
    </div>
  );
}

export default Carousel;