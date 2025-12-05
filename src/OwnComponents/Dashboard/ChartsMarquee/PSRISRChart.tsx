// import React, { useEffect } from 'react'
// import * as echarts from 'echarts'
// import { bottom } from '@popperjs/core'

// interface TemperatureChartProps {
//   data: {
//     days: string[]
//     highest: number[]
//     lowest: number[]
//   }
// }

// const PSRISRChart: React.FC<TemperatureChartProps> = ({ data }) => {
//   useEffect(() => {
//     const chartDom = document.getElementById('psrChart') as HTMLElement
//     const myChart = echarts.init(chartDom)

//     const option = {
//       tooltip: {
//         trigger: 'axis'
//       },
//       color: ['#3F41D1', '#06C270'],
//       legend: {
//         show: true,
//         bottom: '0%',
//         align: 'auto',

//         data: [
//           {
//             name: 'Highest',
//             icon: 'rect'
//           },
//           {
//             name: 'Lowest',
//             icon: 'rect'
//           }
//         ]
//       },
//       toolbox: {
//         show: false,
//         feature: {
//           dataZoom: {
//             yAxisIndex: 'none'
//           },
//           dataView: { readOnly: false },
//           magicType: { type: ['line', 'bar'] },
//           restore: {},
//           saveAsImage: {}
//         }
//       },
//       xAxis: {
//         type: 'category',
//         boundaryGap: false,
//         data: data.days
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           formatter: '{value}'
//         }
//       },
//       series: [
//         {
//           name: 'Highest',
//           type: 'line',
//           data: data.highest,
//           markPoint: {
//             data: [
//               {
//                 type: 'max',
//                 name: 'Max',
//                 symbol: 'rect',
//                 symbolSize: 40,
//                 label: { show: true, position: 'inside', formatter: '{c}' }
//               },
//               {
//                 type: 'min',
//                 name: 'Min',
//                 symbol: 'rect',
//                 symbolSize: 40,
//                 label: { show: true, position: 'inside', formatter: '{c}' }
//               }
//             ]
//           },
//           markLine: {
//             data: [{ type: 'average', name: 'Avg' }]
//           }
//         },
//         {
//           name: 'Lowest',
//           type: 'line',
//           data: data.lowest,
//           markPoint: {
//             data: [
//               {
//                 value: -2,
//                 xAxis: 1,
//                 yAxis: -1.5,
//                 symbol: 'rect',
//                 symbolSize: 40,
//                 label: { show: true, position: 'inside', formatter: '{c}' }
//               }
//             ]
//           },
//           markLine: {
//             data: [
//               { type: 'average', name: 'Avg' },
//               [
//                 {
//                   symbol: 'none',
//                   x: '90%',
//                   yAxis: 'max'
//                 },
//                 {
//                   symbol: 'circle',
//                   label: {
//                     position: 'start',
//                     formatter: 'Max'
//                   },
//                   type: 'max'
//                 }
//               ]
//             ]
//           }
//         }
//       ]
//     }

//     myChart.setOption(option)

//     const handleResize = () => {
//       myChart.resize()
//     }

//     window.addEventListener('resize', handleResize)

//     return () => {
//       window.removeEventListener('resize', handleResize)
//       myChart.dispose()
//     }
//   }, [data])

//   return <div id='psrChart' style={{ width: '100%', height: '400px' }} />
// }

// export default PSRISRChart

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface TemperatureChartProps {
  data: {
    days: string[]
    series: {
      name: string
      data: number[]
    }[]
  }
}

const PSRISRChart: React.FC<TemperatureChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        color: ['#D6F06F', '#7B8AFF', '#76DDD7'],
        legend: {
          show: true,
          bottom: '0%',
          align: 'auto',
          data: data.series.map(s => ({ name: s.name, icon: 'rect' }))
        },
        toolbox: {
          show: false,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: false },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.days
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: data.series.map((s, index) => ({
          name: s.name,
          type: 'line',
          data: s.data,
          lineStyle: {
            width: 2
          },
          markPoint: {
            data: [
              {
                type: 'max',
                name: 'Max',
                symbol: 'rect',
                symbolSize: 25,
                label: { show: true, position: 'inside', formatter: '{c}' }
              },
              {
                type: 'min',
                name: 'Min',
                symbol: 'rect',
                symbolSize: 25,
                label: { show: true, position: 'inside', formatter: '{c}' }
              }
            ]
          },
          markLine: {
            data: [{ type: 'average', name: 'Avg' }]
          }
        }))
      }

      chartInstance.setOption(option)

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

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
}

export default PSRISRChart
