"use client";

import { useState } from 'react';

type Task = {
  title: string;
  description: string;
  subtasks: string[];
  priority: string;
};

type Plan = {
  title: string;
  description: string;
  timeline: string;
  tasks: Task[];
};

export default function Home() {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
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

  const mainStyles = {
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    boxSizing: 'border-box' as const,
  };

  const formStyles = {
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.25rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const planCardStyles = {
    backgroundColor: 'white',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '1.5rem',
    overflow: 'hidden' as const
  };

  const taskCardStyles = {
    padding: '1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    width: '100%',
    boxSizing: 'border-box' as const
  };

  return (
    <main style={mainStyles}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        width: '100%',
        padding: '0 1rem'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          任务规划拆分（MVP）
        </h1>
        
        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="goal" style={{ 
              display: 'block', 
              fontSize: '1rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '0.5rem'
            }}>
              你的目标是什么？
            </label>
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
                lineHeight: '1.5',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                minHeight: '120px',
                resize: 'vertical',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              placeholder="写下你的目标，例如：在两个月内发布租房平台 MVP"
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
                fontWeight: '500',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
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
          }}>
            <svg style={{ 
              flexShrink: 0, 
              width: '1.25rem', 
              height: '1.25rem',
              marginTop: '0.25rem'
            }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{error}</span>
          </div>
        )}

        {plan && (
          <div style={planCardStyles}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {plan.title}
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>{plan.description}</p>
            <div style={{
              marginBottom: '2rem',
              padding: '1rem 1.25rem',
              backgroundColor: '#eff6ff',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontWeight: '600', color: '#1e40af' }}>预计时间：</span>
              <span style={{ color: '#1e40af' }}>{plan.timeline}</span>
            </div>
            
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              任务列表
            </h3>
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              width: '100%'
            }}>
              {plan.tasks.map((task, index) => (
                <div key={index} style={taskCardStyles}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    width: '100%'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#111827',
                        marginBottom: '0.5rem',
                        wordBreak: 'break-word'
                      }}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p style={{ 
                          color: '#4b5563', 
                          margin: '0.5rem 0 0',
                          lineHeight: '1.6',
                          wordBreak: 'break-word'
                        }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div style={{
                      alignSelf: 'flex-start',
                      marginLeft: '0.75rem',
                      flexShrink: 0
                    }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        ...(task.priority === 'high' 
                          ? { 
                              backgroundColor: '#fee2e2', 
                              color: '#b91c1c',
                              border: '1px solid #fecaca'
                            }
                          : task.priority === 'medium'
                          ? { 
                              backgroundColor: '#fef3c7', 
                              color: '#92400e',
                              border: '1px solid #fde68a'
                            }
                          : { 
                              backgroundColor: '#d1fae5', 
                              color: '#065f46',
                              border: '1px solid #a7f3d0'
                            })
                      }}>
                        {task.priority === 'high' ? '高优先级' : 
                         task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                    </div>
                  </div>
                  
                  {task.subtasks.length > 0 && (
                    <div style={{ 
                      marginTop: '1rem', 
                      paddingLeft: '1rem', 
                      borderLeft: '2px solid #e5e7eb'
                    }}>
                      <h5 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: '#4b5563', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        子任务：
                      </h5>
                      <ul style={{ 
                        listStyleType: 'none', 
                        paddingLeft: '0', 
                        display: 'grid', 
                        gap: '0.5rem',
                        margin: '0.5rem 0 0'
                      }}>
                        {task.subtasks.map((subtask, i) => (
                          <li key={i} style={{ 
                            color: '#4b5563',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            lineHeight: '1.5'
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: '4px',
                              height: '4px',
                              backgroundColor: '#6b7280',
                              borderRadius: '50%',
                              marginTop: '0.5em',
                              flexShrink: 0
                            }}></span>
                            <span>{subtask}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
