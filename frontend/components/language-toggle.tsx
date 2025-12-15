'use client';

import { useLanguage } from '@/lib/language-context';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            aria-label="Toggle language"
        >
            {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
        </button>
    );
}
