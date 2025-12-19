'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import ImageViewer to avoid SSR issues with Konva
const ImageViewer = dynamic(
    () => import('@/components/image-viewer/ImageViewer'),
    { ssr: false }
);

interface MedicalImage {
    id: number;
    original_filename: string;
    image_type: string;
    body_part: string | null;
    notes: string | null;
    created_at: string;
    patient_id: number;
}

interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
}

export default function ImageDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [image, setImage] = useState<MedicalImage | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchImageData(token);
    }, [params.id]);

    const fetchImageData = async (token: string) => {
        try {
            // Fetch image metadata
            const imageRes = await fetch(`http://localhost:8000/api/v1/images/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!imageRes.ok) {
                throw new Error('Failed to fetch image');
            }

            const imageData = await imageRes.json();
            setImage(imageData);

            // Fetch patient data
            const patientRes = await fetch(`http://localhost:8000/api/v1/patients/${imageData.patient_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (patientRes.ok) {
                setPatient(await patientRes.json());
            }

            // Get image URL
            const urlRes = await fetch(`http://localhost:8000/api/v1/images/${params.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (urlRes.ok) {
                const urlData = await urlRes.json();
                setImageUrl(urlData.url);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load image');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-700">Chargement...</div>
            </div>
        );
    }

    if (error || !image) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">{error || 'Image non trouvée'}</div>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {image.original_filename}
                            </h1>
                            {patient && (
                                <p className="text-lg text-gray-700">
                                    Patient: {patient.first_name} {patient.last_name} ({patient.patient_id})
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                onClick={() => router.back()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                Retour
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Image Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100 mb-6"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Type</p>
                            <p className="text-gray-900">{image.image_type}</p>
                        </div>
                        {image.body_part && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Partie du corps</p>
                                <p className="text-gray-900">{image.body_part}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-700">Date</p>
                            <p className="text-gray-900">
                                {new Date(image.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                    {image.notes && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                            <p className="text-gray-900">{image.notes}</p>
                        </div>
                    )}
                </motion.div>

                {/* Image Viewer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {imageUrl && (
                        <Suspense fallback={<div className="text-center py-8">Chargement du visualiseur...</div>}>
                            <ImageViewer
                                imageUrl={imageUrl}
                                imageName={image.original_filename}
                            />
                        </Suspense>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
