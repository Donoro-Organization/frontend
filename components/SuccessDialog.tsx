import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface SuccessDialogProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

export default function SuccessDialog({
    visible,
    message,
    onClose,
}: SuccessDialogProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                <Dialog.Icon icon={() => <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />} />
                <Dialog.Content>
                    <Text variant="bodyLarge" style={styles.message}>
                        {message}
                    </Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={onClose}
                        buttonColor="#4CAF50"
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
