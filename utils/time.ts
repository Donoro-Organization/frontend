 export const formatDateToDhaka = (date: Date): string => {
        // Format date in Dhaka timezone (Asia/Dhaka) as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
