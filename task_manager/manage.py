#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

import warnings
import traceback

def custom_warning(message, category, filename, lineno, file=None, line=None):
    traceback.print_stack()
    print(f"{filename}:{lineno}: {category.__name__}: {message}")


def main():
    """Run administrative tasks."""
    warnings.showwarning = custom_warning
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_manager.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
