// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Mock data for testing (replace with your database query)
    const mockTasks = [
      {
        id: '1',
        title: 'Complete project proposal',
        description: 'Finish the Q1 project proposal document',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Review code changes',
        description: 'Review pull requests from team members',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Team meeting',
        description: 'Weekly sync with the team',
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Update documentation',
        description: 'Update API documentation with new endpoints',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Fix critical bug',
        description: 'Resolve the login issue reported by users',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 43200000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, priority, dueDate } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title are required' }, 
        { status: 400 }
      );
    }

    const newTask = {
      id: Date.now().toString(),
      userId,
      title,
      description: description || '',
      status: 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' }, 
      { status: 500 }
    );
  }
}
