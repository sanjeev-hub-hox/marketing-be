import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface PieChartThreeProps {
  data: { value: number; name: string }[]
}

const DepartmentPieChart: React.FC<PieChartThreeProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      // Custom color array
      const colors = ['#3F41D1', '#FFD200', '#F68D2B', '#F4A79D', '#9ECD65']

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
        series: [
          {
            name: 'Access From',
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
            data: data.map((item, index) => ({
              ...item,
              itemStyle: { color: colors[index % colors.length] }
            }))
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

export default DepartmentPieChart
