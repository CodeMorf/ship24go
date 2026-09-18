import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  KeyRound,
  Mail,
  Phone,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  X,
  ChevronRight,
  Filter,
  Link2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../lib/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  role: string;
  role_id?: string;
  role_name?: string;
  status: string;
  assigned_hub_id?: string | null;
  permissions: string[];
  created_at?: string;
}

interface RoleItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  is_system: number | boolean;
}

const AVAILABLE_PERMISSIONS = [
  {
    category: 'Módulos Principales',
    permissions: [
      { key: 'dashboard.view', label: 'Dashboard & Métricas', desc: 'Acceso a estadísticas y métricas generales' },
      { key: 'reports.view', label: 'Reportes Analíticos', desc: 'Ver y exportar reportes operacionales' },
      { key: 'settings.manage', label: 'Configuraciones Generales', desc: 'Configurar crons, parámetros y logs' },
      { key: 'copilot.use', label: 'Asistente IA Copilot', desc: 'Uso del copiloto inteligente' }
    ]
  },
  {
    category: 'Clientes & Cuentas',
    permissions: [
      { key: 'clients.view', label: 'Ver Clientes', desc: 'Listado y detalles de clientes' },
      { key: 'clients.manage', label: 'Gestionar Clientes', desc: 'Recargar saldo, cambiar estados y deudas' }
    ]
  },
  {
    category: 'Envíos & Logística',
    permissions: [
      { key: 'shipments.view', label: 'Ver Envíos', desc: 'Historial, estados y trazabilidad' },
      { key: 'shipments.manage', label: 'Gestionar Envíos', desc: 'Reintentar etiquetas y cancelaciones' },
      { key: 'providers.view', label: 'Ver Proveedores', desc: 'Ver transportistas y servicios' },
      { key: 'providers.manage', label: 'Configurar Proveedores', desc: 'Credenciales y márgenes de tarifas' },
      { key: 'integrations.manage', label: 'Integraciones de Tiendas', desc: 'Shopify, WooCommerce, etc.' }
    ]
  },
  {
    category: 'Finanzas & Pasarelas',
    permissions: [
      { key: 'banks.manage', label: 'Bancos & Comprobantes', desc: 'Aprobar transferencias y cuentas bancarias' },
      { key: 'payments.manage', label: 'Pasarelas de Pago', desc: 'Credenciales de Polar, PayPal y Webhooks' },
      { key: 'plans.manage', label: 'Planes & Membresías', desc: 'Planes de suscripción y descuentos' }
    ]
  },
  {
    category: 'Soporte & Tickets',
    permissions: [
      { key: 'tickets.view', label: 'Ver Tickets', desc: 'Consultar tickets enviados por clientes' },
      { key: 'tickets.reply', label: 'Responder Tickets', desc: 'Enviar respuestas y resolver solicitudes' }
    ]
  },
  {
    category: 'Hubs & Centros Logísticos',
    permissions: [
      { key: 'hubs.view', label: 'Ver Hubs & Valijas', desc: 'Consultar centros logísticos e inventario' },
      { key: 'hubs.inbound', label: 'Recepción de Valijas', desc: 'Escanear y registrar arribo físico de valijas' },
      { key: 'hubs.deconsolidate', label: 'Desconsolidar Valijas', desc: 'Apertura de valija y verificación paquete a paquete' },
      { key: 'hubs.assign_route', label: 'Asignar a Choferes', desc: 'Crear hojas de ruta para última milla' },
      { key: 'manifests.view', label: 'Ver Hojas de Ruta', desc: 'Consultar manifiestos y despachos de broker' }
    ]
  },
  {
    category: 'Conductor & Última Milla (Driver)',
    permissions: [
      { key: 'driver.routes', label: 'Ver Hoja de Ruta', desc: 'Consultar paradas asignadas del día' },
      { key: 'driver.pod', label: 'Prueba de Entrega (POD)', desc: 'Registrar firma digital táctil y foto' },
      { key: 'driver.deliver', label: 'Operar Entregas', desc: 'Navegación GPS y contacto con destinatario' }
    ]
  },
  {
    category: 'Equipo & Roles',
    permissions: [
      { key: 'team.view', label: 'Ver Equipo', desc: 'Consultar colaboradores del sistema' },
      { key: 'team.manage', label: 'Gestionar Equipo', desc: 'Invitar miembros, cambiar roles y claves' },
      { key: 'roles.view', label: 'Ver Roles', desc: 'Consultar lista de roles definidos' },
      { key: 'roles.manage', label: 'Gestionar Roles & Permisos', desc: 'Crear y personalizar matrices de permisos' }
    ]
  }
];

export default function AdminTeam({ currentUser }: { currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modales
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    role: 'support',
    role_id: '',
    assigned_hub_id: '',
    status: 'active',
    password: ''
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamRes, rolesRes, hubsRes] = await Promise.all([
        (api as any).getAdminTeam(),
        (api as any).getAdminRoles(),
        (api as any).getAdminTeamHubs()
      ]);
      const validMembers = (teamRes.members || []).filter((m: any) => m.role !== 'customer' && m.role !== 'point');
      setMembers(validMembers);
      setRoles(rolesRes.roles || []);
      setHubs(hubsRes.hubs || []);
    } catch (err: any) {
      setNotice({ text: err.message || 'Error al cargar datos del equipo.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const copyPointInviteLink = (member: TeamMember) => {
    const origin = window.location.origin;
    const url = `${origin}/point/register?ref=${encodeURIComponent(member.id)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    showNotification(`¡Enlace copiado! Los Points registrados con este link quedarán asignados a ${member.name}.`, 'success');
  };

  const roleRequiresHub = (roleSlug: string, roleId?: string) => {
    const selectedRole = roles.find(r => r.slug === roleSlug || r.id === roleId);
    return ['driver', 'hub_operator'].includes(roleSlug)
      || Boolean(selectedRole?.permissions?.some(permission => permission.startsWith('hubs.')));
  };

  const getHubLabel = (hubId?: string | null) => {
    if (!hubId) return 'Sin ubicación asignada';
    const hub = hubs.find(item => item.id === hubId);
    return hub ? `${hub.code || hub.name} · ${hub.city || hub.country || 'Hub'}` : 'Ubicación no encontrada';
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.email) {
      showNotification('Nombre y correo son requeridos.', 'error');
      return;
    }
    if (roleRequiresHub(memberForm.role, memberForm.role_id) && !memberForm.assigned_hub_id) {
      showNotification('Asigna una ubicación operativa antes de guardar este rol.', 'error');
      return;
    }

    try {
      if (editingMember) {
        await (api as any).updateAdminTeamMember(editingMember.id, memberForm);
        showNotification('Miembro del equipo actualizado correctamente.');
      } else {
        if (!memberForm.password) {
          showNotification('Debes asignar una contraseña inicial.', 'error');
          return;
        }
        await (api as any).createAdminTeamMember(memberForm);
        showNotification('Nuevo integrante agregado con éxito.');
      }
      setShowMemberModal(false);
      setEditingMember(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Error al guardar integrante.', 'error');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${name}" del equipo?`)) return;
    try {
      await (api as any).deleteAdminTeamMember(id);
      showNotification('Integrante eliminado.');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar integrante.', 'error');
    }
  };

  const openEditMember = (m: TeamMember) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      avatar_url: m.avatar_url || '',
      role: m.role,
      role_id: m.role_id || '',
      assigned_hub_id: m.assigned_hub_id || '',
      status: m.status || 'active',
      password: ''
    });
    setShowMemberModal(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) {
      showNotification('El nombre del rol es obligatorio.', 'error');
      return;
    }

    try {
      if (editingRole) {
        await (api as any).updateAdminRole(editingRole.id, roleForm);
        showNotification('Rol actualizado correctamente.');
      } else {
        await (api as any).createAdminRole(roleForm);
        showNotification('Rol creado con éxito.');
      }
      setShowRoleModal(false);
      setEditingRole(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Error al guardar rol.', 'error');
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${name}"?`)) return;
    try {
      await (api as any).deleteAdminRole(id);
      showNotification('Rol eliminado.');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar rol.', 'error');
    }
  };

  const openEditRole = (r: RoleItem) => {
    setEditingRole(r);
    setRoleForm({
      name: r.name,
      description: r.description || '',
      permissions: r.permissions || []
    });
    setShowRoleModal(true);
  };

  const togglePermission = (key: string) => {
    setRoleForm(prev => {
      const exists = prev.permissions.includes(key);
      const next = exists 
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: next };
    });
  };

  const selectAllPermissionsInCategory = (perms: { key: string }[]) => {
    setRoleForm(prev => {
      const allSelected = perms.every(p => prev.permissions.includes(p.key));
      let next: string[];
      if (allSelected) {
        const keysToRemove = new Set(perms.map(p => p.key));
        next = prev.permissions.filter(k => !keysToRemove.has(k));
      } else {
        const keysToAdd = perms.map(p => p.key);
        next = Array.from(new Set([...prev.permissions, ...keysToAdd]));
      }
      return { ...prev, permissions: next };
    });
  };

  const filteredMembers = members.filter(m => {
    if (m.role === 'customer' || m.role === 'point') return false;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter || m.role_id === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleSlug?: string) => {
    switch (roleSlug) {
      case 'super_admin': return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
      case 'admin': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'support': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'operations': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'finance': return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header móvil y desktop adaptativo */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                Equipo & Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Control de acceso, permisos y colaboradores
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher móvil (100% full width en pantalla chica) */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-300/60 dark:border-slate-700/80 sm:w-fit">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Miembros ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Roles ({roles.length})</span>
          </button>
        </div>
      </div>

      {/* Notificación flotante */}
      {notice && (
        <div className={`p-3.5 sm:p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* CONTENIDO TAB 1: MIEMBROS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Barra de Filtros & Botón de Acción Móvil */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-11"
              >
                <option value="all">Todos los roles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingMember(null);
                setMemberForm({
                  name: '',
                  email: '',
                  phone: '',
                  avatar_url: '',
                  role: roles[1]?.slug || 'support',
                  role_id: roles[1]?.id || '',
                  assigned_hub_id: '',
                  status: 'active',
                  password: ''
                });
                setShowMemberModal(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer h-11 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nuevo Miembro
            </button>
          </div>

          {/* VISTA MÓVIL: Tarjetas adaptadas al dedo (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Cargando equipo...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                No se encontraron integrantes que coincidan con los filtros.
              </div>
            ) : (
              filteredMembers.map(m => (
                <div 
                  key={m.id} 
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate leading-snug">
                          {m.name}
                        </h3>
                        <a href={`mailto:${m.email}`} className="text-xs text-blue-500 dark:text-blue-400 truncate block">
                          {m.email}
                        </a>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 ${getRoleBadgeColor(m.role)}`}>
                      {m.role_name || m.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estado</span>
                      {m.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Inactivo
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Teléfono</span>
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} className="text-slate-700 dark:text-slate-300 font-medium truncate block">
                          {m.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="text-slate-400">Ubicación:</span>
                    <span className={`font-bold truncate ${m.assigned_hub_id ? 'text-cyan-600 dark:text-cyan-300' : 'text-amber-500'}`}>
                      {getHubLabel(m.assigned_hub_id)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="text-[11px] text-slate-400">
                      {m.role === 'super_admin' ? (
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Acceso Total
                        </span>
                      ) : (
                        <span>{m.permissions?.length || 0} módulos permitidos</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyPointInviteLink(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold transition-colors flex items-center gap-1.5 h-8"
                        title="Copiar link de registro para Points"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Link Point
                      </button>
                      <button
                        onClick={() => openEditMember(m)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 h-8"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      {m.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 transition-colors w-8 h-8 flex items-center justify-center"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* VISTA DESKTOP: Tabla completa (hidden md:block) */}
          <div className="hidden md:block bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Contacto</th>
                    <th className="py-3.5 px-4">Rol Asignado</th>
                    <th className="py-3.5 px-4">Ubicación</th>
                    <th className="py-3.5 px-4">Permisos</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Cargando equipo...
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No se encontraron integrantes que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {m.avatar_url ? (
                              <img
                                src={m.avatar_url}
                                alt={m.name}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-snug">{m.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {m.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {m.phone}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(m.role)}`}>
                            {m.role_name || m.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${m.assigned_hub_id ? 'text-cyan-600 dark:text-cyan-300' : 'text-amber-500'}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {getHubLabel(m.assigned_hub_id)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {m.role === 'super_admin' ? (
                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Acceso Total (*)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {m.permissions?.length || 0} módulos autorizados
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {m.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => copyPointInviteLink(m)}
                              className="px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors flex items-center gap-1 text-xs font-bold"
                              title={`Copiar link de registro para Points asignados a ${m.name}`}
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>Link Point</span>
                            </button>
                            <button
                              onClick={() => openEditMember(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Editar miembro"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {m.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDeleteMember(m.id, m.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Eliminar miembro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO TAB 2: ROLES & PERMISOS */}
      {activeTab === 'roles' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personaliza los perfiles de acceso para que cada miembro solo acceda a lo necesario.
            </p>
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleForm({
                  name: '',
                  description: '',
                  permissions: ['dashboard.view']
                });
                setShowRoleModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer h-11 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {roles.map(r => {
              const count = members.filter(m => m.role === r.slug || m.role_id === r.id).length;
              const isSuper = r.slug === 'super_admin';
              
              return (
                <div 
                  key={r.id} 
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-blue-500/40 transition-all"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${getRoleBadgeColor(r.slug)}`}>
                          {isSuper ? 'Sistema / Maestro' : r.is_system ? 'Rol Estándar' : 'Personalizado'}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {r.name}
                        </h3>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {count} user{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[30px]">
                      {r.description || 'Sin descripción asignada.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Permisos:</p>
                      {isSuper ? (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" /> Acceso total sin restricciones
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {r.permissions?.slice(0, 6).map(p => (
                            <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                              {p}
                            </span>
                          ))}
                          {(r.permissions?.length || 0) > 6 && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] sm:text-[11px] font-bold">
                              +{(r.permissions?.length || 0) - 6} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                    {!isSuper && (
                      <button
                        onClick={() => openEditRole(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1 h-8"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar Permisos
                      </button>
                    )}
                    {!r.is_system && (
                      <button
                        onClick={() => handleDeleteRole(r.id, r.name)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700/60 transition-colors w-8 h-8 flex items-center justify-center"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL MIEMBRO (BOTTOM-SHEET EN MÓVIL, MODAL EN DESKTOP) */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl animate-slide-up sm:animate-scale-in">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {editingMember ? 'Editar Miembro' : 'Nuevo Miembro del Equipo'}
                </h2>
              </div>
              <button 
                onClick={() => setShowMemberModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Foto de Perfil / Avatar del Integrante */}
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Foto de Perfil / Avatar
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">Visible para Points</span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {memberForm.avatar_url ? (
                    <div className="relative group shrink-0">
                      <img
                        src={memberForm.avatar_url}
                        alt="Preview"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setMemberForm(prev => ({ ...prev, avatar_url: '' }))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-600"
                        title="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xl shadow-xs shrink-0">
                      {(memberForm.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 4 * 1024 * 1024) {
                          showNotification('La imagen no debe superar los 4MB.', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setMemberForm(prev => ({ ...prev, avatar_url: String(reader.result || '') }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{memberForm.avatar_url ? 'Cambiar Foto' : 'Subir Foto'}</span>
                      </button>

                      {memberForm.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setMemberForm(prev => ({ ...prev, avatar_url: '' }))}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-500 text-xs font-bold transition-colors"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Sube la foto del colaborador. Se muestra a los Points como su Ejecutivo asignado.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <input
                    type="url"
                    placeholder="O ingresa enlace directo (https://...)"
                    value={memberForm.avatar_url.startsWith('data:') ? '' : memberForm.avatar_url}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="Ej: Laura Méndez"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingMember)}
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="colaborador@empresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 h-11"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="+1 (829) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Rol
                  </label>
                  <select
                    value={memberForm.role_id || memberForm.role}
                    onChange={(e) => {
                      const selectedRole = roles.find(r => r.id === e.target.value || r.slug === e.target.value);
                      setMemberForm({
                        ...memberForm,
                        role: selectedRole?.slug || e.target.value,
                        role_id: selectedRole?.id || '',
                        assigned_hub_id: roleRequiresHub(selectedRole?.slug || e.target.value, selectedRole?.id)
                          ? memberForm.assigned_hub_id
                          : ''
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Estado
                  </label>
                  <select
                    value={memberForm.status}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                  >
                    <option value="active">Activo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 mb-1">
                      Ubicación operativa asignada por Admin
                    </label>
                    <select
                      value={memberForm.assigned_hub_id}
                      onChange={(e) => setMemberForm({ ...memberForm, assigned_hub_id: e.target.value })}
                      required={roleRequiresHub(memberForm.role, memberForm.role_id)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-cyan-500/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none h-11"
                    >
                      <option value="">Sin ubicación asignada</option>
                      {hubs.map(hub => (
                        <option key={hub.id} value={hub.id}>
                          {hub.code || hub.name} · {hub.city || hub.country || 'Hub'}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                      {roleRequiresHub(memberForm.role, memberForm.role_id)
                        ? 'Obligatoria para Drivers y operadores con permisos de Hub. El usuario no puede cambiarla.'
                        : 'Controla desde qué Hub podrá operar este colaborador. El backend conserva la decisión del administrador.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {editingMember ? 'Nueva Clave (opcional)' : 'Contraseña Inicial'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required={!editingMember}
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                    placeholder={editingMember ? 'Dejar en blanco para no cambiar' : 'Clave segura'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/30 transition-all h-11"
                >
                  {editingMember ? 'Guardar Cambios' : 'Crear Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ROLES & PERMISOS (RESPONSIVO ADAPTADO) */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up sm:animate-scale-in">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-500" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {editingRole ? `Permisos: ${editingRole.name}` : 'Nuevo Rol Personalizado'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Marca las casillas de los módulos autorizados
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="Ej: Coordinador de Logística"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Funciones del rol..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-11"
                  />
                </div>
              </div>

              {/* Matriz de Permisos por Categorías */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Permisos por Módulo
                  </h3>
                  <span className="text-xs text-blue-500 font-bold">
                    {roleForm.permissions.length} activos
                  </span>
                </div>

                <div className="space-y-3">
                  {AVAILABLE_PERMISSIONS.map(cat => {
                    const allCatSelected = cat.permissions.every(p => roleForm.permissions.includes(p.key));

                    return (
                      <div key={cat.category} className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {cat.category}
                          </h4>
                          <button
                            type="button"
                            onClick={() => selectAllPermissionsInCategory(cat.permissions)}
                            className="text-[11px] font-bold text-blue-500 hover:text-blue-400 p-1 cursor-pointer"
                          >
                            {allCatSelected ? 'Deseleccionar' : 'Todos'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.permissions.map(perm => {
                            const checked = roleForm.permissions.includes(perm.key);

                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  checked 
                                    ? 'bg-blue-500/10 border-blue-500/30 text-slate-900 dark:text-white' 
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(perm.key)}
                                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                                />
                                <div className="text-xs min-w-0">
                                  <p className="font-bold leading-snug truncate">{perm.label}</p>
                                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{perm.desc}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pb-2 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/30 transition-all h-11"
                >
                  {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
