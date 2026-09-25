import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="category-card"
      aria-label={`Browse ${category.name}`}
    >
      <div className="category-card__thumb">
        <div className="category-card__icons">
          {category.itemsPreview && category.itemsPreview.length > 0 ? (
            category.itemsPreview.map((item, idx) => (
              <span key={idx} className="category-card__preview-item">{item}</span>
            ))
          ) : (
            <span className="category-card__preview-item">{category.icon}</span>
          )}
        </div>
      </div>
      <span className="category-card__name">{category.name}</span>
    </Link>
  );
}
