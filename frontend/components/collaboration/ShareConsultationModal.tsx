'use client';

import { useState, useEffect } from 'react';
import { collaborationApi, ShareConsultationRequest, ConsultationShare } from '@/lib/api-collaboration';
import { api } from '@/lib/api';

interface User {
    id: number;
    email: string;
    full_name: string;
}

interface ShareConsultationModalProps {
    consultationId: number;
    isOpen: boolean;
    onClose: () => void;
    onShareSuccess?: () => void;
}

export default function ShareConsultationModal({
    consultationId,
    isOpen,
    onClose,
    onShareSuccess,
}: ShareConsultationModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [shares, setShares] = useState<ConsultationShare[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [permission, setPermission] = useState<'READ' | 'WRITE'>('READ');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            fetchShares();
        }
    }, [isOpen, consultationId]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchShares = async () => {
        try {
            const response = await collaborationApi.getConsultationShares(consultationId);
            setShares(response);
        } catch (err) {
            console.error('Failed to fetch shares:', err);
        }
    };

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data: ShareConsultationRequest = {
                shared_with_id: selectedUserId,
                permission,
            };
            await collaborationApi.shareConsultation(consultationId, data);
            await fetchShares();
            setSelectedUserId(null);
            setPermission('READ');
            if (onShareSuccess) onShareSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to share consultation');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (shareId: number) => {
        try {
            await collaborationApi.revokeShare(consultationId, shareId);
            await fetchShares();
        } catch (err: any) {
            setError(err.message || 'Failed to revoke share');
        }
    };

    if (!isOpen) return null;

    // Filter out users who already have access
    const sharedUserIds = shares.map(s => s.shared_with_id);
    const availableUsers = users.filter(u => !sharedUserIds.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Share Consultation</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Share Form */}
                    <form onSubmit={handleShare} className="mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Share with User
                                </label>
                                <select
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a user...</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permission Level
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="READ"
                                            checked={permission === 'READ'}
                                            onChange={(e) => setPermission(e.target.value as 'READ' | 'WRITE')}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Read Only</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="WRITE"
                                            checked={permission === 'WRITE'}
                                            onChange={(e) => setPermission(e.target.value as 'READ' | 'WRITE')}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Read & Write</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedUserId}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Sharing...' : 'Share Consultation'}
                            </button>
                        </div>
                    </form>

                    {/* Current Shares */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Shares</h3>
                        {shares.length === 0 ? (
                            <p className="text-gray-500 text-sm">No shares yet</p>
                        ) : (
                            <div className="space-y-2">
                                {shares.map((share) => (
                                    <div
                                        key={share.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {share.shared_with?.full_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{share.shared_with?.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Permission: <span className="font-medium">{share.permission}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(share.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
