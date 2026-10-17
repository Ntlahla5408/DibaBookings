export const dateText = (value) =>
    value
        ? new Date(value).toLocaleDateString([], {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "-";

export const timeText = (value) =>
    value
        ? new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
          })
        : "-";

export const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString([], {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
          })
        : "-";

export const getDate = (item) =>
    item.startDateTime || item.bookingDate || item.date;


export const localInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const pad = (number) => String(number).padStart(2, "0");

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}`
    );
};
