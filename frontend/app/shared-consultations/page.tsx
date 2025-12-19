'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { collaborationApi, ConsultationShare } from '@/lib/api-collaboration';

interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
}

interface Consultation {
    id: number;
    patient_id: number;
    consultation_date: string;
    chief_complaint: string;
    diagnosis: string | null;
    patient?: Patient;
}

interface ShareWithDetails extends ConsultationShare {
    consultation?: Consultation;
}

export default function SharedConsultationsPage() {
    const router = useRouter();
    const [shares, setShares] = useState<ShareWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchSharedConsultations();
    }, []);

    const fetchSharedConsultations = async () => {
        try {
            const response = await collaborationApi.getSharedConsultations();

            // Fetch consultation details for each share
            const token = localStorage.getItem('access_token');
            const sharesWithDetails = await Promise.all(
                response.map(async (share) => {
                    try {
                        const consultationRes = await fetch(
                            `http://localhost:8000/api/v1/consultations/${share.consultation_id}`,
                            { headers: { 'Authorization': `Bearer ${token}` } }
                        );
                        if (consultationRes.ok) {
                            const consultation = await consultationRes.json();
                            return { ...share, consultation };
                        }
                    } catch (err) {
                        console.error('Failed to fetch consultation:', err);
                    }
                    return share;
                })
            );

            setShares(sharesWithDetails);
        } catch (err: any) {
            console.error('Failed to fetch shared consultations:', err);
            setError(err.message || 'Failed to load shared consultations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Loading...</div>
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
                                Shared Consultations
                            </h1>
                            <p className="text-lg text-gray-700">
                                Consultations shared with you by other doctors
                            </p>
                        </div>
                        <motion.button
                            onClick={() => router.back()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            Back
                        </motion.button>
                    </div>
                </motion.div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Shared Consultations List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shares.length === 0 ? (
                        <div className="col-span-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl p-12 text-center"
                            >
                                <svg
                                    className="w-24 h-24 mx-auto text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Shared Consultations
                                </h3>
                                <p className="text-gray-600">
                                    You don't have any consultations shared with you yet.
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        shares.map((share, index) => (
                            <motion.a
                                key={share.id}
                                href={`/consultations/${share.consultation_id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {share.consultation?.chief_complaint || 'Consultation'}
                                        </h3>
                                        {share.consultation?.patient && (
                                            <p className="text-sm text-gray-600">
                                                Patient: {share.consultation.patient.first_name}{' '}
                                                {share.consultation.patient.last_name}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${share.permission === 'WRITE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {share.permission}
                                    </span>
                                </div>

                                {share.consultation?.diagnosis && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        <span className="font-medium">Diagnosis:</span>{' '}
                                        {share.consultation.diagnosis}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <div>
                                        <p>Shared by: {share.shared_by?.full_name}</p>
                                        <p className="mt-1">
                                            {new Date(share.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {share.consultation && (
                                        <p>
                                            {new Date(share.consultation.consultation_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </motion.a>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
