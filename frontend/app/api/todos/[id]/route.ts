import { NextRequest } from 'next/server';
import { todoStore } from '../../../../lib/todo-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const todo = todoStore.getById(id);

    if (!todo) {
      return new Response(
        JSON.stringify({ error: 'Todo not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(todo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch todo' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { title, description, completed } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Todo ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const updatedTodo = todoStore.update(id, {
      title,
      description,
      completed,
    });

    if (!updatedTodo) {
      return new Response(
        JSON.stringify({ error: 'Todo not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(updatedTodo), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update todo' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const deleted = todoStore.delete(id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'Todo not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify({ message: 'Todo deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete todo' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}