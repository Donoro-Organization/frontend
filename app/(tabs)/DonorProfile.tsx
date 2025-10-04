import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const donorData = {
  donor1: {
    name: 'Jahangir Alam Tamal',
    role: 'Student',
    available: 'Next available today at 03:30 PM',
    rating: 4.5,
    image: require('@/assets/images/donor1.png'),
    details: 'Blood Group: A+\nLocation: Dhaka\nContact: 017XXXXXXXX',
  },
  donor2: {
    name: 'Mahmud Araf',
    role: 'Student',
    available: 'Next available on 06 June,2024',
    rating: 4.5,
    image: require('@/assets/images/donor2.png'),
    details: 'Blood Group: B+\nLocation: Chittagong\nContact: 018XXXXXXXX',
  },
  donor3: {
    name: 'Mehedi Hasan Rumman',
    role: 'Student',
    available: 'Next available today at 05:30 PM',
    rating: 4.5,
    image: require('@/assets/images/donor3.png'),
    details: 'Blood Group: O-\nLocation: Sylhet\nContact: 019XXXXXXXX',
  },
};

export default function DonorProfile() {
  const router = useRouter();
  const { donorId } = useLocalSearchParams();
  const donor = donorData[donorId as keyof typeof donorData];
  if (!donor) return <View style={styles.container}><Text>Donor not found.</Text></View>;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('@/assets/images/back-icon.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Image source={donor.image} style={styles.avatar} />
      <Text style={styles.name}>{donor.name}</Text>
      <Text style={styles.role}>{donor.role}</Text>
      <Text style={styles.available}>{donor.available}</Text>
      <View style={styles.ratingBox}>
        <Text style={styles.ratingText}>{donor.rating} <Text style={styles.star}>★</Text></Text>
      </View>
      <Text style={styles.details}>{donor.details}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  backButton: { alignSelf: 'flex-start', marginBottom: 12, marginLeft: 2 },
  backIcon: { width: 28, height: 28 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  role: { fontSize: 16, color: '#888', marginBottom: 4 },
  available: { fontSize: 15, color: '#1976D2', marginBottom: 8 },
  ratingBox: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#D32F2F', alignItems: 'center', marginBottom: 8 },
  ratingText: { color: '#D32F2F', fontSize: 15, fontWeight: 'bold' },
  star: { color: '#FFD700', fontSize: 15 },
  details: { fontSize: 15, color: '#444', marginTop: 12, textAlign: 'center', lineHeight: 22 },
});
