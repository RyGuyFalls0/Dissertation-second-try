import React from "react";
import { useState } from "react"
import Slider from "react-slick";
import LiveWaveform from "./Waveform";
import Metronome from "./Metronome.jsx"
import Tuner from "./Tuner.jsx"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Carousel() {

  const [activeSlide, setActiveSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    afterChange: (index) => setActiveSlide(index),
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
          <LiveWaveform active={activeSlide === 0}/>
        </div>
      </div>

      <div className="h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Metronome active={activeSlide === 1}/>
        </div>
      </div>

      <div className="h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Tuner active={activeSlide === 2}/>
        </div>
      </div>
    </Slider>
    </div>
  );
}

export default Carousel;