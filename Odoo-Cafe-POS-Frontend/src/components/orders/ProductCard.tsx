import { motion } from 'framer-motion';
import type { Product } from '../../api/products.api';

interface ProductCardProps {
    product: Product & { icon?: string };
    onClick: (product: Product) => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
    return (
        <motion.div
            className="product-card"
            onClick={() => onClick(product)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className="product-card__image">
                {product.image ? (
                    <img src={product.image} alt={product.name} />
                ) : (
                    <span className="product-card__image-placeholder">
                        {(product as Product & { icon?: string }).icon || '🍽️'}
                    </span>
                )}
            </div>

            <span className="product-card__name">{product.name}</span>
            <span className="product-card__price">₹{product.price}</span>
        </motion.div>
    );
};

export default ProductCard;
