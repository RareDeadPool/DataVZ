import { Bar, Line, Pie, Scatter, Doughnut, Radar, PolarArea, Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls, Sphere } from '@react-three/drei';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, RadialLinearScale);

export function ChartRenderer({ type, data, xKey, yKey, zKey, palette = ["#3777E0"], customColors = [] }) {
  if (!data) return null;
  const labels = xKey ? data.map(row => row[xKey]) : [];
  const values = yKey ? data.map(row => row[yKey]) : [];
  const colors = (customColors && customColors.length > 1) ? customColors : palette;

  const legendOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 16, weight: 'bold' },
          color: '#222',
          boxWidth: 24,
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  if (type === 'bar') {
    return <Bar data={{ labels, datasets: [{ label: yKey, data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) }] }} options={legendOptions} />;
  }
  if (type === 'horizontalBar') {
    return <Bar data={{ labels, datasets: [{ label: yKey, data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) }] }} options={{ ...legendOptions, indexAxis: 'y' }} />;
  }
  if (type === 'line') {
    const lineColor = colors[0] || '#3777E0';
    return <Line data={{ labels, datasets: [{ label: yKey, data: values, borderColor: lineColor, backgroundColor: lineColor + '33', pointBackgroundColor: lineColor, pointBorderColor: lineColor, fill: false }] }} options={legendOptions} />;
  }
  if (type === 'area') {
    const lineColor = colors[0] || '#3777E0';
    return <Line data={{ labels, datasets: [{ label: yKey, data: values, borderColor: lineColor, backgroundColor: lineColor + '33', pointBackgroundColor: lineColor, pointBorderColor: lineColor, fill: true }] }} options={{ ...legendOptions, elements: { line: { tension: 0.4 } } }} />;
  }
  if (type === 'pie') {
    return <Pie data={{ labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) }] }} options={legendOptions} />;
  }
  if (type === 'doughnut') {
    return <Doughnut data={{ labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) }] }} options={legendOptions} />;
  }
  if (type === 'radar') {
    const lineColor = colors[0] || '#3777E0';
    return <Radar data={{ labels: Object.keys(data[0] || {}), datasets: [{ label: 'Values', data: Object.values(data[0] || {}), backgroundColor: lineColor + '33', borderColor: lineColor, pointBackgroundColor: lineColor, pointBorderColor: lineColor }] }} options={legendOptions} />;
  }
  if (type === 'polar') {
    return <PolarArea data={{ labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) }] }} options={legendOptions} />;
  }
  if (type === 'bubble') {
    return <Bubble data={{ datasets: [{ label: `${xKey}, ${yKey}, ${zKey}`, data: data.map(row => ({ x: row[xKey], y: row[yKey], r: Number(row[zKey]) || 5 })), backgroundColor: data.map((_, i) => colors[i % colors.length]) }] }} options={{ ...legendOptions, scales: { x: { title: { display: true, text: xKey } }, y: { title: { display: true, text: yKey } } } }} />;
  }
  if (type === 'scatter') {
    return <Scatter data={{ datasets: [{ label: `${xKey} vs ${yKey}`, data: data.map(row => ({ x: row[xKey], y: row[yKey] })), backgroundColor: data.map((_, i) => colors[i % colors.length]) }] }} options={{ ...legendOptions, scales: { x: { title: { display: true, text: xKey } }, y: { title: { display: true, text: yKey } } } }} />;
  }
  if (type === '3d') {
    // Simple 3D column chart
    return (
      <div style={{ height: 400 }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {values.map((v, i) => (
            <Box key={i} position={[i - values.length / 2, v / 2, 0]} args={[0.8, v, 0.8]}>
              <meshStandardMaterial attach="material" color="#3777E0" />
            </Box>
          ))}
          <OrbitControls />
        </Canvas>
      </div>
    );
  }
  if (type === '3dPie') {
    // Simple 3D pie chart placeholder
    return (
      <div style={{ height: 400 }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {values.map((v, i) => (
            <Box key={i} position={[Math.cos((2 * Math.PI * i) / values.length) * 3, 0, Math.sin((2 * Math.PI * i) / values.length) * 3]} args={[1, v, 1]}>
              <meshStandardMaterial attach="material" color={['#3777E0', '#43e', '#e43', '#3e4', '#e34', '#4e3'][i % 6]} />
            </Box>
          ))}
          <OrbitControls />
        </Canvas>
      </div>
    );
  }
  if (type === '3dScatter') {
    // Simple 3D scatter plot
    return (
      <div style={{ height: 400 }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {data.map((row, i) => (
            <Sphere key={i} position={[row[xKey] || 0, row[yKey] || 0, row[zKey] || 0]} args={[0.3, 16, 16]}>
              <meshStandardMaterial attach="material" color="#3777E0" />
            </Sphere>
          ))}
          <OrbitControls />
        </Canvas>
      </div>
    );
  }
  return null;
} 