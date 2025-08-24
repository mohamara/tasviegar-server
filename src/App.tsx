import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Debts from './pages/Debts'
import Groups from './pages/Groups'
import Notifications from './pages/Notifications'
import Test from './pages/Test'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
