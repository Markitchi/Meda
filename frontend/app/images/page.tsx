'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type ImageType = 'xray' | 'ct' | 'mri' | 'retinal' | 'ultrasound' | 'other';

interface MedicalImage {
    id: number;
    filename: string;
    original_filename: string;
    file_size: number;
    image_type: ImageType;
    body_part: string | null;
    analysis_status: string;
    created_at: string;
}

export default function ImagesPage() {
    const router = useRouter();
    const [images, setImages] = useState<MedicalImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ImageType | 'all'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('http://localhost:8000/api/v1/images/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error('Échec récupération images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette image?')) return;

        console.log('🗑️ Attempting to delete image:', id);

        try {
            const token = localStorage.getItem('access_token');
            console.log('Token present:', !!token);

            if (!token) {
                alert('Session expirée. Veuillez vous reconnecter.');
                window.location.href = '/login';
                return;
            }

            const url = `http://localhost:8000/api/v1/images/${id}`;
            console.log('DELETE URL:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                window.location.href = '/login';
                return;
            }

            if (response.status === 204 || response.ok) {
                // Success - remove from list
                console.log('✅ Image deleted successfully');
                setImages(images.filter(img => img.id !== id));
                alert('Image supprimée avec succès!');
            } else {
                const errorText = await response.text();
                console.error('❌ Delete failed:', response.status, errorText);

                try {
                    const error = JSON.parse(errorText);
                    alert(`Échec de la suppression: ${error.detail || 'Erreur serveur'}`);
                } catch {
                    alert(`Échec de la suppression: ${errorText || 'Erreur serveur'}`);
                }
            }
        } catch (error) {
            console.error('❌ Exception during delete:', error);
            console.error('Error details:', {
                name: (error as Error).name,
                message: (error as Error).message,
                stack: (error as Error).stack
            });
            alert(`Erreur lors de la suppression: ${(error as Error).message}`);
        }
    };

    const handleDownload = async (id: number, filename: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/v1/images/${id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                window.open(data.download_url, '_blank');
            }
        } catch (error) {
            console.error('Échec téléchargement image:', error);
        }
    };

    const filteredImages = images.filter(img => {
        const matchesFilter = filter === 'all' || img.image_type === filter;
        const matchesSearch = search === '' ||
            img.original_filename.toLowerCase().includes(search.toLowerCase()) ||
            (img.body_part && img.body_part.toLowerCase().includes(search.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const getTypeLabel = (type: ImageType) => {
        const labels = {
            xray: 'Radiographie',
            ct: 'Scanner',
            mri: 'IRM',
            retinal: 'Rétinien',
            ultrasound: 'Échographie',
            other: 'Autre'
        };
        return labels[type];
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'from-yellow-500 to-orange-500',
            processing: 'from-blue-500 to-cyan-500',
            completed: 'from-emerald-500 to-teal-500',
            failed: 'from-red-500 to-pink-500'
        };
        return colors[status as keyof typeof colors] || colors.pending;
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
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-teal-50 to-emerald-100"></div>
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
                            Galerie d'Images Médicales
                        </h1>
                        <p className="text-lg text-gray-700">
                            Parcourir et gérer votre collection d'imagerie médicale
                        </p>
                    </div>
                    <motion.a
                        href="/upload"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        Téléverser
                    </motion.a>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-emerald-100"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rechercher
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par nom de fichier ou partie du corps..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type d'Image
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as ImageType | 'all')}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 transition-all"
                            >
                                <option value="all">Tous Types</option>
                                <option value="xray">Radiographie</option>
                                <option value="ct">Scanner</option>
                                <option value="mri">IRM</option>
                                <option value="retinal">Rétinien</option>
                                <option value="ultrasound">Échographie</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                >
                    <StatCard title="Total" value={images.length} gradient="from-emerald-500 to-teal-500" />
                    <StatCard title="Affichées" value={filteredImages.length} gradient="from-teal-500 to-cyan-500" />
                    <StatCard title="En Attente" value={images.filter(i => i.analysis_status === 'pending').length} gradient="from-cyan-500 to-blue-500" />
                    <StatCard title="Analysées" value={images.filter(i => i.analysis_status === 'completed').length} gradient="from-blue-500 to-indigo-500" />
                </motion.div>

                {/* Images Grid */}
                {filteredImages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-12 text-center border border-emerald-100"
                    >
                        <p className="text-gray-600">Aucune image trouvée</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                                                {image.original_filename}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {getTypeLabel(image.image_type)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r ${getStatusColor(image.analysis_status)} text-white font-medium`}>
                                            {image.analysis_status}
                                        </span>
                                    </div>

                                    {image.body_part && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            Localisation: {image.body_part}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-500 mb-4">
                                        {(image.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(image.created_at).toLocaleDateString('fr-FR')}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2">
                                        <motion.a
                                            href={`/images/${image.id}/analyze`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm rounded-lg hover:shadow-lg transition-all text-center"
                                        >
                                            Analyser
                                        </motion.a>
                                        <motion.button
                                            onClick={() => handleDownload(image.id, image.original_filename)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Télécharger
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDelete(image.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Supprimer
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
