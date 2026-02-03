import { NextRequest } from 'next/server';
import { todoStore } from '../../../lib/todo-store';

export async function GET(request: NextRequest) {
  try {
    const todos = todoStore.getAll();
    return new Response(JSON.stringify(todos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch todos' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Title is required and must be a string' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const newTodo = todoStore.create(title, description);

    return new Response(JSON.stringify(newTodo), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create todo' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}