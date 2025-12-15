'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

type ImageType = 'xray' | 'ct' | 'mri' | 'retinal' | 'ultrasound' | 'other';

interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
}

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [imageType, setImageType] = useState<ImageType>('xray');
    const [bodyPart, setBodyPart] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await api.getPatients(token);
                setPatients(data);
            }
        } catch (error) {
            console.error('Échec récupération patients:', error);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('image_type', imageType);
            if (bodyPart) {
                formData.append('body_part', bodyPart);
            }
            if (selectedPatient) {
                formData.append('patient_id', selectedPatient.toString());
            }

            const token = localStorage.getItem('access_token');

            if (!token) {
                throw new Error('Non authentifié. Veuillez vous connecter.');
            }

            const response = await fetch('http://localhost:8000/api/v1/images/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Échec du téléversement' }));
                throw new Error(errorData.detail || `Échec avec statut ${response.status}`);
            }

            setSuccess(true);
            setFile(null);
            setBodyPart('');

            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            setTimeout(() => {
                router.push('/images');
            }, 2000);

        } catch (err: any) {
            console.error('Erreur téléversement:', err);
            setError(err.message || 'Échec du téléversement');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-teal-50 to-emerald-100"></div>
                <div className="absolute inset-0 medical-pattern"></div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Téléverser Image Médicale
                    </h1>
                    <p className="text-lg text-gray-700">
                        Téléverser et analyser des fichiers d'imagerie médicale
                    </p>
                </motion.div>

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

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl"
                            >
                                Téléversement réussi! Redirection vers la galerie...
                            </motion.div>
                        )}

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-300 hover:border-emerald-400 bg-gray-50'
                                }`}
                        >
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*,.dcm"
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <motion.button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                    >
                                        Changer Fichier
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 mb-2">
                                            Déposez votre fichier ici
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            ou cliquez pour parcourir
                                        </p>
                                        <motion.button
                                            type="button"
                                            onClick={() => document.getElementById('file-input')?.click()}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Sélectionner Fichier
                                        </motion.button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Supportés: DICOM, PNG, JPEG, TIFF (Max 50MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Patient Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Associer à un Patient (Optionnel)
                            </label>
                            <select
                                value={selectedPatient || ''}
                                onChange={(e) => setSelectedPatient(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                            >
                                <option value="">Aucun patient sélectionné</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.patient_id} - {patient.first_name} {patient.last_name}
                                    </option>
                                ))}
                            </select>
                            {patients.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Aucun patient disponible. <a href="/patients/new" className="text-emerald-600 hover:underline">Créer un patient</a>
                                </p>
                            )}
                        </div>

                        {/* Image Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type d'Image
                            </label>
                            <select
                                value={imageType}
                                onChange={(e) => setImageType(e.target.value as ImageType)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                            >
                                <option value="xray">Radiographie</option>
                                <option value="ct">Scanner</option>
                                <option value="mri">IRM</option>
                                <option value="retinal">Rétinien</option>
                                <option value="ultrasound">Échographie</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        {/* Body Part */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Partie du Corps (Optionnel)
                            </label>
                            <input
                                type="text"
                                value={bodyPart}
                                onChange={(e) => setBodyPart(e.target.value)}
                                placeholder="ex: Thorax, Cerveau, Genou"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={uploading || !file}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {uploading ? 'Téléversement...' : 'Téléverser Image'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
