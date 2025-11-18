import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI, customerAPI, projectAPI } from '../services/api';
import { useAuth } from '../AuthContext';
import SearchableSelect from './SearchableSelect';
import '../styles/taskModal.css';

const TaskModal = ({ isOpen, onClose, onTaskCreated, editingTask = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 1,
        assignedToId: '',
        customerId: '',
        projectId: '',
        dueDate: ''
    });
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const isEditing = !!editingTask;

    useEffect(() => {
        if (isOpen) {
            fetchDropdownData();
            
            if (isEditing && editingTask) {
                // Populate form with existing task data
                setFormData({
                    title: editingTask.title,
                    description: editingTask.description || '',
                    priority: editingTask.priority,
                    assignedToId: editingTask.assignedToId,
                    customerId: editingTask.customerId || '',
                    projectId: editingTask.projectId || '',
                    dueDate: editingTask.dueDate ? 
                        new Date(editingTask.dueDate).toISOString().slice(0, 16) : ''
                });
            } else {
                // Pre-select current user for new tasks
                setFormData(prev => ({
                    ...prev,
                    assignedToId: user.id
                }));
            }
        }
    }, [isOpen, user.id, isEditing, editingTask]);

    useEffect(() => {
        if (formData.customerId) {
            // Filter projects to only show ones for selected customer
            const customerProjects = projects.filter(
                project => project.customerId === formData.customerId
            );
            setFilteredProjects(customerProjects);
        } else {
            setFilteredProjects(projects);
        }
    }, [formData.customerId, projects]);

    const fetchDropdownData = async () => {
        try {
            console.log('Fetching dropdown data...');
            
            const [usersRes, customersRes, projectsRes] = await Promise.allSettled([
                userAPI.getAll(),
                customerAPI.getAll(),
                projectAPI.getAll()
            ]);

            if (usersRes.status === 'fulfilled') {
                console.log('Users loaded:', usersRes.value.data);
                setUsers(usersRes.value.data);
            } else {
                console.error('Users failed:', usersRes.reason);
            }

            if (customersRes.status === 'fulfilled') {
                console.log('Customers loaded:', customersRes.value.data);
                // Add fullName property for the searchable select
                const customersWithFullName = customersRes.value.data.map(customer => ({
                    ...customer,
                    fullName: `${customer.firstName} ${customer.lastName}`
                }));
                setCustomers(customersWithFullName);
            } else {
                console.error('Customers failed:', customersRes.reason);
            }

            if (projectsRes.status === 'fulfilled') {
                console.log('Projects loaded:', projectsRes.value.data);
                setProjects(projectsRes.value.data);
                setFilteredProjects(projectsRes.value.data);
            } else {
                console.error('Projects failed:', projectsRes.reason);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const taskData = {
                ...formData,
                customerId: formData.customerId || null,
                projectId: formData.projectId || null,
                dueDate: formData.dueDate || null
            };

            if (isEditing) {
                // Include the ID when updating
                await taskAPI.update(editingTask.id, { ...taskData, id: editingTask.id });
            } else {
                await taskAPI.create(taskData);
            }

            onTaskCreated();
            onClose();
            resetForm();
        } catch (error) {
            console.log('Task creation/update error:', error.response?.data);
            
            let errorMessage = isEditing ? 'Failed to update task' : 'Failed to create task';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.title) {
                    errorMessage = errorData.title;
                } else if (errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat();
                    errorMessage = validationErrors.join(', ');
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 1,
            assignedToId: '',
            customerId: '',
            projectId: '',
            dueDate: ''
        });
        setError('');
    };

    const handleChange = (e) => {
    const { name, value } = e.target;    
    // Convert priority to integer
    const processedValue = name === 'priority' ? parseInt(value) : value;
    
    setFormData(prev => ({
        ...prev,
        [name]: processedValue
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Task Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter task title"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Task description"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Assign To *</label>
                            <select
                                name="assignedToId"
                                value={formData.assignedToId}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Select user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="0">Low</option>
                                <option value="1">Medium</option>
                                <option value="2">High</option>
                                <option value="3">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Customer (Optional)</label>
                            <SearchableSelect
                                options={customers}
                                value={formData.customerId}
                                onChange={handleChange}
                                placeholder="Search customers..."
                                displayKey="fullName"
                                valueKey="id"
                                name="customerId"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project (Optional)</label>
                            <SearchableSelect
                                options={filteredProjects}
                                value={formData.projectId}
                                onChange={handleChange}
                                placeholder="Search projects..."
                                displayKey="projectName"
                                valueKey="id"
                                name="projectId"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Due Date (Optional)</label>
                            <input
                                type="datetime-local"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="form-input"
                            />
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
                                : (isEditing ? 'Update Task' : 'Create Task')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;