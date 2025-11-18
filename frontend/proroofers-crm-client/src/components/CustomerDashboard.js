import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import CustomerModal from './CustomerModal';

const CustomerDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setLoading(false);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowEditModal(true);
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer? This will also delete all associated projects and tasks.')) {
            try {
                await customerAPI.delete(customerId);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('Failed to delete customer.');
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading customers...</div>;
    }

    return (
        <div className="customer-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h2 className="dashboard-title">Customers</h2>
                    <span className="customer-count">({filteredCustomers.length})</span>
                </div>
                
                <div className="header-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <i className="fas fa-search search-icon"></i>
                    </div>
                    
                    <button 
                        className="btn-create-customer"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Add Customer
                    </button>
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="empty-state">
                    <h3>No customers found</h3>
                    <p>{searchTerm ? 'Try adjusting your search terms.' : 'Add your first customer to get started!'}</p>
                </div>
            ) : (
                <div className="customers-table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Projects</th>
                                <th>Added</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="customer-row">
                                    <td className="customer-name">
                                        <div className="name-primary">
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                        {customer.companyName && (
                                            <div className="company-name">{customer.companyName}</div>
                                        )}
                                    </td>
                                    <td className="contact-info">
                                        <div className="email">{customer.email}</div>
                                        <div className="phone">{customer.phone}</div>
                                    </td>
                                    <td className="address-info">
                                        <div className="address-line">
                                            {customer.billingStreet}, {customer.billingCity}
                                        </div>
                                        <div className="state-zip">
                                            {customer.billingState} {customer.billingZipCode}
                                        </div>
                                    </td>
                                    <td className="projects-count">
                                        <span className="count-badge">
                                            {customer.projects?.length || 0} Projects
                                        </span>
                                    </td>
                                    <td className="created-date">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="customer-actions">
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn btn-edit"
                                                onClick={() => handleEdit(customer)}
                                                title="Edit customer"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            
                                            <button
                                                className="action-btn btn-delete"
                                                onClick={() => handleDelete(customer.id)}
                                                title="Delete customer"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Customer Modal */}
            <CustomerModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCustomerCreated={fetchCustomers}
            />

            {/* Edit Customer Modal */}
            <CustomerModal 
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                }}
                onCustomerCreated={fetchCustomers}
                editingCustomer={editingCustomer}
            />
        </div>
    );
};

export default CustomerDashboard;