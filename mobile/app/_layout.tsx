import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFC' }
        }}
      >
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(beneficiary)/index" />
        <Stack.Screen name="(beneficiary)/submit/gps" />
        <Stack.Screen name="(beneficiary)/submit/media" />
        <Stack.Screen name="(beneficiary)/submit/details" />
        <Stack.Screen name="(beneficiary)/submit/review" />
        <Stack.Screen name="(beneficiary)/submissions" />
        <Stack.Screen name="(beneficiary)/notifications" />
        <Stack.Screen name="(officer)/index" />
        <Stack.Screen name="(officer)/audit" />
      </Stack>
    </>
  );
}
