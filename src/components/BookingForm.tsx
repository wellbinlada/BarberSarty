import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  LogOut,
  UserCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ClientAppointments from "./ClientAppointments";

interface Professional {
  id: string;
  name: string;
  phone_number: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const DEFAULT_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

export default function BookingForm() {
  const { session, signOut } = useAuth();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [bookingData, setBookingData] = useState<{
    name: string;
    date: string;
    time: string;
  } | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<
    { date: string; time: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = "2025-09-01";
  const maxDate = "2028-12-31";

  useEffect(() => {
    fetchProfessional();
    fetchExistingAppointments();
    if (session) {
      fetchClient();
    }
  }, [session]);

  // Refetch existing appointments when a professional is resolved
  useEffect(() => {
    if (professional?.id) {
      fetchExistingAppointments(professional.id);
    }
  }, [professional?.id]);

  const fetchProfessional = async () => {
    try {
      let resolvedProfessional: Professional | null = null;

      // 1) Tenta pelo ID padrão
      const { data: byId, error: byIdError } = await supabase
        .from("professionals")
        .select("id, name, phone_number")
        .eq("id", DEFAULT_PROFESSIONAL_ID)
        .maybeSingle();
      if (byIdError && byIdError.code !== "PGRST116") throw byIdError;
      if (byId) resolvedProfessional = byId as Professional;

      // 2) Se logado como profissional específico e ainda não encontrou, tenta pelo e-mail
      if (!resolvedProfessional && session?.user?.email === "barber@admin.com") {
        const { data: byEmail, error: byEmailError } = await supabase
          .from("professionals")
          .select("id, name, phone_number")
          .eq("email", session.user.email!)
          .maybeSingle();
        if (byEmailError && byEmailError.code !== "PGRST116") throw byEmailError;
        if (byEmail) resolvedProfessional = byEmail as Professional;
      }

      // 3) Como último recurso, busca qualquer profissional existente
      if (!resolvedProfessional) {
        const { data: anyProf, error: anyProfError } = await supabase
          .from("professionals")
          .select("id, name, phone_number")
          .limit(1)
          .maybeSingle();
        if (anyProfError && anyProfError.code !== "PGRST116") throw anyProfError;
        if (anyProf) resolvedProfessional = anyProf as Professional;
      }

      if (resolvedProfessional) {
        setProfessional(resolvedProfessional);
      } else {
        setError("Nenhum profissional cadastrado.");
      }
    } catch (err) {
      setError("Erro ao carregar informações do profissional");
    }
  };

  const fetchClient = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      if (data) {
        setClient(data);
        setName(data.name); // Pre-fill name if user is logged in
      }
    } catch (err) {
      console.error("Erro ao carregar informações do cliente:", err);
    }
  };

  const fetchExistingAppointments = async (professionalId?: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("date, time")
        .eq("professional_id", professionalId ?? DEFAULT_PROFESSIONAL_ID);
      if (error) throw error;
      if (data) setExistingAppointments(data);
    } catch (err) {
      setError("Erro ao carregar agendamentos existentes");
    }
  };

  const isTimeSlotAvailable = (selectedDate: string, selectedTime: string) => {
    return !existingAppointments.some(
      (app) => app.date === selectedDate && app.time === selectedTime
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    if (!professional) {
      setError("Erro: Profissional não encontrado");
      setIsSubmitting(false);
      return;
    }

    if (!isTimeSlotAvailable(date, time)) {
      setError("Este horário já está agendado. Escolha outro.");
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentData = {
        client_name: name,
        date,
        time,
        professional_id: professional.id,
        status: "pending",
        ...(session?.user?.id && { client_id: session.user.id }),
      };

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([appointmentData]);
      if (appointmentError) throw appointmentError;

      setSuccess(true);
      setBookingData({ name, date, time });
      setName("");
      setDate("");
      setTime("");
      fetchExistingAppointments();
    } catch (err: any) {
      setError(err.message || "Falha ao agendar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!bookingData || !professional) return;
    const message = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento:\n\nNome: ${
        bookingData.name
      }\nData: ${format(new Date(bookingData.date), "dd/MM/yyyy")}\nHorário: ${
        bookingData.time
      }`
    );
    const phoneNumber = professional.phone_number.replace(/\D/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-indigo-600">
          Agende seu horário
        </h2>
        {session ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserCircle className="h-5 w-5" />
              <span>{client?.name || "Cliente"}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link
              to="/login"
              className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Cadastrar
            </Link>
          </div>
        )}
      </div>

      {!session && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Dica:</strong> Faça login ou cadastre-se para ter uma
                experiência mais personalizada e acompanhar seus agendamentos.
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-md text-center"
          role="alert"
        >
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
            <p className="font-medium">Agendamento realizado com sucesso!</p>
          </div>
          <button
            onClick={handleWhatsAppConfirm}
            className="mt-3 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full"
            aria-label="Confirmar agendamento via WhatsApp"
          >
            <MessageSquare className="w-5 h-5" /> Confirmar via WhatsApp
          </button>
        </div>
      )}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md flex items-center"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Seu Nome
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="Nome completo"
              className={`w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500 ${
                session ? "bg-gray-50" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting || session}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Data
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              max={maxDate}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700"
          >
            Horário
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              id="time"
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-300 focus:border-indigo-500"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 focus:ring focus:ring-indigo-300 transition-colors flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processando...
            </>
          ) : (
            "Agendar"
          )}
        </button>
      </form>

      {session && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <ClientAppointments />
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        © 2025 • Desenvolvido por Keven M
      </p>
    </div>
  );
}
