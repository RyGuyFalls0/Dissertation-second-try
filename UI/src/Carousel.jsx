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
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <LiveWaveform />
        </div>
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Metronome />
        </div>
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <h3>Slide 3</h3>
        </div>
      </Slider>
    </div>
  );
}

export default Carousel;