import {
  Pressable,
  ScrollView,
  Text,
  View,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import { Image } from 'expo-image';
import { Button, YStack, XStack } from 'tamagui';
import Colors from '@/constants/Colors';
import dreamApi from '@/api/dreamApi';
import { useAuth } from '@clerk/clerk-expo';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  title: string;
  description?: string;
  icon: string;
  type: 'action' | 'toggle' | 'info' | 'danger';
  onPress?: () => void;
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

const index = () => {
  const { signOut, user: clerkUser } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.firstName || '');
  const [username, setUsername] = useState(user?.username || '');

  // Privacy settings state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(true);

  // Modal states
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setDisplayName(user?.firstName || '');
    setUsername(user?.username || '');
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/');
          } catch (err) {
            console.error('Sign out error:', err);
          }
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    try {
      await user?.update({
        firstName: displayName,
        username: username.trim() || undefined,
      });
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleDataExport = async () => {
    try {
      const token = await getToken();
      const exportData = await dreamApi.exportUserData(token!);

      // Create a formatted data string
      const formattedData = JSON.stringify(exportData.data, null, 2);

      // For now, show a preview and copy to clipboard (in a real app, you'd save to device or send via email)
      Alert.alert(
        'Data Export Ready',
        `Your data has been prepared for export. Found ${exportData.data.dreams.length} dreams.\n\nIn a production app, this would be saved to your device or emailed to you.`,
        [
          { text: 'OK' },
          {
            text: 'View Data',
            onPress: () => console.log('Export Data:', formattedData),
          },
        ]
      );
    } catch (error) {
      console.error('Data export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your dreams and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const token = await getToken();
      await dreamApi.deleteUserData(token!);
      await clerkUser?.delete();
      router.replace('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'Failed to delete account. Please contact support.');
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          title: 'Edit Profile',
          description: 'Update your name and username',
          icon: 'person-outline',
          type: 'action',
          onPress: () => setIsEditingProfile(true),
        },
        {
          title: 'Change Password',
          description: 'Update your account password',
          icon: 'lock-closed-outline',
          type: 'action',
          onPress: () =>
            Alert.alert(
              'Feature Coming Soon',
              'Password change will be available in a future update.'
            ),
        },
      ],
    },
    {
      title: 'Privacy & Data',
      items: [
        {
          title: 'Analytics & Performance',
          description: 'Help improve the app with anonymous usage data',
          icon: 'analytics-outline',
          type: 'toggle',
          value: analyticsEnabled,
          onToggle: setAnalyticsEnabled,
        },
        {
          title: 'Marketing Communications',
          description: 'Receive updates about new features',
          icon: 'mail-outline',
          type: 'toggle',
          value: marketingEmails,
          onToggle: setMarketingEmails,
        },
        {
          title: 'Data Processing',
          description: 'Allow processing of dreams for AI interpretation',
          icon: 'cloud-outline',
          type: 'toggle',
          value: dataProcessing,
          onToggle: setDataProcessing,
        },
        {
          title: 'Privacy Policy',
          description: 'Read our privacy policy and data handling',
          icon: 'shield-outline',
          type: 'info',
          onPress: () => setShowPrivacyModal(true),
        },
        {
          title: 'Export My Data',
          description: 'Download all your data (GDPR Right)',
          icon: 'download-outline',
          type: 'action',
          onPress: handleDataExport,
        },
        {
          title: 'Data Usage',
          description: "See what data we collect and how it's used",
          icon: 'information-circle-outline',
          type: 'info',
          onPress: () => setShowDataModal(true),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Contact Support',
          description: 'Get in touch with our team',
          icon: 'chatbox-outline',
          type: 'action',
          onPress: () =>
            Alert.alert('Contact Support', 'Email us at support@morpheoai.com'),
        },
      ],
    },
    {
      title: 'Account Management',
      items: [
        {
          title: 'Delete Account',
          description: 'Permanently delete your account and all data',
          icon: 'trash-outline',
          type: 'danger',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <Pressable
      key={item.title}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" flex={1}>
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Ionicons
              name={item.icon as any}
              size={20}
              color={item.type === 'danger' ? '#ef4444' : Colors.primary}
            />
          </View>
          <YStack flex={1}>
            <Text
              className={`font-nunito text-base font-semibold ${
                item.type === 'danger' ? 'text-red-500' : 'text-gray-800'
              }`}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text className="font-nunito text-sm text-gray-500 mt-1">
                {item.description}
              </Text>
            )}
          </YStack>
        </XStack>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e7eb', true: Colors.primary }}
            thumbColor="#ffffff"
          />
        )}
        {(item.type === 'action' ||
          item.type === 'info' ||
          item.type === 'danger') && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </XStack>
    </Pressable>
  );

  return (
    <GeneralLinearBackground>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 50 }}
      >
        <View className="flex-1 p-4">
          {/* Profile Header */}
          <View className="items-center mb-8">
            <View className="rounded-full overflow-hidden mb-4">
              <Image
                style={{ width: 120, height: 120 }}
                source={{ uri: user?.imageUrl }}
                contentFit="cover"
              />
            </View>
            <Text className="font-nunito text-2xl font-bold text-gray-800">
              {user?.firstName || user?.username || 'User'}
            </Text>
            <Text className="font-nunito text-sm text-gray-500 mt-1">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <View key={section.title} className="mb-6">
              <Text className="font-nunito text-lg font-bold text-gray-700 mb-3 px-2">
                {section.title}
              </Text>
              {section.items.map(renderSettingsItem)}
            </View>
          ))}

          {/* Sign Out Button */}
          <Pressable
            className="bg-white rounded-xl p-4 mt-4 border border-gray-200 shadow-sm"
            onPress={handleSignOut}
          >
            <XStack alignItems="center" justifyContent="center">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="font-nunito text-red-500 font-semibold ml-2">
                Sign Out
              </Text>
            </XStack>
          </Pressable>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={isEditingProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <XStack justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onPress={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
              <Text className="font-nunito text-lg font-bold">
                Edit Profile
              </Text>
              <Button onPress={handleUpdateProfile}>Save</Button>
            </XStack>
          </View>
          <ScrollView className="flex-1 p-4">
            <YStack gap="$4">
              <View>
                <Text className="font-nunito text-base font-semibold mb-2">
                  Display Name
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 font-nunito"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                />
              </View>
              <View>
                <Text className="font-nunito text-base font-semibold mb-2">
                  Username
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl p-4 font-nunito"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                />
              </View>
            </YStack>
          </ScrollView>
        </View>
      </Modal>

      {/* Data Usage Modal */}
      <Modal
        visible={showDataModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <XStack justifyContent="space-between" alignItems="center">
              <Text className="font-nunito text-lg font-bold">Data Usage</Text>
              <Button
                variant="outlined"
                onPress={() => setShowDataModal(false)}
              >
                Close
              </Button>
            </XStack>
          </View>
          <ScrollView className="flex-1 p-4">
            <YStack gap="$4">
              <Text className="font-nunito text-base font-semibold">
                What data we collect:
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                • Dream descriptions you provide{'\n'}• AI-generated
                interpretations and images{'\n'}• Account information (email,
                name, profile picture){'\n'}• App usage analytics (when enabled)
                {'\n'}• Device information for technical support
              </Text>

              <Text className="font-nunito text-base font-semibold mt-4">
                How we use your data:
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                • Provide AI dream interpretations using OpenAI services{'\n'}•
                Generate personalized dream images{'\n'}• Improve app
                performance and user experience{'\n'}• Send important account
                and service updates{'\n'}• Provide customer support when needed
              </Text>

              <Text className="font-nunito text-base font-semibold mt-4">
                Your rights:
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                • Access your data at any time{'\n'}• Export all your data in a
                readable format{'\n'}• Delete your account and all associated
                data{'\n'}• Opt out of analytics and marketing communications
                {'\n'}• Request data correction or deletion
              </Text>
            </YStack>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <XStack justifyContent="space-between" alignItems="center">
              <Text className="font-nunito text-lg font-bold">
                Privacy Policy
              </Text>
              <Button
                variant="outlined"
                onPress={() => setShowPrivacyModal(false)}
              >
                Close
              </Button>
            </XStack>
          </View>
          <ScrollView className="flex-1 p-4">
            <YStack gap="$4">
              <Text className="font-nunito text-base font-semibold">
                Privacy Policy Summary
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                MorpheoAI is committed to protecting your privacy and ensuring
                GDPR compliance.
              </Text>

              <Text className="font-nunito text-base font-semibold mt-4">
                Data Protection
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                • All data is encrypted in transit and at rest{'\n'}• We use
                secure authentication via Clerk{'\n'}• Dream data is processed
                by OpenAI under their privacy terms{'\n'}• We do not sell or
                share your personal data with third parties{'\n'}• Data
                retention policies ensure old data is automatically deleted
              </Text>

              <Text className="font-nunito text-base font-semibold mt-4">
                Third-Party Services
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                • Clerk: Authentication and user management{'\n'}• OpenAI: Dream
                interpretation and image generation{'\n'}• Expo: Mobile app
                development platform{'\n'}• Analytics: Anonymous usage data
                (when enabled)
              </Text>

              <Text className="font-nunito text-base font-semibold mt-4">
                Contact
              </Text>
              <Text className="font-nunito text-sm text-gray-600">
                For privacy concerns, contact us at privacy@morpheoai.com
              </Text>
            </YStack>
          </ScrollView>
        </View>
      </Modal>

      {/* Account Deletion Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm">
            <Text className="font-nunito text-lg font-bold text-center mb-4">
              Delete Account
            </Text>
            <Text className="font-nunito text-sm text-gray-600 text-center mb-6">
              This action cannot be undone. All your dreams, interpretations,
              and account data will be permanently deleted.
            </Text>
            <YStack gap="$3">
              <Button className="bg-red-500" onPress={confirmDeleteAccount}>
                <Text className="font-nunito text-white font-semibold">
                  Delete Forever
                </Text>
              </Button>
              <Button
                variant="outlined"
                onPress={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </YStack>
          </View>
        </View>
      </Modal>
    </GeneralLinearBackground>
  );
};

export default index;
