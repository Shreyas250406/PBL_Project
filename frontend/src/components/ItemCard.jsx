import { Link } from "react-router-dom"
import { MapPin, Calendar, ImageOff, UserCheck, Clock } from "lucide-react"

const API_BASE = ""

export default function ItemCard({ item, variant="default" }) {

  const isClaimed = item.status === 'claimed';
  const daysRemaining = item.autoDeleteAt
    ? Math.max(0, Math.ceil((new Date(item.autoDeleteAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

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



  /* DEFAULT CARD (Dashboard + Found Items) */

  return(

    <Link
      to={`/item/${item._id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition relative"
    >

      {/* Claimed overlay badge */}
      {isClaimed && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(254, 243, 199, 0.95)', color: '#92400e', backdropFilter: 'blur(4px)', border: '1px solid #f59e0b' }}>
          <UserCheck size={12} />
          Claimed
        </div>
      )}

      <div className="h-40 bg-gray-100 overflow-hidden relative">

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

        {/* Countdown timer for claimed items */}
        {isClaimed && daysRemaining !== null && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: '#ffffff',
            }}>
            <Clock size={11} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>
              {daysRemaining > 0
                ? `${daysRemaining}d left to dispute`
                : 'Dispute window closed'}
            </span>
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

        {/* Claimed by info */}
        {isClaimed && item.claimedBy && (
          <div className="flex items-center gap-1.5 pt-1 text-xs"
            style={{ color: '#92400e' }}>
            <UserCheck size={11} />
            <span className="font-medium">Claimed by {item.claimedBy?.name || 'someone'}</span>
          </div>
        )}

      </div>

    </Link>

  )

}