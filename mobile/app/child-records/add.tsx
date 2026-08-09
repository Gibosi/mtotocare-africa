import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

// Redirects to the actual add child form
export default function AddChildRedirect() {
  return <Redirect href="/(auth)/add-your-child" />;
}
