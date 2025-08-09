import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Define the task type
interface Task {
  title: string;
  description: string;
  subtasks: string[];
  priority: 'high' | 'medium' | 'low';
}

// Fallback mock implementation of task generation
function generateMockPlan(goal: string) {
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  const taskTemplates: Omit<Task, 'priority'>[] = [
    {
      title: 'Research and Planning',
      description: 'Gather information and plan the approach',
      subtasks: [
        'Identify key requirements',
        'Research best practices',
        'Create initial outline'
      ]
    },
    {
      title: 'Initial Setup',
      description: 'Set up the basic structure and environment',
      subtasks: [
        'Install necessary tools',
        'Configure development environment',
        'Set up version control'
      ]
    },
    {
      title: 'Core Implementation',
      description: 'Implement the main functionality',
      subtasks: [
        'Develop core features',
        'Write unit tests',
        'Implement error handling'
      ]
    },
    {
      title: 'Testing and Refinement',
      description: 'Test the implementation and make improvements',
      subtasks: [
        'Perform integration testing',
        'Gather feedback',
        'Refine based on feedback'
      ]
    },
    {
      title: 'Deployment',
      description: 'Prepare and deploy the solution',
      subtasks: [
        'Prepare deployment package',
        'Deploy to production',
        'Monitor after deployment'
      ]
    }
  ];

  // Select a random number of tasks (3-5)
  const numTasks = Math.min(Math.max(3, Math.floor(Math.random() * 5) + 1), taskTemplates.length);
  const selectedTasks: Task[] = [];
  const usedIndices = new Set<number>();
  
  while (selectedTasks.length < numTasks) {
    const randomIndex = Math.floor(Math.random() * taskTemplates.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      const task: Task = {
        ...taskTemplates[randomIndex],
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      };
      selectedTasks.push(task);
    }
  }

  // Timeline estimation based on number of tasks
  const weeks = numTasks * 1.5;
  
  return {
    title: `Plan for: ${goal.substring(0, 50)}${goal.length > 50 ? '...' : ''}`,
    description: `This is a generated plan to help you achieve your goal: "${goal}". The plan includes ${numTasks} main tasks with subtasks to guide you through the process.`,
    timeline: `Approximately ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`,
    tasks: selectedTasks
  };
}

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      );
    }

    let plan;
    
    try {
      // Try to generate plan using Gemini 2.0 Flash
      const prompt = `You are a helpful assistant that breaks down goals into actionable steps. 
      For the given goal, create a detailed plan with tasks and subtasks. 
      Return the response as a valid JSON object with this structure: 
      {
        "title": "Goal title",
        "description": "Brief description of the goal",
        "timeline": "Estimated timeline",
        "tasks": [
          {
            "title": "Task title",
            "description": "Task description",
            "subtasks": ["subtask 1", "subtask 2"],
            "priority": "high/medium/low"
          }
        ]
      }
      
      Goal: ${goal}
      
      Please ensure the response is a valid JSON object with no extra text before or after.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to ensure it's valid JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(jsonStart, jsonEnd);
      
      plan = JSON.parse(jsonString);
    } catch (aiError) {
      console.error('Error calling Gemini API, falling back to mock data:', aiError);
      // Fall back to mock data if API call fails
      plan = generateMockPlan(goal);
    }

    try {
      // Try to save to Supabase if configured
      if (supabase) {
        const { error } = await supabase
          .from('plans')
          .insert([
            { 
              goal,
              plan,
              created_at: new Date().toISOString()
            },
          ]);

        if (error) {
          console.error('Error saving to Supabase (continuing without save):', error);
        }
      }
    } catch (dbError) {
      console.error('Database error (continuing without save):', dbError);
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error in plan generation:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to generate plan. Please try again.';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
      },
      { status: 500 }
    );
  }
}
