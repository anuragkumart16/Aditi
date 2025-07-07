import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export interface CustomDrawerProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomDrawer(props: CustomDrawerProps) {
    const router = useRouter();
    return (
      <DrawerContentScrollView {...props}>
        <View className='flex flex-row justify-between'>
          <Text className='text-red-500 text-2xl font-bold'>Welcome, User</Text>
          <Pressable onPress={() => {
            router.push('/settings');
          }}>
            <Entypo name='new-message' size={20} color='black' />
          </Pressable>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    );
  }

