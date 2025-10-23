import { deleteMenuItem, getAllMenuItems } from '@/lib/api';
import type { MenuItem } from '@/types';
import { Edit, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);
  
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMenuItems(200);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };
  
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await deleteMenuItem(productId);
      setProducts(products.filter(p => p.$id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
          <p className="text-gray-500 mt-2">Manage your menu items and inventory</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all">
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-gray-800">4.5</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {products.length === 0 ? 'No products found' : 'No products match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.$id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                    🍔
                  </div>
                )}
                {product.rating && (
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                
                {/* Nutrition Info */}
                {(product.calories || product.protein) && (
                  <div className="flex gap-4 mb-3 text-sm text-gray-600">
                    {product.calories && (
                      <div>
                        <span className="font-medium">{product.calories}</span> cal
                      </div>
                    )}
                    {product.protein && (
                      <div>
                        <span className="font-medium">{product.protein}g</span> protein
                      </div>
                    )}
                  </div>
                )}
                
                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-2xl font-bold text-primary">
                    {product.price?.toLocaleString('vi-VN')}₫
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Edit product: ' + product.name)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.$id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
