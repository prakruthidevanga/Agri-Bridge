import { useCart } from '../context/CartContext';
import '../components/ProductCarousel.css'; // Reusing some grid styles

const allProducts = [
  { id: 1, name: 'Crimson Kanjeevaram Silk', price: '₹15,999', image: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Royal Blue Banarasi', price: '₹12,499', image: 'https://images.unsplash.com/photo-1615708891546-24959db63c1d?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Emerald Green Chanderi', price: '₹8,999', image: 'https://images.unsplash.com/photo-1596457187431-7e87f3b89b4f?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Golden Tissue Silk', price: '₹22,000', image: 'https://images.unsplash.com/photo-1585915233157-1906a2e4b486?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Classic Red Bandhani', price: '₹7,500', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 6, name: 'Black Mysore Silk', price: '₹9,999', image: 'https://images.unsplash.com/photo-1583391733958-6927d6d15b00?q=80&w=400&auto=format&fit=crop' },
];

const Collections = () => {
  const { addToCart } = useCart();

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ marginTop: '2rem' }}>All Collections</h1>
      
      <div className="product-grid">
        {allProducts.map((product) => (
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
  );
};

export default Collections;
