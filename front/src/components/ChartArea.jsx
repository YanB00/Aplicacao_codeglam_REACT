import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import styles from './ChartArea.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartArea() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/agendamentos/grafico/agendamentos-mensal'); 
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensageStatus || 'Erro ao carregar dados do gráfico');
        }

        if (data.errorStatus) {
          throw new Error(data.mensageStatus || 'Erro no servidor ao carregar dados do gráfico');
        }

        const { concluidos, cancelados, emProgresso } = data.data;

        setChartData({
          labels: ['Concluídos', 'Cancelados', 'Em Progresso'],
          datasets: [
            {
              label: 'Quantidade de Agendamentos',
              data: [concluidos, cancelados, emProgresso],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)', 
                'rgba(255, 99, 132, 0.6)', 
                'rgba(255, 206, 86, 0.6)', 
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
        setError(null); 
      } catch (err) {
        console.error('Erro ao buscar dados para o gráfico:', err);
        setError('Não foi possível carregar os dados do gráfico. Tente novamente mais tarde.');
        setChartData({ labels: [], datasets: [] }); 
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []); 

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'top',
        labels: {
            font: {
                size: 14 
            }
        }
      },
      title: {
        display: true,
        text: 'Status dos Agendamentos do Mês',
        font: {
            size: 18 
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('pt-BR').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false 
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.chartBox}>
        <div className={styles.placeholder}>Carregando dados do gráfico...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chartBox}>
        <div className={`${styles.placeholder} ${styles.error}`}>{error}</div>
      </div>
    );
  }

  // Verifica se há dados para exibir o gráfico
  const hasData = chartData.datasets.length > 0 && chartData.datasets[0].data.some(val => val > 0);

  return (
    <div className={styles.chartBox}>
      {hasData ? (
        <div className={styles.chartContainer}> 
            <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className={styles.placeholder}>Nenhum agendamento encontrado para o mês atual.</div>
      )}
    </div>
  );
}