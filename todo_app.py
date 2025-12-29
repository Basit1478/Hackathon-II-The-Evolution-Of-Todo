#!/usr/bin/env python3
"""
Todo List Application
=====================

A simple console-based todo list application that runs in memory only.
No data is persisted beyond the application runtime.
"""


class Task:
    """
    Represents a single task in the todo list.

    Attributes:
        id (int): Unique identifier for the task
        description (str): The task description
        status (str): The task status ('complete' or 'incomplete')
    """

    def __init__(self, task_id: int, description: str, status: str = "incomplete"):
        """
        Initialize a Task instance.

        Args:
            task_id (int): Unique identifier for the task
            description (str): The task description
            status (str): The task status, defaults to 'incomplete'
        """
        self.id = task_id
        self.description = description
        self.status = status  # 'complete' or 'incomplete'

    def __str__(self):
        """String representation of the task."""
        status_symbol = "x" if self.status == "complete" else " "
        return f"{self.id}. [{status_symbol}] {self.description}"

    def __repr__(self):
        """Developer representation of the task."""
        return f"Task(id={self.id}, description='{self.description}', status='{self.status}')"


class TaskManager:
    """
    Manages the collection of tasks in memory.

    Handles all task operations (CRUD), ID management, and data validation.
    """

    def __init__(self):
        """Initialize the TaskManager with an empty task list and ID counter."""
        self.tasks = []  # List of Task objects in memory
        self.next_id = 1  # Counter for generating unique IDs

    def add_task(self, description: str) -> Task:
        """
        Create and store a new task with a unique ID and 'incomplete' status.

        Args:
            description (str): The task description

        Returns:
            Task: The newly created Task object
        """
        if not description or not description.strip():
            raise ValueError("Task description cannot be empty")

        task = Task(self.next_id, description.strip(), "incomplete")
        self.tasks.append(task)
        self.next_id += 1
        return task

    def get_all_tasks(self) -> list:
        """
        Retrieve all tasks.

        Returns:
            list: List of all Task objects
        """
        return self.tasks

    def get_task_by_id(self, task_id: int) -> Task:
        """
        Find task by ID.

        Args:
            task_id (int): The ID of the task to find

        Returns:
            Task: The Task object if found, None otherwise
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(self, task_id: int, description: str) -> bool:
        """
        Update task description while preserving other attributes.

        Args:
            task_id (int): The ID of the task to update
            description (str): The new description

        Returns:
            bool: True if task was updated, False if task not found
        """
        if not description or not description.strip():
            raise ValueError("Task description cannot be empty")

        task = self.get_task_by_id(task_id)
        if task:
            task.description = description.strip()
            return True
        return False

    def delete_task(self, task_id: int) -> bool:
        """
        Remove task by ID.

        Args:
            task_id (int): The ID of the task to delete

        Returns:
            bool: True if task was deleted, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task:
            self.tasks.remove(task)
            return True
        return False

    def mark_task_complete(self, task_id: int) -> bool:
        """
        Mark task as complete.

        Args:
            task_id (int): The ID of the task to mark complete

        Returns:
            bool: True if task was marked complete, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task:
            task.status = "complete"
            return True
        return False

    def mark_task_incomplete(self, task_id: int) -> bool:
        """
        Mark task as incomplete.

        Args:
            task_id (int): The ID of the task to mark incomplete

        Returns:
            bool: True if task was marked incomplete, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task:
            task.status = "incomplete"
            return True
        return False


class TodoCLI:
    """
    Manages user interface, menu display, and input processing.

    Handles user input/output, menu display, and error messages.
    """

    def __init__(self):
        """Initialize the CLI interface with a TaskManager."""
        self.task_manager = TaskManager()

    def display_menu(self):
        """Display the main menu options."""
        print("\nTodo List Application")
        print("=====================")
        print("1. Add Task")
        print("2. View Task List")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Mark Task Complete")
        print("6. Mark Task Incomplete")
        print("7. Exit")
        print()

    def get_user_choice(self) -> int:
        """
        Get and validate user menu choice.

        Returns:
            int: The user's menu choice (1-7), or -1 if invalid input
        """
        try:
            choice = int(input("Enter your choice (1-7): "))
            if 1 <= choice <= 7:
                return choice
            else:
                print("Please enter a number between 1 and 7.")
                return -1
        except ValueError:
            print("Invalid input. Please enter a valid number.")
            return -1

    def add_task(self):
        """Handle adding a new task."""
        description = input("Enter task description: ").strip()
        if not description:
            print("Task description cannot be empty.")
            return

        try:
            task = self.task_manager.add_task(description)
            print(f"Task added successfully with ID {task.id}")
        except ValueError as e:
            print(f"Error: {e}")

    def view_tasks(self):
        """Handle viewing the task list."""
        tasks = self.task_manager.get_all_tasks()
        if not tasks:
            print("Task List: (empty)")
            return

        print("Task List:")
        for task in tasks:
            print(task)

    def update_task(self):
        """Handle updating a task."""
        try:
            task_id = int(input("Enter task ID to update: "))
        except ValueError:
            print("Invalid input. Please enter a valid task ID.")
            return

        task = self.task_manager.get_task_by_id(task_id)
        if not task:
            print(f"Task with ID {task_id} does not exist.")
            return

        new_description = input(f"Enter new description for task {task_id}: ").strip()
        if not new_description:
            print("Task description cannot be empty.")
            return

        try:
            success = self.task_manager.update_task(task_id, new_description)
            if success:
                print("Task updated successfully.")
            else:
                print(f"Task with ID {task_id} does not exist.")
        except ValueError as e:
            print(f"Error: {e}")

    def delete_task(self):
        """Handle deleting a task."""
        try:
            task_id = int(input("Enter task ID to delete: "))
        except ValueError:
            print("Invalid input. Please enter a valid task ID.")
            return

        success = self.task_manager.delete_task(task_id)
        if success:
            print(f"Task with ID {task_id} deleted successfully.")
        else:
            print(f"Task with ID {task_id} does not exist.")

    def mark_task_complete(self):
        """Handle marking a task as complete."""
        try:
            task_id = int(input("Enter task ID to mark complete: "))
        except ValueError:
            print("Invalid input. Please enter a valid task ID.")
            return

        success = self.task_manager.mark_task_complete(task_id)
        if success:
            print(f"Task with ID {task_id} marked as complete.")
        else:
            print(f"Task with ID {task_id} does not exist.")

    def mark_task_incomplete(self):
        """Handle marking a task as incomplete."""
        try:
            task_id = int(input("Enter task ID to mark incomplete: "))
        except ValueError:
            print("Invalid input. Please enter a valid task ID.")
            return

        success = self.task_manager.mark_task_incomplete(task_id)
        if success:
            print(f"Task with ID {task_id} marked as incomplete.")
        else:
            print(f"Task with ID {task_id} does not exist.")

    def run(self):
        """Run the main application loop."""
        while True:
            self.display_menu()
            choice = self.get_user_choice()

            if choice == -1:
                # Invalid input, continue loop
                continue

            if choice == 1:
                self.add_task()
            elif choice == 2:
                self.view_tasks()
            elif choice == 3:
                self.update_task()
            elif choice == 4:
                self.delete_task()
            elif choice == 5:
                self.mark_task_complete()
            elif choice == 6:
                self.mark_task_incomplete()
            elif choice == 7:
                print("Goodbye!")
                break

            # Pause to let user see the result before showing menu again
            input("\nPress Enter to continue...")


def main():
    """Orchestrate application startup and execution flow."""
    app = TodoCLI()
    app.run()


if __name__ == "__main__":
    main()