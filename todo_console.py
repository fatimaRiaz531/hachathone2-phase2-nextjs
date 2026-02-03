#!/usr/bin/env python3
"""
Phase I: Console-based Todo Application with in-memory storage
"""

import json
import datetime
from typing import Dict, List, Optional


class Task:
    def __init__(self, task_id: str, title: str, description: str = "",
                 completed: bool = False, created_at: str = None):
        self.id = task_id
        self.title = title
        self.description = description
        self.completed = completed
        self.created_at = created_at or datetime.datetime.now().isoformat()
        self.updated_at = datetime.datetime.now().isoformat()

    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict):
        task = cls(
            task_id=data['id'],
            title=data['title'],
            description=data.get('description', ''),
            completed=data.get('completed', False)
        )
        task.created_at = data.get('created_at', datetime.datetime.now().isoformat())
        task.updated_at = data.get('updated_at', datetime.datetime.now().isoformat())
        return task


class TodoConsoleApp:
    def __init__(self):
        self.tasks: List[Task] = []
        self.next_id = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task to the list"""
        task_id = str(self.next_id)
        self.next_id += 1
        task = Task(task_id, title, description)
        self.tasks.append(task)
        print(f"✓ Added task: {task.title}")
        return task

    def list_tasks(self):
        """List all tasks"""
        if not self.tasks:
            print("No tasks found.")
            return

        print("\n--- Tasks ---")
        for task in self.tasks:
            status = "✓" if task.completed else "○"
            print(f"{status} [{task.id}] {task.title}")
            if task.description:
                print(f"    Description: {task.description}")
            print(f"    Created: {task.created_at}")
            print()

    def mark_task_completed(self, task_id: str) -> bool:
        """Mark a task as completed"""
        for task in self.tasks:
            if task.id == task_id:
                task.completed = True
                task.updated_at = datetime.datetime.now().isoformat()
                print(f"✓ Task '{task.title}' marked as completed")
                return True
        print(f"✗ Task with ID {task_id} not found")
        return False

    def delete_task(self, task_id: str) -> bool:
        """Delete a task"""
        for i, task in enumerate(self.tasks):
            if task.id == task_id:
                removed_task = self.tasks.pop(i)
                print(f"✓ Task '{removed_task.title}' deleted")
                return True
        print(f"✗ Task with ID {task_id} not found")
        return False

    def edit_task(self, task_id: str, title: str = None, description: str = None) -> bool:
        """Edit a task's title or description"""
        for task in self.tasks:
            if task.id == task_id:
                if title is not None:
                    task.title = title
                if description is not None:
                    task.description = description
                task.updated_at = datetime.datetime.now().isoformat()
                print(f"✓ Task '{task.id}' updated")
                return True
        print(f"✗ Task with ID {task_id} not found")
        return False

    def save_to_file(self, filename: str):
        """Save tasks to a JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump([task.to_dict() for task in self.tasks], f, indent=2)
            print(f"✓ Tasks saved to {filename}")
        except Exception as e:
            print(f"✗ Error saving tasks: {e}")

    def load_from_file(self, filename: str):
        """Load tasks from a JSON file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            self.tasks = [Task.from_dict(task_data) for task_data in data]
            # Update next_id based on highest existing ID
            if self.tasks:
                ids = [int(task.id) for task in self.tasks if task.id.isdigit()]
                if ids:
                    self.next_id = max(ids) + 1
            print(f"✓ Tasks loaded from {filename}")
        except FileNotFoundError:
            print(f"✗ File {filename} not found")
        except Exception as e:
            print(f"✗ Error loading tasks: {e}")

    def run(self):
        """Run the console application"""
        print("Welcome to the Todo Console App!")
        print("Commands:")
        print("  add <title> [description] - Add a new task")
        print("  list - List all tasks")
        print("  complete <id> - Mark task as completed")
        print("  delete <id> - Delete a task")
        print("  edit <id> <title> [description] - Edit a task")
        print("  save <filename> - Save tasks to file")
        print("  load <filename> - Load tasks from file")
        print("  quit - Exit the application")
        print()

        while True:
            try:
                command = input("Enter command: ").strip().split(' ', 2)
                if not command or not command[0]:
                    continue

                action = command[0].lower()

                if action == 'quit':
                    print("Goodbye!")
                    break
                elif action == 'add':
                    if len(command) < 2:
                        print("✗ Usage: add <title> [description]")
                        continue
                    title = command[1]
                    description = command[2] if len(command) > 2 else ""
                    self.add_task(title, description)
                elif action == 'list':
                    self.list_tasks()
                elif action == 'complete':
                    if len(command) < 2:
                        print("✗ Usage: complete <id>")
                        continue
                    self.mark_task_completed(command[1])
                elif action == 'delete':
                    if len(command) < 2:
                        print("✗ Usage: delete <id>")
                        continue
                    self.delete_task(command[1])
                elif action == 'edit':
                    if len(command) < 3:
                        print("✗ Usage: edit <id> <title> [description]")
                        continue
                    task_id = command[1]
                    parts = command[2].split(' ', 1)
                    title = parts[0]
                    description = parts[1] if len(parts) > 1 else ""
                    self.edit_task(task_id, title, description)
                elif action == 'save':
                    if len(command) < 2:
                        print("✗ Usage: save <filename>")
                        continue
                    self.save_to_file(command[1])
                elif action == 'load':
                    if len(command) < 2:
                        print("✗ Usage: load <filename>")
                        continue
                    self.load_from_file(command[1])
                else:
                    print(f"✗ Unknown command: {action}")
                    print("Available commands: add, list, complete, delete, edit, save, load, quit")

            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"✗ Error: {e}")


def main():
    app = TodoConsoleApp()
    app.run()


if __name__ == "__main__":
    main()