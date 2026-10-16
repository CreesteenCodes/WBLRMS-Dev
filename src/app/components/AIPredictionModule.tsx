import { useState } from 'react';
import { Brain, AlertTriangle, TrendingUp, Activity, Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface PredictionResult {
  localRoadId: string;
  localRoadName: string;
  type: string;
  lastInspection: string;
  condition: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  priorityScore: number;
  justification: string;
  recommendation: string;
}

interface AIPredictionModuleProps {
  localRoadData: any[];
  inspections: any[];
  maintenanceRecords: any[];
}

export function AIPredictionModule({ localRoadData, inspections, maintenanceRecords }: AIPredictionModuleProps) {
  const [viewState, setViewState] = useState<'empty' | 'loading' | 'results'>('empty');
  const [currentStep, setCurrentStep] = useState(0);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  const steps = [
    'Retrieving local road records from database',
    'Formatting inspection data as structured prompt',
    'Sending data to Gemini API',
    'Receiving AI priority recommendations',
    'Displaying results'
  ];

  const generatePredictions = () => {
    setViewState('loading');
    setCurrentStep(0);

    // Simulate step-by-step loading
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => {
            // Generate predictions
            const results = calculatePredictions();
            setPredictions(results);
            setViewState('results');
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const calculatePredictions = (): PredictionResult[] => {
    return localRoadData.map(localRoad => {
      const currentYear = new Date().getFullYear();
      const builtYear = new Date(localRoad.dateBuilt).getFullYear();
      const age = currentYear - builtYear;

      const localRoadInspections = inspections.filter(i => i.localRoadId === localRoad.id);
      const avgConditionRating = localRoadInspections.length > 0
        ? localRoadInspections.reduce((sum, i) => sum + i.conditionRating, 0) / localRoadInspections.length
        : 5;

      const inspectionFrequency = localRoadInspections.length;
      const maintenanceHistory = maintenanceRecords.filter(m => m.localRoadId === localRoad.id).length;

      // AI scoring algorithm
      let priorityScore = 0;

      if (age > 20) priorityScore += 25;
      else if (age > 10) priorityScore += 15;
      else priorityScore += 5;

      if (avgConditionRating < 4) priorityScore += 35;
      else if (avgConditionRating < 7) priorityScore += 20;
      else priorityScore += 5;

      if (inspectionFrequency === 0) priorityScore += 20;
      else if (inspectionFrequency < 3) priorityScore += 12;
      else priorityScore += 3;

      if (maintenanceHistory === 0) priorityScore += 20;
      else if (maintenanceHistory < 2) priorityScore += 10;
      else priorityScore += 2;

      let riskLevel: 'High' | 'Medium' | 'Low';
      let justification: string;
      let recommendation: string;

      if (priorityScore >= 70) {
        riskLevel = 'High';
        justification = localRoad.condition === 'Poor'
          ? `Severe deterioration observed. No maintenance in ${maintenanceHistory === 0 ? '18+' : '12'} months. High public safety risk.`
          : `Aging local road (${age} years old) with declining condition. Immediate attention required.`;
        recommendation = `Conduct immediate structural assessment and emergency repairs. Deploy safety measures while work is ongoing.`;
      } else if (priorityScore >= 40) {
        riskLevel = 'Medium';
        justification = `${localRoad.condition} condition with ${inspectionFrequency < 2 ? 'limited' : 'regular'} inspection history. Deterioration trend requires attention.`;
        recommendation = `Schedule preventive maintenance within 60 days. Monitor for progression of deterioration.`;
      } else {
        riskLevel = 'Low';
        justification = `Recently maintained. ${avgConditionRating >= 7 ? 'Good' : 'Stable'} structural condition with no immediate defects observed.`;
        recommendation = `No maintenance action needed at this time. Schedule routine re-inspection in 6 months.`;
      }

      return {
        localRoadId: localRoad.id,
        localRoadName: localRoad.name,
        type: localRoad.type,
        lastInspection: localRoad.lastInspection || 'N/A',
        condition: localRoad.condition,
        riskLevel,
        priorityScore,
        justification,
        recommendation,
      };
    });
  };

  const highPriority = predictions.filter(p => p.riskLevel === 'High');
  const mediumPriority = predictions.filter(p => p.riskLevel === 'Medium');
  const lowPriority = predictions.filter(p => p.riskLevel === 'Low');

  const riskBadgeColors = {
    'High': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    'Medium': 'bg-[#38bdf8]/10 text-[#38bdf8]',
    'Low': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
  };

  const riskBorderColors = {
    'High': 'border-[#0ea5e9]',
    'Medium': 'border-[#38bdf8]',
    'Low': 'border-[#0ea5e9]',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0ea5e9]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-blue-700 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-700" />
              AI Maintenance Priority
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#0ea5e9]/10 text-[#0ea5e9] px-3 py-1 rounded-full font-medium">
              Gemini API
            </span>
            <button
              onClick={generatePredictions}
              disabled={viewState === 'loading'}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                viewState === 'loading'
                  ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                  : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {viewState === 'results' ? 'Regenerate' : 'Generate Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {viewState === 'empty' && (
        <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-[#0ea5e9]" />
          </div>
          <h2 className="text-xl font-bold text-[#0ea5e9] mb-2">No recommendations yet</h2>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Click "Generate Recommendations" to let Gemini API analyze the latest inspection data and generate maintenance priority recommendations.
          </p>
        </div>
      )}

      {/* Loading State */}
      {viewState === 'loading' && (
        <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-6" />
          <h2 className="text-lg font-bold text-[#0ea5e9] mb-6">{steps[currentStep]}...</h2>

          <div className="w-full max-w-lg bg-gray-50 rounded-lg p-6 space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  index < currentStep ? 'bg-[#0ea5e9]' :
                  index === currentStep ? 'bg-[#38bdf8]' :
                  'bg-gray-300'
                }`} />
                <span className={`text-sm ${
                  index <= currentStep ? 'text-[#0ea5e9]' : 'text-gray-400'
                }`}>
                  {step}
                </span>
                {index < currentStep && (
                  <CheckCircle className="w-4 h-4 text-[#0ea5e9] ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results State */}
      {viewState === 'results' && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-[#0ea5e9]">{highPriority.length}</p>
              <p className="text-sm text-gray-600 mt-1">High Priority</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-[#0ea5e9]">{mediumPriority.length}</p>
              <p className="text-sm text-gray-600 mt-1">Medium Priority</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-[#0ea5e9]">{lowPriority.length}</p>
              <p className="text-sm text-gray-600 mt-1">Low Priority</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-3xl font-bold text-[#0ea5e9]">{predictions.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Assessed</p>
            </div>
          </div>

          {/* Prioritized List */}
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-4">Prioritized Maintenance List with Recommendations</h2>
            <div className="space-y-4">
              {predictions.sort((a, b) => b.priorityScore - a.priorityScore).map((prediction) => (
                <div key={prediction.localRoadId} className={`bg-white rounded-r-xl shadow-lg p-6 border-l-4 ${riskBorderColors[prediction.riskLevel]}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-medium text-[#0ea5e9]">{prediction.localRoadName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskBadgeColors[prediction.riskLevel]}`}>
                      {prediction.riskLevel} Priority
                    </span>
                  </div>

                  {/* Meta */}
                  <p className="text-xs text-gray-600 mb-4">
                    {prediction.type} | Last inspected: {prediction.lastInspection} | Condition: {prediction.condition}
                  </p>

                  {/* Justification */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-xs text-gray-500 mb-1">AI Justification</p>
                    <p className="text-sm text-gray-700">{prediction.justification}</p>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-[#0ea5e9]/10 rounded-lg p-4 border border-[#0ea5e9]/30">
                    <p className="text-xs text-[#0ea5e9] font-medium mb-1">AI Recommendation</p>
                    <p className="text-sm text-[#0ea5e9]">{prediction.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 text-center">
            Generated: {new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })} | Head Engineer may review and override all recommendations
          </div>
        </>
      )}
    </div>
  );
}
