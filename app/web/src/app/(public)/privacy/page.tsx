export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-gray">
          <p className="text-gray-600 mb-4">
            Love Alarm uses your approximate location solely to detect when someone 
            you have expressed interest in is within your configured proximity range.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Location Data</h2>
          <p className="text-gray-600 mb-4">
            Your precise GPS coordinates are never stored permanently. Temporary location 
            data is used only for real-time proximity calculations and is automatically 
            deleted after a short retention period.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing</h2>
          <p className="text-gray-600 mb-4">
            We never share your exact location with other users. Other users can only 
            receive anonymous proximity notifications when you are nearby.
          </p>
        </div>
      </div>
    </div>
  )
}
