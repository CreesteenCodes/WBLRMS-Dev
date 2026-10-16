import { useState } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, ArrowLeft } from 'lucide-react';
import { AutoGrowTextarea } from './ui/textarea';

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

interface LocalRoadListProps {
  data: LocalRoad[];
  onAdd: () => void;
  onEdit: (item: LocalRoad) => void;
  onDelete: (id: string) => void;
  validationMode?: boolean;
  validatorName?: string;
  onSaveValidation?: (id: string, result: 'Validated' | 'Return for Revision', remarks: string) => void;
}

export function LocalRoadList({ data, onAdd, onEdit, onDelete, validationMode = false, validatorName = '', onSaveValidation }: LocalRoadListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [selectedItem, setSelectedItem] = useState<LocalRoad | null>(null);
  const [validationResult, setValidationResult] = useState<'Validated' | 'Return for Revision' | ''>('');
  const [validationRemarks, setValidationRemarks] = useState('');

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'All' || item.location === filterLocation;
    const matchesCondition = filterCondition === 'All' || item.condition === filterCondition;
    return matchesSearch && matchesLocation && matchesCondition;
  });

  const locations = [
    'All',
    'Anilao Proper',
    'Anilao East',
    'Bagalangit',
    'Bulacan',
    'Calamias',
    'Estrella',
    'Gasang',
    'Laurel',
    'Ligaya',
    'Mainaga',
    'Mainit',
    'Majuben',
    'Malimatoc I',
    'Malimatoc II',
    'Nag-Iba',
    'Pilahan',
    'Poblacion',
    'Pulang Lupa',
    'Pulong Anahao',
    'Pulong Balibaguhan',
    'Pulong Niogan',
    'Saguing',
    'Sampaguita',
    'San Francisco',
    'San Jose',
    'San Juan',
    'San Teodoro',
    'Santa Ana',
    'Santa Mesa',
    'Santo Niño',
    'Santo Tomas',
    'Solo',
    'Talaga Proper',
    'Talaga East',
  ];
  const conditions = ['All', 'Good', 'Fair', 'Poor'];

  if (selectedItem) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => {
            setSelectedItem(null);
            setValidationResult('');
            setValidationRemarks('');
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0ea5e9]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project Management
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#1a1d3f] px-6 py-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300">{validationMode ? 'Validation Details' : 'Project Details'}</p>
              <h1 className="text-2xl font-bold text-white mt-1">{selectedItem.name}</h1>
            </div>
            {!validationMode && <button
              onClick={() => onEdit(selectedItem)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#1a1d3f] rounded-lg hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Project / Program / Activity Name</p>
              <p className="mt-1 text-gray-800">{selectedItem.projectName || selectedItem.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Project Category</p>
              <p className="mt-1 text-gray-800">{selectedItem.projectCategory || selectedItem.type || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Project Description</p>
              <p className="mt-1 text-gray-800">{selectedItem.projectDescription || selectedItem.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</p>
              <p className="mt-1 flex items-center gap-2 text-gray-800"><MapPin className="w-4 h-4 text-[#0ea5e9]" />{selectedItem.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Barangay</p>
              <p className="mt-1 text-gray-800">{selectedItem.barangay || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Date Started</p>
              <p className="mt-1 text-gray-800">{selectedItem.dateBuilt || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Target Completion Date</p>
              <p className="mt-1 text-gray-800">{selectedItem.targetCompletionDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">No. of Extensions</p>
              <p className="mt-1 text-gray-800">{selectedItem.noOfExtensions || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actual Completion Date</p>
              <p className="mt-1 text-gray-800">{selectedItem.actualCompletionDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Road Network ID No.</p>
              <p className="mt-1 text-gray-800">{selectedItem.roadNetworkId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Road Name</p>
              <p className="mt-1 text-gray-800">{selectedItem.roadName || selectedItem.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Components</p>
              <p className="mt-1 text-gray-800">{selectedItem.components || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</p>
              <p className="mt-1 text-gray-800">{selectedItem.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contractor Name</p>
              <p className="mt-1 text-gray-800">{selectedItem.contractorName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contractor Address</p>
              <p className="mt-1 text-gray-800">{selectedItem.contractorAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contact Information</p>
              <p className="mt-1 text-gray-800">{selectedItem.contactInformation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">PCAD License No.</p>
              <p className="mt-1 text-gray-800">{selectedItem.pcadLicenseNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Source of Funds</p>
              <p className="mt-1 text-gray-800">{selectedItem.sourceOfFunds || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Appropriation</p>
              <p className="mt-1 text-gray-800">{selectedItem.appropriation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contracted Amount</p>
              <p className="mt-1 text-gray-800">{selectedItem.contractedAmount || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Adjusted Project Cost</p>
              <p className="mt-1 text-gray-800">{selectedItem.adjustProjectCost || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Completion Date</p>
              <p className="mt-1 text-gray-800">{selectedItem.completionDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Completion Percentage</p>
              <p className="mt-1 text-gray-800">{selectedItem.completionPercentage || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Turnover Date</p>
              <p className="mt-1 text-gray-800">{selectedItem.turnoverDate || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Attachments</p>
              <div className="mt-2 space-y-2">
                {selectedItem.attachments?.length ? selectedItem.attachments.map((attachment, index) => (
                  <div key={`${attachment.name}-${index}`} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{attachment.category}</span>
                    <a href={attachment.dataUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#0284c7] underline">
                      {attachment.name}
                    </a>
                  </div>
                )) : <p className="text-gray-800">No attachments available</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Condition</p>
              <p className="mt-1 text-gray-800">{selectedItem.condition || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Last Inspection</p>
              <p className="mt-1 text-gray-800">{selectedItem.lastInspection || 'N/A'}</p>
            </div>
            {validationMode && (
              <form
                className="md:col-span-2 border-t border-gray-200 pt-5 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!validationResult || !validationRemarks.trim()) return;
                  onSaveValidation?.(selectedItem.id, validationResult, validationRemarks);
                  setSelectedItem(null);
                }}
              >
                <fieldset>
                  <legend className="text-sm font-semibold text-gray-900">Validation Result<span className="text-red-600">*</span></legend>
                  <div className="mt-2 flex w-fit max-w-full flex-nowrap gap-6 overflow-x-auto">
                    {(['Validated', 'Return for Revision'] as const).map(result => (
                      <label key={result} className="inline-flex shrink-0 items-center gap-2 text-sm text-gray-800">
                        <input type="radio" name="validation-result" value={result} checked={validationResult === result} onChange={() => setValidationResult(result)} required className="h-4 w-4 accent-[#0ea5e9]" />
                        {result}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="validation-remarks" className="block text-sm font-semibold text-gray-900">Remarks<span className="text-red-600">*</span></label>
                  <AutoGrowTextarea id="validation-remarks" value={validationRemarks} onChange={event => setValidationRemarks(event.target.value)} required className="mt-2 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0ea5e9] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]" />
                </div>
                <div className="text-sm text-gray-800">
                  <p>Validated by:</p>
                  <p className="font-bold uppercase">{validatorName}</p>
                  <p>Validator</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setSelectedItem(null)} className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="rounded-md bg-[#0ea5e9] px-5 py-2 text-sm font-medium text-white hover:bg-[#0284c7]">
                    {validationResult === 'Return for Revision' ? 'Save' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-xl font-semibold tracking-tight text-blue-700">{validationMode ? 'Validation Management' : 'Road Management'}</h1>
        </div>
        {!validationMode && <button
          onClick={onAdd}
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:bg-[#0284c7] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Local Road
        </button>}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <AutoGrowTextarea
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              rows={2}
              className="w-full resize-y pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
            />
          </div>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
          >
            {locations.map(location => (
              <option key={location} value={location} className="text-gray-900 bg-white">
                Location: {location}
              </option>
            ))}
          </select>
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition} className="text-gray-900 bg-white">
                Condition: {condition}
              </option>
            ))}
          </select>
        </div>

        <div className={`overflow-x-auto ${validationMode ? '' : 'overflow-hidden rounded-xl border border-slate-200'}`}>
          <table className={validationMode ? 'w-full' : 'road-management-table w-full'}>
            <thead className={validationMode ? 'bg-gray-50 border-b border-gray-200' : 'bg-slate-50 border-b border-slate-200'}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {validationMode ? 'Name' : 'Road Project'}
                </th>
                {validationMode ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validation Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Built</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Inspection</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Road Classification</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Barangay</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Condition</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Inspection</th>
                  </>
                )}
                {!validationMode && <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id} className={validationMode ? 'hover:bg-gray-50' : 'hover:bg-slate-50'}>
                  {validationMode ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setValidationResult(item.validationResult || '');
                            setValidationRemarks(item.validationRemarks || '');
                          }}
                          className="font-medium text-[#0ea5e9] hover:underline text-left"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.validationResult === 'Validated' ? 'bg-green-100 text-green-800' :
                          item.validationResult === 'Return for Revision' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.validationResult || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.dateBuilt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.condition}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.lastInspection || 'N/A'}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <span className="w-5 shrink-0 text-slate-500">{filteredData.length - index}</span>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="text-left font-semibold text-slate-900 hover:text-blue-700"
                          >
                            {item.projectName || item.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="inline-flex rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm text-blue-800">
                          {item.projectCategory || item.type || 'Unclassified'}
                        </span>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          {item.barangay || item.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm ${
                          item.condition === 'Good' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          item.condition === 'Fair' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          'border-red-200 bg-red-50 text-red-700'
                        }`}>
                          {item.condition || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap text-sm text-slate-700">{item.lastInspection || 'N/A'}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex justify-center gap-5">
                          <button
                            onClick={() => onEdit(item)}
                            aria-label={`Edit ${item.projectName || item.name}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            aria-label={`Delete ${item.projectName || item.name}`}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No local road found matching your criteria.
            </div>
          )}
          {!validationMode && (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {filteredData.length} of {data.length} total registered road projects</span>
              <span className="font-medium text-blue-700">Municipality of Mabini, Batangas</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
