'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Analysis {
    id: number;
    image_id: number;
    status: string;
    confidence_score: number | null;
    findings: any;
    recommendations: string | null;
    created_at: string;
    completed_at: string | null;
}

export default function AnalyzePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const imageId = parseInt(params.id);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [polling, setPolling] = useState(false);

    useEffect(() => {
        checkExistingAnalysis();
    }, []);

    const checkExistingAnalysis = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`http://localhost:8000/api/v1/analysis/image/${imageId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const analyses = await response.json();
                if (analyses.length > 0) {
                    const latest = analyses[analyses.length - 1];
                    setAnalysis(latest);

                    if (latest.status === 'processing' || latest.status === 'pending') {
                        startPolling(latest.id);
                    }
                }
            }
        } catch (err) {
            console.error('Erreur vérification analyse:', err);
        }
    };

    const startPolling = (analysisId: number) => {
        setPolling(true);
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost:8000/api/v1/analysis/${analysisId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalysis(data);

                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(interval);
                        setPolling(false);
                    }
                }
            } catch (err) {
                console.error('Erreur polling:', err);
            }
        }, 2000);
    };

    const handleStartAnalysis = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/v1/analysis/start/${imageId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysis(data);
                startPolling(data.id);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Échec du démarrage de l\'analyse');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { text: 'En Attente', gradient: 'from-yellow-500 to-orange-500' },
            processing: { text: 'En Cours', gradient: 'from-blue-500 to-cyan-500' },
            completed: { text: 'Terminée', gradient: 'from-emerald-500 to-teal-500' },
            failed: { text: 'Échouée', gradient: 'from-red-500 to-pink-500' }
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;

        return (
            <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${badge.gradient} text-white font-medium text-sm`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-teal-50 to-emerald-100"></div>
                <div className="absolute inset-0 medical-pattern"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Analyse IA
                            </h1>
                            <p className="text-lg text-gray-700">
                                Analyse automatique par intelligence artificielle
                            </p>
                        </div>
                        <motion.a
                            href="/images"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Retour
                        </motion.a>
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Analysis Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100"
                >
                    {!analysis ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Prêt pour l'Analyse
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Lancez l'analyse IA pour détecter automatiquement les anomalies
                            </p>
                            <motion.button
                                onClick={handleStartAnalysis}
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Démarrage...' : 'Lancer l\'Analyse'}
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Résultats de l'Analyse
                                </h2>
                                {getStatusBadge(analysis.status)}
                            </div>

                            {/* Processing */}
                            {(analysis.status === 'pending' || analysis.status === 'processing') && (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                                    <p className="text-lg text-gray-700">
                                        Analyse en cours... Veuillez patienter
                                    </p>
                                </div>
                            )}

                            {/* Completed */}
                            {analysis.status === 'completed' && analysis.findings && (
                                <div className="space-y-6">
                                    {/* Confidence Score */}
                                    {analysis.confidence_score && (
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Score de Confiance</span>
                                                <span className="text-2xl font-bold text-emerald-700">
                                                    {(analysis.confidence_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${analysis.confidence_score * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pathologies */}
                                    {analysis.findings.pathologies && (
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Découvertes</h3>
                                            <div className="space-y-3">
                                                {analysis.findings.pathologies.map((pathology: any, index: number) => (
                                                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                                    {pathology.name}
                                                                </h4>
                                                                {pathology.location && (
                                                                    <p className="text-sm text-gray-600">
                                                                        Localisation: {pathology.location}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${pathology.severity === 'normal' ? 'bg-green-100 text-green-700' :
                                                                    pathology.severity === 'mild' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {(pathology.probability * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quality */}
                                    {analysis.findings.image_quality && (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                            <p className="text-sm font-medium text-blue-900">
                                                Qualité: {analysis.findings.image_quality}
                                            </p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {analysis.recommendations && (
                                        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                                            <h3 className="text-lg font-bold text-purple-900 mb-3">Recommandations</h3>
                                            <p className="text-purple-800 whitespace-pre-line">
                                                {analysis.recommendations}
                                            </p>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    {analysis.completed_at && (
                                        <p className="text-sm text-gray-500 text-center">
                                            Analyse terminée le {new Date(analysis.completed_at).toLocaleString('fr-FR')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Failed */}
                            {analysis.status === 'failed' && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p className="text-lg text-gray-700 mb-4">
                                        L'analyse a échoué
                                    </p>
                                    <motion.button
                                        onClick={handleStartAnalysis}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Réessayer
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
