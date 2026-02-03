"""
Todo App - Phase I
A simple command-line todo application for managing tasks in memory.
"""

from typing import TypeAlias

# Type aliases
Task: TypeAlias = dict[str, int | str | bool]
TaskList: TypeAlias = list[Task]


def get_next_id(tasks: TaskList) -> int:
    """
    Generate the next available task ID.

    Args:
        tasks: The current list of task dictionaries

    Returns:
        1 if tasks is empty, otherwise max(task['id']) + 1

    Side Effects:
        None (pure function, read-only)

    Examples:
        >>> get_next_id([])
        1

        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> get_next_id(tasks)
        2

        >>> tasks = [{'id': 1, 'title': 'A', 'description': '', 'completed': False},
        ...          {'id': 5, 'title': 'B', 'description': '', 'completed': False}]
        >>> get_next_id(tasks)
        6
    """
    if not tasks:
        return 1
    return max(task['id'] for task in tasks) + 1


def validate_title(title: str) -> bool:
    """
    Validate a task title meets requirements.

    Args:
        title: The title string to validate

    Returns:
        True if title is valid (non-empty, 1-200 chars), False otherwise

    Side Effects:
        None (pure function)

    Examples:
        >>> validate_title("Valid title")
        True

        >>> validate_title("")
        False

        >>> validate_title("   ")
        False

        >>> validate_title("x" * 200)
        True

        >>> validate_title("x" * 201)
        False
    """
    stripped = title.strip()
    return len(stripped) > 0 and len(title) <= 200


def add_task(tasks: TaskList, title: str, description: str = "") -> int:
    """
    Add a new task to the tasks list.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        title: Task title, required, 1-200 characters
        description: Optional task description, defaults to empty string

    Returns:
        The ID of the newly created task

    Raises:
        ValueError: If title is empty or exceeds 200 characters

    Side Effects:
        Appends new task dict to tasks list

    Examples:
        >>> tasks = []
        >>> task_id = add_task(tasks, "Buy milk", "From the grocery store")
        >>> task_id
        1
        >>> len(tasks)
        1
        >>> tasks[0]['title']
        'Buy milk'
    """
    # Validate title
    if not validate_title(title):
        if not title.strip():
            raise ValueError("Title is required.")
        raise ValueError("Title must be 1-200 characters.")

    # Generate ID and create task
    task_id = get_next_id(tasks)
    task = {
        'id': task_id,
        'title': title,
        'description': description,
        'completed': False
    }
    tasks.append(task)
    return task_id


def get_task_by_id(tasks: TaskList, task_id: int) -> Task | None:
    """
    Find a task by its ID.

    Args:
        tasks: The current list of task dictionaries
        task_id: The task ID to search for

    Returns:
        Task dict if found, None if not found

    Side Effects:
        None (pure function, read-only)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> task = get_task_by_id(tasks, 1)
        >>> task['title']
        'Test'

        >>> get_task_by_id(tasks, 999)
        None
    """
    for task in tasks:
        if task['id'] == task_id:
            return task
    return None


def truncate_text(text: str, max_length: int) -> str:
    """
    Truncate text to max_length, adding '...' if truncated.

    Args:
        text: The string to truncate
        max_length: Maximum length including "..." suffix

    Returns:
        Original text if len <= max_length, otherwise text[:max_length-3] + "..."

    Side Effects:
        None (pure function)

    Examples:
        >>> truncate_text("Short", 30)
        'Short'

        >>> truncate_text("This is a very long description that exceeds", 30)
        'This is a very long descri...'

        >>> truncate_text("Exactly30Characters1234567890", 30)
        'Exactly30Characters1234567890'
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."


def print_task_table(tasks: TaskList) -> None:
    """
    Display all tasks in a formatted table.

    Args:
        tasks: The current list of task dictionaries

    Returns:
        None

    Side Effects:
        Prints to stdout

    Examples:
        >>> print_task_table([])
        No tasks yet.
    """
    if not tasks:
        print("No tasks yet.")
        return

    # Print header
    print("ID | Title                  | Description             | Status")
    print("---+------------------------+-------------------------+-----------")

    # Print each task
    for task in tasks:
        task_id = str(task['id']).rjust(2)
        title = task['title'][:24].ljust(24)
        description = truncate_text(task['description'], 27).ljust(27)
        status = "Completed" if task['completed'] else "Pending"
        print(f"{task_id} | {title} | {description} | {status}")


def list_tasks(tasks: TaskList) -> None:
    """
    List all tasks (wrapper for print_task_table).

    Args:
        tasks: The current list of task dictionaries

    Returns:
        None

    Side Effects:
        Prints to stdout via print_task_table()

    Examples:
        >>> list_tasks([])
        No tasks yet.
    """
    print_task_table(tasks)


def update_task(
    tasks: TaskList,
    task_id: int,
    title: str | None = None,
    description: str | None = None
) -> bool:
    """
    Update an existing task's title and/or description.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to update
        title: New title, or None to keep existing (if provided, validates 1-200 chars)
        description: New description, or None to keep existing (no validation)

    Returns:
        True if task was found and updated, False if task not found

    Raises:
        ValueError: If provided title is empty or exceeds 200 characters

    Side Effects:
        Modifies matching task dict in tasks list (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Old', 'description': 'Old desc', 'completed': False}]
        >>> update_task(tasks, 1, title="New")
        True
        >>> tasks[0]['title']
        'New'
    """
    task = get_task_by_id(tasks, task_id)
    if task is None:
        return False

    # Update title if provided
    if title is not None:
        if not validate_title(title):
            if not title.strip():
                raise ValueError("Title is required.")
            raise ValueError("Title must be 1-200 characters.")
        task['title'] = title

    # Update description if provided (no validation)
    if description is not None:
        task['description'] = description

    return True


def delete_task(tasks: TaskList, task_id: int) -> bool:
    """
    Delete a task from the tasks list.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to delete

    Returns:
        True if task was found and deleted, False if task not found

    Side Effects:
        Removes matching task dict from tasks list (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> delete_task(tasks, 1)
        True
        >>> len(tasks)
        0
    """
    task = get_task_by_id(tasks, task_id)
    if task is None:
        return False

    tasks.remove(task)
    return True


def toggle_complete(tasks: TaskList, task_id: int) -> bool:
    """
    Toggle the completed status of a task.

    Args:
        tasks: The current list of task dictionaries (modified in place)
        task_id: ID of task to toggle

    Returns:
        True if task was found and toggled, False if task not found

    Side Effects:
        Flips completed boolean of matching task dict (if found)

    Examples:
        >>> tasks = [{'id': 1, 'title': 'Test', 'description': '', 'completed': False}]
        >>> toggle_complete(tasks, 1)
        True
        >>> tasks[0]['completed']
        True
    """
    task = get_task_by_id(tasks, task_id)
    if task is None:
        return False

    task['completed'] = not task['completed']
    return True


def print_menu() -> None:
    """
    Display the main menu with available commands.

    Args:
        None

    Returns:
        None

    Side Effects:
        Prints to stdout
    """
    print("\n=== Todo App Menu ===")
    print("Commands:")
    print("  add              - Add a new task")
    print("  list             - List all tasks")
    print("  update <id>      - Update a task")
    print("  delete <id>      - Delete a task")
    print("  complete <id>    - Mark task as completed")
    print("  uncomplete <id>  - Mark task as incomplete")
    print("  quit (or q)      - Exit the application")
    print("\nPress Ctrl+C to quit anytime.\n")


def parse_command(input_str: str) -> tuple[str, str]:
    """
    Parse user input into command and arguments.

    Args:
        input_str: Raw input string from user

    Returns:
        Tuple of (command, args) where command is lowercase, args is remaining text

    Side Effects:
        None (pure function)

    Examples:
        >>> parse_command("add")
        ('add', '')

        >>> parse_command("delete 5")
        ('delete', '5')

        >>> parse_command("")
        ('list', '')
    """
    stripped = input_str.strip().lower()
    if not stripped:
        return ('list', '')  # Default to list

    parts = stripped.split(maxsplit=1)
    command = parts[0]
    args = parts[1] if len(parts) > 1 else ""
    return (command, args)


def handle_add(tasks: TaskList) -> None:
    """
    Handle the 'add' command by prompting for title and description.

    Args:
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        Reads from stdin, prints to stdout, modifies tasks list
    """
    title = input("Enter task title: ").strip()
    description = input("Enter description (optional): ").strip()
    try:
        task_id = add_task(tasks, title, description)
        print(f"Task added: {title} (ID: {task_id})")
    except ValueError as e:
        print(f"Error: {e}")


def handle_update(args: str, tasks: TaskList) -> None:
    """
    Handle the 'update <id>' command by prompting for new values.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        Reads from stdin, prints to stdout, modifies tasks list
    """
    try:
        task_id = int(args)
    except ValueError:
        print("Error: Invalid task ID.")
        return

    new_title = input("New title (leave blank to keep): ").strip()
    new_desc = input("New description (leave blank to keep): ").strip()

    try:
        result = update_task(
            tasks,
            task_id,
            new_title if new_title else None,
            new_desc if new_desc else None
        )
        if result:
            print("Task updated.")
        else:
            print("Error: Task not found.")
    except ValueError as e:
        print(f"Error: {e}")


def handle_delete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'delete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        Prints to stdout, modifies tasks list
    """
    try:
        task_id = int(args)
    except ValueError:
        print("Error: Invalid task ID.")
        return

    result = delete_task(tasks, task_id)
    if result:
        print("Task deleted.")
    else:
        print("Error: Task not found.")


def handle_complete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'complete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        Prints to stdout, modifies tasks list
    """
    try:
        task_id = int(args)
    except ValueError:
        print("Error: Invalid task ID.")
        return

    result = toggle_complete(tasks, task_id)
    if result:
        print("Task marked as Completed.")
    else:
        print("Error: Task not found.")


def handle_uncomplete(args: str, tasks: TaskList) -> None:
    """
    Handle the 'uncomplete <id>' command.

    Args:
        args: The task ID as a string
        tasks: The current list of task dictionaries (modified)

    Returns:
        None

    Side Effects:
        Prints to stdout, modifies tasks list
    """
    try:
        task_id = int(args)
    except ValueError:
        print("Error: Invalid task ID.")
        return

    result = toggle_complete(tasks, task_id)
    if result:
        print("Task marked as Pending.")
    else:
        print("Error: Task not found.")


def route_command(command: str, args: str, tasks: TaskList) -> bool:
    """
    Route parsed command to appropriate handler function.

    Args:
        command: Lowercase command name
        args: Command arguments (may be empty)
        tasks: The current list of task dictionaries

    Returns:
        False to continue loop, True to quit

    Side Effects:
        Calls handler functions which may read input, print output, modify tasks
    """
    if command in ('quit', 'q'):
        return True
    elif command == 'add':
        handle_add(tasks)
    elif command == 'list':
        list_tasks(tasks)
    elif command == 'update':
        handle_update(args, tasks)
    elif command == 'delete':
        handle_delete(args, tasks)
    elif command == 'complete':
        handle_complete(args, tasks)
    elif command == 'uncomplete':
        handle_uncomplete(args, tasks)
    else:
        print("Error: Unknown command. Try: add, list, update, delete, complete, quit")

    return False


def main() -> None:
    """
    Main application entry point. Runs interactive command loop.

    Args:
        None

    Returns:
        None

    Side Effects:
        Reads from stdin, prints to stdout, maintains tasks list in memory
    """
    tasks: TaskList = []
    print("Welcome to Todo App!")

    try:
        while True:
            print_menu()
            user_input = input("> ")
            command, args = parse_command(user_input)
            should_quit = route_command(command, args, tasks)
            if should_quit:
                break
    except KeyboardInterrupt:
        pass  # Exit gracefully on Ctrl+C

    print("\nGoodbye!")


if __name__ == "__main__":
    main()
