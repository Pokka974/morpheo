import { AlertDialog, Button, YStack } from 'tamagui';
import { ReactNode } from 'react';

interface ErrorDialogProps {
    message: string;
    onClose: () => void;
    open?: boolean;
    title?: string;
    actions?: ReactNode;
}

const ErrorDialog = ({ message, onClose, open = !!message, title = 'Error', actions }: ErrorDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay key="overlay" />
                <AlertDialog.Content key="content">
                    <AlertDialog.Title key="title">{title}</AlertDialog.Title>
                    <AlertDialog.Description key="description">{message}</AlertDialog.Description>
                    <YStack key="ystack" paddingTop="$3">
                        {actions || (
                            <Button key="on-close-btn" onPress={onClose}>
                                OK
                            </Button>
                        )}
                    </YStack>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog>
    );
};

export default ErrorDialog;
