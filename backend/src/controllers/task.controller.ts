import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Stage } from '@prisma/client';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, stage } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    let taskStage: Stage = Stage.TODO;
    if (stage && Object.values(Stage).includes(stage)) {
      taskStage = stage as Stage;
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        stage: taskStage,
        userId: req.user.id
      }
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, description, stage } = req.body;

    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }

    const updateData: any = {};
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Task title cannot be empty' });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (stage !== undefined) {
      if (!Object.values(Stage).includes(stage)) {
        return res.status(400).json({ error: 'Invalid task stage' });
      }
      updateData.stage = stage as Stage;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this task' });
    }

    await prisma.task.delete({
      where: { id }
    });

    return res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
};
