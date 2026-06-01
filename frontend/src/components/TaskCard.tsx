import React from 'react';
import { type Task, type Stage } from '../api';
import { Trash2, Edit, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveStage: (id: string, newStage: Stage) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onMoveStage }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="task-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <div className="task-actions">
          <button 
            className="btn-task-action" 
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            <Edit size={14} />
          </button>
          <button 
            className="btn-task-action delete" 
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className="task-date">
          <Calendar size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {formatDate(task.updatedAt)}
        </span>
        
        <div className="stage-move-menu">
          {task.stage !== 'TODO' && (
            <button 
              className="btn-move" 
              onClick={() => {
                const prev = task.stage === 'DONE' ? 'IN_PROGRESS' : 'TODO';
                onMoveStage(task.id, prev);
              }}
              title="Move back"
            >
              ←
            </button>
          )}
          {task.stage !== 'DONE' && (
            <button 
              className="btn-move" 
              onClick={() => {
                const next = task.stage === 'TODO' ? 'IN_PROGRESS' : 'DONE';
                onMoveStage(task.id, next);
              }}
              title="Move forward"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
