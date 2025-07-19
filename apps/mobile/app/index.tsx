import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function Index() {
    return (
        <>
            <SignedIn>
                <Redirect href="/logdream" />
            </SignedIn>
            <SignedOut>
                <Redirect href="/auth" />
            </SignedOut>
        </>
    );
}
