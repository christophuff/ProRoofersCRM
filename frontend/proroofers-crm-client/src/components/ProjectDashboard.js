import React, { useState, useEffect } from 'react';
import { projectAPI, customerAPI } from '../services/api';
import ProjectModal from './ProjectModal';

const ProjectDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    useEffect(() => {
        loadProjects();
        loadCustomers();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectAPI.getAll();
            setProjects(response.data);
        } catch (error) {
            setError('Failed to load projects');
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data);
        } catch (error) {
            console.error('Error loading customers:', error);
            setError('Failed to load customers');
        }
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setShowModal(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectAPI.delete(projectId);
                loadProjects(); // Reload the list
            } catch (error) {
                setError('Failed to delete project');
                console.error('Error deleting project:', error);
            }
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingProject(null);
        setError('');
    };

    const handleProjectCreated = () => {
        loadProjects(); // Reload the list after creating/updating
    };

    const getCustomerName = (project) => {
        // Use the embedded customer data from the project
        if (project.customer) {
            return `${project.customer.firstName} ${project.customer.lastName}`;
        }
        return 'Unknown Customer';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            0: 'status-pending',     // Lead
            1: 'status-pending',     // Estimate  
            2: 'status-progress',    // ContractSigned
            3: 'status-progress',    // Scheduled
            4: 'status-progress',    // InProgress
            5: 'status-completed',   // Completed
            6: 'status-cancelled'    // Cancelled
        };
        return statusMap[status] || 'status-pending';
    };

    const getStatusText = (status) => {
        const statusNames = ['Lead', 'Estimate', 'Contract Signed', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
        return statusNames[status] || 'Unknown';
    };

    if (loading) {
        return <div className="loading">Loading projects...</div>;
    }

    return (
        <div className="task-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h2 className="dashboard-title">Projects</h2>
                    <span className="task-count">({projects.length})</span>
                </div>
                <button className="btn-create-task" onClick={handleAddProject}>
                    Add New Project
                </button>
            </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

            <div className="projects-container">
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <h3>No projects found</h3>
                        <p>Create your first project to get started.</p>
                        <button className="btn-create-task" onClick={handleAddProject}>
                            Create Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="tasks-table-container">
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Estimated Cost</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id} className="task-row">
                                        <td className="task-info">
                                            <div className="task-title">{project.projectName}</div>
                                            {project.description && (
                                                <div className="task-description">{project.description}</div>
                                            )}
                                        </td>
                                        <td className="customer-info">
                                            {getCustomerName(project)}
                                        </td>
                                        <td className="project-status">
                                            <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                                                {getStatusText(project.status)}
                                            </span>
                                        </td>
                                        <td className="project-cost" style={{textAlign: 'left', fontWeight: '600', color: '#28a745'}}>
                                            {project.estimatedCost 
                                                ? `$${project.estimatedCost.toLocaleString()}` 
                                                : 'Not estimated'
                                            }
                                        </td>
                                        <td className="due-date">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="task-actions">
                                            <button
                                                className="action-btn btn-start"
                                                onClick={() => handleEditProject(project)}
                                                title="Edit project"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="action-btn btn-complete"
                                                onClick={() => handleDeleteProject(project.id)}
                                                title="Delete project"
                                                style={{background: '#dc3545', marginLeft: '8px'}}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <ProjectModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onProjectCreated={handleProjectCreated}
                    editingProject={editingProject}
                    customers={customers}
                />
            )}
        </div>
    );
};

export default ProjectDashboard;