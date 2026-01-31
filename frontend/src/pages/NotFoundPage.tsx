import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-cream">
      <div className="text-center px-4">
        <h1 className="font-serif text-9xl font-bold text-rose/20">404</h1>
        <h2 className="heading-2 text-charcoal -mt-8 mb-4">Page Not Found</h2>
        <p className="text-warm-gray mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
          <Link to="/">
            <Button icon={<Home className="w-5 h-5" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
