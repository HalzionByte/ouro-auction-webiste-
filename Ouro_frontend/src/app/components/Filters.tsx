import { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import { Filter } from 'lucide-react';

interface FiltersProps {
  onFilterChange: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'endingSoon' | 'newest' | 'priceLow' | 'priceHigh';
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'endingSoon' | 'newest' | 'priceLow' | 'priceHigh'>('endingSoon');

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
    });
  }, [selectedCategory, minPrice, maxPrice, sortBy, onFilterChange]);

  return (
    <div className="bg-secondary rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Min Price</label>
          <input
            type="number"
            placeholder="$0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Max Price</label>
          <input
            type="number"
            placeholder="$10,000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="endingSoon">Ending Soon</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
