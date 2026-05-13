import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Package, Search, Filter, Trash2, 
  MapPin, Calendar, User, CheckCircle, 
  XCircle, MoreHorizontal, Loader,
  AlertTriangle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminItems({ type }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, [type, statusFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/items`, {
        params: { 
            type,
            status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      setItems(res.data.items);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
        await api.patch(`/admin/items/${id}/status`, { status: newStatus });
        setItems(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
        alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
        await api.delete(`/admin/items/${id}`);
        setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
        alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${type} items...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {['all', 'active', 'resolved', 'claimed', 'expired'].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                        px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                        ${statusFilter === status 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}
                    `}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
            <div className="relative h-48 bg-gray-100">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Package size={48} />
                        <span className="text-[10px] font-bold uppercase mt-2">No Image Provided</span>
                    </div>
                )}
                <div className={`
                    absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md
                    ${type === 'lost' ? 'bg-red-500' : 'bg-emerald-500'}
                `}>
                    {type}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <Link 
                        to={`/item/${item._id}`}
                        className="p-2 bg-white/90 backdrop-blur rounded-lg text-gray-700 hover:bg-white transition-colors shadow-sm"
                    >
                        <ExternalLink size={14} />
                    </Link>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={14} className="text-gray-400" />
                        <span className="truncate">{item.reportedBy?.name} ({item.reportedBy?.email})</span>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-2">
                        {item.status === 'active' ? (
                            <button 
                                onClick={() => handleStatusUpdate(item._id, 'resolved')}
                                className="flex items-center gap-1.5 px-3 py-2 bg-black text-white rounded-xl text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                <CheckCircle size={12} /> Mark Resolved
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleStatusUpdate(item._id, 'active')}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold uppercase hover:bg-gray-200 transition-colors"
                            >
                                <XCircle size={12} /> Reactivate
                            </button>
                        )}
                        <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Delete Report"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className={`
                        px-2 py-1 rounded-lg text-[10px] font-black uppercase
                        ${item.status === 'active' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}
                    `}>
                        {item.status}
                    </div>
                </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && !loading && (
            <div className="col-span-full p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Package size={64} className="mx-auto mb-4 text-gray-100" />
                <h4 className="text-lg font-bold text-gray-900">No {type} reports found</h4>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
        )}
      </div>
    </div>
  );
}
