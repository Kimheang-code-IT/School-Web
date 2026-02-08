import React from 'react';
import HeroSlideshow from '../components/HeroSlideshow.jsx';
import AcademicPrograms from '../components/AcademicPrograms.jsx';

import PartnersMarquee from '../components/PartnersMarquee.jsx';

const Home = () => {
  return (
      <div className="min-h-screen">
        {/* Hero Slideshow */}
        <HeroSlideshow />

        {/* Academic Programs */}
        <AcademicPrograms />

        {/* Partners Marquee */}
        <PartnersMarquee />

      </div>
  );
};

export default Home;
