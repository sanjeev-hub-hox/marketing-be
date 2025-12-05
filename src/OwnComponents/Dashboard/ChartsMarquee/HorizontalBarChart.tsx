import React, { useEffect } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption, BarSeriesOption } from 'echarts'

interface BarData {
  value: number | null
  name: string
}

interface HorizontalBarChartProps {
  categories: string[]
  responseData: BarData[]
  resolvedData: BarData[]
  totalPSRData: BarData[]
  id: string
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  categories,
  responseData,
  resolvedData,
  totalPSRData,
  id
}) => {
  useEffect(() => {
    const chartDom = document.getElementById(id) as HTMLDivElement
    const myChart = echarts.init(chartDom)

    // Function to truncate long names
    const truncate = (name: string, length: number) => {
      return name.length > length ? name.slice(0, length) + '...' : name
    }

    const option: EChartsOption = {
      //   tooltip: {
      //     trigger: 'axis',
      //     axisPointer: {
      //       type: 'shadow'
      //     }
      //   },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          show: false
        }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: '#212121',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 13
        }
      },
      series: [
        {
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            formatter: (params: any) => `${params.value}\n\n${truncate(params.name, 10)}`,
            rich: {
              name: {
                color: '#212121',
                fontSize: 12,
                lineHeight: 14
              }
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: responseData.map(data => ({ ...data, itemStyle: { color: '#7B8AFF' } }))
        } as BarSeriesOption,
        {
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            formatter: (params: any) => `${params.value}\n\n${truncate(params.name, 10)}`,
            rich: {
              name: {
                color: '#212121',
                fontSize: 12,
                lineHeight: 14
              }
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: resolvedData.map(data => ({ ...data, itemStyle: { color: '#FA898B' } }))
        } as BarSeriesOption,
        {
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            formatter: (params: any) => `${params.value}\n\n${truncate(params.name, 3)}`,
            rich: {
              name: {
                color: '#212121',
                fontSize: 12,
                lineHeight: 14
              }
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: totalPSRData.map(data => ({ ...data, itemStyle: { color: '#9ECD65' } }))
        } as BarSeriesOption,
        {
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            formatter: (params: any) => `${params.value}\n\n${truncate(params.name, 3)}`,
            rich: {
              name: {
                color: '#212121',
                fontSize: 12,
                lineHeight: 14
              }
            }
          },
          emphasis: {
            focus: 'series'
          },
          data: totalPSRData.map(data => ({ ...data, itemStyle: { color: '#FFD333' } }))
        } as BarSeriesOption
      ]
    }

    myChart.setOption(option)

    // Resize chart when window size changes
    const resizeHandler = () => {
      myChart.resize()
    }

    window.addEventListener('resize', resizeHandler)

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeHandler)
      myChart.dispose()
    }
  }, [categories, responseData, resolvedData, totalPSRData, id])

  return <div id={id} style={{ width: '100%', height: '400px' }} />
}

export default HorizontalBarChart
