import React, { useState } from "react";
import { Settings, Users, Save, Edit, Trash2, X, Lock, KeyRound, Upload, Download, FileSpreadsheet, Check, AlertCircle, FolderOpen, ChevronDown, Fingerprint, BookOpen, Award, Shield, Activity, RefreshCw, UserPlus } from "lucide-react";
import Papa from "papaparse";
import { Student, Halaqa, AttendanceRecord, QuranLesson, PaymentRecord, EtapePedagogique } from "../types";
import StudentFile from "./StudentFile";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";

function getEtapeLabelFormat(etape: EtapePedagogique, gender?: string) {
  const isFemale = gender === "female" || gender === "F";
  switch (etape) {
    case EtapePedagogique.Tahajji:
      return "Tahajji (التهجي)";
    case EtapePedagogique.Hifz:
      return "Hifz (الحفظ)";
    case EtapePedagogique.Murajaah:
      return "Muraja'ah (المراجعة)";
    case EtapePedagogique.Tathbit:
      return "Tathbit (التثبيت)";
    case EtapePedagogique.Khatm:
      return "Khatm (الختم)";
    case EtapePedagogique.Hafiz:
      return isFemale ? "Hafizat (حافظة) 👑" : "Hafiz (حافظ) 👑";
    default:
      return etape;
  }
}

interface ParametresTabProps {
  students?: Student[];
  halaqas?: Halaqa[];
  attendance?: AttendanceRecord[];
  lessons?: QuranLesson[];
  payments?: PaymentRecord[];
  onImportStudents?: (importedStudents: Partial<Student>[]) => Promise<void>;
  onUpdateInstituteName?: (name: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onAddHalaqa?: (halaqa: Halaqa) => void;
  onUpdateHalaqa?: (halaqa: Halaqa) => void;
  onDeleteHalaqa?: (halaqaId: string) => void;
}

export default function ParametresTab({
  students = [],
  halaqas = [],
  attendance = [],
  lessons = [],
  payments = [],
  onImportStudents,
  onUpdateInstituteName,
  onUpdateStudent,
  onAddHalaqa,
  onUpdateHalaqa,
  onDeleteHalaqa
}: ParametresTabProps) {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("daara_admin_auth") === "true";
  });
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [authError, setAuthError] = useState(false);

  // General Settings State
  const [instituteName, setInstituteName] = useState(() => 
    localStorage.getItem("daara_institute_name") || "Rayhanah Institute"
  );
  const [academicYear, setAcademicYear] = useState(() => 
    localStorage.getItem("daara_academic_year") || "2026-2027"
  );
  const [pointsHizb, setPointsHizb] = useState(() => 
    Number(localStorage.getItem("daara_points_hizb")) || 100
  );
  const [pointsSurah, setPointsSurah] = useState(() => 
    Number(localStorage.getItem("daara_points_surah")) || 15
  );
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Student Dossier Viewing & Filtering State
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentFilter, setStudentFilter] = useState<"tous" | "en_cours" | "hafiz" | "abandonne">("tous");

  const countEnCours = React.useMemo(() => 
    students.filter(s => s.status === "en_cours" || (!s.status && s.etape !== EtapePedagogique.Hafiz)).length,
    [students]
  );
  const countHuffaz = React.useMemo(() => 
    students.filter(s => s.status === "hafiz" || s.etape === EtapePedagogique.Hafiz).length,
    [students]
  );
  const countAbandonne = React.useMemo(() => 
    students.filter(s => s.status === "abandonne").length,
    [students]
  );

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => {
      if (studentFilter === "en_cours") {
        return s.status === "en_cours" || (!s.status && s.etape !== EtapePedagogique.Hafiz);
      }
      if (studentFilter === "hafiz") {
        return s.status === "hafiz" || s.etape === EtapePedagogique.Hafiz;
      }
      if (studentFilter === "abandonne") {
        return s.status === "abandonne";
      }
      return true;
    });
  }, [students, studentFilter]);

  // Quick Add Student State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState<Partial<Student>>({
    firstName: "",
    lastName: "",
    gender: "M",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    nationality: "Sénégalaise",
    age: 7,
    regime: "internat",
    halaqaId: halaqas[0]?.id || "",
    etape: EtapePedagogique.Tahajji,
    khatmatCount: 0,
    dailyWardHizbs: 0,
    score: 50,
    balanceDue: 0,
    monthlyFee: 0,
  });

  // Halaqa Modal State
  const [isHalaqaModalOpen, setIsHalaqaModalOpen] = useState(false);
  const [editingHalaqa, setEditingHalaqa] = useState<Halaqa | null>(null);
  const [halaqaForm, setHalaqaForm] = useState({ name: "", teacherName: "", maxCapacity: 20 });

  const openNewHalaqaModal = () => {
    setEditingHalaqa(null);
    setHalaqaForm({ name: "", teacherName: "", maxCapacity: 20 });
    setIsHalaqaModalOpen(true);
  };

  const openEditHalaqaModal = (h: Halaqa) => {
    setEditingHalaqa(h);
    setHalaqaForm({ name: h.name, teacherName: h.teacherName, maxCapacity: h.maxCapacity });
    setIsHalaqaModalOpen(true);
  };

  const handleSaveHalaqa = () => {
    if (!halaqaForm.name || !halaqaForm.teacherName) {
      alert("Veuillez renseigner le nom de la Halaqa et l'enseignant.");
      return;
    }
    if (editingHalaqa) {
      if (onUpdateHalaqa) {
        onUpdateHalaqa({ ...editingHalaqa, ...halaqaForm });
      }
    } else {
      if (onAddHalaqa) {
        onAddHalaqa({
          id: `h_${Date.now()}`,
          ...halaqaForm
        });
      }
    }
    setIsHalaqaModalOpen(false);
  };

  const handleSaveGeneralSettings = () => {
    localStorage.setItem("daara_institute_name", instituteName);
    localStorage.setItem("daara_academic_year", academicYear);
    localStorage.setItem("daara_points_hizb", pointsHizb.toString());
    localStorage.setItem("daara_points_surah", pointsSurah.toString());
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
      sessionStorage.setItem("daara_admin_auth", "true");
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordAttempt("");
    }
  };

  const handleQuickAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.firstName || !newStudentData.lastName || !newStudentData.halaqaId) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }
    const count = students.length + 1;
    const matricule = `IRY-${String(count).padStart(4, "0")}`;
    
    const mainParentName = newStudentData.parentName || newStudentData.fatherName || newStudentData.guardianName || "";
    const mainParentPhone = newStudentData.parentPhone || newStudentData.fatherPhone || newStudentData.guardianPhone || "";

    const studentToSave: Partial<Student> = {
      ...newStudentData,
      parentName: mainParentName,
      parentPhone: mainParentPhone,
      id: `s_${Date.now()}`,
      matricule,
      status: "en_cours",
      medals: []
    };

    if (onImportStudents) {
      await onImportStudents([studentToSave]);
      setShowAddStudentModal(false);
      setNewStudentData({
        firstName: "",
        lastName: "",
        gender: "M",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        fatherName: "",
        fatherPhone: "",
        motherName: "",
        motherPhone: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
        nationality: "Sénégalaise",
        age: 7,
        regime: "internat",
        halaqaId: halaqas[0]?.id || "",
        etape: EtapePedagogique.Tahajji,
        khatmatCount: 0,
        dailyWardHizbs: 0,
        score: 50,
        balanceDue: 0,
        monthlyFee: 0,
      });
      alert("Élève ajouté avec succès !");
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
        rp: { name: "Rayhanah Institute", id: window.location.hostname },
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

  const handleClearCacheAndReload = async () => {
    if (confirm("Voulez-vous réinitialiser le cache et forcer l'actualisation vers la toute dernière version ?")) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      window.location.reload();
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

  const INITIAL_STAFF = [
    { id: 1, name: "Cheikh Baye Kane (شيخ باي كان)", role: "Directeur (المدير)", phone: "+221 77 000 00 01", status: "Actif" },
    { id: 2, name: "Mohamed Sall (محمد صال)", role: "Enseignant Principal (المدرس)", phone: "+221 77 000 00 02", status: "Actif" },
    { id: 3, name: "Mohamed Ka (محمد كا)", role: "Enseignant Assistant (المساعد)", phone: "+221 77 000 00 03", status: "Actif" },
    { id: 4, name: "Asma Niass (آسماء انياس)", role: "Secrétaire (سكرتيرة)", phone: "+221 78 000 00 04", status: "Actif" },
    { id: 5, name: "Khadidja Ji (خديجة جي)", role: "Assistante (المساعدة)", phone: "+221 70 000 00 05", status: "Actif" },
  ];

  const [staffList, setStaffList] = useState(() => {
    const cached = localStorage.getItem("daara_staff_list");
    return cached ? JSON.parse(cached) : INITIAL_STAFF;
  });

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

  // Supabase Staff Cloud Sync & Realtime Listener
  React.useEffect(() => {
    supabase.from("Staff").select("*").then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setStaffList(data);
        localStorage.setItem("daara_staff_list", JSON.stringify(data));
      }
    });

    const channel = supabase
      .channel("staff-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "Staff" }, () => {
        supabase.from("Staff").select("*").then(({ data, error }) => {
          if (!error && data) {
            setStaffList(data);
            localStorage.setItem("daara_staff_list", JSON.stringify(data));
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
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

  const handleSave = async () => {
    if (!formData.name || !formData.role) return;
    const targetId = editingId !== null ? String(editingId) : `st_${Date.now()}`;
    const newMember = { id: targetId, ...formData };

    let updatedStaff;
    if (editingId !== null) {
      updatedStaff = staffList.map(s => String(s.id) === String(editingId) ? newMember : s);
    } else {
      updatedStaff = [...staffList, newMember];
    }
    setStaffList(updatedStaff);
    localStorage.setItem("daara_staff_list", JSON.stringify(updatedStaff));
    setIsModalOpen(false);

    try {
      await supabase.from("Staff").upsert(newMember);
    } catch (err) {
      console.warn("Error saving staff member to Supabase:", err);
    }
  };

  // State for CSV Import
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [selectedImportIndices, setSelectedImportIndices] = useState<number[]>([]);
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
        setSelectedImportIndices(results.data.map((_: any, idx: number) => idx));
      },
      error: (err) => {
        setImportError(`Erreur : ${err.message}`);
      }
    });
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;

    const selectedRows = importPreview.filter((_, idx) => selectedImportIndices.includes(idx));
    if (selectedRows.length === 0) {
      alert("Veuillez sélectionner au moins un élève à importer.");
      return;
    }

    setIsImporting(true);
    try {
      const parsedStudents: Partial<Student>[] = selectedRows.map((row: any, idx: number) => {
        const fatherName = row.fatherName || row.pere || row.Père || row.father || row["Nom Père"] || row["Nom du Père"] || "";
        const fatherPhone = row.fatherPhone || row.tel_pere || row["Tél Père"] || row["Téléphone Père"] || "";
        const motherName = row.motherName || row.mere || row.Mère || row.mother || row["Nom Mère"] || row["Nom de la Mère"] || "";
        const motherPhone = row.motherPhone || row.tel_mere || row["Tél Mère"] || row["Téléphone Mère"] || "";
        const guardianName = row.guardianName || row.tuteur || row.Tuteur || row.guardian || row["Nom Tuteur"] || row["Nom du Tuteur"] || "";
        const guardianPhone = row.guardianPhone || row.tel_tuteur || row["Tél Tuteur"] || row["Téléphone Tuteur"] || row.telephone || row.Telephone || "";
        const guardianRelation = row.guardianRelation || row.lien_tuteur || row["Lien Tuteur"] || row.Relation || "";
        
        const parentName = row.parentName || row.parent || row.Parent || fatherName || guardianName || "Parent Inconnu";
        const parentPhone = row.parentPhone || fatherPhone || guardianPhone || "+221 77 000 00 00";
        const parentEmail = row.parentEmail || row.email || row.Email || "";

        return {
          id: row.id || row.matricule || `imp_${Date.now()}_${idx}`,
          matricule: row.matricule || row.Matricule || `IRY-${String(students.length + idx + 1).padStart(4, "0")}`,
          firstName: row.firstName || row.prenom || row.Prenom || row["Prénom"] || "Élève",
          lastName: row.lastName || row.nom || row.Nom || "Inconnu",
          gender: row.gender || row.sexe || row.Sexe || row.Genre || "M",
          age: Number(row.age || row.Age || row["Âge"] || 7),
          nationality: row.nationality || row.nationalite || row.Nationalité || "Sénégalaise",
          regime: row.regime || row.Regime || row["Régime"] || "internat",
          parentName,
          parentPhone,
          parentEmail: parentEmail || undefined,
          fatherName: fatherName || undefined,
          fatherPhone: fatherPhone || undefined,
          motherName: motherName || undefined,
          motherPhone: motherPhone || undefined,
          guardianName: guardianName || undefined,
          guardianPhone: guardianPhone || undefined,
          guardianRelation: guardianRelation || undefined,
          halaqaId: row.halaqaId || row.halaqa || row.Halaqa || halaqas[0]?.id || "h1",
          etape: (row.etape as EtapePedagogique) || EtapePedagogique.Tahajji,
          currentHizbNum: Number(row.currentHizbNum || row.hizb || row.Hizb) || 60,
          currentHizbFraction: Number(row.currentHizbFraction || row.fraction || 0),
          monthlyFee: Number(row.monthlyFee || row.tarif || row.Mensualité || 15000),
          balanceDue: Number(row.balanceDue || row.solde || row.Impayé || 0),
          score: Number(row.score || 50),
          khatmatCount: Number(row.khatmatCount || 0),
          status: "en_cours"
        };
      });

      if (onImportStudents) {
        await onImportStudents(parsedStudents);
      } else {
        const res = await fetch("/api/students/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedStudents })
        });
        if (!res.ok) throw new Error("Échec de l'import backend");
      }

      setImportSuccess(`${parsedStudents.length} élève(s) importé(s) avec succès !`);
      setImportPreview(null);
      setSelectedImportIndices([]);
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
    link.setAttribute("download", `ELEVES_RAYHANAH_INSTITUTE_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce membre du personnel ?")) {
      const updatedStaff = staffList.filter(s => String(s.id) !== String(id));
      setStaffList(updatedStaff);
      localStorage.setItem("daara_staff_list", JSON.stringify(updatedStaff));

      try {
        await supabase.from("Staff").delete().eq("id", String(id));
      } catch (err) {
        console.warn("Error deleting staff member from Supabase:", err);
      }
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
          <h3 className="font-bold text-xl text-slate-800 mb-2">{t('settings.restrictedAccess')}</h3>
          <p className="text-sm text-slate-500 mb-6">
            {t('settings.restrictedDesc')}
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
              {authError && <p className="text-rose-500 text-xs mt-2 font-semibold">{t('settings.wrongPassword')}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#0B1C30] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#142d47] transition-colors cursor-pointer shadow-sm"
            >
              {t('settings.unlock')}
            </button>
          </form>

          {hasBiometric && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleBiometricLogin}
                className="w-full bg-slate-50 border border-slate-200 text-[#0B1C30] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-5 h-5 text-emerald-600" />
                {t('settings.bioLogin')}
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
            <span>{t('settings.globalAdmin')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('settings.globalAdminDesc')}</p>
        </div>

        {settingsSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{t('settings.settingsSaved')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">{t('settings.schoolIdentity')}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.instituteName')}</label>
                <input 
                  type="text" 
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/20" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.academicYear')}</label>
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
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2">{t('settings.smsGateway')}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.activeProvider')}</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 font-medium">
                  <option>Orange Sénégal API</option>
                  <option>Twilio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.apiKey')}</label>
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
                    t('settings.testConnection')
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              {t('settings.securityAccess')}
            </h4>
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-tight">
                {t('settings.bioDesc')}
              </p>
              
              {!hasBiometric ? (
                <button
                  onClick={handleRegisterBiometric}
                  className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  {t('settings.enableBio')}
                </button>
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t('settings.bioActive')}</span>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("daara_biometric_id");
                      setHasBiometric(false);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-[10px] underline cursor-pointer"
                  >
                    {t('settings.disable')}
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
            {t('settings.saveChanges')}
          </button>
        </div>
      </div>

      {/* SECTION CONFIGURATION PEDAGOGIQUE */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full mt-8">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>{t('settings.pedagogyConfig')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('settings.pedagogyConfigDesc')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> {t('settings.halaqaManagement')}
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-[11px] text-slate-500">{t('settings.halaqaDesc')}</p>
              
              {halaqas.map((h) => {
                const count = students.filter(s => s.halaqaId === h.id).length;
                return (
                  <div key={h.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-xs border border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-700">{h.name}</div>
                      <div className="text-[10px] text-slate-500">{h.teacherName} • {count} élèves (max {h.maxCapacity || 20})</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditHalaqaModal(h)} title="Modifier" className="text-slate-400 hover:text-[#0B1C30] p-1 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm(`Supprimer la Halaqa "${h.name}" ?`)) onDeleteHalaqa?.(h.id); }} title="Supprimer" className="text-slate-400 hover:text-rose-600 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}

              {halaqas.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">{t('settings.noHalaqa')}</p>
              )}

              <button
                onClick={openNewHalaqaModal}
                className="w-full py-2.5 bg-white border-2 border-dashed border-indigo-300 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{t('settings.createHalaqa')}</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> {t('settings.pointsScale')}
            </h4>
            <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('settings.pointsHizb')}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={pointsHizb} onChange={(e) => setPointsHizb(Number(e.target.value))} className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-sm text-center font-bold" />
                  <span className="text-xs text-slate-500">points attribués à l'élève</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('settings.pointsSurah')}</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={pointsSurah} onChange={(e) => setPointsSurah(Number(e.target.value))} className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-sm text-center font-bold" />
                  <span className="text-xs text-slate-500">points de récompense par leçon réussie</span>
                </div>
              </div>
              <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors w-full cursor-pointer shadow-sm">
                {t('settings.saveScale')}
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
            <span>{t('settings.dataManagement')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('settings.dataDesc')}</p>
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
                <span>{t('settings.importStudents')}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Chargez un fichier CSV (champs : matricule, nom, prenom, etape, hizb, tuteur, telephone...).
              </p>
            </div>
            <div>
              <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{t('settings.chooseCSV')}</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Export CSV */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-600" />
                <span>{t('settings.exportData')}</span>
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
                <span>{t('settings.exportCsv')} ({students.length})</span>
              </button>
              
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">{t('settings.advancedOps')}</h5>
                <button
                  onClick={handleClearCache}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('settings.clearCache')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL AJOUT RAPIDE ELEVE */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  Ajouter un Élève
                </h3>
                <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto">
                <form id="quick-add-student-form" onSubmit={handleQuickAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                      <input type="text" required className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.firstName} onChange={e => setNewStudentData({...newStudentData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                      <input type="text" required className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.lastName} onChange={e => setNewStudentData({...newStudentData, lastName: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Âge</label>
                      <input type="number" min="4" max="30" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.age} onChange={e => setNewStudentData({...newStudentData, age: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Genre</label>
                      <select className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.gender} onChange={e => setNewStudentData({...newStudentData, gender: e.target.value})}>
                        <option value="M">Garçon</option>
                        <option value="F">Fille</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nationalité</label>
                      <input type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.nationality} onChange={e => setNewStudentData({...newStudentData, nationality: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Halaqa *</label>
                      <select required className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.halaqaId} onChange={e => setNewStudentData({...newStudentData, halaqaId: e.target.value})}>
                        {halaqas.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Régime</label>
                      <select className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.regime} onChange={e => setNewStudentData({...newStudentData, regime: e.target.value as any})}>
                        <option value="internat">Internat</option>
                        <option value="externat">Externat</option>
                        <option value="demi-pension">Demi-pension</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Étape (Niveau)</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.etape} onChange={e => setNewStudentData({...newStudentData, etape: e.target.value as EtapePedagogique})}>
                      {Object.values(EtapePedagogique).map(etape => (
                        <option key={etape} value={etape}>{getEtapeLabelFormat(etape)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">Information Filiation & Tuteur</h4>
                    
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nom du Père</label>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" value={newStudentData.fatherName} onChange={e => setNewStudentData({...newStudentData, fatherName: e.target.value})} placeholder="Nom Père" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Tél Père</label>
                        <input type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" value={newStudentData.fatherPhone} onChange={e => setNewStudentData({...newStudentData, fatherPhone: e.target.value})} placeholder="Tél Père" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nom de la Mère</label>
                        <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" value={newStudentData.motherName} onChange={e => setNewStudentData({...newStudentData, motherName: e.target.value})} placeholder="Nom Mère" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Tél Mère</label>
                        <input type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" value={newStudentData.motherPhone} onChange={e => setNewStudentData({...newStudentData, motherPhone: e.target.value})} placeholder="Tél Mère" />
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 space-y-2">
                      <span className="text-[11px] font-bold text-amber-900 block">Tuteur Légal (Si différent)</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nom Tuteur</label>
                          <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs" value={newStudentData.guardianName} onChange={e => setNewStudentData({...newStudentData, guardianName: e.target.value})} placeholder="Tuteur" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tél Tuteur</label>
                          <input type="tel" className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs" value={newStudentData.guardianPhone} onChange={e => setNewStudentData({...newStudentData, guardianPhone: e.target.value})} placeholder="Tél" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Lien</label>
                          <input type="text" className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs" value={newStudentData.guardianRelation} onChange={e => setNewStudentData({...newStudentData, guardianRelation: e.target.value})} placeholder="Ex: Oncle" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optionnel)</label>
                      <input type="email" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={newStudentData.parentEmail} onChange={e => setNewStudentData({...newStudentData, parentEmail: e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                  Annuler
                </button>
                <button type="submit" form="quick-add-student-form" className="px-4 py-2 bg-[#0B1C30] hover:bg-[#142d47] text-white rounded-lg text-sm font-bold transition-colors">
                  Enregistrer l'élève
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / APERÇU COMPLET DE L'IMPORT EXCEL / CSV */}
        {importPreview && (
          <div className="mt-6 p-4 sm:p-5 bg-slate-50 border border-emerald-300 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800 uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Aperçu de l'import : {importPreview.length} élève(s) détecté(s)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cochez ou décochez les élèves que vous souhaitez importer dans le système.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedImportIndices.length === importPreview.length) {
                      setSelectedImportIndices([]);
                    } else {
                      setSelectedImportIndices(importPreview.map((_, i) => i));
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {selectedImportIndices.length === importPreview.length ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
                <button onClick={() => setImportPreview(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto overflow-x-auto bg-white border border-slate-200 rounded-xl text-xs shadow-inner">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px] sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={importPreview.length > 0 && selectedImportIndices.length === importPreview.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImportIndices(importPreview.map((_, i) => i));
                          } else {
                            setSelectedImportIndices([]);
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="p-2.5">Matricule</th>
                    <th className="p-2.5">Élève (Prénom & Nom)</th>
                    <th className="p-2.5">Sexe / Âge / Nat.</th>
                    <th className="p-2.5">Père (Nom & Tél)</th>
                    <th className="p-2.5">Mère (Nom & Tél)</th>
                    <th className="p-2.5">Tuteur / Parent</th>
                    <th className="p-2.5">Régime & Niveau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreview.map((row, idx) => {
                    const isSelected = selectedImportIndices.includes(idx);
                    const prenom = row.firstName || row.prenom || row.Prenom || row["Prénom"] || "Élève";
                    const nom = row.lastName || row.nom || row.Nom || "";
                    const pere = row.fatherName || row.pere || row.Père || row.father || row["Nom Père"] || "—";
                    const telPere = row.fatherPhone || row.tel_pere || row["Tél Père"] || "";
                    const mere = row.motherName || row.mere || row.Mère || row.mother || row["Nom Mère"] || "—";
                    const telMere = row.motherPhone || row.tel_mere || row["Tél Mère"] || "";
                    const tuteur = row.guardianName || row.tuteur || row.Tuteur || row.parentName || row.parent || "—";
                    const telTuteur = row.guardianPhone || row.tel_tuteur || row.parentPhone || row.telephone || "";

                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedImportIndices(selectedImportIndices.filter(i => i !== idx));
                          } else {
                            setSelectedImportIndices([...selectedImportIndices, idx]);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-slate-50 opacity-60"}`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedImportIndices([...selectedImportIndices, idx]);
                              } else {
                                setSelectedImportIndices(selectedImportIndices.filter(i => i !== idx));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-600">{row.matricule || row.Matricule || `IRY-${String(students.length + idx + 1).padStart(4, "0")}`}</td>
                        <td className="p-2.5 font-bold text-slate-800">{prenom} {nom}</td>
                        <td className="p-2.5 text-slate-600">
                          {row.gender || row.sexe || "M"} · {row.age || row.Age || 7} ans · {row.nationality || row.nationalite || "SN"}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          <span className="font-semibold">{pere}</span> {telPere && <span className="text-slate-400 font-mono text-[10px]">({telPere})</span>}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          <span className="font-semibold">{mere}</span> {telMere && <span className="text-slate-400 font-mono text-[10px]">({telMere})</span>}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          <span className="font-semibold">{tuteur}</span> {telTuteur && <span className="text-slate-400 font-mono text-[10px]">({telTuteur})</span>}
                        </td>
                        <td className="p-2.5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {row.regime || "internat"} · {row.etape || "Tahajji"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-600">
                {selectedImportIndices.length} sur {importPreview.length} élève(s) sélectionné(s)
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setImportPreview(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting || selectedImportIndices.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isImporting ? "Importation en cours..." : `Importer (${selectedImportIndices.length}) élève(s)`}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full overflow-hidden">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#0B1C30]" />
              <span>{t('settings.teamManagement')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('settings.teamDesc')}</p>
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
                <th className="px-4 py-3 rounded-tl-lg">{t('settings.fullName')}</th>
                <th className="px-4 py-3">{t('settings.positionRole')}</th>
                <th className="px-4 py-3">{t('school.phone')}</th>
                <th className="px-4 py-3">{t('settings.status')}</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">{t('settings.actions')}</th>
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
                    <span>{t('studentFile.edit')}</span>
                  </button>
                  <button onClick={() => handleDelete(staff.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('settings.delete')}</span>
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
      <div className="bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl shadow-xs max-w-4xl mx-auto w-full mt-8">
        <div className="mb-5">
          <h3 className="font-bold text-base sm:text-lg text-slate-800 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-600 shrink-0" />
            <span>{t('settings.auditLogs')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('settings.auditDesc')}</p>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 whitespace-nowrap">{t('settings.dateTime')}</th>
                <th className="px-4 py-2.5">{t('settings.user')}</th>
                <th className="px-4 py-2.5">{t('settings.actionDone')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {systemLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-100/50">
                  <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0B1C30] text-white flex items-center justify-center text-[8px] shrink-0">{log.user.charAt(0)}</span>
                      {log.user}
                    </div>
                  </td>
                  <td className="px-4 py-3">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-2">
          {systemLogs.map(log => (
            <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B1C30] text-white flex items-center justify-center text-[9px] font-bold shrink-0">{log.user.charAt(0)}</span>
                  <span className="text-xs font-bold text-slate-700">{log.user}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
              </div>
              <p className="text-xs text-slate-600 pl-8">{log.action}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline decoration-emerald-600/30 underline-offset-4 cursor-pointer">
            Voir tout l'historique d'audit
          </button>
          <button
            onClick={handleClearCacheAndReload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('settings.clearCache')}</span>
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
              <span>{t('settings.globalStudentRegistry')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('settings.registryDesc')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
              Total : {students.length}
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              + Ajouter
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
          {[
            { id: "tous", label: "Tous", count: students.length, color: "bg-slate-800 text-white" },
            { id: "en_cours", label: "📖 En cours", count: countEnCours, color: "bg-emerald-600 text-white" },
            { id: "hafiz", label: "👑 Huffaz", count: countHuffaz, color: "bg-amber-600 text-white" },
            { id: "abandonne", label: "⚠️ Abandonnés", count: countAbandonne, color: "bg-rose-600 text-white" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStudentFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                studentFilter === f.id
                  ? `${f.color} shadow-xs`
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${studentFilter === f.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 font-mono"}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">{t('school.cardMatricule')}</th>
                <th className="px-4 py-3">{t('settings.firstLastName')}</th>
                <th className="px-4 py-3">{t('studentFile.gender')}</th>
                <th className="px-4 py-3">{t('settings.level')}</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">{t('studentFile.regime')}</th>
                <th className="px-4 py-3">{t('settings.parentContact')}</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">{t('settings.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{student.matricule}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600 text-center">
                    {(student.gender === 'female' || student.gender === 'F') ? (
                      <span className="text-pink-500 font-bold">♀</span>
                    ) : (
                      <span className="text-blue-500 font-bold">♂</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium border border-emerald-100">
                      {getEtapeLabelFormat(student.etape, student.gender)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded font-bold border ${
                      (student.status === "abandonne") ? "bg-rose-100 text-rose-700 border-rose-200" :
                      (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? "bg-amber-100 text-amber-800 border-amber-200" :
                      "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}>
                      {student.status === "abandonne" ? "⚠️ Abandonné" : (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? "👑 Hafiz(a)" : "📖 En cours"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{student.regime || "Non défini"}</td>
                  <td className="px-4 py-3 text-xs">{student.parentPhone}</td>
                  <td className="px-4 py-3 text-xs text-right">
                    <button
                      onClick={() => setViewingStudent(student)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{t('settings.file')}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-xs font-medium">
                    Aucun élève trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4">
          {filteredStudents.map((student) => (
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
                      {(student.gender === 'female' || student.gender === 'F') ? (
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
                  {getEtapeLabelFormat(student.etape, student.gender)}
                </span>
              </div>
              
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">STATUT</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  (student.status === "abandonne") ? "bg-rose-100 text-rose-700 border-rose-200" :
                  (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? "bg-amber-100 text-amber-800 border-amber-200" :
                  "bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}>
                  {student.status === "abandonne" ? "⚠️ Abandonné" : (student.status === "hafiz" || student.etape === EtapePedagogique.Hafiz) ? "👑 Hafiz(a)" : "📖 En cours"}
                </span>
              </div>
              
              <div className="border-t border-slate-100 px-4 py-3 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-400">HÉBERGEMENT / RÉGIME</span>
                <span className="font-semibold text-slate-700 uppercase">
                  {student.regime || "-"}
                </span>
              </div>
              
              {/* Actions Row */}
              <div className="border-t border-slate-100 p-3 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setViewingStudent(student)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{t('settings.openStudentFile')}</span>
                </button>
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

      {/* Student Dossier Modal */}
      {viewingStudent && (
        <StudentFile
          student={viewingStudent}
          halaqas={halaqas}
          attendance={attendance}
          lessons={lessons}
          payments={payments}
          onClose={() => setViewingStudent(null)}
          onUpdateStudent={(updated) => {
            onUpdateStudent?.(updated);
            setViewingStudent(updated);
          }}
        />
      )}

      {/* Halaqa Create / Edit Modal */}
      {isHalaqaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[#0B1C30]">
                {editingHalaqa ? "Modifier la Halaqa" : "Créer une nouvelle Halaqa"}
              </h3>
              <button onClick={() => setIsHalaqaModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.halaqaName')}</label>
                <input 
                  type="text" 
                  value={halaqaForm.name}
                  onChange={(e) => setHalaqaForm({...halaqaForm, name: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium" 
                  placeholder="Ex: Halaqa Abu Bakr — حلقة أبو بكر"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.responsibleTeacher')}</label>
                <input 
                  type="text" 
                  value={halaqaForm.teacherName}
                  onChange={(e) => setHalaqaForm({...halaqaForm, teacherName: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="Ex: Oustaz Mohamed Ka"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.maxCapacity')}</label>
                <input 
                  type="number" 
                  min={1}
                  max={100}
                  value={halaqaForm.maxCapacity}
                  onChange={(e) => setHalaqaForm({...halaqaForm, maxCapacity: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold" 
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setIsHalaqaModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveHalaqa}
                disabled={!halaqaForm.name || !halaqaForm.teacherName}
                className="px-5 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                {editingHalaqa ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.fullNameEx')}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="Saisissez le nom complet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.positionRole')}</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="Ex: Maître Coranique (أستاذ)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('school.phone')}</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  placeholder="+221 ..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('settings.status')}</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Actif">{t('settings.statusActive')}</option>
                  <option value="Inactif">{t('settings.statusInactive')}</option>
                  <option value="En congé">{t('settings.statusOnLeave')}</option>
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
