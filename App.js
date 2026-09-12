import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './src/screens/AuthScreen';
import FeedScreen from './src/screens/FeedScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'تسجيل الدخول', headerShown: false }} />
        <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'الرئيسية' }} />
        <Stack.Screen name="CommentsScreen" component={CommentsScreen} options={{ title: 'التعليقات' }} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'منشور جديد' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
