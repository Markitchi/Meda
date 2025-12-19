'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { reportsApi } from '@/lib/api-reports';
import ShareConsultationModal from '@/components/collaboration/ShareConsultationModal';
import CommentsSection from '@/components/collaboration/CommentsSection';
import AuditLogViewer from '@/components/collaboration/AuditLogViewer';

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
    symptoms: string | null;
    vital_signs: Record<string, any> | null;
    diagnosis: string | null;
    treatment_plan: string | null;
    notes: string | null;
    ai_diagnosis: string | null;
    patient?: Patient;
}

export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchConsultation(token);
    }, [params.id]);

    const fetchConsultation = async (token: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/consultations/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setConsultation(await response.json());
            } else {
                console.error('Failed to fetch consultation');
            }
        } catch (error) {
            console.error('Failed to fetch consultation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setDownloadingPDF(true);
            const token = localStorage.getItem('access_token');
            if (token) {
                await reportsApi.downloadConsultationPDF(token, parseInt(params.id));
            }
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Failed to download PDF report');
        } finally {
            setDownloadingPDF(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Loading...</div>
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Consultation not found</div>
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
                                Consultation Details
                            </h1>
                            {consultation.patient && (
                                <p className="text-lg text-gray-700">
                                    Patient: {consultation.patient.first_name} {consultation.patient.last_name}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                onClick={() => setShowShareModal(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                🔗 Share
                            </motion.button>
                            <motion.button
                                onClick={handleDownloadPDF}
                                disabled={downloadingPDF}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {downloadingPDF ? 'Downloading...' : '📄 PDF'}
                            </motion.button>
                            <motion.button
                                onClick={() => router.back()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Back
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Consultation Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <InfoRow label="Date" value={new Date(consultation.consultation_date).toLocaleDateString()} />
                                <InfoRow label="Chief Complaint" value={consultation.chief_complaint} />
                                {consultation.symptoms && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Symptoms</p>
                                        <p className="text-gray-600 text-sm">{consultation.symptoms}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Vital Signs */}
                        {consultation.vital_signs && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Vital Signs</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(consultation.vital_signs).map(([key, value]) => (
                                        <InfoRow key={key} label={key.replace(/_/g, ' ').toUpperCase()} value={String(value)} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Diagnosis & Treatment */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnosis & Treatment</h2>
                            <div className="space-y-4">
                                {consultation.diagnosis && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis</p>
                                        <p className="text-gray-600 text-sm">{consultation.diagnosis}</p>
                                    </div>
                                )}
                                {consultation.treatment_plan && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Treatment Plan</p>
                                        <p className="text-gray-600 text-sm">{consultation.treatment_plan}</p>
                                    </div>
                                )}
                                {consultation.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                                        <p className="text-gray-600 text-sm">{consultation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* AI Diagnosis */}
                        {consultation.ai_diagnosis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-purple-200"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Analysis</h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{consultation.ai_diagnosis}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Comments Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <CommentsSection consultationId={consultation.id} />
                        </motion.div>
                    </div>

                    {/* Right Column - Collaboration */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Audit Log */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <AuditLogViewer entityType="consultation" entityId={consultation.id} />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareConsultationModal
                consultationId={consultation.id}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
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
