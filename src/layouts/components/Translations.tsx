import { Typography } from '@mui/material'

interface Props {
  text: string
}

const Translations = ({ text }: Props) => {
  return (
    <>
      <Typography variant='body1'>{text}</Typography>
    </>
  )
}

export default Translations
