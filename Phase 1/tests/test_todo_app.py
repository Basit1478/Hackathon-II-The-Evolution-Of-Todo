#!/usr/bin/env python3
"""
Unit tests for the Todo CLI Application.
"""
import unittest
from todo_app import Task, TaskManager


class TestTask(unittest.TestCase):
    """Test the Task class."""

    def test_task_initialization(self):
        """Test Task initialization with default status."""
        task = Task(1, "Test task")
        self.assertEqual(task.id, 1)
        self.assertEqual(task.description, "Test task")
        self.assertEqual(task.status, "incomplete")

    def test_task_initialization_with_status(self):
        """Test Task initialization with custom status."""
        task = Task(1, "Test task", "complete")
        self.assertEqual(task.id, 1)
        self.assertEqual(task.description, "Test task")
        self.assertEqual(task.status, "complete")

    def test_task_str_representation(self):
        """Test Task string representation."""
        task = Task(1, "Test task", "incomplete")
        self.assertEqual(str(task), "1. [ ] Test task")

        task.status = "complete"
        self.assertEqual(str(task), "1. [x] Test task")


class TestTaskManager(unittest.TestCase):
    """Test the TaskManager class."""

    def setUp(self):
        """Set up a TaskManager instance for testing."""
        self.tm = TaskManager()

    def test_initial_state(self):
        """Test initial state of TaskManager."""
        self.assertEqual(len(self.tm.get_all_tasks()), 0)
        self.assertEqual(self.tm.next_id, 1)

    def test_add_task(self):
        """Test adding a task."""
        task = self.tm.add_task("Test task")
        self.assertEqual(task.id, 1)
        self.assertEqual(task.description, "Test task")
        self.assertEqual(task.status, "incomplete")
        self.assertEqual(len(self.tm.get_all_tasks()), 1)
        self.assertEqual(self.tm.next_id, 2)

    def test_add_task_empty_description(self):
        """Test adding a task with empty description raises ValueError."""
        with self.assertRaises(ValueError):
            self.tm.add_task("")

        with self.assertRaises(ValueError):
            self.tm.add_task("   ")

    def test_get_all_tasks(self):
        """Test getting all tasks."""
        self.tm.add_task("Task 1")
        self.tm.add_task("Task 2")

        tasks = self.tm.get_all_tasks()
        self.assertEqual(len(tasks), 2)
        self.assertEqual(tasks[0].description, "Task 1")
        self.assertEqual(tasks[1].description, "Task 2")

    def test_get_task_by_id(self):
        """Test getting a task by ID."""
        task1 = self.tm.add_task("Task 1")
        task2 = self.tm.add_task("Task 2")

        found_task = self.tm.get_task_by_id(1)
        self.assertEqual(found_task.id, 1)
        self.assertEqual(found_task.description, "Task 1")

        found_task = self.tm.get_task_by_id(2)
        self.assertEqual(found_task.id, 2)
        self.assertEqual(found_task.description, "Task 2")

        not_found_task = self.tm.get_task_by_id(99)
        self.assertIsNone(not_found_task)

    def test_update_task(self):
        """Test updating a task."""
        task = self.tm.add_task("Original task")

        result = self.tm.update_task(1, "Updated task")
        self.assertTrue(result)

        updated_task = self.tm.get_task_by_id(1)
        self.assertEqual(updated_task.description, "Updated task")

    def test_update_task_empty_description(self):
        """Test updating a task with empty description raises ValueError."""
        task = self.tm.add_task("Original task")

        with self.assertRaises(ValueError):
            self.tm.update_task(1, "")

        with self.assertRaises(ValueError):
            self.tm.update_task(1, "   ")

    def test_update_nonexistent_task(self):
        """Test updating a non-existent task returns False."""
        result = self.tm.update_task(99, "Updated task")
        self.assertFalse(result)

    def test_delete_task(self):
        """Test deleting a task."""
        task1 = self.tm.add_task("Task 1")
        task2 = self.tm.add_task("Task 2")

        self.assertEqual(len(self.tm.get_all_tasks()), 2)

        result = self.tm.delete_task(1)
        self.assertTrue(result)
        self.assertEqual(len(self.tm.get_all_tasks()), 1)

        remaining_task = self.tm.get_task_by_id(2)
        self.assertEqual(remaining_task.description, "Task 2")

        deleted_task = self.tm.get_task_by_id(1)
        self.assertIsNone(deleted_task)

    def test_delete_nonexistent_task(self):
        """Test deleting a non-existent task returns False."""
        result = self.tm.delete_task(99)
        self.assertFalse(result)

    def test_mark_task_complete(self):
        """Test marking a task as complete."""
        task = self.tm.add_task("Test task")
        self.assertEqual(task.status, "incomplete")

        result = self.tm.mark_task_complete(1)
        self.assertTrue(result)

        completed_task = self.tm.get_task_by_id(1)
        self.assertEqual(completed_task.status, "complete")

    def test_mark_task_incomplete(self):
        """Test marking a task as incomplete."""
        task = self.tm.add_task("Test task")
        self.tm.mark_task_complete(1)  # First mark as complete
        self.assertEqual(task.status, "complete")

        result = self.tm.mark_task_incomplete(1)
        self.assertTrue(result)

        incomplete_task = self.tm.get_task_by_id(1)
        self.assertEqual(incomplete_task.status, "incomplete")

    def test_mark_nonexistent_task(self):
        """Test marking a non-existent task returns False."""
        result = self.tm.mark_task_complete(99)
        self.assertFalse(result)

        result = self.tm.mark_task_incomplete(99)
        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()