import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import '../styles/customerModal.css';

const CustomerModal = ({ isOpen, onClose, onCustomerCreated, editingCustomer = null }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!editingCustomer;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && editingCustomer) {
                // Populate form with existing customer data
                setFormData({
                    firstName: editingCustomer.firstName || '',
                    lastName: editingCustomer.lastName || '',
                    email: editingCustomer.email || '',
                    phone: editingCustomer.phone || '',
                    address: editingCustomer.billingStreet || '',
                    city: editingCustomer.billingCity || '',
                    state: editingCustomer.billingState || '',
                    zipCode: editingCustomer.billingZipCode || ''
                });
            }
        }
    }, [isOpen, isEditing, editingCustomer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Map form data to match C# Customer model
            const customerData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                // Use the same address for both billing and property
                billingStreet: formData.address,
                billingCity: formData.city,
                billingState: formData.state,
                billingZipCode: formData.zipCode,
                propertyStreet: formData.address,
                propertyCity: formData.city,
                propertyState: formData.state,
                propertyZipCode: formData.zipCode
            };

            if (isEditing) {
                await customerAPI.update(editingCustomer.id, { ...customerData, id: editingCustomer.id });
            } else {
                await customerAPI.create(customerData);
            }

            onCustomerCreated();
            onClose();
            resetForm();
        } catch (error) {
            let errorMessage = isEditing ? 'Failed to update customer' : 'Failed to create customer';
            
            if (error.response?.data?.errors) {
                // Show specific validation errors
                const allErrors = Object.entries(error.response.data.errors).map(([field, messages]) => 
                    `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
                );
                errorMessage = allErrors.join('; ');
            } else if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClose = () => {
        onClose();
        if (!isEditing) {
            resetForm();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="customer-form">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="section-title">Personal Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter first name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter email address"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="form-section">
                        <h3 className="section-title">Address Information</h3>
                        <p className="section-subtitle">This address will be used for both billing and property location.</p>
                        
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Street Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter street address"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter city"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter state"
                                    maxLength="2"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">ZIP Code *</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Enter ZIP code"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading 
                                ? (isEditing ? 'Updating...' : 'Creating...') 
                                : (isEditing ? 'Update Customer' : 'Add Customer')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;