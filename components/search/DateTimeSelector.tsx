import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ErrorDialog from "../ErrorDialog";

interface DateTimeSelectorProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    getValidationState?: React.MutableRefObject<any>;
}

interface DateItem {
    date: number;
    day: string;
    fullDate: Date;
}

export default function DateTimeSelector({
    selectedDate,
    onChange,
    getValidationState,
}: DateTimeSelectorProps) {
    const [hourInput, setHourInput] = useState("");
    const [minuteInput, setMinuteInput] = useState("");
    const [errorDialogVisible, setErrorDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Expose validation state to parent
    React.useEffect(() => {
        if (getValidationState) {
            const validateInputs = () => {
                if (hourInput !== "") {
                    const num = parseInt(hourInput);
                    if (isNaN(num) || num < 1 || num > 12) {
                        return {
                            hasInvalidInput: true,
                            errorMessage: "Invalid hour! Please enter a value between 1 and 12.",
                        };
                    }
                }

                if (minuteInput !== "") {
                    const num = parseInt(minuteInput);
                    if (isNaN(num) || num < 0 || num > 59) {
                        return {
                            hasInvalidInput: true,
                            errorMessage: "Invalid minute! Please enter a value between 0 and 59.",
                        };
                    }
                }

                return { hasInvalidInput: false, errorMessage: "" };
            };

            // Override the function reference
            (getValidationState as any).current = validateInputs;
        }
    }, [hourInput, minuteInput, getValidationState]);

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

    const handleDateChange = (date: Date) => {
        // Preserve the time when changing date
        const newDate = new Date(date);
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        onChange(newDate);
    };

    const handleTimeChange = (hours: number, minutes: number) => {
        const newDate = new Date(selectedDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
    };

    const get12Hour = () => {
        const hour = selectedDate.getHours();
        return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    };

    const getAMPM = () => {
        return selectedDate.getHours() >= 12 ? "PM" : "AM";
    };

    const incrementHour = () => {
        const newHour = (selectedDate.getHours() + 1) % 24;
        handleTimeChange(newHour, selectedDate.getMinutes());
    };

    const decrementHour = () => {
        const newHour = (selectedDate.getHours() - 1 + 24) % 24;
        handleTimeChange(newHour, selectedDate.getMinutes());
    };

    const incrementMinute = () => {
        const newMinute = (selectedDate.getMinutes() + 1) % 60;
        const newHour = selectedDate.getMinutes() === 59 ? (selectedDate.getHours() + 1) % 24 : selectedDate.getHours();
        handleTimeChange(newHour, newMinute);
    };

    const decrementMinute = () => {
        const newMinute = (selectedDate.getMinutes() - 1 + 60) % 60;
        const newHour = selectedDate.getMinutes() === 0 ? (selectedDate.getHours() - 1 + 24) % 24 : selectedDate.getHours();
        handleTimeChange(newHour, newMinute);
    };

    const toggleAMPM = () => {
        const currentHour = selectedDate.getHours();
        const newHour = currentHour >= 12 ? currentHour - 12 : currentHour + 12;
        handleTimeChange(newHour, selectedDate.getMinutes());
    };

    const handleHourInput = (text: string) => {
        setHourInput(text);
    };

    const handleMinuteInput = (text: string) => {
        setMinuteInput(text);
    };

    const validateAndSetHour = () => {
        if (hourInput === "") {
            return;
        }

        const num = parseInt(hourInput);
        if (isNaN(num) || num < 1 || num > 12) {
            setErrorMessage("Invalid hour! Please enter a value between 1 and 12.");
            setErrorDialogVisible(true);
            // Reset to current hour
            setHourInput("");
            return;
        }

        const isPM = selectedDate.getHours() >= 12;
        let hour24 = num === 12 ? 0 : num;
        if (isPM) hour24 += 12;
        handleTimeChange(hour24, selectedDate.getMinutes());
        setHourInput("");
    };

    const validateAndSetMinute = () => {
        if (minuteInput === "") {
            return;
        }

        const num = parseInt(minuteInput);
        if (isNaN(num) || num < 0 || num > 59) {
            setErrorMessage("Invalid minute! Please enter a value between 0 and 59.");
            setErrorDialogVisible(true);
            // Reset to current minute
            setMinuteInput("");
            return;
        }

        handleTimeChange(selectedDate.getHours(), num);
        setMinuteInput("");
    };

    const formatTime = (num: number) => num.toString().padStart(2, "0");

    return (
        <View>
            {/* Date Selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateContainer}
                contentContainerStyle={styles.dateContentContainer}
            >
                {dates.map((item, index) => {
                    const isSelected = isSelectedDate(item.fullDate);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                            onPress={() => handleDateChange(item.fullDate)}
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

            {/* Time Selector */}
            <View style={styles.timeContainer}>
                <View style={styles.timePickerContainer}>
                    {/* Hour Picker */}
                    <View style={styles.timeColumn}>
                        <TouchableOpacity
                            onPress={incrementHour}
                            style={styles.timeButton}
                        >
                            <Ionicons name="chevron-up" size={20} color="#C84B4B" />
                        </TouchableOpacity>
                        <View style={styles.timeValueContainer}>
                            <TextInput
                                style={styles.timeValue}
                                value={hourInput || formatTime(get12Hour())}
                                onChangeText={handleHourInput}
                                onBlur={validateAndSetHour}
                                keyboardType="number-pad"
                                maxLength={2}
                                selectTextOnFocus
                                onFocus={() => setHourInput("")}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={decrementHour}
                            style={styles.timeButton}
                        >
                            <Ionicons name="chevron-down" size={20} color="#C84B4B" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.timeSeparator}>:</Text>

                    {/* Minute Picker */}
                    <View style={styles.timeColumn}>
                        <TouchableOpacity
                            onPress={incrementMinute}
                            style={styles.timeButton}
                        >
                            <Ionicons name="chevron-up" size={20} color="#C84B4B" />
                        </TouchableOpacity>
                        <View style={styles.timeValueContainer}>
                            <TextInput
                                style={styles.timeValue}
                                value={minuteInput || formatTime(selectedDate.getMinutes())}
                                onChangeText={handleMinuteInput}
                                onBlur={validateAndSetMinute}
                                keyboardType="number-pad"
                                maxLength={2}
                                selectTextOnFocus
                                onFocus={() => setMinuteInput("")}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={decrementMinute}
                            style={styles.timeButton}
                        >
                            <Ionicons name="chevron-down" size={20} color="#C84B4B" />
                        </TouchableOpacity>
                    </View>

                    {/* AM/PM Toggle */}
                    <TouchableOpacity
                        onPress={toggleAMPM}
                        style={styles.ampmButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.ampmText}>{getAMPM()}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ErrorDialog
                visible={errorDialogVisible}
                message={errorMessage}
                onClose={() => setErrorDialogVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    dateContainer: {
        maxHeight: 80,
    },
    dateContentContainer: {
        gap: 12,
        paddingVertical: 4,
    },
    dateItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 70,
        borderRadius: 8,
        backgroundColor: "#F5F5F5",
    },
    selectedDateItem: {
        backgroundColor: "#C84B4B",
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
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
    timeContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    timeColumn: {
        alignItems: "center",
        gap: 8,
    },
    timeButton: {
        padding: 8,
    },
    timeValueContainer: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 60,
        alignItems: "center",
    },
    timeValue: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
    },
    ampmButton: {
        backgroundColor: "#C84B4B",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 60,
    },
    ampmText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
});
