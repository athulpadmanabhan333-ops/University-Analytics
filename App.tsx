
import React, { useState, useMemo } from 'react';
import { SYNTHETIC_STUDENTS, DEPARTMENTS } from './constants';
import StudentTable from './components/StudentTable';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const filteredStudents = useMemo(() => {
    if (selectedDept === 'All') return SYNTHETIC_STUDENTS;
    return SYNTHETIC_STUDENTS.filter(s => s.department === selectedDept);
  }, [selectedDept]);

  const stats = useMemo(() => {
    const avgGpa = filteredStudents.reduce((acc, s) => acc + s.gpa, 0) / filteredStudents.length;
    const totalCredits = filteredStudents.reduce((acc, s) => acc + s.credits, 0);
    return {
      avgGpa: avgGpa.toFixed(2),
      totalCredits,
      count: filteredStudents.length
    };
  }, [filteredStudents]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Main Dashboard Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">University Analytics</h1>
            <p className="text-slate-500">Managing {SYNTHETIC_STUDENTS.length} students across {DEPARTMENTS.length} departments</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Filter Dept:</label>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </header>

        {/* Quick Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Avg Department GPA</p>
            <h3 className="text-4xl font-bold text-indigo-600 mt-1">{stats.avgGpa}</h3>
            <div className="mt-2 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-md inline-block">
              +0.2% vs Last Term
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Total Credits Tracked</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{stats.totalCredits.toLocaleString()}</h3>
            <div className="mt-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md inline-block">
              Avg {Math.round(stats.totalCredits / stats.count)}/Student
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Student Population</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{stats.count}</h3>
            <div className="mt-2 text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-md inline-block">
              Active Enrollment
            </div>
          </div>
        </section>

        {/* Student Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Student Directory</h2>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Export CSV</button>
          </div>
          <StudentTable students={filteredStudents} />
        </section>
      </main>

      {/* Side Chat Panel */}
      <aside className="w-full lg:w-[450px] bg-slate-100 lg:border-l border-slate-200 p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Agentic Query</h2>
          <p className="text-sm text-slate-500">Ask Gemini for deeper insights and automated reports.</p>
        </div>
        <div className="flex-1">
          <ChatInterface />
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-700 leading-relaxed">
            <strong>Pro Tip:</strong> You can ask "Who are the top 3 students in CS?" or "What is the average GPA of students with more than 80 credits?"
          </p>
        </div>
      </aside>
    </div>
  );
};

export default App;
