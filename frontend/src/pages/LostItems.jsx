import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../services/api"
import ItemCard from "../components/ItemCard"
import SearchBar from "../components/SearchBar"
import { AlertTriangle, Loader, Package, ChevronLeft, ChevronRight } from "lucide-react"

export default function LostItems() {

  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  })

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    color: searchParams.get("color") || "",
    sort: "newest",
    page: 1,
  })


  useEffect(()=>{
    fetchItems()
  },[filters])


  const fetchItems = async () => {

    setLoading(true)

    try{

      const params = new URLSearchParams()

      if(filters.search) params.set("search",filters.search)
      if(filters.category) params.set("category",filters.category)
      if(filters.color) params.set("color",filters.color)
      if(filters.sort) params.set("sort",filters.sort)

      params.set("page",filters.page)

      const res = await api.get(`/items/lost?${params.toString()}`)

      setItems(res.data.items || [])
      setPagination(res.data.pagination || { page:1, pages:1, total:0 })

    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }


  return (

    <div className="min-h-screen bg-gray-50 pt-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* HEADER */}

      <div className="flex items-center gap-4 mb-8">

        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-600"/>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost Items</h1>
          <p className="text-sm text-gray-500">
            {pagination.total} items reported lost
          </p>
        </div>

      </div>


      {/* SEARCH */}

      <SearchBar filters={filters} onFilterChange={setFilters} />


      {/* ITEMS */}

      {loading ? (

        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-gray-800"/>
        </div>

      ) : items.length > 0 ? (

        <>
          <div className="grid gap-5">

            {items.map(item=>(
              <ItemCard key={item._id} item={item} variant="compact"/>
            ))}

          </div>


          {/* PAGINATION */}

          {pagination.pages > 1 && (

            <div className="flex items-center justify-center gap-3 mt-10">

              <button
                onClick={()=>setFilters({...filters,page:filters.page-1})}
                disabled={filters.page<=1}
                className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5"/>
              </button>


              <span className="text-sm px-4 text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>


              <button
                onClick={()=>setFilters({...filters,page:filters.page+1})}
                disabled={filters.page>=pagination.pages}
                className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5"/>
              </button>

            </div>

          )}

        </>

      ) : (

        <div className="card text-center py-20">

          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300"/>

          <h3 className="text-lg font-semibold mb-1 text-gray-700">
            No items found
          </h3>

          <p className="text-sm text-gray-400">
            Try adjusting your search or filters
          </p>

        </div>

)}

      </div>

    </div>

  )
}