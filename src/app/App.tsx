'use client';

import { useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const IDLE_WARNING_MS = 30 * 1000;
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LocalRoadList } from './components/LocalRoadList';
import { LocalRoadForm } from './components/LocalRoadForm';
import { InspectionModule } from './components/InspectionModule';
import { MaintenanceModule } from './components/MaintenanceModule';
import { AIPredictionModule } from './components/AIPredictionModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UserManagementModule } from './components/UserManagementModule';
import { ProjectProgressModule } from './components/ProjectProgressModule';

interface ProjectAttachment {
  name: string;
  type: string;
  dataUrl: string;
  category: string;
}

interface LocalRoad {
  id: string;
  name: string;
  type: string;
  location: string;
  dateBuilt: string;
  condition: string;
  lastInspection?: string;
  projectName?: string;
  projectCategory?: string;
  projectDescription?: string;
  targetCompletionDate?: string;
  noOfExtensions?: string;
  actualCompletionDate?: string;
  roadNetworkId?: string;
  roadName?: string;
  barangay?: string;
  components?: string;
  description?: string;
  contractorName?: string;
  contractorAddress?: string;
  contactInformation?: string;
  pcadLicenseNo?: string;
  sourceOfFunds?: string;
  appropriation?: string;
  contractedAmount?: string;
  adjustProjectCost?: string;
  completionDate?: string;
  completionPercentage?: string;
  turnoverDate?: string;
  attachments?: ProjectAttachment[];
  validationResult?: 'Validated' | 'Return for Revision';
  validationRemarks?: string;
}

interface Inspection {
  id: string;
  localRoadId: string;
  localRoadName: string;
  date: string;
  conditionRating: number;
  remarks: string;
  inspector: string;
}

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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLocalRoadForm, setShowLocalRoadForm] = useState(false);
  const [editingLocalRoad, setEditingLocalRoad] = useState<LocalRoad | null>(null);

  const [localRoadData, setLocalRoadData] = useState<LocalRoad[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  const [idleCountdown, setIdleCountdown] = useState(0);
  const lastActivity = useRef(Date.now());
  const handleLogoutRef = useRef<() => void>(() => {});

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch('/api/local-road'),
      fetch('/api/inspections'),
      fetch('/api/maintenance'),
    ])
      .then(async ([roadsResponse, inspectionsResponse, maintenanceResponse]) => {
        if (!roadsResponse.ok || !inspectionsResponse.ok || !maintenanceResponse.ok) {
          throw new Error('Unable to load local road records.');
        }
        return Promise.all([
          roadsResponse.json(),
          inspectionsResponse.json(),
          maintenanceResponse.json(),
        ]);
      })
      .then(([roadsPayload, inspectionsPayload, maintenancePayload]) => {
        if (!isMounted) return;
        setLocalRoadData(roadsPayload?.data ?? []);
        setInspections(inspectionsPayload?.data ?? []);
        setMaintenanceRecords(maintenancePayload?.data ?? []);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        console.error('Failed to load local road data.', error);
        setLocalRoadData([]);
        setInspections([]);
        setMaintenanceRecords([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    lastActivity.current = Date.now();
    setIdleCountdown(0);

    const resetTimer = () => {
      lastActivity.current = Date.now();
      setIdleCountdown(0);
    };

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        handleLogoutRef.current();
      } else if (elapsed >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        setIdleCountdown(Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.clearInterval(interval);
    };
  }, [isLoggedIn]);

  const handleLogin = (role: string, username: string, email: string) => {
    setUserRole(role);
    setUserName(username);
    setActiveTab(role === 'Staff - Inspector' ? 'inspection-management' : 'dashboard');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    setActiveTab('dashboard');
  };

  handleLogoutRef.current = handleLogout;

  const handleAddLocalRoad = () => {
    setEditingLocalRoad(null);
    setShowLocalRoadForm(true);
  };

  const handleEditLocalRoad = (item: LocalRoad) => {
    setEditingLocalRoad(item);
    setShowLocalRoadForm(true);
  };

  const handleSaveLocalRoad = async (data: Omit<LocalRoad, 'id'> & { id?: string }) => {
    const normalizedData: LocalRoad = {
      id: data.id ?? crypto.randomUUID(),
      name: data.name || data.projectName || '',
      type: data.type || data.projectCategory || '',
      location: data.location || '',
      dateBuilt: data.dateBuilt || '',
      condition: data.condition || 'Good',
      lastInspection: data.lastInspection,
      projectName: data.projectName || data.name || '',
      projectCategory: data.projectCategory || data.type || '',
      projectDescription: data.projectDescription || '',
      targetCompletionDate: data.targetCompletionDate || '',
      noOfExtensions: data.noOfExtensions || '',
      actualCompletionDate: data.actualCompletionDate || '',
      roadNetworkId: data.roadNetworkId || '',
      roadName: data.roadName || data.name || '',
      barangay: data.barangay || '',
      components: data.components || '',
      description: data.description || '',
      contractorName: data.contractorName || '',
      contractorAddress: data.contractorAddress || '',
      contactInformation: data.contactInformation || '',
      pcadLicenseNo: data.pcadLicenseNo || '',
      sourceOfFunds: data.sourceOfFunds || '',
      appropriation: data.appropriation || '',
      contractedAmount: data.contractedAmount || '',
      adjustProjectCost: data.adjustProjectCost || '',
      completionDate: data.completionDate || '',
      completionPercentage: data.completionPercentage || '',
      turnoverDate: data.turnoverDate || '',
      attachments: data.attachments || [],
    };

    try {
      const response = await fetch('/api/local-road', {
        method: data.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Unable to save this road.');
      const savedRoad = payload.data as LocalRoad;
      setLocalRoadData((previous) => data.id
        ? previous.map((item) => (item.id === data.id ? savedRoad : item))
        : [...previous, savedRoad]);
      setShowLocalRoadForm(false);
      setEditingLocalRoad(null);
    } catch (error) {
      console.error('Failed to save local road record.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to save this road.');
    }
  };

  const handleDeleteLocalRoad = (id: string) => {
    if (confirm('Are you sure you want to delete this road?')) {
      fetch(`/api/local-road?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) throw new Error(payload?.message || 'Unable to delete this road.');
          setLocalRoadData((prev) => prev.filter((item) => item.id !== id));
          setInspections((prev) => prev.filter((item) => item.localRoadId !== id));
          setMaintenanceRecords((prev) => prev.filter((item) => item.localRoadId !== id));
        })
        .catch((error: unknown) => {
          console.error('Failed to delete local road record.', error);
          window.alert(error instanceof Error ? error.message : 'Unable to delete this road.');
        });
    }
  };

  const handleSaveValidation = async (id: string, result: 'Validated' | 'Return for Revision', remarks: string) => {
    try {
      const response = await fetch('/api/local-road', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, validationResult: result, validationRemarks: remarks }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Unable to save validation.');
      setLocalRoadData((prev) => prev.map((item) => item.id === id ? payload.data : item));
    } catch (error) {
      console.error('Failed to save road validation.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to save validation.');
    }
  };

  const handleAddInspection = async (inspection: Omit<Inspection, 'id'>) => {
    try {
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Unable to save inspection.');
      const newInspection = payload.data as Inspection;
      setInspections((prev) => [...prev, newInspection]);

      const condition =
        inspection.conditionRating >= 8 ? 'Good' :
        inspection.conditionRating >= 5 ? 'Fair' : 'Poor';

      setLocalRoadData((prev) =>
        prev.map((item) =>
          item.id === inspection.localRoadId
            ? { ...item, condition, lastInspection: inspection.date }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to save local road inspection.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to save inspection.');
    }
  };

  const handleAddMaintenance = async (maintenance: Omit<Maintenance, 'id'>) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Unable to save maintenance record.');
      setMaintenanceRecords((prev) => [...prev, payload.data]);
    } catch (error) {
      console.error('Failed to save local road maintenance.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to save maintenance record.');
    }
  };

  const handleUpdateMaintenanceStatus = (
    id: string,
    status: 'Scheduled' | 'In Progress' | 'Completed',
    completedDate?: string
  ) => {
    fetch('/api/maintenance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, completedDate }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || 'Unable to update maintenance status.');
        setMaintenanceRecords((prev) => prev.map((item) => item.id === id ? payload.data : item));
      })
      .catch((error: unknown) => {
        console.error('Failed to update local road maintenance status.', error);
        window.alert(error instanceof Error ? error.message : 'Unable to update maintenance status.');
      });
  };

  // Role-based access control based on system diagram
  const hasAccess = (module: string): boolean => {
    const rolePermissions: Record<string, string[]> = {
      'Head Engineer': ['dashboard', 'analytics', 'project-management', 'inspection-management', 'maintenance-management', 'ai', 'system-management'],
      'Staff - Encoder': ['dashboard', 'project-management', 'maintenance-management'],
      'Staff - Inspector': ['dashboard', 'inspection-management'],
      'Staff - Validator': ['dashboard', 'validation-management'],
    };
    return rolePermissions[userRole]?.includes(module) || false;
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#1a1d3f] overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
      />
      <div className="module-content flex-1 overflow-auto">
        {activeTab === 'dashboard' && hasAccess('dashboard') && (
          <Dashboard
            localRoadData={localRoadData}
            inspections={inspections}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'project-management' && hasAccess('project-management') && (
          <LocalRoadList
            data={localRoadData}
            onAdd={handleAddLocalRoad}
            onEdit={handleEditLocalRoad}
            onDelete={handleDeleteLocalRoad}
          />
        )}
        {activeTab === 'inspection-management' && hasAccess('inspection-management') && (
          <InspectionModule
            inspections={inspections}
            localRoadList={localRoadData}
            onAddInspection={handleAddInspection}
            currentUser={userName}
          />
        )}
        {activeTab === 'maintenance-management' && hasAccess('maintenance-management') && (
          <MaintenanceModule
            maintenanceRecords={maintenanceRecords}
            localRoadList={localRoadData}
            onAddMaintenance={handleAddMaintenance}
            onUpdateStatus={handleUpdateMaintenanceStatus}
          />
        )}
        {activeTab === 'ai' && hasAccess('ai') && (
          <AIPredictionModule
            localRoadData={localRoadData}
            inspections={inspections}
            maintenanceRecords={maintenanceRecords}
          />
        )}
        {activeTab === 'analytics' && hasAccess('analytics') && (
          <AnalyticsDashboard
            localRoadData={localRoadData}
          />
        )}
        {activeTab === 'validation-management' && hasAccess('validation-management') && (
          <LocalRoadList
            data={localRoadData}
            onAdd={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            validationMode
            validatorName={userName}
            onSaveValidation={handleSaveValidation}
          />
        )}
        {activeTab === 'system-management' && hasAccess('system-management') && (
          <UserManagementModule />
        )}
        {!hasAccess(activeTab) && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this module.</p>
              <p className="text-sm text-gray-500 mt-4">Your role: <span className="font-semibold capitalize">{userRole}</span></p>
            </div>
          </div>
        )}
      </div>
      {showLocalRoadForm && (
        <LocalRoadForm
          item={editingLocalRoad}
          onSave={handleSaveLocalRoad}
          onClose={() => {
            setShowLocalRoadForm(false);
            setEditingLocalRoad(null);
          }}
        />
      )}
      {idleCountdown > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-[#0ea5e9] mb-2">Session Expiring</h2>
            <p className="text-gray-600 mb-4">
              You have been inactive. You will be logged out in{' '}
              <span className="font-bold text-red-500">{idleCountdown}</span> seconds.
            </p>
            <p className="text-sm text-gray-500">Move your mouse or press a key to continue.</p>
          </div>
        </div>
      )}
    </div>
  );
}
