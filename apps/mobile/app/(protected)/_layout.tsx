import React from 'react';
import { Redirect, Slot, Stack } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';

const ProtectedLoayout = () => {
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

export default ProtectedLoayout;
