import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    hospitalLocation: 'Dhanmondi,Dhaka',
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
    hospitalLocation: 'Ramna,Dhaka',
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
    hospitalLocation: 'Sher-e-Bangla Nagar,Dhaka',
  },
};

export default function DonorProfile() {
  const router = useRouter();
  const { donorId } = useLocalSearchParams();
  const donor = donorData[donorId as keyof typeof donorData];
  
  const [selectedDate, setSelectedDate] = useState(17);
  const [selectedTime, setSelectedTime] = useState('8:00');

  const dates = [
    { date: 17, day: 'Mon' },
    { date: 18, day: 'Tue' },
    { date: 19, day: 'Wed' },
    { date: 20, day: 'Thu' },
    { date: 21, day: 'Fri' },
  ];

  const timeSlots = [
    '8:00', '10:30', '13:00',
    '14:30', '15:00', '16:30'
  ];

  if (!donor) return <View style={styles.container}><Text>Donor not found.</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/AppointmentDonor');
            }
          }} style={styles.backButton}>
            <Image source={require('@/assets/images/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotCompleted]} />
            </View>
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Donor's profile</Text>

        {/* Donor Info Card */}
        <View style={styles.donorCard}>
          <View style={styles.donorInfo}>
            <Image source={donor.image} style={styles.donorImage} />
            <View style={styles.donorDetails}>
              <Text style={styles.donorName}>{donor.name}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>RATING</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{donor.rating}</Text>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={[styles.star, star <= donor.rating ? styles.starActive : styles.starInactive]}>
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>DONATED</Text>
                  <View style={styles.donatedContainer}>
                    <Text style={styles.donatedNumber}>{donor.donated}</Text>
                    <Text style={styles.bloodType}>{donor.bloodType}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Patient Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Condition</Text>
          <Text style={styles.conditionText}>{donor.patientCondition}</Text>
        </View>

        {/* Hospital */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospital</Text>
          <View style={styles.hospitalRow}>
            <View style={styles.locationIconContainer}>
              <View style={styles.locationIcon} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{donor.hospital}</Text>
              <Text style={styles.hospitalLocation}>{donor.hospitalLocation}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Choose Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose date</Text>
          <View style={styles.datesContainer}>
            {dates.map((dateItem) => (
              <TouchableOpacity
                key={dateItem.date}
                style={[
                  styles.dateButton,
                  selectedDate === dateItem.date && styles.dateButtonActive
                ]}
                onPress={() => setSelectedDate(dateItem.date)}
              >
                <Text style={[
                  styles.dateNumber,
                  selectedDate === dateItem.date && styles.dateNumberActive
                ]}>
                  {dateItem.date}
                </Text>
                <Text style={[
                  styles.dateDay,
                  selectedDate === dateItem.date && styles.dateDayActive
                ]}>
                  {dateItem.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Choose Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose time</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.timeButtonActive,
                  (time === '13:00' || time === '14:30' || time === '16:30') && styles.timeButtonDisabled
                ]}
                onPress={() => {
                  if (time !== '13:00' && time !== '14:30' && time !== '16:30') {
                    setSelectedTime(time);
                  }
                }}
                disabled={time === '13:00' || time === '14:30' || time === '16:30'}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextActive,
                  (time === '13:00' || time === '14:30' || time === '16:30') && styles.timeTextDisabled
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Message */}
        <Text style={styles.supportText}>
          Support your donor with an easy ride Support.
        </Text>

        {/* Ride Support Button */}
        <TouchableOpacity 
          style={styles.rideSupportButton}
          onPress={() => router.push({
            pathname: '/(tabs)/Confirmation',
            params: {
              donorId: donorId,
              selectedDate: selectedDate,
              selectedTime: selectedTime
            }
          })}
        >
          <Text style={styles.rideSupportText}>Ride Support</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/HomePage')}>
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
  progressLineActive: {
    backgroundColor: '#D32F2F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 30,
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  donorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#E0E0E0',
  },
  donatedContainer: {
    alignItems: 'flex-start',
  },
  donatedNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  bloodType: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  conditionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    minWidth: 60,
  },
  dateButtonActive: {
    backgroundColor: '#D32F2F',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  dateNumberActive: {
    color: '#fff',
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
  },
  dateDayActive: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },
  timeButtonActive: {
    backgroundColor: '#D32F2F',
  },
  timeButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  timeTextActive: {
    color: '#fff',
  },
  timeTextDisabled: {
    color: '#BDBDBD',
  },
  supportText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    lineHeight: 22,
  },
  rideSupportButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  rideSupportText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
