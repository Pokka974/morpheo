import React from 'react';
import { Redirect, Slot } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import Loading from '../loading';

const ProtectedLayout = () => {
  return (
    <>
      <SignedIn>
        <Slot />
      </SignedIn>
      <SignedOut>
        <Redirect href="/auth" />
      </SignedOut>
    </>
  );
};

export default ProtectedLayout;
