# Quickstart Guide: Phase I Todo CLI Application

**Feature**: 1-todo-cli-app
**Date**: 2025-12-29
**Spec**: [specs/1-todo-cli-app/spec.md](C:\Users\Windows 10 Pro\Desktop\Hackathon II\Phase 1\specs\1-todo-cli-app/spec.md)

## Getting Started

### Prerequisites

- Python 3.8 or higher
- No external dependencies required
- Cross-platform compatible (Windows, macOS, Linux)

### Running the Application

1. Save the application code as `todo_app.py`
2. Execute from command line:
   ```bash
   python todo_app.py
   ```

### First Run

1. Launch the application
2. You'll see the main menu with available options:
   ```
   Todo List Application
   =====================
   1. Add Task
   2. View Task List
   3. Update Task
   4. Delete Task
   5. Mark Task Complete
   6. Mark Task Incomplete
   7. Exit
   ```
3. Select an option by entering the corresponding number

## Basic Usage

### Adding a Task

1. Select option 1 (Add Task)
2. Enter your task description when prompted
3. The system will assign a unique ID and set status to "incomplete"
4. The task will appear in your list when you view tasks

### Viewing Tasks

1. Select option 2 (View Task List)
2. All tasks will be displayed with their ID, description, and status
3. Example output:
   ```
   Task List:
   1. [ ] Buy groceries
   2. [x] Complete project proposal
   3. [ ] Schedule meeting
   ```

### Updating a Task

1. Select option 3 (Update Task)
2. Enter the ID of the task you want to update
3. Enter the new description for the task
4. The task description will be updated while preserving ID and status

### Deleting a Task

1. Select option 4 (Delete Task)
2. Enter the ID of the task you want to delete
3. The task will be permanently removed from memory
4. You'll receive confirmation of the deletion

### Marking Tasks Complete/Incomplete

1. Select option 5 (Mark Task Complete) or 6 (Mark Task Incomplete)
2. Enter the ID of the task you want to update
3. The task status will change accordingly
4. The change will be reflected when viewing the task list

## Error Handling

### Common Error Messages

- "Invalid input. Please enter a valid number." - Occurs when non-numeric input is entered where a number is expected
- "Task with ID X does not exist." - Occurs when trying to operate on a non-existent task
- "Task description cannot be empty." - Occurs when trying to add or update a task with empty description
- "Please enter a number between 1 and 7." - Occurs when menu selection is out of range

### Recovery

- The application handles all errors gracefully and returns to the main menu
- No data is lost when errors occur
- Simply try the operation again with valid input

## Limitations

- Data is stored only in memory and will be lost when the application exits
- No file or database persistence
- Single-user application (no authentication)
- Maximum recommended task count: 1000 (for optimal performance)