import React, { useState, useEffect } from 'react';
import { menuService } from '../services';
import Navbar from '../components/Navbar';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const GestionMenus = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: true
  });

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAll();
      setMenus(data);
    } catch (err) {
      console.error('Error al cargar menús:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await menuService.update(editingMenu.id, formData);
      } else {
        await menuService.create(formData);
      }
      setShowModal(false);
      setEditingMenu(null);
      setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', disponible: true });
      fetchMenus();
    } catch (err) {
      alert('Error al guardar menú: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      nombre: menu.nombre,
      descripcion: menu.descripcion || '',
      precio: menu.precio,
      categoria: menu.categoria || '',
      disponible: menu.disponible
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este menú?')) {
      try {
        await menuService.delete(id);
        fetchMenus();
      } catch (err) {
        alert('Error al eliminar menú: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleNew = () => {
    setEditingMenu(null);
    setFormData({ nombre: '', descripcion: '', precio: '', categoria: '', disponible: true });
    setShowModal(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Cargando menús...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Menús</h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchMenus}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiRefreshCw />
              <span>Actualizar</span>
            </button>
            <button
              onClick={handleNew}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiPlus />
              <span>Nuevo Menú</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{menu.nombre}</h3>
                  <p className="text-sm text-gray-600">{menu.categoria}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${menu.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {menu.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              {menu.descripcion && (
                <p className="text-sm text-gray-600 mb-4">{menu.descripcion}</p>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  ${parseFloat(menu.precio).toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(menu)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiEdit2 />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiTrash2 />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {menus.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay menús registrados</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingMenu ? 'Editar Menú' : 'Nuevo Menú'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Hamburguesas, Pizzas, Bebidas"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Disponible
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMenu(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GestionMenus;
