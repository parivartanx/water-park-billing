
export const todayISTDateTime = () => {
    // Set time zone to Asia/Kolkata (Indian Standard Time)
    const now = new Date();
    // IST is UTC+5:30
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime;
}