// ** MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'
import Loader from './image/loader.gif'
import Loader2 from './image/loader2.gif'
import Image from 'next/image'

const FallbackSpinner = () => {
  // ** Hook

  return (
    <div>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: '3456',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        open={true}
      >
        {/* <CircularProgress color="primary" /> */}
        <Image src={Loader} alt='Loader' width={70} height={70} />
      </Backdrop>
    </div>
  )
}

export default FallbackSpinner
