'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
}

interface MedicalImage {
    id: number;
    original_filename: string;
    image_type: string;
}

export default function NewConsultationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [diagnosing, setDiagnosing] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [images, setImages] = useState<MedicalImage[]>([]);
    const [diagnosis, setDiagnosis] = useState<any>(null);

    const [formData, setFormData] = useState({
        patient_id: '',
        chief_complaint: '',
        symptoms: [] as string[],
        symptom_input: '',
        vital_signs: {
            temperature: '',
            blood_pressure: '',
            heart_rate: '',
            respiratory_rate: '',
            oxygen_saturation: '',
        },
        selected_images: [] as number[],
        diagnosis: '',
        treatment_plan: '',
        notes: '',
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (formData.patient_id) {
            fetchPatientImages(parseInt(formData.patient_id));
        }
    }, [formData.patient_id]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await api.getPatients(token);
                setPatients(data);
            }
        } catch (error) {
            console.error('Échec récupération patients:', error);
        }
    };

    const fetchPatientImages = async (patientId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await api.getPatientImages(token, patientId);
                setImages(data);
            }
        } catch (error) {
            console.error('Échec récupération images:', error);
        }
    };

    const handleAddSymptom = () => {
        if (formData.symptom_input.trim()) {
            setFormData({
                ...formData,
                symptoms: [...formData.symptoms, formData.symptom_input.trim()],
                symptom_input: ''
            });
        }
    };

    const handleRemoveSymptom = (index: number) => {
        setFormData({
            ...formData,
            symptoms: formData.symptoms.filter((_, i) => i !== index)
        });
    };

    const handleGenerateDiagnosis = async () => {
        if (!formData.patient_id || formData.symptoms.length === 0) {
            setError('Veuillez sélectionner un patient et ajouter des symptômes');
            return;
        }

        setDiagnosing(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/v1/diagnosis/comprehensive/${formData.patient_id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: parseInt(formData.patient_id),
                    symptoms: formData.symptoms,
                    vital_signs: {
                        temperature: formData.vital_signs.temperature ? parseFloat(formData.vital_signs.temperature) : null,
                        blood_pressure: formData.vital_signs.blood_pressure || null,
                        heart_rate: formData.vital_signs.heart_rate ? parseInt(formData.vital_signs.heart_rate) : null,
                        respiratory_rate: formData.vital_signs.respiratory_rate ? parseInt(formData.vital_signs.respiratory_rate) : null,
                        oxygen_saturation: formData.vital_signs.oxygen_saturation ? parseInt(formData.vital_signs.oxygen_saturation) : null,
                    },
                    image_ids: formData.selected_images.length > 0 ? formData.selected_images : null
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setDiagnosis(result);
                setFormData({
                    ...formData,
                    diagnosis: result.diagnosis
                });
            } else {
                setError('Échec de la génération du diagnostic');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setDiagnosing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/v1/consultations/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: parseInt(formData.patient_id),
                    chief_complaint: formData.chief_complaint,
                    symptoms: formData.symptoms,
                    vital_signs: {
                        temperature: formData.vital_signs.temperature ? parseFloat(formData.vital_signs.temperature) : null,
                        blood_pressure: formData.vital_signs.blood_pressure || null,
                        heart_rate: formData.vital_signs.heart_rate ? parseInt(formData.vital_signs.heart_rate) : null,
                        respiratory_rate: formData.vital_signs.respiratory_rate ? parseInt(formData.vital_signs.respiratory_rate) : null,
                        oxygen_saturation: formData.vital_signs.oxygen_saturation ? parseInt(formData.vital_signs.oxygen_saturation) : null,
                    },
                    diagnosis: formData.diagnosis,
                    ai_diagnosis: diagnosis,
                    treatment_plan: formData.treatment_plan,
                    notes: formData.notes,
                }),
            });

            if (response.ok) {
                router.push(`/patients/${formData.patient_id}`);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Échec de la création de la consultation');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100"></div>
                <div className="absolute inset-0 medical-pattern"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Nouvelle Consultation
                            </h1>
                            <p className="text-lg text-gray-700">
                                Créer une consultation avec diagnostic IA
                            </p>
                        </div>
                        <motion.a
                            href="/patients"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Retour
                        </motion.a>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Patient & Symptoms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Patient Selection */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Patient</h2>
                                <select
                                    value={formData.patient_id}
                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                                >
                                    <option value="">Sélectionner un patient...</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.patient_id} - {patient.first_name} {patient.last_name}
                                        </option>
                                    ))}
                                </select>
                            </motion.div>

                            {/* Chief Complaint */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Motif de Consultation</h2>
                                <input
                                    type="text"
                                    value={formData.chief_complaint}
                                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                                    required
                                    placeholder="Ex: Douleur thoracique, Fièvre persistante..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                                />
                            </motion.div>

                            {/* Symptoms */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Symptômes</h2>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={formData.symptom_input}
                                        onChange={(e) => setFormData({ ...formData, symptom_input: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
                                        placeholder="Ajouter un symptôme..."
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                                    />
                                    <motion.button
                                        type="button"
                                        onClick={handleAddSymptom}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg"
                                    >
                                        Ajouter
                                    </motion.button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.symptoms.map((symptom, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-2"
                                        >
                                            <span>{symptom}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSymptom(index)}
                                                className="text-emerald-600 hover:text-emerald-900"
                                            >
                                                ×
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Vital Signs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Signes Vitaux</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Température (°C)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.vital_signs.temperature}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                vital_signs: { ...formData.vital_signs, temperature: e.target.value }
                                            })}
                                            placeholder="37.0"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tension</label>
                                        <input
                                            type="text"
                                            value={formData.vital_signs.blood_pressure}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                vital_signs: { ...formData.vital_signs, blood_pressure: e.target.value }
                                            })}
                                            placeholder="120/80"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence Cardiaque</label>
                                        <input
                                            type="number"
                                            value={formData.vital_signs.heart_rate}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                vital_signs: { ...formData.vital_signs, heart_rate: e.target.value }
                                            })}
                                            placeholder="70"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence Respiratoire</label>
                                        <input
                                            type="number"
                                            value={formData.vital_signs.respiratory_rate}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                vital_signs: { ...formData.vital_signs, respiratory_rate: e.target.value }
                                            })}
                                            placeholder="16"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                                        <input
                                            type="number"
                                            value={formData.vital_signs.oxygen_saturation}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                vital_signs: { ...formData.vital_signs, oxygen_saturation: e.target.value }
                                            })}
                                            placeholder="98"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Images Selection */}
                            {images.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Images Médicales (Optionnel)</h2>
                                    <div className="space-y-2">
                                        {images.map((image) => (
                                            <label key={image.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selected_images.includes(image.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                selected_images: [...formData.selected_images, image.id]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                selected_images: formData.selected_images.filter(id => id !== image.id)
                                                            });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                                />
                                                <span className="text-gray-900">{image.original_filename} ({image.image_type})</span>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column - Diagnosis */}
                        <div className="space-y-6">
                            {/* Generate Diagnosis Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <motion.button
                                    type="button"
                                    onClick={handleGenerateDiagnosis}
                                    disabled={diagnosing || !formData.patient_id || formData.symptoms.length === 0}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {diagnosing ? 'Analyse en cours...' : '🤖 Générer Diagnostic IA'}
                                </motion.button>
                            </motion.div>

                            {/* AI Diagnosis Results */}
                            {diagnosis && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-2xl shadow-xl p-6 border border-purple-200"
                                >
                                    <h2 className="text-xl font-bold text-purple-900 mb-4">Résultats IA</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Confiance</p>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full"
                                                    style={{ width: `${diagnosis.confidence_score * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-right text-sm text-gray-600 mt-1">{(diagnosis.confidence_score * 100).toFixed(1)}%</p>
                                        </div>

                                        {diagnosis.differential_diagnoses && diagnosis.differential_diagnoses.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Diagnostics Différentiels</p>
                                                <div className="space-y-1">
                                                    {diagnosis.differential_diagnoses.map((diag: string, index: number) => (
                                                        <div key={index} className="px-3 py-2 bg-purple-50 text-purple-800 rounded-lg text-sm">
                                                            {diag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {diagnosis.urgency_level && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Urgence</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${diagnosis.urgency_level === 'urgent' ? 'bg-red-100 text-red-700' :
                                                        diagnosis.urgency_level === 'priority' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {diagnosis.urgency_level}
                                                </span>
                                            </div>
                                        )}

                                        {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">Recommandations</p>
                                                <ul className="space-y-1 text-sm text-gray-600">
                                                    {diagnosis.recommendations.map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-purple-500">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Manual Diagnosis */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnostic Final</h2>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    rows={4}
                                    placeholder="Diagnostic final (ajustez le diagnostic IA si nécessaire)..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                />
                            </motion.div>

                            {/* Treatment Plan */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Plan de Traitement</h2>
                                <textarea
                                    value={formData.treatment_plan}
                                    onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                                    rows={4}
                                    placeholder="Prescriptions, recommandations..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                />
                            </motion.div>

                            {/* Notes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Notes additionnelles..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                                />
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer la Consultation'}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
