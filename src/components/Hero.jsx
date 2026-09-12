import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1 className="hero-title">Elegance Woven in Silk</h1>
        <p className="hero-subtitle">
          Discover our exclusive festive collection of handcrafted Kanjeevaram and Banarasi sarees. 
          Drape yourself in tradition and luxury.
        </p>
        <div className="hero-cta">
          <Link to="/collections" className="btn btn-primary">Shop Collection</Link>
          <Link to="/collections" className="btn btn-outline" style={{ borderColor: 'var(--white)', color: 'var(--white)' }}>
            View Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
