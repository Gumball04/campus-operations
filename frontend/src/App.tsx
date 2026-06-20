import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Recommendations from './pages/Recommendations'

export default function App(){
  return (
    <div className="p-4">
      <nav className="mb-4">
        <Link to="/">Dashboard</Link> | <Link to="/students">Students</Link> | <Link to="/recommendations">Recommendations</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/students" element={<Students/>} />
        <Route path="/recommendations" element={<Recommendations/>} />
      </Routes>
    </div>
  )
}
