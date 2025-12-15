'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    const features = [
        {
            title: 'Analyse par IA',
            description: 'Modèles d\'apprentissage automatique avancés pour une analyse précise des images médicales',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
        },
        {
            title: 'Gestion des Patients',
            description: 'Dossiers patients complets et suivi de l\'historique médical',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            gradient: 'from-teal-500 via-cyan-500 to-blue-500'
        },
        {
            title: 'Stockage Sécurisé',
            description: 'Stockage cloud conforme HIPAA pour images et données médicales',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            gradient: 'from-cyan-500 via-blue-500 to-indigo-500'
        },
        {
            title: 'Collaboration Temps Réel',
            description: 'Partagez des cas et collaborez avec des professionnels de santé',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            gradient: 'from-indigo-500 via-purple-500 to-pink-500'
        }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Hero Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>
                <div className="absolute inset-0 dna-pattern"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-block mb-6"
                    >
                        <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl md:text-7xl font-bold mb-6 text-white"
                    >
                        Diagnostic Médical
                        <br />
                        <span className="text-emerald-100">
                            Assisté par IA
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto"
                    >
                        Apprentissage automatique avancé pour l'analyse précise d'images médicales et la gestion des soins
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {isLoggedIn ? (
                            <>
                                <motion.a
                                    href="/dashboard"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-medium shadow-2xl hover:shadow-3xl transition-all text-lg"
                                >
                                    Tableau de Bord
                                </motion.a>
                                <motion.a
                                    href="/upload"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all text-lg border border-white/30"
                                >
                                    Téléverser Image
                                </motion.a>
                            </>
                        ) : (
                            <>
                                <motion.a
                                    href="/register"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-medium shadow-2xl hover:shadow-3xl transition-all text-lg"
                                >
                                    Commencer
                                </motion.a>
                                <motion.a
                                    href="/login"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all text-lg border border-white/30"
                                >
                                    Se Connecter
                                </motion.a>
                            </>
                        )}
                    </motion.div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold text-white mb-2">
                                99.5%
                            </div>
                            <div className="text-white/80">
                                Taux de Précision
                            </div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white mb-2">
                                10K+
                            </div>
                            <div className="text-white/80">
                                Images Analysées
                            </div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-white mb-2">
                                500+
                            </div>
                            <div className="text-white/80">
                                Professionnels de Santé
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
