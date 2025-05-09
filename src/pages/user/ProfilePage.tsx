import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Home, CreditCard, Save, AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    setSuccessMessage('Profile updated successfully!');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="section">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-secondary-300">Manage your account details and preferences</p>
      </div>
      
      {successMessage && (
        <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-md mb-6 flex items-start animate-slide-up">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-secondary-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input w-full"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
            
            <div className="bg-secondary-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-secondary-300 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-secondary-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-secondary-300 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-secondary-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-secondary-300 mb-2">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-secondary-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="•••• •••• •••• ••••"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-secondary-300 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="MM/YY"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardCvv" className="block text-sm font-medium text-secondary-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cardCvv"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
            <div className="mb-6 text-center">
              <div className="h-24 w-24 rounded-full bg-primary-700 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{user?.name}</h3>
              <p className="text-secondary-300">{user?.email}</p>
              <div className="mt-2 px-3 py-1 bg-primary-900 text-primary-200 text-xs rounded-full inline-block">
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </div>
            </div>
            
            <div className="border-t border-secondary-700 pt-4">
              <h4 className="font-medium text-white mb-3">Account Summary</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-secondary-300">Member Since</span>
                  <span className="text-white">June 2023</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-secondary-300">Bookings</span>
                  <span className="text-white">12</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-secondary-300">Loyalty Points</span>
                  <span className="text-primary-500 font-medium">350 pts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;