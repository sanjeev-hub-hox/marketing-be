import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface BarChartProps {
  barData: number[]
}

const BarChart = ({ barData }: BarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      // Initialize the chart
      // const chartDom = document.getElementById('bar')
      // const myChart = echarts.init(chartDom)

      // Data and colors
      const data = barData
      const colors = [
        '#FA898B',
        '#9ECD65',
        '#7678EB',
        '#FFD333',
        '#F8B75D',
        '#7EECE5',
        '#5AC4FF',
        '#CA8CFB',
        '#FF77B8',
        '#77FFAD'
      ]

      // Chart option
      const option = {
        xAxis: {
          data: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']
        },
        yAxis: {
          min: 0,
          max: 40,
          interval: 5,
          axisLabel: {
            formatter: function (value: any) {
              return value
            }
          }
        },
        series: [
          {
            type: 'bar',
            data: barData.map((value, index) => ({
              value,
              itemStyle: { color: colors[index] }
            })),
            itemStyle: {
              barBorderRadius: 10,
              borderWidth: 1,
              borderType: 'solid'
            }
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

export default BarChart
