import React, { useState } from "react";
import { Settings, Users, Save, Edit, Trash2, X } from "lucide-react";

export default function ParametresTab() {
  const [staffList, setStaffList] = useState([
    { id: 1, name: "Cheikh Baye Kane (شيخ باي كان)", role: "Fondateur (المؤسس)", phone: "+221 77 000 00 01", status: "Actif" },
    { id: 2, name: "Mohamed Sall (محمد صال)", role: "Enseignant Principal (المدرس)", phone: "+221 77 000 00 02", status: "Actif" },
    { id: 3, name: "Mohamed Ka (محمد كا)", role: "Enseignant Assistant (المساعد)", phone: "+221 77 000 00 03", status: "Actif" },
    { id: 4, name: "Asma Niass (آسماء انياس)", role: "Responsable (المسؤلة)", phone: "+221 78 000 00 04", status: "Actif" },
    { id: 5, name: "Khadidja Ji (خديجة جي)", role: "Assistante (المساعدة)", phone: "+221 70 000 00 05", status: "Actif" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", phone: "", status: "Actif" });

  const handleOpenModal = (staff?: any) => {
    if (staff) {
      setEditingId(staff.id);
      setFormData({ name: staff.name, role: staff.role, phone: staff.phone, status: staff.status });
    } else {
      setEditingId(null);
      setFormData({ name: "", role: "", phone: "", status: "Actif" });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.role) return;
    if (editingId !== null) {
      setStaffList(staffList.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      setStaffList([...staffList, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Voulez-vous vraiment supprimer ce membre du personnel ?")) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#0B1C30]" />
            <span>Paramètres Système & RH</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Configuration globale de l'institut et gestion du personnel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">Identité de l'Établissement</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom de l'Institut</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700" defaultValue="Institut Rayhanah - La Sagesse" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Année Académique</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700">
                  <option>2026-2027</option>
                  <option>2025-2026</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">Passerelle SMS</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fournisseur Actif</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700">
                  <option>Orange Sénégal API</option>
                  <option>Twilio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Clé d'API</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700" defaultValue="****************" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button className="bg-[#0B1C30] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#142d47] transition-colors">
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#0B1C30]" />
              <span>Répertoire du Personnel — الهيكل الإداري</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Structure administrative, direction et encadrement coranique</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            + Ajouter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Nom Complet</th>
                <th className="px-4 py-3">Fonction / Poste</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff, index) => (
                <tr key={staff.id} className={index === 0 ? "bg-amber-50/30" : ""}>
                  <td className={`px-4 py-3 font-semibold ${index === 0 ? "font-bold text-[#0B1C30]" : "text-slate-800"}`}>
                    {staff.name}
                  </td>
                  <td className={`px-4 py-3 ${index === 0 ? "font-semibold text-slate-700" : ""}`}>
                    {staff.role}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{staff.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${staff.status === "Actif" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(staff)} className="p-1.5 text-slate-400 hover:text-[#0B1C30] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(staff.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Aucun personnel enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POUR AJOUTER/MODIFIER UN MEMBRE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[#0B1C30]">
                {editingId ? "Modifier le profil" : "Ajouter un membre"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom Complet (Ex: Amadou Diallo - أحمد)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="Saisissez le nom complet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fonction / Poste</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="Ex: Maître Coranique (أستاذ)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="+221 ..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Statut</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="En congé">En congé</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.role}
                className="px-4 py-2 text-sm font-bold bg-[#0B1C30] text-white rounded-xl hover:bg-[#142d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {editingId ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
