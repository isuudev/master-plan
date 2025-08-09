"use client";

import { useState } from 'react';

type Task = {
  title: string;
  description: string;
  emoji: string;
  id?: string;
};

type Plan = {
  title: string;
  description: string;
  tasks: Task[];
};

export default function Home() {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!goal.trim()) {
      setError('请输入目标');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || responseData.message || '请求出错');
      }
      
      // 重置已完成任务状态
      setCompletedTasks(new Set());
      setPlan(responseData.plan);
    } catch (err) {
      let errorMessage = '网络错误';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      setError(errorMessage);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  }

  const mainStyles: React.CSSProperties = {
    minHeight: '100vh',
    padding: '2rem 0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const formStyles: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box'
  };

  // Define base styles that work with React.CSSProperties
  const taskCardBaseStyles = (isCompleted: boolean): React.CSSProperties => ({
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    opacity: isCompleted ? 0.8 : 1,
    transition: 'all 0.2s ease-in-out',
    transform: isCompleted ? 'none' : 'translateY(0)'
  } as React.CSSProperties);

  // Separate hover styles to be applied via onMouseEnter/onMouseLeave
  const taskCardHoverStyles: React.CSSProperties = {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
  };

  const taskCardCompletedHoverStyles: React.CSSProperties = {
    transform: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  const taskCardMobileStyles: React.CSSProperties = {
    padding: '0.75rem'
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    padding: '2rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  return (
    <main style={mainStyles}>
      <div style={containerStyles}>
        
        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#111827',
                fontSize: '1rem',
                lineHeight: 1.5,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                minHeight: '120px',
                resize: 'vertical',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              } as React.CSSProperties}
              placeholder="你的目标是什么？"
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                backgroundColor: loading ? '#93c5fd' : '#3b82f6',
                color: 'white',
                fontWeight: 500,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              } as React.CSSProperties}
              onMouseOver={e => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={e => {
                if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
              onMouseDown={e => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={e => {
                if (!loading) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? '生成中...' : '生成计划'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            margin: '0 0 1.5rem',
            color: '#b91c1c',
            backgroundColor: '#fee2e2',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #dc2626',
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '0.5rem',
            maxWidth: '100%',
            boxSizing: 'border-box'
          } as React.CSSProperties}>
            <svg style={{
              flexShrink: 0,
              width: '1.25rem',
              height: '1.25rem',
              marginTop: '0.25rem'
            } as React.CSSProperties} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ flex: 1, wordBreak: 'break-word' } as React.CSSProperties}>{error}</span>
          </div>
        )}

        {plan && (
          <div >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {plan.title}
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>{plan.description}</p>
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: '1fr',
              width: '100%',
              margin: 0
            }}>
              {plan.tasks.map((task, index) => {
                const taskId = task.id || `task-${index}`;
                const isCompleted = completedTasks.has(taskId);
                
                return (
                  <div 
                    key={index} 
                    style={{
                      ...taskCardBaseStyles(isCompleted),
                      ...(window.innerWidth <= 480 ? taskCardMobileStyles : {})
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 480) {
                        const target = e.currentTarget;
                        Object.entries(isCompleted ? taskCardCompletedHoverStyles : taskCardHoverStyles)
                          .forEach(([key, value]) => {
                            target.style[key as any] = value as string;
                          });
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 480) {
                        const target = e.currentTarget;
                        Object.keys(taskCardHoverStyles).forEach(key => {
                          target.style[key as any] = '';
                        });
                        // Restore base transform for completed state
                        if (isCompleted) {
                          target.style.transform = 'none';
                        } else {
                          target.style.transform = 'translateY(0)';
                        }
                      }
                    }}
                    onClick={() => {
                      const newCompleted = new Set(completedTasks);
                      if (isCompleted) {
                        newCompleted.delete(taskId);
                      } else {
                        newCompleted.add(taskId);
                      }
                      setCompletedTasks(newCompleted);
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      width: '100%',
                      position: 'relative',
                      zIndex: 2,
                      opacity: isCompleted ? 0.7 : 1
                    } as React.CSSProperties}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: window.innerWidth <= 480 ? '2rem' : '2.25rem',
                        height: window.innerWidth <= 480 ? '2rem' : '2.25rem',
                        borderRadius: '50%',
                        backgroundColor: '#f0f5ff',
                        flexShrink: 0,
                        fontSize: window.innerWidth <= 480 ? '1rem' : '1.1rem',
                        opacity: isCompleted ? 0.5 : 1,
                        transition: 'all 0.2s ease-in-out'
                      } as React.CSSProperties}>
                        {task.emoji}
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        flex: 1
                      } as React.CSSProperties}>
                        <h4 style={{ 
                          fontSize: window.innerWidth <= 480 ? '0.95rem' : '1rem',
                          fontWeight: 600, 
                          color: '#111827',
                          margin: 0,
                          wordBreak: 'break-word',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          transition: 'all 0.2s ease-in-out',
                          lineHeight: window.innerWidth <= 480 ? 1.4 : 1.5
                        } as React.CSSProperties}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p style={{ 
                            color: '#4b5563',
                            fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.85rem',
                            margin: 0,
                            lineHeight: window.innerWidth <= 480 ? 1.4 : 1.5,
                            wordBreak: 'break-word',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            transition: 'all 0.2s ease-in-out'
                          } as React.CSSProperties}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
