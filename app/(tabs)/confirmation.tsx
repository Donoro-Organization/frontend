import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const donorData = {
  donor1: {
    name: 'Jahangir Alam Tamal',
    role: 'Student',
    rating: 4.5,
    donated: 6,
    bloodType: 'A+',
    image: require('@/assets/images/donor1.png'),
    patientCondition: 'Delivery Patient, Heavy Blood Loss',
    hospital: 'Anowar Khan Medical College',
    hospitalLocation: 'Dhanmondi, Dhaka',
  },
  donor2: {
    name: 'Tanjina Ahmed Tuly',
    role: 'Housewife',
    rating: 4.5,
    donated: 4,
    bloodType: 'B+',
    image: require('@/assets/images/donor2.png'),
    patientCondition: 'Emergency Surgery, Blood Loss',
    hospital: 'Dhaka Medical College',
    hospitalLocation: 'Ramna, Dhaka',
  },
  donor3: {
    name: 'Tanjid Ahammed Shafin',
    role: 'Student',
    rating: 4.5,
    donated: 8,
    bloodType: 'O-',
    image: require('@/assets/images/donor3.png'),
    patientCondition: 'Accident Patient, Critical Condition',
    hospital: 'National Institute of Cardiovascular',
    hospitalLocation: 'Sher-e-Bangla Nagar, Dhaka',
  },
};

export default function Confirmation() {
  const router = useRouter();
  const { donorId, selectedDate, selectedTime } = useLocalSearchParams();
  const donor = donorData[donorId as keyof typeof donorData];

  const [note, setNote] = useState('Kindly Be presented 15 minutes earlier.');

  if (!donor) return <View style={styles.container}><Text>Donor not found.</Text></View>;

  const handleConfirmAppointment = () => {
    // Here you would typically save the appointment and navigate to appointments page
    // For now, let's navigate to the Appointments page to show the confirmed appointment
    router.push('/appointments');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push(`/donor-profile/donor${donorId}`);
            }
          }} style={styles.backButton}>
            <Image source={require('@/assets/images/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotCompleted]} />
            </View>
            <View style={[styles.progressLine, styles.progressLineCompleted]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotCompleted]} />
            </View>
            <View style={[styles.progressLine, styles.progressLineCompleted]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Confirmation</Text>

        {/* Donor Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.iconContainer}>
              <Image source={donor.image} style={styles.donorIcon} />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Donor</Text>
              <Text style={styles.sectionValue}>{donor.name}</Text>
            </View>
          </View>
        </View>

        {/* Occupation Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.iconContainer}>
              <View style={styles.occupationIcon} />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Occupation</Text>
              <Text style={styles.sectionValue}>{donor.role}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.iconContainer}>
              <Image source={require('@/assets/images/calendar-icon.png')} style={styles.sectionIcon} />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Date & Time</Text>
              <Text style={styles.sectionValue}>
                {selectedTime || '08:00'} PM | {selectedDate || '17'}/04/2024
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.iconContainer}>
              <View style={styles.noteIcon}>
                <Text style={styles.noteIconText}>i</Text>
              </View>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Note</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                multiline
              />
            </View>
          </View>
        </View>

        {/* Hospital Section */}
        <View style={styles.hospitalSection}>
          <Text style={styles.hospitalTitle}>Hospital</Text>
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalRow}>
              <Text style={styles.hospitalName}>{donor.hospital}</Text>
              <TouchableOpacity>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hospitalLocation}>{donor.hospitalLocation}</Text>
          </View>
        </View>

        {/* Transportation Section */}
        <View style={styles.transportationSection}>
          <Text style={styles.transportationTitle}>Transportation</Text>
          <View style={styles.transportationCard}>
            <View style={styles.transportationRow}>
              <Text style={styles.transportationText}>Bike Info (Number Plate)</Text>
              <TouchableOpacity>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.transportationSubtext}>Pickup Point • Your Location</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAppointment}>
          <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Image source={require('@/assets/images/appointment-icon.png')} style={[styles.navIcon, styles.navIconActive]} />
          <Text style={[styles.navText, styles.navTextActive]}>Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('@/assets/images/inbox-icon.png')} style={styles.navIcon} />
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>1</Text>
          </View>
          <Text style={styles.navText}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/homepage')}>
          <Image source={require('@/assets/images/home-icon.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('@/assets/images/notification-icon.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('@/assets/images/settings-icon.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#D32F2F',
  },
  progressDotCompleted: {
    backgroundColor: '#D32F2F',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: '#D32F2F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  donorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  occupationIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#D32F2F',
    borderRadius: 4,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    tintColor: '#8E24AA',
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4FC3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContent: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    fontSize: 16,
  },
  noteInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    minHeight: 24,
  },
  hospitalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hospitalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  hospitalCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },
  hospitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 20,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  transportationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transportationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  transportationCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },
  transportationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transportationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  transportationSubtext: {
    fontSize: 14,
    color: '#666',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navItemActive: {
    // Active state styling if needed
  },
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 2,
    tintColor: '#999',
  },
  navIconActive: {
    tintColor: '#D32F2F',
  },
  navText: {
    fontSize: 12,
    color: '#999',
  },
  navTextActive: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: 8,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});