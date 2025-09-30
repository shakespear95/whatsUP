import React from 'react';
import './Hero.css';

interface HeroProps {
  onSearchClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSearchClick }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>WELCOME TO THE ALTERNATIVE</h1>
        <p>
          Incredible live shows. Upfront pricing. Relevant recommendations. <br />
          EventFinder makes finding events easy.
        </p>
        <button onClick={onSearchClick} className="primary-btn">
          SEARCH EVENTS
        </button>
      </div>
    </section>
  );
};

export default Hero;