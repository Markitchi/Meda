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
    date_of_birth: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    created_at: string;
}

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async (searchTerm?: string) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                if (!hasRedirected) {
                    setHasRedirected(true);
                    router.push('/login');
                }
                return;
            }

            const data = await api.getPatients(token, searchTerm);
            setPatients(data);
        } catch (error: any) {
            console.error('Échec récupération patients:', error);
            // Si erreur 401, rediriger vers login
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                if (!hasRedirected) {
                    setHasRedirected(true);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    router.push('/login');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPatients(search);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient?')) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await api.deletePatient(token, id);
            setPatients(patients.filter(p => p.id !== id));
        } catch (error) {
            console.error('Échec suppression patient:', error);
            alert('Erreur lors de la suppression du patient');
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Gestion des Patients
                        </h1>
                        <p className="text-lg text-gray-700">
                            Gérer les dossiers patients et l'historique médical
                        </p>
                    </div>
                    <motion.a
                        href="/patients/new"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        Nouveau Patient
                    </motion.a>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-emerald-100"
                >
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, prénom ou ID patient..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Rechercher
                        </motion.button>
                        {search && (
                            <motion.button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    fetchPatients();
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Réinitialiser
                            </motion.button>
                        )}
                    </form>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                >
                    <StatCard title="Total Patients" value={patients.length} gradient="from-emerald-500 to-teal-500" />
                    <StatCard title="Hommes" value={patients.filter(p => p.gender === 'M').length} gradient="from-teal-500 to-cyan-500" />
                    <StatCard title="Femmes" value={patients.filter(p => p.gender === 'F').length} gradient="from-cyan-500 to-blue-500" />
                </motion.div>

                {/* Patients Table */}
                {patients.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-12 text-center border border-emerald-100"
                    >
                        <p className="text-gray-600">Aucun patient trouvé</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ID Patient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Nom Complet
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Âge
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Genre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients.map((patient) => (
                                        <motion.tr
                                            key={patient.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                            className="transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {patient.patient_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {patient.first_name} {patient.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {calculateAge(patient.date_of_birth)} ans
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {patient.gender || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {patient.phone || patient.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <a
                                                    href={`/patients/${patient.id}`}
                                                    className="text-emerald-600 hover:text-emerald-900 transition-colors"
                                                >
                                                    Voir
                                                </a>
                                                <a
                                                    href={`/patients/${patient.id}/edit`}
                                                    className="text-teal-600 hover:text-teal-900 transition-colors"
                                                >
                                                    Modifier
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(patient.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, gradient }: { title: string; value: number; gradient: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
            <div className="relative p-4 text-white">
                <p className="text-sm font-medium opacity-90">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
        </motion.div>
    );
}
