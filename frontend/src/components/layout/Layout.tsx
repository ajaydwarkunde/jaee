import { Outlet } from 'react-router-dom'
import GeoSiteSchema from '@/components/seo/GeoSiteSchema'
import RouteSeo from '@/components/seo/RouteSeo'
import Header from './Header'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import WhatsAppWidget from './WhatsAppWidget'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <GeoSiteSchema />
      <RouteSeo />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
