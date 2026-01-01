import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function SpendingChart({ expenses }) {
  
  // 1. Aggregate Data: Calculate total spend per user
  const spendingMap = {};
  
  expenses.forEach((expense) => {
    // specific check to ignore Settlements in the chart
    if (expense.category === 'Settlement' || expense.description === 'Payment / Settlement') return;

    const name = expense.paidBy ? expense.paidBy.name : 'Unknown';
    if (!spendingMap[name]) {
        spendingMap[name] = 0;
    }
    spendingMap[name] += expense.amount;
  });

  const names = Object.keys(spendingMap);
  const amounts = Object.values(spendingMap);

  // 2. Chart Configuration
  const data = {
    labels: names,
    datasets: [
      {
        label: 'Total Spent (₹)',
        data: amounts,
        backgroundColor: [
          '#6c5ce7', // Purple
          '#00b894', // Green
          '#ff7675', // Red
          '#fdcb6e', // Yellow
          '#0984e3', // Blue
          '#e17055', // Orange
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
        legend: {
            position: 'right', // Put labels on the side
            labels: {
                usePointStyle: true,
                font: { family: 'Poppins', size: 12 }
            }
        }
    },
    cutout: '70%', // Makes it a thin doughnut
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '180px', marginBottom: '30px', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#888' }}>Spending Breakdown</h3>
        {expenses.length > 0 ? (
             <div style={{ height: '120px' }}>
                <Doughnut data={data} options={options} />
             </div>
        ) : (
            <p style={{ fontSize: '0.8rem', color: '#ccc', textAlign: 'center' }}>No data yet</p>
        )}
    </div>
  );
}

export default SpendingChart;