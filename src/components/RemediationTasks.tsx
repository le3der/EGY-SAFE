import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, ShieldAlert } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
}

const initialTasks: Task[] = [
  { id: 't1', title: 'Invalidate leaked session tokens for user #3928', priority: 'High', status: 'Pending' },
  { id: 't2', title: 'Patch CVE-2023-4523 on external load balancer', priority: 'High', status: 'Pending' },
  { id: 't3', title: 'Review unhandled MFA bypass attempts from IP 45.33.2.1', priority: 'Medium', status: 'Pending' },
  { id: 't4', title: 'Update WAF rules to block malicious payload variants', priority: 'Medium', status: 'Pending' },
  { id: 't5', title: 'Generate monthly executive security summary report', priority: 'Low', status: 'Pending' },
];

export default function RemediationTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    if (result.source.index === result.destination.index) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  return (
    <div className="pt-8 border-t border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-cyan" />
        <h2 className="text-2xl font-bold dark:text-white">Remediation Action Plan</h2>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Drag and drop tasks to prioritize your incident response and remediation queue.
      </p>

      <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks-list">
            {(provided) => (
              <ul 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-3"
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                          snapshot.isDragging 
                            ? 'bg-black/5 dark:bg-white/5 border-cyan shadow-[0_0_15px_rgba(0,194,255,0.2)] z-50' 
                            : 'bg-white dark:bg-[#111] border-black/10 dark:border-white/10 hover:border-cyan/50 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        style={provided.draggableProps.style}
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-cyan transition-colors"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-black dark:text-white">{task.title}</h4>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${
                            task.priority === 'High' ? 'bg-red/10 text-red border-red/20' :
                            task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20' :
                            'bg-cyan/10 text-cyan border-cyan/20'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
