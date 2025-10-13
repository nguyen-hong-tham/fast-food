import { getAllUsers } from '@/lib/api';
import type { User } from '@/types';
import { Calendar, Mail, Phone, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadCustomers();
  }, []);
  
  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);
  
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers(200);
      const customersOnly = data.filter(u => u.role !== 'admin');
      setCustomers(customersOnly);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>
          <p className="text-gray-500 mt-2">View and manage customer accounts</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-800">{customers.length}</p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {customers.length === 0 ? 'No customers found' : 'No customers match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div
              key={customer.$id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {customer.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    customer.name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{customer.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1 capitalize">
                    {customer.role || 'customer'}
                  </span>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 break-all">{customer.email || 'N/A'}</p>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
