import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
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
const App = (): JSX.Element => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-6 flex-1 overflow-y-auto">
          <Routes>
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
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
