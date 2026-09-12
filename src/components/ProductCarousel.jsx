import { useCart } from '../context/CartContext';
import './ProductCarousel.css';

const products = [
  { id: 1, name: 'Crimson Kanjeevaram Silk', price: '₹15,999', image: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Royal Blue Banarasi', price: '₹12,499', image: 'https://images.unsplash.com/photo-1615708891546-24959db63c1d?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Emerald Green Chanderi', price: '₹8,999', image: 'https://images.unsplash.com/photo-1596457187431-7e87f3b89b4f?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Golden Tissue Silk', price: '₹22,000', image: 'https://images.unsplash.com/photo-1585915233157-1906a2e4b486?q=80&w=400&auto=format&fit=crop' }
];

const ProductCarousel = () => {
  const { addToCart } = useCart();

  return (
    <section className="products section-padding" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <h2 className="section-title">New Arrivals</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
