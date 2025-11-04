import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";

interface DateSelectorProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

interface DateItem {
    date: number;
    day: string;
    fullDate: Date;
}

export default function DateSelector({
    selectedDate,
    onChange,
}: DateSelectorProps) {
    const generateDates = () => {
        const dates: DateItem[] = [];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            dates.push({
                date: date.getDate(),
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                fullDate: date,
            });
        }

        return dates;
    };

    const dates = generateDates();

    const isSelectedDate = (date: Date) => {
        return (
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear()
        );
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {dates.map((item, index) => {
                const isSelected = isSelectedDate(item.fullDate);
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                        onPress={() => onChange(item.fullDate)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.dateNumber,
                                isSelected && styles.selectedDateNumber,
                            ]}
                        >
                            {item.date}
                        </Text>
                        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                            {item.day}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: 80,
    },
    contentContainer: {
        gap: 12,
        paddingVertical: 4,
    },
    dateItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 70,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#fff",
    },
    selectedDateItem: {
        backgroundColor: "#C84B4B",
        borderColor: "#C84B4B",
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    selectedDateNumber: {
        color: "#fff",
    },
    dayText: {
        fontSize: 12,
        color: "#666",
    },
    selectedDayText: {
        color: "#fff",
    },
});
