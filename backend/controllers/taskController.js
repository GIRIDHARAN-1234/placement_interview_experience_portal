const StudyTask = require('../models/StudyTask');

// @desc    Get all study tasks for logged-in student
// @route   GET /api/study-tasks
// @access  Private (Student)
const getTasks = async (req, res, next) => {
  try {
    const tasks = await StudyTask.find({ userId: req.user._id }).sort({
      status: 1, // pending first
      dueDate: 1,
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new study task
// @route   POST /api/study-tasks
// @access  Private (Student)
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const task = await StudyTask.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Study task created successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status or details
// @route   PUT /api/study-tasks/:id
// @access  Private (Student)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const task = await StudyTask.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Study task not found.' });
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate) task.dueDate = new Date(dueDate);

    if (status) {
      task.status = status;
      task.completedAt = status === 'completed' ? new Date() : null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Study task updated successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a study task
// @route   DELETE /api/study-tasks/:id
// @access  Private (Student)
const deleteTask = async (req, res, next) => {
  try {
    const task = await StudyTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Study task not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Study task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
