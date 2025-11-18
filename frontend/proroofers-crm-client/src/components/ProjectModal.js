import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api';
import '../styles/projectModal.css';

const ProjectModal = ({ isOpen, onClose, onProjectCreated, editingProject = null, customers = [] }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        projectName: '',
        description: '',
        status: 0, // Lead
        estimatedCost: '',
        finalCost: '',
        amountPaid: '',
        estimateDate: '',
        contractSignedDate: '',
        scheduledStartDate: '',
        completionDate: '',
        shingleType: '',
        shingleColor: '',
        hasMetalWork: false,
        metalWorkDescription: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!editingProject;

    const statusOptions = [
        { value: 0, label: 'Lead' },
        { value: 1, label: 'Estimate' },
        { value: 2, label: 'Contract Signed' },
        { value: 3, label: 'Scheduled' },
        { value: 4, label: 'In Progress' },
        { value: 5, label: 'Completed' },
        { value: 6, label: 'Cancelled' }
    ];

    const shingleTypes = [
        'Architectural',
        '3-Tab',
        'Luxury',
        'Premium'
    ];

    useEffect(() => {
        if (isOpen) {
            if (isEditing && editingProject) {
                // Populate form with existing project data
                setFormData({
                    customerId: editingProject.customerId || '',
                    projectName: editingProject.projectName || '',
                    description: editingProject.description || '',
                    status: editingProject.status || 0,
                    estimatedCost: editingProject.estimatedCost || '',
                    finalCost: editingProject.finalCost || '',
                    amountPaid: editingProject.amountPaid || '',
                    estimateDate: editingProject.estimateDate ? new Date(editingProject.estimateDate).toISOString().split('T')[0] : '',
                    contractSignedDate: editingProject.contractSignedDate ? new Date(editingProject.contractSignedDate).toISOString().split('T')[0] : '',
                    scheduledStartDate: editingProject.scheduledStartDate ? new Date(editingProject.scheduledStartDate).toISOString().split('T')[0] : '',
                    completionDate: editingProject.completionDate ? new Date(editingProject.completionDate).toISOString().split('T')[0] : '',
                    shingleType: editingProject.shingleType || '',
                    shingleColor: editingProject.shingleColor || '',
                    hasMetalWork: editingProject.hasMetalWork || false,
                    metalWorkDescription: editingProject.metalWorkDescription || '',
                    notes: editingProject.notes || ''
                });
            }
        }
    }, [isOpen, isEditing, editingProject]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepare data for API
            const projectData = {
                customerId: parseInt(formData.customerId),
                projectName: formData.projectName,
                description: formData.description,
                status: parseInt(formData.status),
                estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
                finalCost: formData.finalCost ? parseFloat(formData.finalCost) : null,
                amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : null,
                estimateDate: formData.estimateDate ? new Date(formData.estimateDate).toISOString() : null,
                contractSignedDate: formData.contractSignedDate ? new Date(formData.contractSignedDate).toISOString() : null,
                scheduledStartDate: formData.scheduledStartDate ? new Date(formData.scheduledStartDate).toISOString() : null,
                completionDate: formData.completionDate ? new Date(formData.completionDate).toISOString() : null,
                shingleType: formData.shingleType,
                shingleColor: formData.shingleColor,
                hasMetalWork: formData.hasMetalWork,
                metalWorkDescription: formData.metalWorkDescription,
                notes: formData.notes
            };

            if (isEditing) {
                await projectAPI.update(editingProject.id, { ...projectData, id: editingProject.id });
            } else {
                await projectAPI.create(projectData);
            }

            onProjectCreated();
            onClose();
            resetForm();
        } catch (error) {
            let errorMessage = isEditing ? 'Failed to update project' : 'Failed to create project';
            
            if (error.response?.data?.errors) {
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
            customerId: '',
            projectName: '',
            description: '',
            status: 0,
            estimatedCost: '',
            finalCost: '',
            amountPaid: '',
            estimateDate: '',
            contractSignedDate: '',
            scheduledStartDate: '',
            completionDate: '',
            shingleType: '',
            shingleColor: '',
            hasMetalWork: false,
            metalWorkDescription: '',
            notes: ''
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
            <div className="modal-content project-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="project-form">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h3 className="section-title">Project Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Customer *</label>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.firstName} {customer.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Project Name *</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="e.g., Smith Residence Roof Replacement"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Project details and scope"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="form-section">
                        <h3 className="section-title">Financial Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Estimated Cost *</label>
                                <input
                                    type="number"
                                    name="estimatedCost"
                                    value={formData.estimatedCost}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Final Cost</label>
                                <input
                                    type="number"
                                    name="finalCost"
                                    value={formData.finalCost}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Amount Paid</label>
                                <input
                                    type="number"
                                    name="amountPaid"
                                    value={formData.amountPaid}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Information */}
                    <div className="form-section">
                        <h3 className="section-title">Timeline</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Estimate Date</label>
                                <input
                                    type="date"
                                    name="estimateDate"
                                    value={formData.estimateDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Contract Signed</label>
                                <input
                                    type="date"
                                    name="contractSignedDate"
                                    value={formData.contractSignedDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Scheduled Start</label>
                                <input
                                    type="date"
                                    name="scheduledStartDate"
                                    value={formData.scheduledStartDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Completion Date</label>
                                <input
                                    type="date"
                                    name="completionDate"
                                    value={formData.completionDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Work Details */}
                    <div className="form-section">
                        <h3 className="section-title">Work Details</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Shingle Type</label>
                                <select
                                    name="shingleType"
                                    value={formData.shingleType}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select shingle type</option>
                                    {shingleTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Shingle Color</label>
                                <input
                                    type="text"
                                    name="shingleColor"
                                    value={formData.shingleColor}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g., Charcoal Black"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="hasMetalWork"
                                        checked={formData.hasMetalWork}
                                        onChange={handleChange}
                                        className="form-checkbox"
                                    />
                                    Has Metal Work
                                </label>
                            </div>
                        </div>

                        {formData.hasMetalWork && (
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label className="form-label">Metal Work Description</label>
                                    <textarea
                                        name="metalWorkDescription"
                                        value={formData.metalWorkDescription}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        placeholder="Describe the metal work required"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="form-section">
                        <h3 className="section-title">Additional Notes</h3>
                        
                        <div className="form-row">
                            <div className="form-group full-width">
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Any additional notes about this project"
                                    rows="3"
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
                                : (isEditing ? 'Update Project' : 'Add Project')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;