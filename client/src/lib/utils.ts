import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else {
    return 'há poucos segundos';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'trabalhando':
      return 'bg-green-100 text-green-800';
    case 'pausa':
      return 'bg-yellow-100 text-yellow-800';
    case 'saiu':
      return 'bg-red-100 text-red-800';
    case 'ausente':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'trabalhando':
      return 'Trabalhando';
    case 'pausa':
      return 'Pausa';
    case 'saiu':
      return 'Saiu';
    case 'ausente':
    default:
      return 'Ausente';
  }
}
