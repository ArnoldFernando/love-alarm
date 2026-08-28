export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-gray">
          <p className="text-gray-600 mb-4">
            By using Love Alarm, you agree to use the service responsibly and 
            respect the privacy and boundaries of other users.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Acceptable Use</h2>
          <p className="text-gray-600 mb-4">
            Users must not use the proximity features to stalk, harass, or track 
            other individuals. Abuse of the platform will result in account suspension.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Safety</h2>
          <p className="text-gray-600 mb-4">
            Always prioritize your personal safety when meeting people through the app. 
            Meet in public places and inform friends or family of your plans.
          </p>
        </div>
      </div>
    </div>
  )
}
