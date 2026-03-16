import { Link } from "react-router-dom"
import { MapPin, Calendar, ImageOff } from "lucide-react"

const API_BASE = ""

export default function ItemCard({ item, variant="default" }) {


  /* COMPACT CARD (Lost / Found pages) */

  if(variant==="compact"){

    return(

      <Link
        to={`/item/${item._id}`}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex"
      >

        {/* IMAGE */}

        <div className="w-36 h-28 bg-gray-100 flex-shrink-0 overflow-hidden">

          {item.imageUrl ? (
            <img
              src={`${API_BASE}${item.imageUrl}`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ):(
            <div className="flex items-center justify-center h-full text-gray-400">
              <ImageOff size={20}/>
            </div>
          )}

        </div>


        {/* CONTENT */}

        <div className="p-4 flex flex-col justify-between flex-1">

          <div className="flex justify-between items-start">

            <h3 className="font-semibold text-gray-900 text-sm">
              {item.name}
            </h3>

            {item.color && (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                {item.color}
              </span>
            )}

          </div>


          <p className="text-xs text-gray-500 line-clamp-2">
            {item.description}
          </p>


          <div className="flex justify-between text-xs text-gray-400 pt-2">

            <div className="flex items-center gap-1">
              <MapPin size={12}/>
              {item.location}
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={12}/>
              {new Date(item.date).toLocaleDateString()}
            </div>

          </div>

        </div>

      </Link>

    )

  }



  /* DEFAULT CARD (Dashboard) */

  return(

    <Link
      to={`/item/${item._id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
    >

      <div className="h-40 bg-gray-100 overflow-hidden">

        {item.imageUrl ? (
          <img
            src={`${API_BASE}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ):(
          <div className="flex items-center justify-center h-full text-gray-400">
            <ImageOff size={26}/>
          </div>
        )}

      </div>


      <div className="p-4 space-y-2">

        <h3 className="font-semibold">
          {item.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between text-xs text-gray-400 pt-2">

          <div className="flex items-center gap-1">
            <MapPin size={12}/>
            {item.location}
          </div>

          <div className="flex items-center gap-1">
            <Calendar size={12}/>
            {new Date(item.date).toLocaleDateString()}
          </div>

        </div>

      </div>

    </Link>

  )

}