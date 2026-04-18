'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface ShippingData {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void;
  defaultValues?: Partial<ShippingData>;
}

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

export function ShippingForm({ onSubmit, defaultValues }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    email: defaultValues?.email || '',
    fullName: defaultValues?.fullName || '',
    phone: defaultValues?.phone || '',
    addressLine1: defaultValues?.addressLine1 || '',
    addressLine2: defaultValues?.addressLine2 || '',
    city: defaultValues?.city || '',
    district: defaultValues?.district || '',
    postalCode: defaultValues?.postalCode || '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingData, string>> = {};
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email required';
    }
    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name required';
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Valid phone required';
    }
    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address required';
    }
    if (!formData.city) {
      newErrors.city = 'City required';
    }
    if (!formData.district) {
      newErrors.district = 'District required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof ShippingData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="+94 77 123 4567"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 *
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="123 Main Street"
        />
        {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Apartment, suite, etc. (optional)"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Colombo"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="00300"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District *
        </label>
        <select
          value={formData.district}
          onChange={(e) => updateField('district', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
      </div>
      
      <Button type="submit" className="w-full mt-6">
        Continue to Shipping Method
      </Button>
    </form>
  );
}