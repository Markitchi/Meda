'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function EditPatientPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        medical_history: '',
        allergies: '',
    });

    useEffect(() => {
        fetchPatient();
    }, [params.id]);

    const fetchPatient = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const patient = await api.getPatient(token, parseInt(params.id));
            setFormData({
                patient_id: patient.patient_id,
                first_name: patient.first_name,
                last_name: patient.last_name,
                date_of_birth: patient.date_of_birth || '',
                gender: patient.gender || '',
                phone: patient.phone || '',
                email: patient.email || '',
                medical_history: patient.medical_history || '',
                allergies: patient.allergies || '',
            });
        } catch (error) {
            console.error('Failed to fetch patient:', error);
            setError('Impossible de charger le patient');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            await api.updatePatient(token, parseInt(params.id), {
                ...formData,
                date_of_birth: formData.date_of_birth || null,
            });

            router.push(`/patients/${params.id}`);
        } catch (err: any) {
            setError(err.message || 'Échec de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Chargement...</div>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Modifier Patient
                            </h1>
                            <p className="text-lg text-gray-700">
                                Mettre à jour les informations du patient
                            </p>
                        </div>
                        <motion.a
                            href={`/patients/${params.id}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Retour
                        </motion.a>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100"
                >
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

                        {/* Informations Personnelles */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">
                                Informations Personnelles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ID Patient *
                                    </label>
                                    <input
                                        type="text"
                                        name="patient_id"
                                        required
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        required
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de Naissance
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Genre
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                        <option value="O">Autre</option>
                                    </select>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+237 6XX XXX XXX"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informations Médicales */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">
                                Informations Médicales
                            </h2>
                            <div className="space-y-6">
                                {/* Medical History */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Antécédents Médicaux
                                    </label>
                                    <textarea
                                        name="medical_history"
                                        value={formData.medical_history}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                        placeholder="Diabète, hypertension, etc."
                                    />
                                </div>

                                {/* Allergies */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Allergies
                                    </label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                                        placeholder="Pénicilline, arachides, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <motion.button
                                type="submit"
                                disabled={saving}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                            </motion.button>
                            <motion.a
                                href={`/patients/${params.id}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all text-center"
                            >
                                Annuler
                            </motion.a>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
