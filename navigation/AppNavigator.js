import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../src/screens/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';
import ProductScreen from '../src/screens/ProductScreen';
import EditProductScreen from '../src/screens/EditProductScreen';
import AddProductScreen from '../src/screens/AddProductScreen';
import SalesScreen from '../src/screens/SalesScreen';
import CashBookScreen from '../src/screens/CashBookScreen';
import SalesDetailScreen from '../src/screens/SalesDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="SalesScreen" component={SalesScreen} />
      <Stack.Screen name="CashBookScreen" component={CashBookScreen} />
      <Stack.Screen name="SalesDetailScreen" component={SalesDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
