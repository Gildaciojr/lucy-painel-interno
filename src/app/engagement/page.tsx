import EngagementMetrics from "../../components/EngagementMetrics";

export default function EngagementPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Painel Interno de Gestão
        </h1>
        <p className="text-gray-500">Métricas e engajamento</p>
      </header>
      <main className="flex-1 container mx-auto">
        <EngagementMetrics />
      </main>
    </div>
  );
}
