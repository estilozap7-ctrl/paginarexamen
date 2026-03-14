import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, Edit, Trash2, Search, User, 
  Mail, Shield, Key, X, Check,
  AlertCircle, Loader2, UserPlus, Fingerprint, Activity
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function UserManagement() {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cc: '',
    password: '',
    role_id: 2 // Default to COURSE_ADMIN/Docente
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/roles`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      setRoles(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar roles: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenModal = (targetUser = null) => {
    if (targetUser) {
      setEditingUser(targetUser);
      setFormData({
        full_name: targetUser.full_name,
        email: targetUser.email,
        cc: targetUser.cc,
        password: '', // Don't show password or allow changing it here for now (needs separate logic)
        role_id: targetUser.role_id,
        is_active: targetUser.is_active
      });
    } else {
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        cc: '',
        password: '',
        role_id: 2
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_URL}/admin/users/${editingUser.id}`, formData, {
          headers: { 
            'x-user-id': user.id,
            'x-user-role': user.role
          }
        });
      } else {
        await axios.post(`${API_URL}/admin/users`, formData, {
          headers: { 
            'x-user-id': user.id,
            'x-user-role': user.role
          }
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al guardar el usuario';
      alert(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { 
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });
      fetchUsers();
    } catch (err) {
      alert('Error al eliminar usuario');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cc.includes(searchTerm)
  );

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-unicordoba-dark flex items-center justify-center p-6">
        <div className="glass p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-unicordoba-dark text-white p-6 md:p-10 pt-12 md:pt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight mb-2">
              Gestión de <span className="text-unicordoba-primary">Usuarios</span>
            </h1>
            <p className="text-white/40 text-sm">Control de accesos y roles institucionales (Docentes y Estudiantes).</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-unicordoba-primary hover:bg-unicordoba-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-unicordoba-primary/20"
          >
            <UserPlus size={20} />
            NUEVO USUARIO
          </button>
        </div>

        {/* Search */}
        <div className="relative group mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-unicordoba-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o cédula..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-unicordoba-primary/20 focus:border-unicordoba-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* User Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-unicordoba-primary animate-spin mb-4" />
            <p className="text-white/40 animate-pulse">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Documento (CC)</th>
                    <th className="px-6 py-4">Rol / Privilegios</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-unicordoba-primary/10 flex items-center justify-center text-unicordoba-primary font-bold border border-unicordoba-primary/20">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{u.full_name}</p>
                            <p className="text-xs text-white/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white/40">{u.cc}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.Role?.name === 'ADMIN' ? 'bg-red-500/10 text-red-400' : 
                          u.Role?.name === 'COURSE_ADMIN' ? 'bg-blue-500/10 text-blue-400' : 
                          'bg-green-500/10 text-green-400'
                        }`}>
                          {u.Role?.name === 'COURSE_ADMIN' ? 'DOCENTE' : u.Role?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-white/60">{u.is_active ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(u)}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          {u.id !== user.id && (
                            <button 
                              onClick={() => handleDelete(u.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-unicordoba-dark/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative glass w-full max-w-lg overflow-hidden animate-slide-up">
              <div className="p-6 md:p-8 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingUser ? 'Editar' : 'Nuevo'} <span className="text-unicordoba-primary">Usuario</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input 
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-unicordoba-primary transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Cédula (CC)</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-unicordoba-primary transition-all"
                      value={formData.cc}
                      onChange={(e) => setFormData({...formData, cc: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Rol / Privilegios</label>
                    <select 
                      required
                      className="w-full bg-unicordoba-dark border border-white/10 rounded-xl p-3 outline-none focus:border-unicordoba-primary transition-all appearance-none cursor-pointer"
                      value={formData.role_id}
                      onChange={(e) => setFormData({...formData, role_id: parseInt(e.target.value)})}
                    >
                      <option value="" disabled className="bg-unicordoba-dark">Seleccione un rol</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id} className="bg-unicordoba-dark">
                          {r.name === 'COURSE_ADMIN' ? 'DOCENTE' : r.name}
                        </option>
                      ))}
                    </select>
                    {roles.length === 0 && (
                      <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold italic">No se pudieron cargar los roles. Intenta recargar la página.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Correo Institucional</label>
                  <input 
                    type="email" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-unicordoba-primary transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                    <input 
                      type="password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-unicordoba-primary transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-unicordoba-primary hover:bg-unicordoba-primary-dark rounded-xl font-bold transition-all"
                  >
                    {editingUser ? 'ACTUALIZAR' : 'CREAR USUARIO'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
