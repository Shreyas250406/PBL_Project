import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import LostItems from './pages/LostItems'
import FoundItems from './pages/FoundItems'
import ItemDetail from './pages/ItemDetail'
import AdminPanel from './pages/AdminPanel'

import { Loader } from 'lucide-react'


function LoadingScreen(){
  return(
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin"/>
    </div>
  )
}


function ProtectedRoute({children}){
  const {user,loading}=useAuth()

  if(loading) return <LoadingScreen/>

  if(!user) return <Navigate to="/login"/>

  return children
}


function AdminRoute({children}){
  const {user,loading,isAdmin}=useAuth()

  if(loading) return <LoadingScreen/>

  if(!user) return <Navigate to="/login"/>

  if(!isAdmin) return <Navigate to="/dashboard"/>

  return children
}


export default function App(){

  const {user,loading}=useAuth()

  if(loading) return <LoadingScreen/>

  return(

    <div className="min-h-screen">

      {user && <Navbar/>}

      <main className="main-content">

        <Routes>

          <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <Login/>}/>
          <Route path="/register" element={user ? <Navigate to="/dashboard"/> : <Register/>}/>

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/report-lost" element={<ProtectedRoute><ReportLost/></ProtectedRoute>}/>
          <Route path="/report-found" element={<ProtectedRoute><ReportFound/></ProtectedRoute>}/>

          <Route path="/lost-items" element={<ProtectedRoute><LostItems/></ProtectedRoute>}/>
          <Route path="/found-items" element={<ProtectedRoute><FoundItems/></ProtectedRoute>}/>

          <Route path="/item/:id" element={<ProtectedRoute><ItemDetail/></ProtectedRoute>}/>

          <Route path="/admin" element={<AdminRoute><AdminPanel/></AdminRoute>}/>

          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"}/>}/>

        </Routes>

      </main>

    </div>

  )
}