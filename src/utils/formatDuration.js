/**
 * Lesson.duration is stored in SECONDS (see LectureModal.jsx's admin auto-detect: it reads
 * <video>.duration — always seconds — and rounds it straight into this field). The student-
 * facing viewer was previously showing that raw number with a "min" suffix (a 3600s/1-hour
 * video literally read "3600 min") — this converts it to whatever unit actually makes sense.
 */
export function formatDuration(totalSeconds) {
    const seconds = Math.round(Number(totalSeconds) || 0);
    if (seconds <= 0) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
        return secs > 0 && minutes < 5 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
}
