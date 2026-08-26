export const formattedDate = (locale: string | null, date: Date | null) => {
if (!locale || !date) return '';

    const newDate = new Date(date)
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(newDate)
}
