import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface DetailsButtonProps {
    onPress: () => void;
    text?: string;
    variant?: 'primary' | 'outlined';
    color?: string;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function DetailsButton({
    onPress,
    text = 'Details',
    variant = 'outlined',
    color = '#D32F2F',
    fullWidth = true,
    style,
    textStyle,
}: DetailsButtonProps) {
    const buttonStyles = [
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'primary' ? { backgroundColor: color } : styles.outlined,
        variant === 'outlined' && { borderColor: color },
        style,
    ];

    const textStyles = [
        styles.text,
        variant === 'primary' ? styles.primaryText : { color },
        textStyle,
    ];

    return (
        <TouchableOpacity style={buttonStyles} onPress={onPress}>
            <Text style={textStyles}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    outlined: {
        backgroundColor: '#fff',
        borderWidth: 1,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
    },
    primaryText: {
        color: '#fff',
    },
});
