import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock3, Route, ArrowUpRight, Activity } from 'lucide-react';

interface DashboardProps {
  localRoadData: any[];
  inspections: any[];
  onTabChange: (tab: string) => void;
}

const conditionColors: Record<string, string> = {
  Good: '#2563eb',
  Fair: '#60a5fa',
  Poor: '#cbd5e1',
};

const isRoad = (item: any) => /road/i.test(`${item.type || ''} ${item.projectCategory || ''}`);

export function Dashboard({ localRoadData, inspections, onTabChange }: DashboardProps) {
  const roads = localRoadData.filter(isRoad);
  const roadIds = new Set(roads.map(road => road.id));
  const roadInspections = inspections.filter(inspection => roadIds.has(inspection.localRoadId));
  const goodRoads = roads.filter(road => road.condition === 'Good').length;
  const highRiskRoads = roads.filter(road => ['Poor', 'Bad'].includes(road.condition)).length;
  const goodPercent = roads.length ? Math.round((goodRoads / roads.length) * 100) : 0;
  const conditionData = ['Good', 'Fair', 'Poor'].map(name => ({
    name,
    value: roads.filter(road => road.condition === name).length,
    color: conditionColors[name],
  }));

  const categoryCounts = roads.reduce<Record<string, number>>((counts, road) => {
    const category = road.projectCategory?.trim() || 'Uncategorized';
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });
  const monthlyInspections = months.map(month => ({
    month: month.toLocaleDateString('en', { month: 'short' }),
    inspections: roadInspections.filter(inspection => {
      const date = new Date(inspection.date);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    }).length,
  }));

  const latestInspections = roadInspections.slice(-5).reverse();

  const summaryCards = [
    {
      label: 'Total Road Network',
      value: roads.length,
      note: `${roads.length} local road${roads.length === 1 ? '' : 's'} cataloged`,
      icon: Route,
      color: 'blue',
      onClick: () => onTabChange('project-management'),
    },
    {
      label: 'High Risk Road Sections',
      value: highRiskRoads,
      note: highRiskRoads ? 'Requires attention' : 'Zero critical washouts',
      icon: AlertTriangle,
      color: 'green',
    },
    {
      label: 'Good Pavement State',
      value: goodRoads,
      note: `${goodPercent}% of local roads`,
      icon: CheckCircle2,
      color: 'blue',
    },
    {
      label: 'Recent Road Audits',
      value: roadInspections.length,
      note: 'Pavement assessments',
      icon: Clock3,
      color: 'blue',
      onClick: () => onTabChange('inspection-management'),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-5">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-blue-700">Road Monitoring Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time pavement condition, road network classifications, and field audit status for Mabini, Batangas.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map(({ label, value, note, icon: Icon, color, onClick }) => {
          const cardClass = `relative flex min-h-[112px] w-full items-start justify-between overflow-hidden rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-left shadow-md transition ${
            onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400' : ''
          }`;
          const content = (
            <>
              <span
                aria-hidden="true"
                className={`absolute -right-8 -top-12 h-32 w-32 rounded-full ${
                  color === 'green' ? 'bg-amber-50/80' : 'bg-blue-50/80'
                }`}
              />
              <div className="relative z-10">
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <p className="mt-1 text-3xl font-bold leading-none text-blue-700">{value}</p>
                <p className={`mt-2 text-[10px] ${color === 'green' ? 'text-emerald-600' : 'text-slate-400'}`}>{note}</p>
              </div>
              <span className="relative z-10 rounded-xl border border-blue-100 bg-blue-50 p-3 text-blue-600 shadow-md">
                <Icon className="h-5 w-5" />
              </span>
            </>
          );

          return onClick ? (
            <button key={label} type="button" onClick={onClick} className={cardClass}>{content}</button>
          ) : (
            <div key={label} className={cardClass}>{content}</div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-md">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-blue-900">Roads by Category</h2>
              <p className="mt-1 text-[9px] text-slate-400">Local road count by project category</p>
            </div>
            <span className="flex items-center gap-1 text-[9px] text-slate-500"><i className="h-2 w-2 rounded-sm bg-blue-600" /> count</span>
          </div>
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={categoryData} margin={{ top: 12, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="#e8eef7" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[155px] items-center justify-center text-xs text-slate-400">No road projects have been cataloged yet.</div>
          )}
          <div className="border-t border-slate-100 pt-2 text-[9px] text-slate-400">
            {roads.length ? `Showing ${roads.length} registered road ${roads.length === 1 ? 'project' : 'projects'} by project category` : 'Add a road project to see category data.'}
          </div>
        </section>

        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-md">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-blue-900">Pavement Condition Distribution</h2>
              <p className="mt-1 text-[9px] text-slate-400">Current condition ratings across cataloged road sections</p>
            </div>
            <span className="text-[9px] text-slate-500">{roads.length} Total Roads</span>
          </div>
          <div className="flex min-h-[155px] items-center justify-center gap-3 sm:gap-6">
            <div className="relative h-[132px] w-[132px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={conditionData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={56} paddingAngle={2} stroke="none">
                    {conditionData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-sm text-blue-900">{goodPercent}%</strong>
                <span className="text-[7px] tracking-wide text-slate-400">GOOD RATE</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {conditionData.map(entry => {
                const percent = roads.length ? Math.round((entry.value / roads.length) * 100) : 0;
                return (
                  <div key={entry.name} className="flex min-w-[130px] items-center justify-between gap-3 rounded-md border border-slate-100 px-2 py-1.5 text-[9px]">
                    <span className="flex items-center gap-1.5 text-slate-600"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}</span>
                    <span className="font-medium text-slate-600">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] text-slate-400">
            <span>Engineering target: maintain over 65% in good condition</span>
            <span className={`flex items-center gap-1 ${goodPercent >= 65 ? 'text-emerald-600' : 'text-amber-600'}`}>
              <CheckCircle2 className="h-3 w-3" />{goodPercent >= 65 ? 'Compliant' : 'Review'}
            </span>
          </div>
        </section>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-md">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-blue-900">Monthly Road Inspection Trend</h2>
              <p className="mt-1 text-[9px] text-slate-400">Road inspection activity from the last six months</p>
            </div>
            <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[8px] text-blue-600"><Activity className="h-3 w-3" /> Active Cycle</span>
          </div>
          <ResponsiveContainer width="100%" height={145}>
            <LineChart data={monthlyInspections} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="#e8eef7" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="inspections" stroke="#2563eb" strokeWidth={2} dot={{ r: 2.5, fill: 'white', strokeWidth: 1.5 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="flex min-h-[190px] flex-col rounded-[22px] border border-slate-200 bg-white p-5 shadow-md">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-blue-900">Recent Road Field Inspections</h2>
              <p className="mt-1 text-[9px] text-slate-400">Pavement assessments logged by road inspectors</p>
            </div>
            <button type="button" onClick={() => onTabChange('inspection-management')} className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-800">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 divide-y divide-slate-100">
            {latestInspections.length ? latestInspections.map((inspection, index) => {
              const road = roads.find(item => item.id === inspection.localRoadId);
              const condition = road?.condition || (inspection.conditionRating >= 8 ? 'Good' : inspection.conditionRating >= 5 ? 'Fair' : 'Poor');
              return (
                <div key={inspection.id || `${inspection.localRoadId}-${index}`} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-slate-800">{inspection.localRoadName || road?.name || 'Road inspection'}</p>
                    <p className="text-[8px] text-slate-400">{inspection.inspector || 'Road Inspector'} · {inspection.date} · Rating: {inspection.conditionRating}/10</p>
                  </div>
                  <span className={`shrink-0 rounded px-1.5 py-1 text-[8px] ${condition === 'Good' ? 'bg-emerald-50 text-emerald-700' : condition === 'Fair' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{condition}</span>
                </div>
              );
            }) : (
              <div className="flex h-full min-h-[100px] items-center justify-center text-xs text-slate-400">No road inspections have been recorded yet.</div>
            )}
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-[8px] text-slate-400">
            <span>Municipal Road Inventory</span><span>{roadInspections.length} audit{roadInspections.length === 1 ? '' : 's'}</span>
          </div>
        </section>
      </div>
    </main>
  );
}
