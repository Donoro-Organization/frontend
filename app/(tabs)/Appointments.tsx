import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Appointments() {
  const router = useRouter();

  // Sample appointment data - in a real app, this would come from a database/API
  const appointments = [
    {
      id: 1,
      donor: {
        name: 'Jahangir Alam Tamal',
        role: 'Student',
        image: require('@/assets/images/donor1.png'),
      },
      date: '02/06/2022',
      time: '03:30 PM',
      status: 'Confirmed',
      section: 'Tomorrow'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Appointments</Text>
        </View>

        {/* Appointments List */}
        {appointments.map((appointment) => (
          <View key={appointment.id}>
            {/* Section Header */}
            <Text style={styles.sectionTitle}>{appointment.section}</Text>
            
            {/* Appointment Card */}
            <View style={styles.appointmentCard}>
              {/* Donor Info */}
              <View style={styles.donorRow}>
                <Image source={appointment.donor.image} style={styles.donorImage} />
                <View style={styles.donorInfo}>
                  <View style={styles.donorNameRow}>
                    <Text style={styles.donorName}>{appointment.donor.name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{appointment.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.donorRole}>{appointment.donor.role}</Text>
                </View>
              </View>

              {/* Time and Date */}
              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Image source={require('@/assets/images/clock-icon.png')} style={styles.timeIcon} />
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Image source={require('@/assets/images/calendar-icon.png')} style={styles.timeIcon} />
                  <Text style={styles.timeText}>{appointment.date}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rescheduleButton}>
                  <Text style={styles.rescheduleText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Donor Treat Section */}
        <View style={styles.treatSection}>
          <Text style={styles.treatMessage}>A small treat, a big thank you!</Text>
          <Text style={styles.treatSubtext}>
            Gift your donor a healthy drink or snack as a{'\n'}
            gesture of love and gratitude.
          </Text>
          
          <TouchableOpacity style={styles.treatButton}>
            <Text style={styles.treatButtonText}>Donor Treat</Text>
          </TouchableOpacity>
        </View>

        {/* Go Back to Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)/HomePage')}
        >
          <Text style={styles.homeButtonText}>Go Back To Home</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 20,
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  donorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  donorInfo: {
    flex: 1,
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  donorRole: {
    fontSize: 14,
    color: '#666',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#666',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  rescheduleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  treatSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  treatMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  treatSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  treatButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  treatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  homeButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
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