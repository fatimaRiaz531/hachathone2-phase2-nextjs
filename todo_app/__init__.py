"""
Phase I: Console-based Todo Application with in-memory storage
Package __init__.py
"""

from .todo_console import TodoConsoleApp, Task

__version__ = "1.0.0"
__author__ = "Todo App Team"
__all__ = ["TodoConsoleApp", "Task"]