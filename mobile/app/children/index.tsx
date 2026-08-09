import React from 'react';
import { Redirect } from 'expo-router';

// This is a placeholder route. Children management happens via
// /children/add (add new) or /children/[id] (view existing). Visiting
// just /children redirects to the home screen.
export default function ChildrenIndex() {
  return <Redirect href="/(tabs)/home" />;
}
