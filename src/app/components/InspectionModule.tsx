import { useRef, useState } from 'react';
import { Plus, ClipboardCheck, Calendar, X } from 'lucide-react';
import { AutoGrowTextarea } from './ui/textarea';

interface Inspection {
  id: string;
  localRoadId: string;
  localRoadName: string;
  date: string;
  conditionRating: number;
  remarks: string;
  inspector: string;
}

interface InspectionModuleProps {
  inspections: Inspection[];
  localRoadList: any[];
  onAddInspection: (inspection: Omit<Inspection, 'id'>) => void;
  currentUser: string;
}

const inspectionFormTabs = [
  { id: 'project', label: 'Project Info' },
  { id: 'road', label: 'Road Info' },
  { id: 'inspection', label: 'Inspection Details' },
] as const;

export function InspectionModule({ inspections, localRoadList, onAddInspection, currentUser }: InspectionModuleProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<(typeof inspectionFormTabs)[number]['id']>('project');
  const formScrollRef = useRef<HTMLFormElement>(null);
  const projectSectionRef = useRef<HTMLElement>(null);
  const roadSectionRef = useRef<HTMLElement>(null);
  const inspectionSectionRef = useRef<HTMLElement>(null);
  const formSectionRefs = [projectSectionRef, roadSectionRef, inspectionSectionRef];
  const [attachmentName, setAttachmentName] = useState('No file chosen');
  const [conditionRatings, setConditionRatings] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    localRoadId: '',
    projectName: '',
    projectCategory: '',
    projectDescription: '',
    location: '',
    dateStarted: '',
    targetCompletionDate: '',
    noOfExtensions: '',
    actualCompletionDate: '',
    roadNetworkId: '',
    roadName: '',
    components: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    inspectionType: '',
    conditionRating: 'Good',
    remarks: '',
  });
  const moveToFormTab = (index: number) => {
    formSectionRefs[index].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveFormTab(inspectionFormTabs[index].id);
  };
  const updateActiveFormTab = () => {
    const scrollTop = formScrollRef.current?.getBoundingClientRect().top ?? 0;
    const currentIndex = formSectionRefs.reduce((current, sectionRef, index) => (
      sectionRef.current && sectionRef.current.getBoundingClientRect().top <= scrollTop + 110 ? index : current
    ), 0);
    setActiveFormTab(inspectionFormTabs[currentIndex].id);
  };

  const selectedProject = localRoadList.find(item => item.id === formData.localRoadId);
  const conditionRatingOptions = ['Good', 'Fair', 'Poor', 'Bad', 'N/A'];

  const handleConditionRatingChange = (rowLabel: string, value: string) => {
    setConditionRatings(prev => ({ ...prev, [rowLabel]: value }));
    setFormData(prev => ({ ...prev, conditionRating: value }));
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAttachmentName(file ? file.name : 'No file chosen');
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
      dateStarted: selected?.dateBuilt || '',
      targetCompletionDate: selected?.targetCompletionDate || '',
      noOfExtensions: selected?.noOfExtensions || '',
      actualCompletionDate: selected?.actualCompletionDate || '',
      roadNetworkId: selected?.roadNetworkId || '',
      roadName: selected?.roadName || selected?.name || '',
      components: selected?.components || '',
      description: selected?.description || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const localRoad = localRoadList.find(item => item.id === formData.localRoadId);
    if (localRoad) {
      onAddInspection({
        ...formData,
        conditionRating: formData.conditionRating === 'N/A' ? 0 : Number(formData.conditionRating),
        localRoadName: localRoad.name,
        inspector: currentUser,
      });
      setFormData({
        localRoadId: '',
        projectName: '',
        projectCategory: '',
        projectDescription: '',
        location: '',
        dateStarted: '',
        targetCompletionDate: '',
        noOfExtensions: '',
        actualCompletionDate: '',
        roadNetworkId: '',
        roadName: '',
        components: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        inspectionType: '',
        conditionRating: 'Good',
        remarks: '',
      });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#eef2f6] min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-blue-700">Inspection Results</h1>
          <button
            onClick={() => {
              setActiveFormTab('project');
              setShowForm(!showForm);
            }}
            className="bg-[#0ea5e9] text-white px-5 py-3 rounded-lg hover:bg-[#0284c7] transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Inspection
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[840px] h-[min(560px,calc(100vh-48px))] overflow-hidden border border-gray-200 relative flex flex-col">
              <div className="flex shrink-0 items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
                <div>
                  <h2 className="text-xl font-bold text-white">Encoding Inspection</h2>
                  <p className="text-sm text-blue-100">Municipal Engineering Office · Inspection Entry</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Close inspection form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex shrink-0 gap-2 overflow-x-auto border-b bg-slate-50 px-4 py-2" aria-label="Inspection form sections">
                {inspectionFormTabs.map((tab, index) => (
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

              <form ref={formScrollRef} onSubmit={handleSubmit} onScroll={updateActiveFormTab} className="form-modal-fields min-h-0 flex-1 overflow-y-auto p-4">
                <section ref={projectSectionRef} className="scroll-mt-4 border-b pb-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project / Program / Activity Name</label>
                      <select
                        value={formData.localRoadId}
                        onChange={(e) => handleProjectSelection(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent text-gray-900"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Category</label>
                      <input
                        type="text"
                        value={formData.projectCategory}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                    <textarea
                      value={formData.projectDescription}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Started</label>
                      <input
                        type="date"
                        value={formData.dateStarted}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion Date</label>
                      <input
                        type="date"
                        value={formData.targetCompletionDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">No. of Extensions</label>
                      <input
                        type="text"
                        value={formData.noOfExtensions}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Completion Date</label>
                      <input
                        type="date"
                        value={formData.actualCompletionDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                </section>

                <section ref={roadSectionRef} className="scroll-mt-4 border-b pb-6 pt-5">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Road Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Road Network ID No.</label>
                      <input
                        type="text"
                        value={formData.roadNetworkId}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Road Name</label>
                      <input
                        type="text"
                        value={formData.roadName}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Components</label>
                    <input
                      type="text"
                      value={formData.components}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      rows={2}
                    />
                  </div>
                </div>
                </section>

                <section ref={inspectionSectionRef} className="scroll-mt-4 pt-5">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspector Information</h3>
                  <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="border-r border-gray-300">
                        <label className="block px-4 pt-3 text-[1.05rem] font-bold text-gray-900">Inspection Date*</label>
                        <div className="p-3 bg-[#f3f4f6]">
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-base"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block px-4 pt-3 text-[1.05rem] font-bold text-gray-900">Inspection Type*</label>
                        <div className="p-3 bg-[#f3f4f6]">
                          <select
                            value={formData.inspectionType}
                            onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-base appearance-none"
                            required
                          >
                            <option value="">Select Type Acceptance Inspection</option>
                            <option value="Type Acceptance Inspection">Type Acceptance Inspection</option>
                            <option value="Routine Inspection">Routine Inspection</option>
                            <option value="Follow-up Inspection">Follow-up Inspection</option>
                            <option value="Initial Inspection">Initial Inspection</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Road Condition Assessment*</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                    <table className="w-full border-collapse text-left text-sm text-gray-800">
                      <thead>
                        <tr className="bg-[#1a1d3f] text-white">
                          <th className="border-r border-gray-300 px-3 py-3 font-semibold align-top w-1/4">Pavement Type / Road Elements</th>
                          <th className="border-r border-gray-300 px-3 py-3 font-semibold align-top w-1/4">Condition Rating</th>
                          <th className="px-3 py-3 font-semibold align-top w-1/2">Field Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: 'Concrete',
                            details: {
                              Good: 'Sound, even, and no cracks or scaling, normal speed ok at 70-80 kph.',
                              Fair: 'Even with very minimal hair-line cracks and very minimal surface wearing, normal speed ok at 50-60 kph.',
                              Poor: 'Slightly uneven with minor cracks (<=3mm. width) and wearing surface, joint sealant deterioration, normal speed ok at 30-40 kph.',
                              Bad: 'With major cracks, shattered slabs, joint deterioration and cut/slip, can only travel very slowly, normal speed ok at 20-30 kph.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Asphalt',
                            details: {
                              Good: 'Sound, well-shaped, even and waterproof, normal speed ok at 70-80 kph.',
                              Fair: 'Even with minor patches and very minimal wearing surface but still waterproof, normal speed ok at 50-60 kph.',
                              Poor: 'Very uneven and porous, with potholes and cracks (<=3mm. Width) normal speed 30-40 kph.',
                              Bad: 'Very broken up, rough, with base failures, edge break, can only travel very slowly, normal speed ok at 20-30 kph.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Gravel',
                            details: {
                              Good: 'Good shape and surface, does not hold water.',
                              Fair: 'Flat camber with minor potholes and holding some water.',
                              Poor: 'Depressions common, drainage impeded.',
                              Bad: 'Extensive ponding, water tends to flow on the road.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Earth',
                            details: {
                              Good: 'Good shape and surface, does not hold water.',
                              Fair: 'Flat camber with minor potholes and holding some water.',
                              Poor: 'Depressions common, drainage impeded.',
                              Bad: 'Extensive ponding, water tends to flow on the road, impassable when wet.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Shoulder',
                            details: {
                              Good: 'Adequate width, even surface and well maintained.',
                              Fair: 'Adequate width, slightly uneven, with few potholes, inadequate maintenance.',
                              Poor: 'Inadequate width, very uneven or with many edge break and no maintenance.',
                              Bad: 'No effective shoulders, very silted road edge and with plenty of vegetation.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Side Drain',
                            details: {
                              Good: 'Road edge well above side drains, well defined side drains, sufficient depth, sufficient side slopes to drain water.',
                              Fair: 'Road edge slightly level with side drains, not fully efficient side drains, water can cross the road.',
                              Poor: 'Road edge slightly below ground level, no side drains or totally blocked side drains, some ponding of water.',
                              Bad: 'Road edge well below ground level — road serving as a drain to surrounding areas.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          },
                          {
                            label: 'Sidewalk',
                            details: {
                              Good: 'Sufficient width, even surface, no vegetation, not holding water.',
                              Fair: 'Sufficient width, with minimal vegetation and slightly uneven.',
                              Poor: 'Insufficient width, with ponding of water, insufficient maintenance.',
                              Bad: 'No maintenance or no sidewalk.',
                              'N/A': 'Not applicable – type/element not present.'
                            }
                          }
                        ].map((row) => (
                          <tr key={row.label} className="border-t border-gray-300 align-top">
                            <td className="border-r border-gray-300 px-3 py-3 align-top font-medium">{row.label}</td>
                            <td className="border-r border-gray-300 px-3 py-3 align-top">
                              <div className="flex flex-col gap-3">
                                {conditionRatingOptions.map((option) => (
                                  <label key={`${row.label}-${option}`} className="flex items-center gap-2 text-gray-700">
                                    <input
                                      type="radio"
                                      name={`condition-${row.label}`}
                                      value={option}
                                      checked={conditionRatings[row.label] === option}
                                      onChange={() => handleConditionRatingChange(row.label, option)}
                                      className="h-4 w-4 text-[#0ea5e9]"
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top text-gray-700">
                              <div className="divide-y divide-gray-300 overflow-hidden border border-gray-300">
                                {conditionRatingOptions.map((option) => {
                                  const isSelected = conditionRatings[row.label] === option;
                                  return (
                                    <div
                                      key={`${row.label}-${option}`}
                                      className={isSelected ? 'bg-[#eaf9ff]' : 'bg-white'}
                                    >
                                      <div className="flex items-center justify-between px-2 py-2">
                                        <span className={`text-sm font-bold uppercase tracking-wide ${isSelected ? 'text-[#0ea5e9]' : 'text-gray-700'}`}>
                                          {option}
                                        </span>
                                        {isSelected && <span className="text-[10px] font-medium text-[#0ea5e9]">Selected</span>}
                                      </div>
                                      <p className="px-2 pb-2 text-sm leading-relaxed text-gray-700">
                                        {row.details[option as keyof typeof row.details]}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 text-xs text-gray-600">
                    <span className="font-medium">N/A: Not applicable – type/element not present.</span>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Findings*</h3>
                  <AutoGrowTextarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent text-gray-900 resize-y"
                    placeholder="Enter inspection findings..."
                    required
                  />
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachment*</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex cursor-pointer items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors min-w-[140px]">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleAttachmentChange}
                      />
                      Choose File
                    </label>
                    <span className="text-sm text-gray-700">{attachmentName}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">Supported File Formats: PDF, JPG, PNG | Max Size: 10 MB</p>
                </div>

                <div className="border-b pb-6 text-gray-900">
                  <p className="text-sm">Prepared by:</p>
                  <p className="font-bold uppercase">{currentUser}</p>
                  <p className="text-sm">Site Inspector</p>
                </div>
                </section>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Inspection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0ea5e9] mb-4">Inspection History</h2>
          <div className="space-y-3">
            {inspections.slice().reverse().map((inspection) => (
              <div key={inspection.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ClipboardCheck className="w-5 h-5 text-[#0ea5e9]" />
                      <h3 className="font-semibold text-[#0ea5e9]">{inspection.localRoadName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inspection.conditionRating >= 8 ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' :
                        inspection.conditionRating >= 5 ? 'bg-[#38bdf8]/10 text-[#38bdf8]' :
                        'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                      }`}>
                        Rating: {inspection.conditionRating}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {inspection.date}
                      </div>
                      <div>
                        Inspector: <span className="font-medium">{inspection.inspector}</span>
                      </div>
                    </div>
                    {inspection.remarks && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">
                        {inspection.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {inspections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No inspections recorded yet. Add your first inspection above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
