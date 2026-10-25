import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <h1>Saree<span>Boutique</span></h1>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/collections">Collections</Link></li>
          <li><Link to="/collections">New Arrivals</Link></li>
        </ul>
        <div className="navbar-icons">
          <span className="icon"><Search size={22} /></span>
          <span className="icon"><User size={22} /></span>
          <Link to="/cart" className="icon cart-icon-wrapper">
            <ShoppingCart size={22} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
