import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '@/components/CustomDrawer';
import '../global.css';

export default function Layout() {
  return <Drawer
  drawerContent={(props) => <CustomDrawer {...props} />}
/>
}