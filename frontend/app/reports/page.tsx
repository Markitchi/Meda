'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface ReportStats {
    totalPatients: number;
    totalConsultations: number;
    totalImages: number;
    totalAnalyses: number;
    consultationsThisMonth: number;
    consultationsLastMonth: number;
    newPatientsThisMonth: number;
    averageConsultationsPerPatient: number;
}

export default function ReportsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<ReportStats>({
        totalPatients: 0,
        totalConsultations: 0,
        totalImages: 0,
        totalAnalyses: 0,
        consultationsThisMonth: 0,
        consultationsLastMonth: 0,
        newPatientsThisMonth: 0,
        averageConsultationsPerPatient: 0,
    });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Utilisateur');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchUserName(token);
        fetchStats(token);
    }, [dateRange]);

    const fetchUserName = async (token: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                setUserName(user.full_name || user.email || 'Utilisateur');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchStats = async (token: string) => {
        try {
            // Fetch patients
            const patients = await api.getPatients(token);
            console.log('Patients loaded:', patients.length);

            // Fetch images directly
            const imagesRes = await fetch('http://localhost:8000/api/v1/images/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!imagesRes.ok) {
                console.error('Failed to fetch images:', imagesRes.status);
            }

            const images = imagesRes.ok ? await imagesRes.json() : [];
            console.log('Images loaded:', images.length);

            // Calculate stats
            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const newPatientsThisMonth = patients.filter((p: any) =>
                new Date(p.created_at) >= thisMonthStart
            ).length;

            const analyses = images.filter((img: any) => img.analysis_status === 'completed');

            const calculatedStats = {
                totalPatients: patients.length,
                totalConsultations: 0,
                totalImages: images.length,
                totalAnalyses: analyses.length,
                consultationsThisMonth: 0,
                consultationsLastMonth: 0,
                newPatientsThisMonth,
                averageConsultationsPerPatient: 0,
            };

            console.log('Calculated stats:', calculatedStats);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const getUserName = () => {
        return userName;
    };

    const exportToPDF = () => {
        alert('Export PDF en cours de développement. Cette fonctionnalité sera bientôt disponible!');
    };

    const exportToCSV = () => {
        const csvContent = `Rapport Meda - ${new Date().toLocaleDateString('fr-FR')}\n\n` +
            `Statistiques Générales\n` +
            `Patients Total,${stats.totalPatients}\n` +
            `Images Total,${stats.totalImages}\n` +
            `Analyses Complétées,${stats.totalAnalyses}\n` +
            `Nouveaux Patients (ce mois),${stats.newPatientsThisMonth}\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport_meda_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Chargement des rapports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 opacity-60"></div>
                <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
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
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                {getGreeting()}, {getUserName()}
                            </h1>
                            <p className="text-xl text-gray-700 font-medium">
                                Rapports & Statistiques - Analyse de l'activité médicale 📊
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                onClick={exportToCSV}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Export CSV
                            </motion.button>
                            <motion.button
                                onClick={exportToPDF}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Export PDF
                            </motion.button>
                            <motion.a
                                href="/dashboard"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Retour
                            </motion.a>
                        </div>
                    </div>
                </motion.div>

                {/* Date Range Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-emerald-100"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Période</h2>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Patients Total"
                        value={stats.totalPatients}
                        icon="👥"
                        gradient="from-emerald-500 to-teal-500"
                        trend={`+${stats.newPatientsThisMonth} ce mois`}
                    />
                    <StatCard
                        title="Images Médicales"
                        value={stats.totalImages}
                        icon="📸"
                        gradient="from-teal-500 to-cyan-500"
                    />
                    <StatCard
                        title="Analyses IA"
                        value={stats.totalAnalyses}
                        icon="🤖"
                        gradient="from-cyan-500 to-blue-500"
                    />
                    <StatCard
                        title="Consultations"
                        value={stats.totalConsultations}
                        icon="📋"
                        gradient="from-purple-500 to-pink-500"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Activité Mensuelle</h2>
                        <div className="space-y-4">
                            <ActivityBar
                                label="Nouveaux Patients"
                                value={stats.newPatientsThisMonth}
                                max={Math.max(stats.newPatientsThisMonth, 10)}
                                color="emerald"
                            />
                            <ActivityBar
                                label="Consultations"
                                value={stats.consultationsThisMonth}
                                max={Math.max(stats.consultationsThisMonth, 10)}
                                color="teal"
                            />
                            <ActivityBar
                                label="Analyses IA"
                                value={stats.totalAnalyses}
                                max={Math.max(stats.totalAnalyses, 10)}
                                color="cyan"
                            />
                        </div>
                    </motion.div>

                    {/* Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition</h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Patients avec Images</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {stats.totalImages > 0 ? Math.round((stats.totalImages / Math.max(stats.totalPatients, 1)) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all"
                                        style={{ width: `${stats.totalImages > 0 ? Math.min((stats.totalImages / Math.max(stats.totalPatients, 1)) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Analyses Complétées</span>
                                    <span className="text-sm font-bold text-cyan-600">
                                        {stats.totalImages > 0 ? Math.round((stats.totalAnalyses / stats.totalImages) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                                        style={{ width: `${stats.totalImages > 0 ? (stats.totalAnalyses / stats.totalImages) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Summary Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé d'Activité</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryItem
                            label="Taux d'Analyse"
                            value={`${stats.totalImages > 0 ? Math.round((stats.totalAnalyses / stats.totalImages) * 100) : 0}%`}
                            description="Images analysées par IA"
                            icon="🎯"
                        />
                        <SummaryItem
                            label="Croissance Patients"
                            value={`+${stats.newPatientsThisMonth}`}
                            description="Nouveaux ce mois"
                            icon="📈"
                        />
                        <SummaryItem
                            label="Images par Patient"
                            value={stats.totalPatients > 0 ? (stats.totalImages / stats.totalPatients).toFixed(1) : '0'}
                            description="Moyenne"
                            icon="📊"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, gradient, trend }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
            <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{icon}</span>
                </div>
                <p className="text-sm font-medium opacity-90">{title}</p>
                <p className="text-4xl font-bold mt-2">{value}</p>
                {trend && (
                    <p className="text-xs opacity-75 mt-2">{trend}</p>
                )}
            </div>
        </motion.div>
    );
}

function ActivityBar({ label, value, max, color }: any) {
    const percentage = (value / max) * 100;
    const colorClasses = {
        emerald: 'from-emerald-500 to-teal-500',
        teal: 'from-teal-500 to-cyan-500',
        cyan: 'from-cyan-500 to-blue-500',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} h-4 rounded-full`}
                ></motion.div>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, description, icon }: any) {
    return (
        <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
    );
}
