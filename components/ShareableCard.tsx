// components/ShareableCard.tsx
export default function ShareableCard({
    streak,
    longest,
    thisWeek,
  }: {
    streak: number;
    longest: number;
    thisWeek: { date: string; count: number }[];
  }) {
    const isNewRecord = streak > longest;
  
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
            const bg =
              b.count === 0
                ? '#d1d5db'
                : b.count < 2
                ? '#facc15'
                : b.count < 4
                ? '#fb923c'
                : '#22c55e';
  
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
          🏆 Longest streak: {streak} day{streak !== 1 ? 's' : ''}{' '}
          {isNewRecord ? '🎉 New Record!' : ''}
        </div>
      </div>
    );
  }
  