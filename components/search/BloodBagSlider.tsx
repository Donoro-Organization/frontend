import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text, Chip } from "react-native-paper";

interface BloodBagSliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

export default function BloodBagSlider({
    value,
    onChange,
    min = 1,
    max = 5,
}: BloodBagSliderProps) {
    const handleIncrement = () => {
        if (value < max) onChange(value + 1);
    };

    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };

    const progress = ((value - min) / (max - min)) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.sliderContainer}>
                <IconButton
                    icon="minus"
                    size={24}
                    iconColor="#fff"
                    containerColor="#C84B4B"
                    onPress={handleDecrement}
                    disabled={value <= min}
                />

                <View style={styles.trackContainer}>
                    <View style={styles.track}>
                        <View style={[styles.trackFilled, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.numbersContainer}>
                        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(
                            (num) => (
                                <Text
                                    key={num}
                                    style={[
                                        styles.numberText,
                                        num === value && styles.activeNumberText,
                                    ]}
                                >
                                    {num}
                                </Text>
                            )
                        )}
                    </View>
                </View>

                <IconButton
                    icon="plus"
                    size={24}
                    iconColor="#fff"
                    containerColor="#C84B4B"
                    onPress={handleIncrement}
                    disabled={value >= max}
                />
            </View>
            <View style={styles.centerValue}>
                <Chip
                    mode="flat"
                    textStyle={styles.chipText}
                    style={styles.chip}
                >
                    {value} bag{value !== 1 ? "s" : ""}
                </Chip>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: "#C84B4B",
        borderRadius: 8,
        padding: 16,
        backgroundColor: "#fff",
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
    },
    trackContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    track: {
        width: "100%",
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        overflow: "hidden",
    },
    trackFilled: {
        height: "100%",
        backgroundColor: "#C84B4B",
        borderRadius: 4,
    },
    numbersContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 8,
    },
    numberText: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
    },
    activeNumberText: {
        color: "#C84B4B",
        fontWeight: "700",
        fontSize: 14,
    },
    centerValue: {
        alignItems: "center",
        marginTop: 12,
    },
    chip: {
        backgroundColor: "#C84B4B",
    },
    chipText: {
        color: "#fff",
        fontWeight: "600",
    },
});
