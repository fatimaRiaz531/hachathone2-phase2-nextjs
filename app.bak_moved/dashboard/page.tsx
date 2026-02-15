'use client';

import { TodoDashboard } from '../../components/TodoDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TodoDashboard />
    </div>
  );
}
