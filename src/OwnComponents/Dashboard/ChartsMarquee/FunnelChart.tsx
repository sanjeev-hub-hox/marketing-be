// import React, { useEffect, useRef } from 'react'
// import * as echarts from 'echarts'

// interface FunnelChartProps {
//   data: { value: number; name: string }[]
// }

// const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
//   const chartRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     if (chartRef.current) {
//       const chart = echarts.init(chartRef.current)

//       const option = {
//         color: ['#9EA9FF', '#f89395', '#9ecd65', '#ffd333', '#b1baff', '#f9a9aa', '#b1d784', '#ffdc5c'],
//         series: [
//           {
//             name: 'Achievement',
//             type: 'funnel',
//             left: '10%',
//             width: '80%',

//             label: {
//               show: false,
//               position: 'outside',
//               formatter: (params: { value: number; name: string }) => `${params.value / 100}\n\n${params.name}`,
//               textStyle: {
//                 color: '#212121',
//                 fontWeight: 400,
//                 fontSize: 12,
//                 lineHeight: 13
//               }
//             },
//             labelLine: {
//               show: false,
//               length: 10,
//               length2: 20,
//               lineStyle: {
//                 color: '#212121',
//                 fontWeight: 400,
//                 fontSize: 10,
//                 lineHeight: 11
//               }
//             },
//             itemStyle: {
//               opacity: 0.7
//             },
//             emphasis: {
//               label: {
//                 position: 'inside',
//                 formatter: (params: { value: number; name: string }) => `${params.value / 100}\n\n${params.name}`
//               }
//             },
//             data
//           },
//           {
//             name: 'Actual',
//             type: 'funnel',
//             left: '10%',
//             width: '80%',
//             maxSize: '80%',
//             label: {
//               position: 'inside',
//               formatter: (params: { value: number; name: string }) => `${params.value}/100\n${params.name}`,
//               color: '#212121',
//               fontSize: 12,
//               fontWeight: 400,
//               lineHeight: 13
//             },
//             labelLine: {
//               show: true,
//               length: 10,
//               length2: 20,
//               lineStyle: {
//                 color: '#212121',
//                 fontWeight: 400,
//                 fontSize: 10,
//                 lineHeight: 11
//               }
//             },
//             itemStyle: {
//               opacity: 0.5,
//               borderColor: '#fff',
//               borderWidth: 2
//             },

//             // emphasis: {

//             //   label: {
//             //     position: 'inside',
//             //     formatter: '{c}'
//             //   }
//             // },
//             data,
//             z: 100
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
//   }, [])

//   return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
// }

// export default FunnelChart

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { margin } from '@mui/system'

interface FunnelChartProps {
  data: { value: number; name: string }[]
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current)

      // Add hidden segment at the end with a very small value
      const hiddenSegment = { value: 1, name: '' }
      const extendedData = [...data, hiddenSegment]

      const option = {
        color: [
          '#9EA9FF',
          '#f89395',
          '#9ecd65',
          '#ffd333',
          '#b1baff',
          '#f9a9aa',
          '#b1d784',
          '#ffdc5c',
          'rgba(0,0,0,0)'
        ],
        series: [
          {
            name: 'Achievement',
            type: 'funnel',
            left: '10%',
            width: '80%',
            label: {
              show: false,
              position: 'outside',
              formatter: (params: { value: number; name: string }) => `${params.value / 100}\n\n${params.name}`,
              textStyle: {
                color: '#212121',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 13
              }
            },
            labelLine: {
              show: false,
              length: 10,
              length2: 20,
              lineStyle: {
                color: '#212121',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 11
              }
            },
            itemStyle: {
              opacity: 0.7
            },
            emphasis: {
              label: {
                show: false,
                position: 'inside',
                formatter: (params: { value: number; name: string }) => `${params.value / 100}\n\n${params.name}`
              }
            },
            data: extendedData.slice(0, -1) // Exclude the last hidden segment
          },
          {
            name: 'Actual',
            type: 'funnel',
            left: '10%',
            width: '80%',
            maxSize: '80%',

            label: {
              position: 'inside',
              formatter: (params: { value: number; name: string }) => `${params.value}/100\n${params.name}`,
              color: '#212121',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 13
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 20,
              lineStyle: {
                color: '#212121',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 11
              }
            },
            itemStyle: {
              opacity: 0.5,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: extendedData.slice(0, -1), // Exclude the last hidden segment
            z: 100
          }
        ]
      }

      chart.setOption(option)

      // Resize chart when window size changes
      const resizeHandler = () => {
        chart.resize()
      }

      window.addEventListener('resize', resizeHandler)

      // Clean up
      return () => {
        window.removeEventListener('resize', resizeHandler)
        chart.dispose()
      }
    }
  }, [data])

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
}

export default FunnelChart
