import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BecomeDonor() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    nidNumber: '',
    gender: '',
    bloodGroup: '',
    makeContactVisible: false,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleConfirm = () => {
    // Here you would typically validate the form and submit the data
    // For now, let's navigate back to HomePage with a success message
    router.push('/homepage');
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
              router.push('/homepage');
            }
          }} style={styles.backButton}>
            <Image source={require('@/assets/images/back-icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Become Donor</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="NID Number"
              value={formData.nidNumber}
              onChangeText={(text) => setFormData({...formData, nidNumber: text})}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[
                styles.genderButton,
                formData.gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setFormData({...formData, gender: 'male'})}
            >
              <View style={styles.genderIcon}>
                <Text style={styles.genderIconText}>♂</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.genderButton,
                formData.gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setFormData({...formData, gender: 'female'})}
            >
              <View style={styles.genderIcon}>
                <Text style={styles.genderIconText}>♀</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blood Group Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Blood Group</Text>
          <View style={styles.bloodGroupContainer}>
            <View style={styles.bloodGroupRow}>
              {bloodGroups.slice(0, 6).map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.bloodGroupButton,
                    formData.bloodGroup === group && styles.bloodGroupButtonActive
                  ]}
                  onPress={() => setFormData({...formData, bloodGroup: group})}
                >
                  <Text style={[
                    styles.bloodGroupText,
                    formData.bloodGroup === group && styles.bloodGroupTextActive
                  ]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.bloodGroupRow}>
              {bloodGroups.slice(6).map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.bloodGroupButton,
                    formData.bloodGroup === group && styles.bloodGroupButtonActive
                  ]}
                  onPress={() => setFormData({...formData, bloodGroup: group})}
                >
                  <Text style={[
                    styles.bloodGroupText,
                    formData.bloodGroup === group && styles.bloodGroupTextActive
                  ]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData({...formData, makeContactVisible: !formData.makeContactVisible})}
          >
            <View style={[
              styles.checkboxBox,
              formData.makeContactVisible && styles.checkboxBoxChecked
            ]}>
              {formData.makeContactVisible && (
                <Text style={styles.checkboxCheck}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxText}>
              Do you want to make your contact number visible?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('@/assets/images/appointment-icon.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require('@/assets/images/inbox-icon.png')} style={styles.navIcon} />
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>1</Text>
          </View>
          <Text style={styles.navText}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => router.push('/(tabs)/HomePage')}>
          <Image source={require('@/assets/images/home-icon.png')} style={[styles.navIcon, styles.navIconActive]} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
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
    paddingBottom: 30,
  },
  backButton: {
    marginRight: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginRight: 44, // To center the title accounting for back button
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  genderButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#D32F2F',
  },
  genderIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderIconText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  bloodGroupContainer: {
    backgroundColor: '#FFE4E1',
    borderRadius: 16,
    padding: 16,
  },
  bloodGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  bloodGroupButton: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  bloodGroupTextActive: {
    color: '#fff',
  },
  checkboxContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
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