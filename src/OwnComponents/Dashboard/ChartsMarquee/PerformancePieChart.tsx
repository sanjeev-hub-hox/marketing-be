// import React, { useEffect, useRef } from 'react'
// import * as echarts from 'echarts'

// interface PieChartProps {
//   data: { value: number; name: string }[]
// }

// const PerformancePieChart: React.FC<PieChartProps> = ({ data }) => {
//   const chartRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     if (chartRef.current) {
//       const chart = echarts.init(chartRef.current)

//       // Define a color palette
//       const colors = ['#ff6666', '#ffcc66', '#66cc66', '#66ccff', '#cc66ff']

//       // Calculate the total value of all items
//       const total = data.reduce((sum, item) => sum + item.value, 0)

//       // Map data to include percentage values and item styles
//       const formattedData = data.map((item, index) => ({
//         ...item,
//         value: (item.value / total) * 100, // Convert value to percentage
//         itemStyle: {
//           color: colors[index % colors.length]
//         }
//       }))

//       const option: echarts.EChartsOption = {
//         tooltip: {
//           trigger: 'item',
//           formatter: '{b}: {d}%' // Display percentage in tooltip
//         },
//         series: [
//           {
//             type: 'pie',

//             // radius: ['70%', '80%'],
//             radius: ['40%', '70%'],
//             avoidLabelOverlap: false,
//             itemStyle: {
//               borderRadius: 10
//             },
//             label: {
//               show: false,
//               position: 'center'
//             },
//             emphasis: {
//               label: {
//                 show: false // Ensure the center label doesn't appear on hover
//               }
//             },
//             labelLine: {
//               show: false
//             },
//             data: formattedData
//           }
//         ]
//       }

//       chart.setOption(option)

//       // Resize chart when window size changes
//       const resizeHandler = () => {
//         chart.resize()
//       }

//       window.addEventListener('resize', resizeHandler)

//       // Clean up
//       return () => {
//         window.removeEventListener('resize', resizeHandler)
//         chart.dispose()
//       }
//     }
//   }, [data])

//   return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
// }

// export default PerformancePieChart

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface PieChartThreeProps {
  data: { value: number; name: string }[]
}

const PerformancePieChart: React.FC<PieChartThreeProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      // Custom color array
      const colors = ['#3F41D1', '#FFD200', '#F68D2B', '#F4A79D', '#9ECD65']

      // Calculate the total value of all items
      const total = data.reduce((sum, item) => sum + item.value, 0)

      // Map data to include percentage values and item styles
      const formattedData = data.map((item, index) => ({
        ...item,
        value: (item.value / total) * 100, // Convert value to percentage
        itemStyle: { color: colors[index % colors.length] }
      }))

      const option: echarts.EChartsOption = {
        legend: {
          bottom: '3%',
          left: 'center',
          type: 'plain',
          orient: 'horizontal',
          itemGap: 20,
          itemWidth: 14,
          itemHeight: 14,
          textStyle: {
            color: '#212121',
            fontSize: 10,
            fontWeight: 500,
            lineHeight: 15,
            align: 'center',
            verticalAlign: 'middle'
          },
          data: data.map(item => item.name),
          icon: 'circle'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {d}%' // Display percentage in tooltip
        },
        series: [
          {
            name: 'Access From1',
            type: 'pie',
            radius: ['50%', '40%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: formattedData
          }
        ]
      }

      // Use the specified configuration item and data to show the chart
      chartInstance.setOption(option)

      // Cleanup on unmount
      return () => {
        chartInstance.dispose()
      }
    }
  }, [])

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
}

export default PerformancePieChart
