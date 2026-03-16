import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import ItemCard from "../components/ItemCard"
import MatchList from "../components/MatchList"

import {
  TrendingUp,
  AlertTriangle,
  Package,
  ArrowRight,
  Loader,
  CheckCircle,
} from "lucide-react"

export default function Dashboard(){

  const {user}=useAuth()

  const [myItems,setMyItems]=useState([])
  const [matches,setMatches]=useState([])
  const [recentLost,setRecentLost]=useState([])
  const [recentFound,setRecentFound]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    loadDashboard()
  },[])

  const loadDashboard=async()=>{

    try{

      const [itemsRes,matchRes,lostRes,foundRes]=await Promise.all([
        api.get('/items/my/items'),
        api.get('/matches'),
        api.get('/items/lost?limit=4'),
        api.get('/items/found?limit=4'),
      ])

      setMyItems(itemsRes.data.items||[])
      setMatches(matchRes.data.matches||[])
      setRecentLost(lostRes.data.items||[])
      setRecentFound(foundRes.data.items||[])

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  const myLostCount=myItems.filter(i=>i.type==='lost').length
  const myFoundCount=myItems.filter(i=>i.type==='found').length
  const strongMatches=matches.filter(m=>m.matchScore>60).length

  if(loading){
    return(
      <div className="flex justify-center items-center py-32">
        <Loader className="animate-spin"/>
      </div>
    )
  }

  return(

    <div className="page-container">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's what's happening with your lost & found items
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 section">

        <StatCard icon={AlertTriangle} label="Lost Reports" value={myLostCount} iconColor="text-red-600"/>
        <StatCard icon={CheckCircle} label="Found Reports" value={myFoundCount} iconColor="text-green-600"/>
        <StatCard icon={TrendingUp} label="Matches" value={strongMatches} iconColor="text-yellow-600"/>
        <StatCard icon={Package} label="Total Items" value={myItems.length} iconColor="text-gray-700"/>

      </div>

      {/* QUICK ACTIONS */}

      <div className="grid md:grid-cols-2 gap-6 section">

        <ActionCard
        to="/report-lost"
        icon={AlertTriangle}
        title="Report Lost Item"
        description="Lost something? Report it here"
        />

        <ActionCard
        to="/report-found"
        icon={CheckCircle}
        title="Report Found Item"
        description="Found something? Help return it"
        />

      </div>


      {/* MATCHES */}

      {matches.length>0 &&(

        <div className="section">

          <div className="flex justify-between mb-4">

            <h2 className="section-title flex items-center gap-2">
              <TrendingUp size={18}/>
              Matching Suggestions
            </h2>

          </div>

          <MatchList matches={matches.slice(0,5)}/>

        </div>

      )}


      {/* RECENT LOST */}

      <Section title="Recent Lost Items" link="/lost-items" items={recentLost}/>


      {/* RECENT FOUND */}

      <Section title="Recent Found Items" link="/found-items" items={recentFound}/>

    </div>

  )
}


/* COMPONENTS */

function StatCard({icon:Icon,label,value,iconColor}){

  return(

    <div className="card flex items-center gap-4">

      <Icon className={`w-6 h-6 ${iconColor}`}/>

      <div>

        <p className="text-xl font-semibold">{value}</p>

        <p className="text-sm text-gray-500">
          {label}
        </p>

      </div>

    </div>

  )
}


function ActionCard({to,icon:Icon,title,description}){

  return(

    <Link
      to={to}
      className="card card-hover flex items-center gap-4"
    >

      <Icon className="w-6 h-6 text-gray-700"/>

      <div className="flex-1">

        <h3 className="font-semibold">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>

      </div>

      <ArrowRight className="w-5 h-5 text-gray-400"/>

    </Link>

  )
}


function Section({title,link,items}){

  return(

    <div className="section">

      <div className="flex justify-between mb-4">

        <h2 className="section-title">{title}</h2>

        <Link
        to={link}
        className="text-sm text-gray-600 flex items-center gap-1"
        >

          View all

          <ArrowRight size={16}/>

        </Link>

      </div>

      {items.length>0?(
        <div className="item-grid">

          {items.map(item=>(
            <ItemCard key={item._id} item={item}/>
          ))}

        </div>
      ):(

        <div className="card text-center py-12">

          <Package className="mx-auto mb-2 text-gray-300"/>

          <p className="text-gray-400 text-sm">
            No items reported yet
          </p>

        </div>

      )}

    </div>

  )

}