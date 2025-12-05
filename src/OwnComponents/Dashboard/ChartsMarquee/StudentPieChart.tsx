'use client'
import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

// Define the type for the data
interface DataItem {
  value: number
  name: string
  centerLabel: string
}
interface RowData {
  rowData: DataItem[]
}
const StudentPieChart: React.FC<RowData> = ({ rowData }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      const data = rowData

      const totalValue = data.reduce((acc, item) => acc + item.value, 0)

      const centerData = data[0] // Assuming the first data point's label and value to be the default center data
      const defaultPercentage = ((centerData.value / totalValue) * 100).toFixed(0)

      const option: echarts.EChartsOption = {
        color: ['#3F41D1'],
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['70%', '63%'],
            avoidLabelOverlap: false,

            label: {
              show: false,
              position: 'outside', // Position labels outside the pie chart
              color: '#212121',
              formatter: '{b}', // Format label to show name and percentage
              edgeDistance: '30%' // Distance from pie chart edge
            },
            labelLine: {
              show: false,
              length: 15,
              length2: 15,
              smooth: true,
              minTurnAngle: 90,
              maxSurfaceAngle: 90
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 10,
                fontWeight: 400
              }
            },
            data: data
          }
        ],
        graphic: [
          {
            type: 'text',
            id: 'centralValue',
            left: 'center',
            top: '44%',
            style: {
              text: defaultPercentage,
              align: 'center',
              fill: '#212121',
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 37
            }
          },
          {
            type: 'text',
            id: 'centralLabel',
            left: 'center',
            top: '56%',
            style: {
              text: centerData.centerLabel,
              align: 'center',
              fill: '#212121',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 13
            }
          }
        ]
      }

      chartInstance.setOption(option)

      chartInstance.on('mouseover', 'series', (params: any) => {
        const percentage = ((params.data.value / totalValue) * 100).toFixed(0)
        chartInstance.setOption({
          graphic: [
            {
              id: 'centralValue',
              type: 'text', // Ensure type is set to 'text'
              style: {
                text: percentage,
                align: 'center',
                fill: '#212121',
                fontSize: 34,
                fontWeight: 400,
                lineHeight: 37
              }
            },
            {
              id: 'centralLabel',
              type: 'text', // Ensure type is set to 'text'
              style: {
                text: params.data.centerLabel,
                align: 'center',
                fill: '#212121',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 13
              }
            }
          ]
        })
      })

      chartInstance.on('mouseout', 'series', () => {
        chartInstance.setOption({
          graphic: [
            {
              id: 'centralValue',
              type: 'text', // Ensure type is set to 'text'
              style: {
                text: defaultPercentage,
                align: 'center',
                fill: '#212121',
                fontSize: 34,
                fontWeight: 400,
                lineHeight: 37
              }
            },
            {
              id: 'centralLabel',
              type: 'text', // Ensure type is set to 'text'
              style: {
                text: centerData.centerLabel,
                align: 'center',
                fill: '#212121',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 13
              }
            }
          ]
        })
      })

      // Resize chart on window resize
      const handleResize = () => {
        chartInstance.resize()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chartInstance.dispose()
      }
    }
  }, [])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

export default StudentPieChart
