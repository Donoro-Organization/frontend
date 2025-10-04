import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AppointmentDonor() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const donors = [
    {
      id: 1,
      name: 'Jahangir Alam Tamal',
      role: 'Student',
      rating: 4.5,
      availability: 'Next available today at 03:30 PM',
      image: require('@/assets/images/donor1.png'),
    },
    {
      id: 2,
      name: 'Tanjina Ahmed Tuly',
      role: 'Housewife',
      rating: 4.5,
      availability: 'Next available on 06 june,2024',
      image: require('@/assets/images/donor2.png'),
    },
    {
      id: 3,
      name: 'Tanjid Ahammed Shafin',
      role: 'Student',
      rating: 4.5,
      availability: 'Next available today at 05:30 PM',
      image: require('@/assets/images/donor3.png'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/(tabs)/HomePage');
          }
        }} style={styles.backButton}>
          <Image source={require('@/assets/images/back-icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Choose your donor</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={require('@/assets/images/search-donor-icon.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Image source={require('@/assets/images/filter-icon.png')} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* Donors List */}
      <ScrollView style={styles.donorsList} showsVerticalScrollIndicator={false}>
        {donors.map((donor) => (
          <View key={donor.id} style={styles.donorCard}>
            <View style={styles.donorInfo}>
              <Image source={donor.image} style={styles.donorImage} />
              <View style={styles.donorDetails}>
                <View style={styles.donorHeader}>
                  <View>
                    <Text style={styles.donorName}>{donor.name}</Text>
                    <Text style={styles.donorRole}>{donor.role}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push(`/(tabs)/DonorProfile/donor${donor.id}`)}>
                    <Text style={styles.seeProfile}>See Profile</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{donor.rating}</Text>
                    <Text style={styles.star}>★</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.availabilityRow}>
              <Image source={require('@/assets/images/calendar-icon.png')} style={styles.availabilityIcon} />
              <Text style={styles.availabilityText}>{donor.availability}</Text>
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See more ⌄</Text>
        </TouchableOpacity>
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
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  donorsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  donorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  donorDetails: {
    flex: 1,
  },
  donorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  donorRole: {
    fontSize: 14,
    color: '#666',
  },
  seeProfile: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  star: {
    color: '#fff',
    fontSize: 14,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#D32F2F',
  },
  availabilityText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
  },
  seeMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 80,
  },
  seeMoreText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '500',
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