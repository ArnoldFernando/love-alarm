import Link from "next/link"
import { Heart, MapPin, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xl">
          <Heart className="h-6 w-6 fill-current" />
          <span>Love Alarm</span>
        </div>
        <Link href="/login">
          <Button variant="outline">Admin Login</Button>
        </Link>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 text-rose-600 mb-8">
            <Heart className="h-10 w-10 fill-current" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Love is Closer Than You Think
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Express your feelings secretly. When someone you like is nearby, 
            your Love Alarm will ring. Real connections, real proximity, real privacy.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                Get Started
              </Button>
            </Link>
            <Link href="/privacy">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="Proximity Based"
            description="Only know when someone you like is nearby. Exact locations are never shared."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Privacy First"
            description="Your exact location is never stored permanently or exposed to other users."
          />
          <FeatureCard
            icon={<MessageCircle className="h-6 w-6" />}
            title="Match & Chat"
            description="When the feeling is mutual, start chatting instantly and securely."
          />
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <div className="flex gap-6 justify-center mb-4">
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
        </div>
        <p> Love Alarm. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
