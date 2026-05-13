import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import ItemCard from "../components/ItemCard"
import MatchList from "../components/MatchList"

import {
  ArrowRight,
  Loader,
  CheckCircle,
  Inbox,
  AlertTriangle
} from "lucide-react"

export default function Dashboard(){

  const {user} = useAuth()

  const [myItems, setMyItems] = useState([])
  const [matches, setMatches] = useState([])
  const [recentLost, setRecentLost] = useState([])
  const [recentFound, setRecentFound] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [itemsRes, matchRes, lostRes, foundRes] = await Promise.all([
        api.get('/items/my/items'),
        api.get('/matches'),
        api.get('/items/lost?limit=6'),
        api.get('/items/found?limit=6'),
      ])

      setMyItems(itemsRes.data.items || [])
      setMatches(matchRes.data.matches || [])
      setRecentLost(lostRes.data.items || [])
      setRecentFound(foundRes.data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const strongMatches = matches.filter(m => m.matchScore > 60).length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="page-container pt-24 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/lost-items" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <p className="text-3xl font-bold text-amber-600">{myItems.filter(i => i.type === 'lost').length}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Lost Items</p>
          </Link>
          <Link to="/found-items" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <p className="text-3xl font-bold text-emerald-600">{myItems.filter(i => i.type === 'found').length}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Found Items</p>
          </Link>
          <Link to="/dashboard" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <p className="text-3xl font-bold text-blue-600">{strongMatches}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Matches</p>
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-3xl font-bold text-gray-900">{myItems.length}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Total Items</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 mb-3">Quick filters</p>
          <div className="flex flex-wrap gap-2">
            {['All', 'Electronics', 'Wallet', 'Phone', 'Bag', 'Keys', 'ID Card', 'Clothing', 'Books'].map((cat) => (
              <Link
                key={cat}
                to={cat === 'All' ? '/lost-items' : `/lost-items?category=${cat.toLowerCase().replace(' ', '')}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/report-lost"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white border-2 border-gray-900 rounded-xl text-gray-900 font-semibold text-sm transition-all duration-200 hover:bg-gray-900 hover:text-white active:scale-[0.98]"
          >
            <AlertTriangle size={20} />
            Report Lost Item
            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100" />
          </Link>

          <Link
            to="/report-found"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white border-2 border-gray-900 rounded-xl text-gray-900 font-semibold text-sm transition-all duration-200 hover:bg-gray-900 hover:text-white active:scale-[0.98]"
          >
            <CheckCircle size={20} />
            Report Found Item
            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100" />
          </Link>
        </div>

        {matches.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Matching Suggestions</h2>
            </div>
            <MatchList matches={matches.slice(0, 5)} />
          </div>
        )}

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Lost Items</h2>
            <Link
              to="/lost-items"
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentLost.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
              {recentLost.slice(0, 4).map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl py-12 text-center col-span-full">
              <Search className="mx-auto mb-2 text-gray-300 w-10 h-10" />
              <p className="text-gray-400 text-sm">No lost items reported yet</p>
              <Link
                to="/report-lost"
                className="text-sm text-gray-900 font-medium mt-2 inline-block hover:underline"
              >
                Report a lost item
              </Link>
            </div>
          )}
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Found Items</h2>
            <Link
              to="/found-items"
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentFound.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
              {recentFound.slice(0, 4).map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl py-12 text-center col-span-full">
              <Inbox className="mx-auto mb-2 text-gray-300 w-10 h-10" />
              <p className="text-gray-400 text-sm">No found items reported yet</p>
              <Link
                to="/report-found"
                className="text-sm text-gray-900 font-medium mt-2 inline-block hover:underline"
              >
                Report a found item
              </Link>
            </div>
          )}
        </div>

        </div>
    </div>
  )
}