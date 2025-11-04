import React from 'react';
import { SearchContainer } from '@/components/search';
import { useRouter } from 'expo-router';

export default function SearchDonorsScreen() {
    const router = useRouter();

    return <SearchContainer onClose={() => router.back()} />;
}
