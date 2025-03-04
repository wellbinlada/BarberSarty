import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, parseISO, isFuture, isPast, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  CalendarCheck, 
  LogOut, 
  User, 
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Scissors,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Appointment {
  id: string;
  client_name: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Get all appointments regardless of professional_id
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data as Appointment[]);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar agendamentos: ' + err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const confirmAppointment = async (id: string) => {
    setActionInProgress(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to reflect the change immediately
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === id ? { ...appointment, status: 'confirmed' } : appointment
        )
      );
      
      setSuccessMessage({
        message: 'Agendamento confirmado com sucesso!',
        type: 'success'
      });
      
    } catch (err: any) {
      setError('Erro ao confirmar agendamento: ' + err.message);
      setSuccessMessage({
        message: 'Erro ao confirmar agendamento',
        type: 'error'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }
    
    setActionInProgress(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to reflect the change immediately
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
        )
      );
      
      setSuccessMessage({
        message: 'Agendamento cancelado com sucesso!',
        type: 'success'
      });
      
    } catch (err: any) {
      setError('Erro ao cancelar agendamento: ' + err.message);
      setSuccessMessage({
        message: 'Erro ao cancelar agendamento',
        type: 'error'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'confirmed') {
      await confirmAppointment(id);
    } else {
      await cancelAppointment(id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments();
  };

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter by status
      if (filterStatus !== 'all' && appointment.status !== filterStatus) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const getAppointmentsByDate = (filter: (date: string) => boolean) => {
    return getFilteredAppointments().filter(appointment => filter(appointment.date));
  };

  const getStatusClass = (status: string) => {
    return status === 'confirmed' ? 'bg-green-100 text-green-800' :
           status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'confirmed' ? 'Confirmado' :
           status === 'cancelled' ? 'Cancelado' : 'Pendente';
  };

  const renderTable = (appointments: Appointment[], title: string, icon: JSX.Element, emptyMessage: string) => (
    <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </div>
      </div>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Horário</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map(({ id, client_name, date, time, status }) => (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-indigo-500 mr-2" />
                      <span className="font-medium">{time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        {client_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {status === 'pending' && (
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleStatusChange(id, 'confirmed')} 
                          className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                          title="Confirmar"
                          disabled={actionInProgress === id}
                          aria-label="Confirmar agendamento"
                        >
                          {actionInProgress === id ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleStatusChange(id, 'cancelled')} 
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                          title="Cancelar"
                          disabled={actionInProgress === id}
                          aria-label="Cancelar agendamento"
                        >
                          {actionInProgress === id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}
                    {status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusChange(id, 'cancelled')} 
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                        title="Cancelar"
                        disabled={actionInProgress === id}
                        aria-label="Cancelar agendamento confirmado"
                      >
                        {actionInProgress === id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    {status === 'cancelled' && (
                      <button 
                        onClick={() => handleStatusChange(id, 'confirmed')} 
                        className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-full transition-colors disabled:opacity-50"
                        title="Reativar"
                        disabled={actionInProgress === id}
                        aria-label="Reativar agendamento cancelado"
                      >
                        {actionInProgress === id ? (
                          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {successMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-md flex items-center ${
          successMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {successMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <p>{successMessage.message}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <Scissors className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Controle de Agendamentos</h2>
              <p className="text-gray-500">Gerencie todos os seus agendamentos</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut} 
            className="flex items-center bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5 mr-2" /> Sair
          </button>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar cliente por nome"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              aria-expanded={showFilters}
              aria-controls="filter-options"
            >
              <Filter className="w-5 h-5" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button 
              onClick={handleRefresh}
              className={`flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg transition-colors`}
              disabled={isRefreshing}
              aria-label="Atualizar lista de agendamentos"
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Atualizar
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div id="filter-options" className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-600 border border-gray-300'}`}
                aria-pressed={filterStatus === 'all'}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-gray-600 border border-gray-300'}`}
                aria-pressed={filterStatus === 'pending'}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600 border border-gray-300'}`}
                aria-pressed={filterStatus === 'confirmed'}
              >
                Confirmados
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-white text-gray-600 border border-gray-300'}`}
                aria-pressed={filterStatus === 'cancelled'}
              >
                Cancelados
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && !isRefreshing ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" role="status"></div>
          <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
        </div>
      ) : (
        <>
          {renderTable(
            getAppointmentsByDate(date => isToday(parseISO(date))), 
            'Agendamentos de Hoje', 
            <CalendarCheck className="w-6 h-6 text-indigo-600" />,
            'Nenhum agendamento para hoje'
          )}
          
          {renderTable(
            getAppointmentsByDate(date => isFuture(parseISO(date)) && !isToday(parseISO(date))), 
            'Próximos Agendamentos', 
            <Calendar className="w-6 h-6 text-indigo-600" />,
            'Nenhum agendamento futuro'
          )}
          
          {renderTable(
            getAppointmentsByDate(date => isPast(parseISO(date)) && !isToday(parseISO(date))), 
            'Agendamentos Passados', 
            <Clock className="w-6 h-6 text-indigo-600" />,
            'Nenhum agendamento passado'
          )}
        </>
      )}

      <div className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 mt-8">
        © 2025 • Desenvolvido por Keven M
      </div>
    </div>
  );
}