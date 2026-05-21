import AIForm from './AIForm';
import EmergencyForm from './EmergencyForm';
import RiskAssessmentForm from './RiskAssessmentForm';
import MedicationForm from './MedicationForm';
import AssistantChat from './AssistantChat';
import VoiceAssistant from './VoiceAssistant';
import WellnessReport from './WellnessReport';

export default function AIWorkflow() {
  return (
    <div className="space-y-8">
      <section className="card">
        <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
          <div>
            <p className="text-sm text-arogya-700">AI Healthcare Workflows</p>
            <h1 className="text-3xl font-semibold text-[#0c2e1e]">Phase 5: Voice-Enabled Healthcare AI</h1>
            <p className="mt-2 text-sm text-[#3a5d42]">
              Use multilingual speech recognition, AI voice responses, and accessible healthcare voice workflows.
            </p>
          </div>
        </div>
      </section>

      <AIForm />
      <EmergencyForm />
      <RiskAssessmentForm />
      <MedicationForm />
      <AssistantChat />
      <VoiceAssistant />
      <WellnessReport />
    </div>
  );
}
