import React, { useState } from "react";
import { Settings, Users, Save, Edit, Trash2, X, Lock, KeyRound, Upload, Download, FileSpreadsheet, Check, AlertCircle, FolderOpen, ChevronDown, Fingerprint, BookOpen, Award, Shield, Activity, RefreshCw } from "lucide-react";
import Papa from "papaparse";
import { Student, EtapePedagogique } from "../types";

interface ParametresTabProps {
  students?: Student[];
  onImportStudents?: (importedStudents: Partial<Student>[]) => Promise<void>;
  onUpdateInstituteName?: (name: string) => void;
}

export default function ParametresTab({ students = [], onImportStudents, onUpdateInstituteName }: ParametresTabProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [authError, setAuthError] = useState(false);

  // General Settings State
  const [instituteName, setInstituteName] = useState(() => 
    localStorage.getItem("daara_institute_name") || "Institut Rayhanah - La Sagesse"
  );
  const [academicYear, setAcademicYear] = useState(() => 
    localStorage.getItem("daara_academic_year") || "2026-2027"
  );
  const [pointsHizb, setPointsHizb] = useState(100);
  const [pointsSurah, setPointsSurah] = useState(15);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handleSaveGeneralSettings = () => {
    localStorage.setItem("daara_institute_name", instituteName);
    localStorage.setItem("daara_academic_year", academicYear);
    if (onUpdateInstituteName) {
      onUpdateInstituteName(instituteName);
    }
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Le mot de passe par défaut pour accéder à l'administration
  const ADMIN_PASSWORD = "Cheikh@66#";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordAttempt === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordAttempt("");
    }
  };

  // ----------------------------------------------------
  // BIOMETRIC WEBAUTHN LOGIC (Face ID / Touch ID)
  // ----------------------------------------------------
  const [hasBiometric, setHasBiometric] = useState(() => !!localStorage.getItem("daara_biometric_id"));

  const generateRandomBuffer = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  };

  const handleRegisterBiometric = async () => {
    if (!window.PublicKeyCredential) {
      alert("Votre navigateur ne supporte pas la connexion biométrique (WebAuthn).");
      return;
    }
    try {
      const publicKey = {
        challenge: generateRandomBuffer(),
        rp: { name: "Institut Rayhanah", id: window.location.hostname },
        user: {
          id: Uint8Array.from("admin-rayhanah", c => c.charCodeAt(0)),
          name: "admin",
          displayName: "Administrateur Rayhanah"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" as const }, { alg: -257, type: "public-key" as const }],
        authenticatorSelection: { authenticatorAttachment: "platform" as const, userVerification: "required" as const },
        timeout: 60000,
        attestation: "none" as const
      };

      const credential = await navigator.credentials.create({ publicKey }) as any;
      
      if (credential && credential.rawId) {
        // Encode rawId to base64 string to store in localStorage
        const rawIdBase64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.rawId))));
        localStorage.setItem("daara_biometric_id", rawIdBase64);
        setHasBiometric(true);
        alert("Connexion biométrique activée avec succès !");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'activation biométrique : " + err.message);
    }
  };

  const handleBiometricLogin = async () => {
    const storedIdBase64 = localStorage.getItem("daara_biometric_id");
    if (!storedIdBase64) return;
    
    try {
      const binaryString = atob(storedIdBase64);
      const rawId = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        rawId[i] = binaryString.charCodeAt(i);
      }

      const publicKey = {
        challenge: generateRandomBuffer(),
        allowCredentials: [{ id: rawId, type: "public-key" as const }],
        userVerification: "required" as const,
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({ publicKey });
      if (assertion) {
        setIsAuthenticated(true);
        setAuthError(false);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(true);
    }
  };
  // ----------------------------------------------------

  const [staffList, setStaffList] = useState([
    { id: 1, name: "Cheikh Baye Kane (شيخ باي كان)", role: "Directeur (المدير)", phone: "+221 77 000 00 01", status: "Actif" },
    { id: 2, name: "Mohamed Sall (محمد صال)", role: "Enseignant Principal (المدرس)", phone: "+221 77 000 00 02", status: "Actif" },
    { id: 3, name: "Mohamed Ka (محمد كا)", role: "Enseignant Assistant (المساعد)", phone: "+221 77 000 00 03", status: "Actif" },
    { id: 4, name: "Asma Niass (آسماء انياس)", role: "Secrétaire (سكرتيرة)", phone: "+221 78 000 00 04", status: "Actif" },
    { id: 5, name: "Khadidja Ji (خديجة جي)", role: "Assistante (المساعدة)", phone: "+221 70 000 00 05", status: "Actif" },
  ]);

  const [systemLogs] = useState([
    { id: 1, action: "Sauvegarde complète de la base de données", user: "Admin", time: "Aujourd'hui, 09:12" },
    { id: 2, action: "Import CSV massif (34 élèves)", user: "Directeur", time: "Hier, 16:45" },
    { id: 3, action: "Clôture de la journée pédagogique", user: "Enseignant", time: "Hier, 15:30" },
    { id: 4, action: "Connexion biométrique activée", user: "Admin", time: "20/07/2026" },
  ]);

  const [smsTestStatus, setSmsTestStatus] = useState<null|'testing'|'success'|'error'>(null);
  const handleTestSms = () => {
    setSmsTestStatus('testing');
    setTimeout(() => setSmsTestStatus('success'), 1500);
  };

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

  // State for CSV Import
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setImportError("Erreur lors de la lecture du fichier CSV. Vérifiez le format.");
          return;
        }
        setImportPreview(results.data);
      },
      error: (err) => {
        setImportError(`Erreur : ${err.message}`);
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    setIsImporting(true);
    try {
      const parsedStudents: Partial<Student>[] = importPreview.map((row: any, idx: number) => ({
        id: row.id || row.matricule || `imp_${Date.now()}_${idx}`,
        matricule: row.matricule || row.Matricule || `RAY-${1000 + idx}`,
        firstName: row.firstName || row.prenom || row.Prenom || row["Prénom"] || "Élève",
        lastName: row.lastName || row.nom || row.Nom || "Inconnu",
        gender: row.gender || row.sexe || row.Sexe || "M",
        dateOfBirth: row.dateOfBirth || row.dob || row["Date de Naissance"] || "2015-01-01",
        halaqaId: row.halaqaId || row.halaqa || row.Halaqa || "h1",
        etape: (row.etape as EtapePedagogique) || EtapePedagogique.Hifz,
        currentHizbNum: Number(row.currentHizbNum || row.hizb || row.Hizb) || 60,
        currentHizbFraction: Number(row.currentHizbFraction || row.fraction || 0),
        guardianName: row.guardianName || row.tuteur || row.Tuteur || "Tuteur",
        guardianPhone: row.guardianPhone || row.telephone || row.Telephone || "+221 77 000 00 00",
        monthlyFee: Number(row.monthlyFee || row.tarif || 15000),
        balanceDue: Number(row.balanceDue || row.solde || 0),
        score: Number(row.score || 100),
        khatmatCount: Number(row.khatmatCount || 0)
      }));

      if (onImportStudents) {
        await onImportStudents(parsedStudents);
      } else {
        // Fallback fetch API
        const res = await fetch("/api/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedStudents })
        });
        if (!res.ok) throw new Error("Échec de l'import backend");
      }

      setImportSuccess(`${parsedStudents.length} élèves importés avec succès !`);
      setImportPreview(null);
    } catch (err: any) {
      setImportError(err.message || "Erreur lors de l'enregistrement de l'import.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      alert("Aucun élève à exporter.");
      return;
    }
    const csv = Papa.unparse(students);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ELEVES_INSTITUT_RAYHANAH_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Voulez-vous vraiment supprimer ce membre du personnel ?")) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const handleClearCache = () => {
    if(window.confirm("Attention : Cela va effacer le cache local. Si des modifications n'ont pas été synchronisées avec le serveur, elles seront perdues. Continuer ?")) {
      // We clear everything except the institute settings and biometric ID
      const instituteName = localStorage.getItem("daara_institute_name");
      const academicYear = localStorage.getItem("daara_academic_year");
      const biometricId = localStorage.getItem("daara_biometric_id");
      
      localStorage.clear();
      
      if (instituteName) localStorage.setItem("daara_institute_name", instituteName);
      if (academicYear) localStorage.setItem("daara_academic_year", academicYear);
      if (biometricId) localStorage.setItem("daara_biometric_id", biometricId);
      
      alert("Cache local vidé avec succès. La page va se recharger.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 relative">
      {!isAuthenticated ? (
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xs max-w-md mx-auto w-full text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#0B1C30]" />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-2">Accès Restreint</h3>
          <p className="text-sm text-slate-500 mb-6">
            L'espace Administration et Ressources Humaines est protégé. Veuillez saisir le mot de passe directeur.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={passwordAttempt}
                  onChange={(e) => setPasswordAttempt(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${authError ? 'border-rose-300 ring-rose-100' : 'border-slate-200 focus:border-[#0B1C30]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20 sm:text-sm`}
                  placeholder="Mot de passe"
                  autoFocus
                />
              </div>
              {authError && <p className="text-rose-500 text-xs mt-2 font-semibold">Mot de passe incorrect.</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#0B1C30] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#142d47] transition-colors cursor-pointer shadow-sm"
            >
              Déverrouiller
            </button>
          </form>

          {hasBiometric && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleBiometricLogin}
                className="w-full bg-slate-50 border border-slate-200 text-[#0B1C30] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-5 h-5 text-emerald-600" />
                Se connecter avec Face ID / Touch ID
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#0B1C30]" />
            <span>Administration Globale du Système</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Paramètres vitaux, sécurité et identité de l'institut</p>
        </div>

        {settingsSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Paramètres de l'établissement enregistrés avec succès !</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">Identité de l'Établissement</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom de l'Institut</label>
                <input 
                  type="text" 
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Année Académique</label>
                <select 
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="2026-2027">2026-2027</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">Passerelle SMS</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fournisseur Actif</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-medium">
                  <option>Orange Sénégal API</option>
                  <option>Twilio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Clé d'API</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-medium" defaultValue="****************" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleTestSms}
                  disabled={smsTestStatus === 'testing'}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {smsTestStatus === 'testing' ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Test en cours...</>
                  ) : smsTestStatus === 'success' ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Connexion Réussie !</>
                  ) : (
                    "Tester la connexion API"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              Sécurité & Accès
            </h4>
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-tight">
                Activez l'authentification biométrique (Face ID, Touch ID, Windows Hello) pour déverrouiller ce panneau d'administration sans mot de passe.
              </p>
              
              {!hasBiometric ? (
                <button
                  onClick={handleRegisterBiometric}
                  className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  Activer la Biométrie (WebAuthn)
                </button>
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Biométrie active</span>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("daara_biometric_id");
                      setHasBiometric(false);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-[10px] underline cursor-pointer"
                  >
                    Désactiver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSaveGeneralSettings}
            className="bg-[#0B1C30] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#142d47] transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* SECTION CONFIGURATION PEDAGOGIQUE */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full mt-8">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Configuration Pédagogique (Halaqas & Gamification)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Paramétrage des groupes, des points de motivation et du cursus coranique</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Gestion des Halaqas
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-[11px] text-slate-500">Les groupes (Halaqas) permettent de diviser les élèves par enseignant ou par niveau.</p>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">Halaqa Abu Bakr</div>
                  <div className="text-[10px] text-slate-500">Oustaz Mohamed Sall • 12 élèves</div>
                </div>
                <button className="text-slate-400 hover:text-[#0B1C30]"><Edit className="w-4 h-4" /></button>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-700">Halaqa Oumar</div>
                  <div className="text-[10px] text-slate-500">Oustaz Mohamed Ka • 8 élèves</div>
                </div>
                <button className="text-slate-400 hover:text-[#0B1C30]"><Edit className="w-4 h-4" /></button>
              </div>
              <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-[#0B1C30] hover:border-[#0B1C30] transition-colors cursor-pointer">
                + Créer une nouvelle Halaqa
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Barème de Points (Gamification)
            </h4>
            <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Points pour l'achèvement d'un Hizb</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={pointsHizb} onChange={(e) => setPointsHizb(Number(e.target.value))} className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-sm text-center font-bold" />
                  <span className="text-xs text-slate-500">points attribués à l'élève</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Points pour un Dars 'Naam' (Sourate)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={pointsSurah} onChange={(e) => setPointsSurah(Number(e.target.value))} className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-sm text-center font-bold" />
                  <span className="text-xs text-slate-500">points de récompense par leçon réussie</span>
                </div>
              </div>
              <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors w-full cursor-pointer shadow-sm">
                Sauvegarder le barème
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION IMPORT & EXPORT DE DONNÉES (ADMIN UNIQ) */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Gestion des Données & Import/Export — استيراد وتصدير</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Importation massive d'élèves (CSV / Excel) et sauvegarde complète de la base de données</p>
        </div>

        {importSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Import CSV */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Importer la liste des élèves</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Chargez un fichier CSV (champs : matricule, nom, prenom, etape, hizb, tuteur, telephone...).
              </p>
            </div>
            <div>
              <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Choisir un fichier CSV...</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Export CSV */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-600" />
                <span>Exporter les données (Sauvegarde)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Téléchargez la liste complète de vos {students.length} élèves au format CSV pour sauvegarde ou Excel.
              </p>
            </div>
            <div>
              <button
                onClick={handleExportCSV}
                className="bg-[#0B1C30] hover:bg-[#142d47] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer w-full shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV complet ({students.length})</span>
              </button>
              
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Opérations Avancées</h5>
                <button
                  onClick={handleClearCache}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Vider le Cache Local</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL / APERÇU DE L'IMPORT */}
        {importPreview && (
          <div className="mt-6 p-4 bg-slate-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Aperçu du fichier : {importPreview.length} ligne(s) détectée(s)</span>
              </h4>
              <button onClick={() => setImportPreview(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto overflow-x-auto bg-white border border-slate-200 rounded-lg p-2 text-xs">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-bold text-slate-600">
                  <tr>
                    <th className="p-1">#</th>
                    <th className="p-1">Matricule</th>
                    <th className="p-1">Prénom & Nom</th>
                    <th className="p-1">Étape</th>
                    <th className="p-1">Hizb</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="p-1 text-slate-400">{idx + 1}</td>
                      <td className="p-1 font-mono">{row.matricule || row.Matricule || "-"}</td>
                      <td className="p-1 font-semibold">{row.prenom || row.firstName || ""} {row.nom || row.lastName || ""}</td>
                      <td className="p-1">{row.etape || "Hifz"}</td>
                      <td className="p-1">{row.hizb || row.currentHizbNum || 60}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importPreview.length > 5 && (
                <p className="text-[10px] text-slate-400 italic mt-1">+ {importPreview.length - 5} autres élèves...</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setImportPreview(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isImporting ? "Importation..." : "Valider et importer"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full overflow-hidden">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#0B1C30]" />
              <span>Gestion de l'Équipe & Accès — إدارة الفريق</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Gérez le personnel, les enseignants et leurs accès au système</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            + Ajouter
          </button>
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
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

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4 mt-4">
          {staffList.map((staff, index) => (
            <div key={staff.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm ${index === 0 ? "border-amber-200" : "border-slate-200"}`}>
              {/* Card Header: Avatar & Info */}
              <div className={`p-4 flex items-center space-x-3 ${index === 0 ? "bg-amber-50/30" : ""}`}>
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-lg shrink-0 ${index === 0 ? "bg-amber-600" : "bg-[#0B1C30]"}`}>
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold text-sm truncate uppercase ${index === 0 ? "text-[#0B1C30]" : "text-slate-800"}`}>
                      {staff.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase truncate max-w-full">
                      {staff.role}
                    </span>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold border ${staff.status === "Actif" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}`}>
                      {staff.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Card Body: Data Rows */}
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">CONTACT</span>
                <div className="flex items-center space-x-1 font-semibold text-slate-800">
                  <span className="font-mono">{staff.phone}</span>
                </div>
              </div>
              
              {/* Actions Row */}
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex flex-col justify-center">
                <span className="font-bold text-slate-400 mb-2">ACTIONS</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenModal(staff)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-[#0B1C30] hover:bg-slate-50 rounded-lg transition-colors font-semibold">
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button onClick={() => handleDelete(staff.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {staffList.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm border border-slate-100 rounded-xl">
              Aucun personnel enregistré.
            </div>
          )}
        </div>
      </div>
      
      {/* SECTION LOGS SYSTEME */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full mt-8">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-600" />
            <span>Journaux d'Audit & Activité Système</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Historique des actions critiques effectuées par l'équipe sur la plateforme</p>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Date & Heure</th>
                <th className="px-4 py-2.5">Utilisateur</th>
                <th className="px-4 py-2.5">Action Effectuée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {systemLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-100/50">
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0B1C30] text-white flex items-center justify-center text-[8px]">{log.user.charAt(0)}</span>
                      {log.user}
                    </div>
                  </td>
                  <td className="px-4 py-3">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline decoration-emerald-600/30 underline-offset-4 cursor-pointer">
            Voir tout l'historique d'audit
          </button>
        </div>
      </div>

      {/* MODAL POUR AJOUTER/MODIFIER UN MEMBRE */}
      {/* Global Student List Section */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full overflow-hidden mt-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#0B1C30]" />
              <span>Registre Global des Élèves — سجل الطلاب</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Liste complète des inscrits de l'institut</p>
          </div>
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            Total : {students.length}
          </div>
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Matricule</th>
                <th className="px-4 py-3">Nom & Prénom</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Régime</th>
                <th className="px-4 py-3 rounded-tr-lg">Contact Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{student.matricule}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600 text-center">
                    {student.gender === 'F' ? (
                      <span className="text-pink-500 font-bold">♀</span>
                    ) : (
                      <span className="text-blue-500 font-bold">♂</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium border border-emerald-100">
                      {student.etape}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{student.regime || "Non défini"}</td>
                  <td className="px-4 py-3 text-xs">{student.parentPhone}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-xs font-medium">
                    Aucun élève enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4">
          {students.map((student) => (
            <div key={student.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {/* Card Header: Avatar & Info */}
              <div className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {student.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 text-sm truncate uppercase">{student.firstName}</span>
                    <span className="text-slate-800 font-bold text-sm truncate uppercase">{student.lastName}</span>
                    <span className="text-sm shrink-0">
                      {student.gender === 'F' ? (
                        <span className="text-pink-500 font-bold">♀</span>
                      ) : (
                        <span className="text-blue-500 font-bold">♂</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block bg-slate-500 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      {student.matricule}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Card Body: Data Rows */}
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">FAMILLE & CONTACTS</span>
                <div className="flex items-center space-x-1 font-semibold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.parentPhone || "Non renseigné"}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">PARCOURS CORAN</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {student.etape}
                </span>
              </div>
              
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">HÉBERGEMENT / RÉGIME</span>
                <span className="font-semibold text-slate-700 uppercase">
                  {student.regime || "-"}
                </span>
              </div>
              
              {/* Actions Row (Matching User Request) */}
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex flex-col justify-center">
                <span className="font-bold text-slate-400 mb-2">ACTIONS</span>
                <div className="flex items-center">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-semibold shadow-sm">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dossier</span>
                    <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Aucun élève enregistré.
            </div>
          )}
        </div>
      </div>

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
        </>
      )}
    </div>
  );
}
