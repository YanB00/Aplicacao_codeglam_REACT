import React, { useState, useEffect, useRef } from 'react'; 
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
import ChartDataLabels from 'chartjs-plugin-datalabels';

import styles from './ChartArea.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function ChartArea() {
  const chartRef = useRef(null); // <--- Crie uma ref para o gráfico
  const [originalChartData, setOriginalChartData] = useState(null);
  const [chartData, setChartData] = useState({
    labels: ['Concluídos', 'Cancelados', 'Em Progresso'],
    datasets: [ {
        label: 'Quantidade de Agendamentos',
        data: [0, 0, 0], 
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

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

        const concluidos = data.data.concluidos || 0;
        const cancelados = data.data.cancelados || 0;
        const emProgresso = data.data.emProgresso || 0;
        const total = data.data.total || 0;

        const fetchedData = { concluidos, cancelados, emProgresso, total };
        setOriginalChartData(fetchedData);
        setTotalAppointments(total);

        updateChartData(fetchedData, 'all');

        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados para o gráfico:', err);
        setError('Não foi possível carregar os dados do gráfico. Tente novamente mais tarde.');
        setOriginalChartData(null);
        setChartData({ labels: [], datasets: [] });
        setTotalAppointments(0);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const updateChartData = (data, filter) => {
    let labels = ['Concluídos', 'Cancelados', 'Em Progresso'];
    let chartValues = [data.concluidos, data.cancelados, data.emProgresso];
    let backgroundColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
    ];
    let borderColors = [
      'rgba(75, 192, 192, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)',
    ];
    let currentTotal = data.total;

    if (filter === 'concluidos') {
      labels = ['Concluídos'];
      chartValues = [data.concluidos];
      backgroundColors = ['rgba(75, 192, 192, 0.6)'];
      borderColors = ['rgba(75, 192, 192, 1)'];
      currentTotal = data.concluidos;
    } else if (filter === 'cancelados') {
      labels = ['Cancelados'];
      chartValues = [data.cancelados];
      backgroundColors = ['rgba(255, 99, 132, 0.6)'];
      borderColors = ['rgba(255, 99, 132, 1)'];
      currentTotal = data.cancelados;
    } else if (filter === 'emprogresso') {
      labels = ['Em Progresso'];
      chartValues = [data.emProgresso];
      backgroundColors = ['rgba(255, 206, 86, 0.6)'];
      borderColors = ['rgba(255, 206, 86, 1)'];
      currentTotal = data.emProgresso;
    }

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Quantidade de Agendamentos',
          data: chartValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    });
    setTotalAppointments(currentTotal);
    setActiveFilter(filter);
  };

  const handleBarClick = (event) => {
    const chart = chartRef.current;
    if (!chart || !originalChartData) { 
      return;
    }
    const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
    console.log('Clicked elements:', elements); 


    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index;
      const clickedLabel = chartData.labels[clickedElementIndex];       
      let filterToApply = '';
      if (clickedLabel === 'Concluídos') filterToApply = 'concluidos';
      else if (clickedLabel === 'Cancelados') filterToApply = 'cancelados';
      else if (clickedLabel === 'Em Progresso') filterToApply = 'emProgresso';

      if (activeFilter === filterToApply) {
        updateChartData(originalChartData, 'all');
      } else {
        updateChartData(originalChartData, filterToApply);
      }
    } else { 
      if (activeFilter !== 'all' && originalChartData) { 
        updateChartData(originalChartData, 'all');
      }
    }
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        },
        onClick: (e, legendItem, legend) => {
          if (originalChartData) {
            const labelText = legendItem.text;

            console.log("Clique na legenda:", legendItem.text); 
            if (activeFilter !== 'all' && legendItem.text === 'Quantidade de Agendamentos') {
                updateChartData(originalChartData, 'all');
            }
          }
        },
      },
      title: {
        display: true,
        text: `Status dos Agendamentos do Mês (Total: ${totalAppointments})`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.y;
            const total = totalAppointments;

            let percentage = 0;
            if (total > 0) {
                percentage = ((value / total) * 100).toFixed(1);
            }

            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value) => {
          return value > 0 ? value : '';
        },
        anchor: 'end',
        align: 'top',
        offset: -4,
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
    },

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

  const hasData = totalAppointments > 0;

  return (
    <div className={styles.chartBox}>
      {hasData ? (
        <div className={styles.chartContainer}>
          <Bar ref={chartRef} data={chartData} options={options} onClick={handleBarClick} /> 
        </div>
      ) : (
        <div className={styles.placeholder}>Nenhum agendamento encontrado para o mês atual.</div>
      )}
    </div>
  );
}