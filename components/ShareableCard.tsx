export default function ShareableCard({
  streak,
  longest,
  thisWeek,
}: {
  streak: number;
  longest: number;
  thisWeek: { date: string; count: number }[] | undefined;
}) {
  if (!thisWeek || !Array.isArray(thisWeek)) return null;

  const isNewRecord = streak > longest;

  // 1. Group counts by weekday
  const dailyCounts: Record<string, number[]> = {};
  thisWeek.forEach((b) => {
    const day = new Date(b.date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!dailyCounts[day]) dailyCounts[day] = [];
    dailyCounts[day].push(b.count);
  });

  // 2. Compute ceiling averages for each weekday
  const averages: Record<string, number> = {};
  for (const day in dailyCounts) {
    const values = dailyCounts[day];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    averages[day] = Math.ceil(avg);
  }

  // 3. Determine block color
  const getBlockColor = (
    count: number,
    weekday: string,
    averages: Record<string, number>
  ) => {
    const avg = averages[weekday];

    if (avg === 0 || avg === undefined) return '#d1d5db'; // gray
    if (count > avg) return '#22c55e'; // green
    if (count < avg) return '#facc15'; // yellow
    return '#60a5fa'; // blue
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
        🧠 Focus Streak (Last 7 Days)
      </h2>

      <p style={{ marginTop: '8px' }}>
        🔥 {streak} block{streak !== 1 ? 's' : ''} logged this week
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '16px',
        }}
      >
        {thisWeek.map((b, i) => {
          const weekday = new Date(b.date).toLocaleDateString('en-US', {
            weekday: 'short',
          });
          const bg = getBlockColor(b.count, weekday, averages);

          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: bg,
                  borderRadius: '6px',
                  margin: '0 auto',
                }}
              ></div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{weekday}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        🎯 Current streak: {streak} day{streak !== 1 ? 's' : ''}
        <br />
        🏆 Longest streak: {longest} day{longest !== 1 ? 's' : ''}{' '}
        {isNewRecord ? '🎉 New Record!' : ''}
      </div>
    </div>
  );
}
