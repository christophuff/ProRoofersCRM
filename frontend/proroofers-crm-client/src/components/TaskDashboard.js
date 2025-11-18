import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from '../AuthContext';
import TaskModal from './TaskModal';

const TaskDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await taskAPI.getAll();
            setTasks(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const updatedTask = { 
                ...task, 
                status: newStatus,
                completedAt: newStatus === 2 ? new Date().toISOString() : task.completedAt
            };

            await taskAPI.update(taskId, updatedTask);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskAPI.delete(taskId);
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. You may not have permission.');
            }
        }
    };

    const canEditTask = (task) => {
        return user?.role === 1 || task.assignedToId === user?.id;
    };

    const canDeleteTask = (task) => {
        return user?.role === 1 || task.assignedToId === user?.id;
    };

    // Helper functions
    const getStatusText = (status) => {
        const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
        return statuses[status] || 'Unknown';
    };

    const getPriorityText = (priority) => {
        const priorities = ['Low', 'Medium', 'High', 'Urgent'];
        return priorities[priority] || 'Unknown';
    };

    const getStatusClass = (status) => {
        const classes = ['status-pending', 'status-progress', 'status-completed', 'status-cancelled'];
        return classes[status] || 'status-pending';
    };

    const getPriorityClass = (priority) => {
        const classes = ['priority-low', 'priority-medium', 'priority-high', 'priority-urgent'];
        return classes[priority] || 'priority-medium';
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    return (
        <div className="task-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h2 className="dashboard-title">Tasks</h2>
                    <span className="task-count">({tasks.length})</span>
                </div>
                
                <button 
                    className="btn-create-task"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started!</p>
                </div>
            ) : (
                <div className="tasks-table-container">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Priority</th>
                                <th>Assigned To</th>
                                <th>Customer</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className={`task-row ${getStatusClass(task.status)}`}>
                                    <td className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        {task.description && (
                                            <div className="task-description">{task.description}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                                            {getPriorityText(task.priority)}
                                        </span>
                                    </td>
                                    <td className="assigned-to">
                                        {task.assignedTo?.username || 'Unassigned'}
                                    </td>
                                    <td className="customer-info">
                                        {task.customer ? 
                                            `${task.customer.firstName} ${task.customer.lastName}` : 
                                            'No Customer'
                                        }
                                    </td>
                                    <td className="due-date">
                                        {task.dueDate ? 
                                            new Date(task.dueDate).toLocaleDateString() : 
                                            'No due date'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(task.status)}`}>
                                            {getStatusText(task.status)}
                                        </span>
                                    </td>
                                    <td className="task-actions">
                                        <div className="action-buttons">
                                            {/* Status Dropdown */}
                                            <select
                                                className="status-select"
                                                value={task.status}
                                                onChange={(e) => updateTaskStatus(task.id, parseInt(e.target.value))}
                                                disabled={!canEditTask(task)}
                                            >
                                                <option value="0">Pending</option>
                                                <option value="1">In Progress</option>
                                                <option value="2">Completed</option>
                                                <option value="3">Cancelled</option>
                                            </select>
                                            
                                            {canEditTask(task) && (
                                                <button
                                                    className="action-btn btn-edit"
                                                    onClick={() => handleEdit(task)}
                                                    title="Edit task"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            )}
                                            
                                            {canDeleteTask(task) && (
                                                <button
                                                    className="action-btn btn-delete"
                                                    onClick={() => handleDelete(task.id)}
                                                    title="Delete task"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Task Modal */}
            <TaskModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={fetchTasks}
            />

            {/* Edit Task Modal */}
            <TaskModal 
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                }}
                onTaskCreated={fetchTasks}
                editingTask={editingTask}
            />
        </div>
    );
};

export default TaskDashboard;