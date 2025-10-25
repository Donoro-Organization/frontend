import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface ErrorDialogProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

export default function ErrorDialog({
    visible,
    message,
    onClose,
}: ErrorDialogProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                <Dialog.Icon icon={() => <Ionicons name="alert-circle" size={64} color="#D32F2F" />} />
                <Dialog.Content>
                    <Text variant="bodyLarge" style={styles.message}>
                        {message}
                    </Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={onClose}
                        buttonColor="#D32F2F"
                        style={styles.button}
                    >
                        OK
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    message: {
        textAlign: 'center',
        lineHeight: 24,
        color: '#333',
    },
    actions: {
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    button: {
        borderRadius: 12,
        minWidth: 140,
    },
});
