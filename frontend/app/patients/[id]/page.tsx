'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { reportsApi } from '@/lib/api-reports';

interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    medical_history: string | null;
    allergies: string | null;
    created_at: string;
}

interface MedicalImage {
    id: number;
    original_filename: string;
    image_type: string;
    body_part: string | null;
    created_at: string;
}

interface Consultation {
    id: number;
    consultation_date: string;
    chief_complaint: string;
    diagnosis: string | null;
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [images, setImages] = useState<MedicalImage[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchPatientData(token);
    }, [params.id]);

    const fetchPatientData = async (token: string) => {
        try {
            const patientData = await api.getPatient(token, parseInt(params.id));
            setPatient(patientData);

            const imagesData = await api.getPatientImages(token, parseInt(params.id));
            setImages(imagesData);

            try {
                const consultationsRes = await fetch(`http://localhost:8000/api/v1/consultations/patient/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (consultationsRes.ok) {
                    setConsultations(await consultationsRes.json());
                }
            } catch (error) {
                console.error('Failed to fetch consultations:', error);
            }
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dob: string | null) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleDownloadPatientPDF = async () => {
        try {
            setDownloadingPDF(true);
            const token = localStorage.getItem('access_token');
            if (token) {
                await reportsApi.downloadPatientPDF(token, parseInt(params.id));
            }
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Échec du téléchargement du rapport PDF');
        } finally {
            setDownloadingPDF(false);
        }
    };

    const handleDownloadConsultationPDF = async (consultationId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                await reportsApi.downloadConsultationPDF(token, consultationId);
            }
        } catch (error) {
            console.error('Failed to download consultation PDF:', error);
            alert('Échec du téléchargement du rapport de consultation');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Chargement...</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Patient non trouvé</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100"></div>
                <div className="absolute inset-0 medical-pattern"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <p className="text-lg text-gray-700">
                                ID: {patient.patient_id}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.a
                                href={`/patients/${patient.id}/edit`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Modifier
                            </motion.a>
                            <motion.a
                                href="/patients"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Retour
                            </motion.a>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Patient Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Personal Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Personnelles</h2>
                            <div className="space-y-3">
                                <InfoRow label="Âge" value={`${calculateAge(patient.date_of_birth)} ans`} />
                                <InfoRow label="Genre" value={patient.gender === 'M' ? 'Masculin' : patient.gender === 'F' ? 'Féminin' : 'Autre'} />
                                <InfoRow label="Téléphone" value={patient.phone || '-'} />
                                <InfoRow label="Email" value={patient.email || '-'} />
                            </div>
                        </motion.div>

                        {/* Medical Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Médicales</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Antécédents</p>
                                    <p className="text-gray-600 text-sm">
                                        {patient.medical_history || 'Aucun antécédent enregistré'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Allergies</p>
                                    <p className="text-gray-600 text-sm">
                                        {patient.allergies || 'Aucune allergie connue'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
                            <div className="space-y-3">
                                <motion.a
                                    href={`/consultations/new?patient=${patient.id}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium text-center shadow-lg hover:shadow-xl transition-all"
                                >
                                    Nouvelle Consultation
                                </motion.a>
                                <motion.a
                                    href={`/upload?patient=${patient.id}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="block w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium text-center shadow-lg hover:shadow-xl transition-all"
                                >
                                    Ajouter Image
                                </motion.a>
                                <motion.button
                                    onClick={handleDownloadPatientPDF}
                                    disabled={downloadingPDF}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="block w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium text-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {downloadingPDF ? 'Téléchargement...' : '📄 Télécharger Rapport PDF'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Consultations & Images */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Consultations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Consultations ({consultations.length})</h2>
                            </div>
                            {consultations.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">Aucune consultation enregistrée</p>
                            ) : (
                                <div className="space-y-4">
                                    {consultations.map((consultation) => (
                                        <motion.a
                                            key={consultation.id}
                                            href={`/consultations/${consultation.id}`}
                                            whileHover={{ scale: 1.01 }}
                                            className="block p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{consultation.chief_complaint}</p>
                                                    {consultation.diagnosis && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Diagnostic: {consultation.diagnosis}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(consultation.consultation_date).toLocaleDateString('fr-FR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDownloadConsultationPDF(consultation.id);
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="ml-3 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Télécharger PDF"
                                                >
                                                    📄
                                                </motion.button>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Images */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Images Médicales ({images.length})</h2>
                            </div>
                            {images.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">Aucune image associée</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((image) => (
                                        <motion.a
                                            key={image.id}
                                            href={`/images/${image.id}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all group"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                <p className="text-white text-xs font-medium truncate">{image.original_filename}</p>
                                                <p className="text-white/80 text-xs">{image.image_type}</p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
        </div>
    );
}
