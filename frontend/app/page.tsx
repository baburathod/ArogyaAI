export default function Page() {
  return (
    <section className="max-w-5xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold">Welcome to ArogyaAI</h1>
        <p className="mt-2 text-sm text-[#1b3d2a]">Phase 1: Foundation & Frontend Architecture</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold">Diagnosis</h2>
          <p className="text-sm text-[#234a33]">Quick triage and explainable AI response.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">Health Records</h2>
          <p className="text-sm text-[#234a33]">Local-first personal health records for offline use.</p>
        </div>
      </div>
    </section>
  );
}
