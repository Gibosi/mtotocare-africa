import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

// This file exists so expo-router recognizes the "add-center" route name
// used by the (tabs) layout's custom tab bar. The actual tap/long-press
// actions in the tab bar navigate to /appointments/book or /children/add
// directly — this screen is never actually rendered.
export default function AddCenter() {
  return <Redirect href="/(tabs)/home" />;
}
