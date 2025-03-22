import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import TicketBilling from './components/TicketBilling'
import LockerBilling from './components/LockerBilling'
import ReturnLocker from './components/ReturnLocker'
import CostumeBilling from './components/CostumeBilling'
import ReturnCostume from './components/ReturnCostume'
import BillHistory from './components/BillHistory'
import Profile from './components/Profile'
import LockerStock from './components/LockerStock'
import AddLocker from './components/AddLocker'
import CostumeStock from './components/CostumeStock'
import SignIn from './components/SignIn'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const App = (): JSX.Element => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/signin" element={<SignIn />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ticket-billing" element={<TicketBilling />} />
            <Route path="/locker-billing" element={<LockerBilling />} />
            <Route path="/return-locker" element={<ReturnLocker />} />
            <Route path="/costume-billing" element={<CostumeBilling />} />
            <Route path="/return-costume" element={<ReturnCostume />} />
            <Route path="/bill-history" element={<BillHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/locker" element={<LockerStock />} />
            <Route path="/add-locker" element={<AddLocker />} />
            <Route path="/costume" element={<CostumeStock />} />
          </Route>

          {/* Redirect any unknown routes to signin */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
