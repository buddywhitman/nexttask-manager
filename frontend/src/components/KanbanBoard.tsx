import React, { useState } from 'react';
import { type Task, type Stage } from '../api';
import { TaskCard } from './TaskCard';
import { ClipboardList } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, newStage: Stage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onMoveTask 
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<Stage | null>(null);

  const stages: { key: Stage; label: string; class: string }[] = [
    { key: 'TODO', label: 'Todo', class: 'todo' },
    { key: 'IN_PROGRESS', label: 'In Progress', class: 'inprogress' },
    { key: 'DONE', label: 'Done', class: 'done' }
  ];

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverColumn(stage);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetStage);
    }
  };

  const getStageTasks = (stageKey: Stage) => {
    return tasks.filter(task => task.stage === stageKey);
  };

  return (
    <div className="board-container">
      {stages.map((stage) => {
        const stageTasks = getStageTasks(stage.key);
        const isDragOver = dragOverColumn === stage.key;

        return (
          <div 
            key={stage.key} 
            className={`board-lane ${stage.class} ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <div className="lane-header">
              <div className="lane-title-group">
                <span className="lane-dot"></span>
                <h3 className="lane-title">{stage.label}</h3>
              </div>
              <span className="lane-count">{stageTasks.length}</span>
            </div>

            <div className="lane-cards">
              {stageTasks.length > 0 ? (
                stageTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={onEditTask} 
                    onDelete={onDeleteTask}
                    onMoveStage={onMoveTask}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <ClipboardList size={28} className="empty-state-icon" />
                  <p>No tasks in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
