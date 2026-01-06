import React from 'react';

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800'
};

const estadoLabels = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const EstadoBadge = ({ estado }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoColors[estado] || 'bg-gray-100 text-gray-800'}`}>
      {estadoLabels[estado] || estado}
    </span>
  );
};

export default EstadoBadge;
