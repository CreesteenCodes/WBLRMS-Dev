import { useRef, useState } from 'react';
import { Plus, Wrench, Calendar, BadgeDollarSign, CheckCircle, Clock } from 'lucide-react';
import { AutoGrowTextarea } from './ui/textarea';

interface Maintenance {
  id: string;
  localRoadId: string;
  localRoadName: string;
  type: string;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  description: string;
}

interface MaintenanceModuleProps {
  maintenanceRecords: Maintenance[];
  localRoadList: any[];
  onAddMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  onUpdateStatus: (id: string, status: 'Scheduled' | 'In Progress' | 'Completed', completedDate?: string) => void;
}

const maintenanceFormTabs = [
  { id: 'project', label: 'Project Info' },
  { id: 'activity', label: 'Maintenance Info' },
] as const;

export function MaintenanceModule({ maintenanceRecords, localRoadList, onAddMaintenance, onUpdateStatus }: MaintenanceModuleProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<(typeof maintenanceFormTabs)[number]['id']>('project');
  const formScrollRef = useRef<HTMLFormElement>(null);
  const projectSectionRef = useRef<HTMLElement>(null);
  const activitySectionRef = useRef<HTMLElement>(null);
  const formSectionRefs = [projectSectionRef, activitySectionRef];
  const [formData, setFormData] = useState({
    localRoadId: '',
    projectName: '',
    projectCategory: '',
    projectDescription: '',
    location: '',
    contractor: '',
    dateStarted: '',
    completionDate: '',
    maintenanceType: 'Corrective Maintenance',
    maintenanceActivities: '',
    remarks: '',
    type: 'Corrective Maintenance',
    scheduledDate: '',
    cost: 0,
    description: '',
  });

  const selectedProject = localRoadList.find(item => item.id === formData.localRoadId);
  const moveToFormTab = (index: number) => {
    formSectionRefs[index].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveFormTab(maintenanceFormTabs[index].id);
  };
  const updateActiveFormTab = () => {
    const scrollTop = formScrollRef.current?.getBoundingClientRect().top ?? 0;
    const currentIndex = formSectionRefs.reduce((current, sectionRef, index) => (
      sectionRef.current && sectionRef.current.getBoundingClientRect().top <= scrollTop + 110 ? index : current
    ), 0);
    setActiveFormTab(maintenanceFormTabs[currentIndex].id);
  };

  const handleProjectSelection = (projectId: string) => {
    const selected = localRoadList.find(item => item.id === projectId);

    setFormData(prev => ({
      ...prev,
      localRoadId: projectId,
      projectName: selected?.projectName || selected?.name || '',
      projectCategory: selected?.projectCategory || selected?.type || '',
      projectDescription: selected?.projectDescription || selected?.description || '',
      location: selected?.location || '',
      contractor: selected?.contractorName || '',
      dateStarted: selected?.dateBuilt || '',
      completionDate: selected?.actualCompletionDate || '',
      type: prev.type,
      scheduledDate: prev.scheduledDate,
      cost: prev.cost,
      description: prev.description,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const localRoad = localRoadList.find(item => item.id === formData.localRoadId);
    if (localRoad) {
      onAddMaintenance({
        localRoadId: formData.localRoadId,
        localRoadName: localRoad.name,
        type: formData.maintenanceType || formData.type,
        scheduledDate: formData.scheduledDate || formData.dateStarted,
        cost: Number(formData.cost) || 0,
        status: 'Scheduled',
        description: formData.remarks || formData.description,
      });
      setFormData({
        localRoadId: '',
        projectName: '',
        projectCategory: '',
        projectDescription: '',
        location: '',
        contractor: '',
        dateStarted: '',
        completionDate: '',
        maintenanceType: 'Corrective Maintenance',
        maintenanceActivities: '',
        remarks: '',
        type: 'Corrective Maintenance',
        scheduledDate: '',
        cost: 0,
        description: '',
      });
      setShowForm(false);
    }
  };

  const statusColors = {
    'Scheduled': 'bg-[#7dd3fc]/10 text-[#7dd3fc]',
    'In Progress': 'bg-[#38bdf8]/10 text-[#38bdf8]',
    'Completed': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-blue-700">Maintenance Records</h1>
        </div>
        <button
          onClick={() => {
            setActiveFormTab('project');
            setShowForm(!showForm);
          }}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:bg-[#0284c7] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Schedule Maintenance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0ea5e9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled</p>
              <p className="text-3xl font-bold text-[#0ea5e9]">
                {maintenanceRecords.filter(m => m.status === 'Scheduled').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-[#0ea5e9]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#38bdf8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-[#0ea5e9]">
                {maintenanceRecords.filter(m => m.status === 'In Progress').length}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-[#38bdf8]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0ea5e9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#0ea5e9]">
                {maintenanceRecords.filter(m => m.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-[#0ea5e9]" />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-2">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[840px] h-[min(560px,calc(100vh-48px))] overflow-hidden border border-gray-200 relative flex flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-white">Local Road Project Maintenance Activity</h2>
                <p className="text-sm text-blue-100">Municipal Engineering Office · Maintenance Entry</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Close maintenance form"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <nav className="flex shrink-0 gap-2 overflow-x-auto border-b bg-slate-50 px-4 py-2" aria-label="Maintenance form sections">
              {maintenanceFormTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => moveToFormTab(index)}
                  aria-current={activeFormTab === tab.id ? 'step' : undefined}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    activeFormTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {index + 1}. {tab.label}
                </button>
              ))}
            </nav>

            <form ref={formScrollRef} onSubmit={handleSubmit} onScroll={updateActiveFormTab} className="form-modal-fields min-h-0 flex-1 overflow-y-auto bg-white p-4 text-gray-900">
              <section ref={projectSectionRef} className="scroll-mt-4 border-b pb-5">
                <h3 className="text-[1.05rem] font-bold mb-3 text-gray-900">Project Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Project / Program / Activity Name</label>
                    <select
                      value={formData.localRoadId}
                      onChange={(e) => handleProjectSelection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-[#0ea5e9] focus:border-transparent"
                      required
                    >
                      <option value="">Select project</option>
                      {localRoadList.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Project Category</label>
                    <input
                      type="text"
                      value={formData.projectCategory}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Project Description</label>
                  <input
                    type="text"
                    value={formData.projectDescription}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contractor</label>
                  <input
                    type="text"
                    value={formData.contractor}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                </div>
              </section>

              <section ref={activitySectionRef} className="scroll-mt-4 pt-5">
                <h3 className="text-[1.05rem] font-bold mb-3 text-gray-900">Maintenance Activity Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date Started *</label>
                    <input
                      type="date"
                      value={formData.dateStarted}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Completion Date *</label>
                    <input
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maintenance Type *</label>
                    <select
                      value={formData.maintenanceType}
                      onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-[#0ea5e9] focus:border-transparent"
                      required
                    >
                      <option value="Corrective Maintenance">Corrective Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Maintenance Activities*</label>
                  <AutoGrowTextarea
                    value={formData.maintenanceActivities}
                    onChange={(e) => setFormData({ ...formData, maintenanceActivities: e.target.value, description: e.target.value })}
                    rows={3}
                    className="w-full resize-y px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                  <AutoGrowTextarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full resize-y px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-900"
                  />
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#0ea5e9] mb-4">Maintenance Schedule</h2>
        <div className="space-y-3">
          {maintenanceRecords.slice().reverse().map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-5 h-5 text-[#0ea5e9]" />
                    <h3 className="font-semibold text-[#0ea5e9]">{record.localRoadName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[record.status]}`}>
                      {record.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#0ea5e9]/10 text-[#0ea5e9]">
                      {record.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Scheduled: {record.scheduledDate}
                    </div>
                    {record.completedDate && (
                      <div>Completed: {record.completedDate}</div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-sm">₱</span>
                      {record.cost.toLocaleString()}
                    </div>
                  </div>
                  {record.description && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">
                      {record.description}
                    </p>
                  )}
                  {record.status !== 'Completed' && (
                    <div className="flex gap-2 mt-3">
                      {record.status === 'Scheduled' && (
                        <button
                          onClick={() => onUpdateStatus(record.id, 'In Progress')}
                          className="px-4 py-2 bg-[#38bdf8] text-white rounded-lg hover:bg-[#0ea5e9] transition-colors text-sm"
                        >
                          Start Work
                        </button>
                      )}
                      {record.status === 'In Progress' && (
                        <button
                          onClick={() => onUpdateStatus(record.id, 'Completed', new Date().toISOString().split('T')[0])}
                          className="px-4 py-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] transition-colors text-sm"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {maintenanceRecords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No maintenance scheduled yet. Schedule your first maintenance above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
