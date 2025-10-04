import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomePage() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.helloText}>Hello, User01</Text>
          <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/SearchDonor')}>
            <Image source={require('@/assets/images/avatar-icon.png')} style={styles.avatarIcon} />
          </TouchableOpacity>
            <Image source={require('@/assets/images/bell-icon.png')} style={styles.headerIcon} />
            <Image source={require('@/assets/images/user-icon.png')} style={styles.headerIcon} />
          </View>
        </View>
        <Text style={styles.logoText}>Donor<Text style={styles.logoRed}>o</Text></Text>
        {/* Overview Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Image source={require('@/assets/images/overview-chart.png')} style={styles.chartImage} />
          <Text style={styles.showMore}>Show More</Text>
        </View>
        {/* Facility */}
        <View style={styles.facilityRow}>
          <TouchableOpacity style={styles.facilityCard} onPress={() => router.push('/(tabs)/BecomeDonor')}>
            <View style={styles.facilityIconBox}>
              <Image source={require('@/assets/images/medical-sign.png')} style={styles.facilityIcon} />
            </View>
            <Text style={styles.facilityText}>Become Donor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.facilityCard}>
            <View style={styles.facilityIconBox}>
              <Image source={require('@/assets/images/medical-sign.png')} style={styles.facilityIcon} />
            </View>
            <Text style={styles.facilityText}>Search Donor</Text>
          </TouchableOpacity>
        </View>
        {/* Recent Donated */}
        <Text style={styles.sectionTitle}>Recent Donated</Text>
        <View style={styles.recentCard}>
          <View style={styles.recentRow}>
            <Image source={require('@/assets/images/profile1.png')} style={styles.profileImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Mohammad Sakib</Text>
              <Text style={styles.profileRole}>Student</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeProfile}>See Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentInfoRow}>
            <Text style={styles.recentInfo}><Image source={require('@/assets/images/clock-icon.png')} style={styles.infoIcon} /> 03:30 PM</Text>
            <Text style={styles.recentInfo}><Image source={require('@/assets/images/calendar-icon.png')} style={styles.infoIcon} /> 03/30/2024</Text>
          </View>
        </View>
        {/* Medical Supplies */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Medical Supplies</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.suppliesRow}>
          <Image source={require('@/assets/images/supply1.png')} style={styles.supplyImage} />
          <Image source={require('@/assets/images/supply2.png')} style={styles.supplyImage} />
        </View>
        {/* Top Donors */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Top Donors</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topDonorsRow}>
          <View style={styles.donorCard}>
            <Image source={require('@/assets/images/donor1.png')} style={styles.donorImage} />
            <Text style={styles.donorName}>Jahangir Alam</Text>
            <Text style={styles.donorRating}>4.5 <Text style={styles.star}>★</Text></Text>
          </View>
          <View style={styles.donorCard}>
            <Image source={require('@/assets/images/donor2.png')} style={styles.donorImage} />
            <Text style={styles.donorName}>Mahmud Araf</Text>
            <Text style={styles.donorRating}>4.5 <Text style={styles.star}>★</Text></Text>
          </View>
          <View style={styles.donorCard}>
            <Image source={require('@/assets/images/donor3.png')} style={styles.donorImage} />
            <Text style={styles.donorName}>Mehedi</Text>
            <Text style={styles.donorRating}>4.5 <Text style={styles.star}>★</Text></Text>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/AppointmentDonor')}><Image source={require('@/assets/images/appointment-icon.png')} style={styles.navIcon} /><Text style={styles.navText}>Appointment</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/inbox-icon.png')} style={styles.navIcon} /><Text style={styles.navText}>Inbox</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/home-icon.png')} style={styles.navIcon} /><Text style={styles.navText}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/notification-icon.png')} style={styles.navIcon} /><Text style={styles.navText}>Notification</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/settings-icon.png')} style={styles.navIcon} /><Text style={styles.navText}>Settings</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 90 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 8, paddingHorizontal: 18 },
  helloText: { fontSize: 18, fontWeight: '500', color: '#222' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  avatarIcon: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  headerIcon: { width: 28, height: 28, marginHorizontal: 2 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center', marginBottom: 8 },
  logoRed: { color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 18, marginBottom: 12, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  chartImage: { width: '100%', height: 120, resizeMode: 'contain', marginBottom: 8 },
  showMore: { color: '#888', fontSize: 13, textAlign: 'right' },
  facilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 18,
  },
  facilityCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  facilityIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  facilityIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  facilityText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    textAlign: 'center',
  },
  recentCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginHorizontal: 18, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  recentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  profileImage: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  profileRole: { fontSize: 13, color: '#888' },
  seeProfile: { color: '#1976D2', fontSize: 13, fontWeight: '500' },
  recentInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  recentInfo: { fontSize: 13, color: '#888', flexDirection: 'row', alignItems: 'center' },
  infoIcon: { width: 16, height: 16, marginRight: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 18, marginBottom: 8 },
  viewAll: { color: '#1976D2', fontSize: 13, fontWeight: '500' },
  suppliesRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18, marginBottom: 18 },
  supplyImage: { width: 140, height: 80, borderRadius: 12, marginHorizontal: 4 },
  topDonorsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18, marginBottom: 18 },
  donorCard: { backgroundColor: '#fff', borderRadius: 12, padding: 8, alignItems: 'center', width: 100, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  donorImage: { width: 48, height: 48, borderRadius: 24, marginBottom: 6 },
  donorName: { fontSize: 14, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  donorRating: { fontSize: 13, color: '#888', textAlign: 'center' },
  star: { color: '#FFD700', fontSize: 13 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee', paddingHorizontal: 8 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navIcon: { width: 28, height: 28, marginBottom: 2 },
  navText: { fontSize: 12, color: '#888' },
});
