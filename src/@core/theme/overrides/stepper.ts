// ** Type Import
import { OwnerStateThemeType } from './'

const stepper = () => {
  return {
    MuiStepper: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          padding: '16px 24px',
          '& .MuiStep-root': {
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-iconContainer.Mui-active .MuiSvgIcon-root': {
                color: `${theme.palette.primary.dark} !important`,
                '& .MuiStepIcon-text': {
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '18px',
                  color: theme.palette.common.white
                }
              },
              '& .MuiStepLabel-iconContainer.Mui-completed .MuiSvgIcon-root': {
                color: `${theme.palette.primary.dark} !important`,
                '& .MuiStepIcon-text': {
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '18px',
                  color: theme.palette.common.white
                }
              },
              '& .MuiStepLabel-iconContainer .MuiSvgIcon-root': {
                color: `${theme.palette.customColors.inactive} !important`,
                '& .MuiStepIcon-text': {
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '18px',
                  color: theme.palette.common.white
                }
              },
              '& .MuiStepLabel-labelContainer': {
                '& .MuiStepLabel-label.Mui-active': {
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '21px',
                  color: `${theme.palette.primary.dark} `
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '21px !important',
                  color: `${theme.palette.primary.dark} !important`
                },
                '& .MuiStepLabel-label': {
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '21px',
                  color: theme.palette.customColors.text3
                }
              }
            }
          }
        })
      }
    }
  }
}

export default stepper
