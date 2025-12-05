// ** Type Import
import { OwnerStateThemeType } from './'

const typography = {
  MuiTypography: {
    styleOverrides: {
      gutterBottom: ({ theme }: OwnerStateThemeType) => ({
        marginBottom: theme.spacing(2)
      })
    },
    variants: [
      {
        props: { variant: 'h1' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 300,
          fontSize: '96px '
        })
      },
      {
        props: { variant: 'h2' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 300,
          fontSize: '60px '
        })
      },
      {
        props: { variant: 'h3' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '48px '
        })
      },
      {
        props: { variant: 'h4' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '34px '
        })
      },
      {
        props: { variant: 'h5' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '24px '
        })
      },
      {
        props: { variant: 'h6' },
        style: ({ theme }: OwnerStateThemeType) => ({
          fontWeight: 500,
          fontSize: '20px ',
          color: theme.palette.text.primary
        })
      },
      {
        props: { variant: 'subtitle1' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '16px '
        })
      },
      {
        props: { variant: 'subtitle2' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: '14px '
        })
      },
      {
        props: { variant: 'body1' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '16px '
        })
      },
      {
        props: { variant: 'body2' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          lineHeight: '20px ',
          fontWeight: 400,
          fontSize: '14px '
        })
      },
      {
        props: { variant: 'button' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: '14px '
        })
      },
      {
        props: { variant: 'caption' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '12px '
        })
      },
      {
        props: { variant: 'overline' },
        style: ({ theme }: OwnerStateThemeType) => ({
          color: theme.palette.text.primary,
          fontWeight: 400,
          fontSize: '10px '
        })
      }
    ]
  }
}

export default typography
