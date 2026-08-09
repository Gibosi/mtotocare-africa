import React from 'react';
import { Redirect } from 'expo-router';

// This is a placeholder route. Children management happens via
// /child-records/add (add new) or /child-records/[id] (view existing).
// Visiting just /child-records redirects to the home screen.
export default function ChildRecordsIndex() {
  return <Redirect href="/(tabs)/home" />;
}
