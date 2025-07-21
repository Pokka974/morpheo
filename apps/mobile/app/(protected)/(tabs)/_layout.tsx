import Colors from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { NotebookText, CloudMoon, UserCircle, Orbit } from '@tamagui/lucide-icons';
import useTabBarStore from '@/app/store/tabBarStore';

export default function TabLayout() {
    const { visible } = useTabBarStore();
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: '#A0AEC0',
                headerShown: false,
                tabBarStyle: {
                    display: visible ? 'flex' : 'none',
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 25,
                    elevation: 0,
                    backgroundColor: '#fff',
                    borderRadius: 24,
                    height: 85,
                    marginHorizontal: 45,
                    // If you want a little shadow on Android:
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 8,
                },
                tabBarItemStyle: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            }}
        >
            <Tabs.Screen
                name="dreamhistory"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View
                            className={`flex-1 items-center justify-center ${
                                focused ? 'mt-5' : 'mt-11'
                            } duration-150 ease-in-out`}
                        >
                            <NotebookText size={focused ? '$3' : '$2'} color={focused ? Colors.primary : '#A0AEC0'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="logdream"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View
                            className={`flex-1 items-center justify-center ${
                                focused ? 'mt-5' : 'mt-11'
                            } duration-150 ease-in-out`}
                        >
                            <CloudMoon size={focused ? '$3' : '$2'} color={focused ? Colors.primary : '#A0AEC0'} />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View
                            className={`flex-1 items-center justify-center ${
                                focused ? 'mt-5' : 'mt-11'
                            } duration-150 ease-in-out`}
                        >
                            <UserCircle size={focused ? '$3' : '$2'} color={focused ? Colors.primary : '#A0AEC0'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View
                            className={`flex-1 items-center justify-center ${
                                focused ? 'mt-5' : 'mt-11'
                            } duration-150 ease-in-out`}
                        >
                            <Orbit size={focused ? '$3' : '$2'} color={focused ? Colors.primary : '#A0AEC0'} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}