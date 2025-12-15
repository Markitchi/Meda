'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        analyses: 0,
        patients: 0,
        images: 0,
        consultations: 0
    });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Utilisateur');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchUserName(token);
        fetchStats(token);
    }, []);

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
            console.log('🔍 Fetching dashboard stats...');
            console.log('Token:', token ? 'Present' : 'Missing');

            // Fetch patients
            const patientsRes = await fetch('http://localhost:8000/api/v1/patients/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Patients response status:', patientsRes.status);

            const patients = patientsRes.ok ? await patientsRes.json() : [];
            console.log('✅ Patients loaded:', patients.length, patients);

            // Fetch images
            const imagesRes = await fetch('http://localhost:8000/api/v1/images/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Images response status:', imagesRes.status);

            const images = imagesRes.ok ? await imagesRes.json() : [];
            console.log('✅ Images loaded:', images.length, images);

            const calculatedStats = {
                analyses: images.filter((img: any) => img.analysis_status === 'completed').length,
                patients: patients.length,
                images: images.length,
                consultations: 0
            };

            console.log('📊 Calculated stats:', calculatedStats);
            setStats(calculatedStats);
        } catch (error) {
            console.error('❌ Failed to fetch stats:', error);
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
                        {getGreeting()}, {getUserName()}
                    </h1>
                    <p className="text-2xl text-gray-700 font-medium">
                        Bienvenue sur votre espace médical IA ✨
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    <StatCard
                        title="Analyses"
                        value={stats.analyses}
                        icon={<AnalysisIcon />}
                        gradient="from-emerald-500 to-teal-500"
                        variants={itemVariants}
                    />
                    <StatCard
                        title="Patients"
                        value={stats.patients}
                        icon={<PatientsIcon />}
                        gradient="from-teal-500 to-cyan-500"
                        variants={itemVariants}
                    />
                    <StatCard
                        title="Images"
                        value={stats.images}
                        icon={<ImageIcon />}
                        gradient="from-cyan-500 to-blue-500"
                        variants={itemVariants}
                    />
                    <StatCard
                        title="Consultations"
                        value={stats.consultations}
                        icon={<ConsultationIcon />}
                        gradient="from-purple-500 to-pink-500"
                        variants={itemVariants}
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-emerald-100"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Actions Rapides
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ActionButton
                            href="/upload"
                            title="Nouvelle Analyse"
                            description="Téléverser images médicales"
                            gradient="from-emerald-500 to-teal-500"
                            icon={<UploadIcon />}
                        />
                        <ActionButton
                            href="/patients/new"
                            title="Ajouter Patient"
                            description="Créer dossier patient"
                            gradient="from-teal-500 to-cyan-500"
                            icon={<UserPlusIcon />}
                        />
                        <ActionButton
                            href="/images"
                            title="Voir Images"
                            description="Parcourir galerie"
                            gradient="from-cyan-500 to-blue-500"
                            icon={<ImageIcon />}
                        />
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Accès Rapide
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickLink href="/patients" title="Patients" icon={<PatientsIcon />} />
                        <QuickLink href="/images" title="Images" icon={<ImageIcon />} />
                        <QuickLink href="/upload" title="Téléverser" icon={<UploadIcon />} />
                        <QuickLink href="/reports" title="Rapports" icon={<ReportsIcon />} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, gradient, variants }: any) {
    return (
        <motion.div
            variants={variants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl shadow-xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
            <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        {icon}
                    </div>
                </div>
                <p className="text-sm font-medium opacity-90">{title}</p>
                <p className="text-4xl font-bold mt-2">{value}</p>
            </div>
        </motion.div>
    );
}

function ActionButton({ href, title, description, gradient, icon }: any) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-emerald-300 transition-all duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-4`}>
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {title}
                </h3>
                <p className="text-sm text-gray-600">
                    {description}
                </p>
            </div>
        </motion.a>
    );
}

function QuickLink({ href, title, icon }: any) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
        >
            <div className="text-emerald-600 mb-3">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700">
                {title}
            </span>
        </motion.a>
    );
}

// Icons
function AnalysisIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function PatientsIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function ConsultationIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    );
}

function UploadIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
}


function ReportsIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}
