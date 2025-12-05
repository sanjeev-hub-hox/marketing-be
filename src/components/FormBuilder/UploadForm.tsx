import { Grid, IconButton, Tooltip, Switch, Box } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import DropZoneDialog from 'src/@core/CustomComponent/UploadDialogBox/DropZoneDialog'
import ViewDocumentDialog from './Dialog/ViewDocumentDialog'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useGlobalContext } from 'src/@core/global/GlobalContext'
import SuccessDialog from 'src/@core/CustomComponent/SuccessDialogBox/SuccessDialog'
import ErrorDialogBox from 'src/@core/CustomComponent/ErrorDialogBox/ErrorDialogBox'

import { Any } from '@react-spring/web'
import DeleteDialog from 'src/@core/CustomComponent/DeleteDialogBox/DeleteDialog'
import { ENQUIRY_STAGES } from 'src/utils/constants'
import FallbackSpinner from 'src/@core/components/backdrop-spinner'

interface UploadProps {
  enquiryId?: any
  stage?: any
  activeStageName?: any
  setRrefreshStatus?: any
}
export default function UploadForms({ enquiryId, stage, activeStageName, setRrefreshStatus }: UploadProps) {
  const [openDropzone, setOpenDropzone] = useState<boolean>(false)
  const [openDropzoneSuccess, setOpenDropzoneSuccess] = useState<boolean>(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [formfields, setFormfields] = useState<any>(null)
  const [rowInputs, setRowInputs] = useState<any>([])
  const [activeDocummentID, setActiveDocummentID] = useState(null)
  const { setGlobalState } = useGlobalContext()
  const [uploaded, setUploaded] = useState(false)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)
  const [activeDeleteId, setActiveDeleteId] = useState<any>(null)
  const [refresh, setRefresh] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleErrorClose = () => {
    setOpenErrorDialog(false)
  }
  const getFormData = async () => {
    setGlobalState({ isLoading: true })
    const params = {
      url: `marketing/enquiry/${enquiryId}`
    }

    const response = await getRequest(params)
    if (response.status) {
      if (!stage) {
        const dd = response.data.documents
          ?.filter((val: any) => val?.stage == 'Registration')
          .map((val: any, index: any) => {
            return {
              id: val.document_id,
              documents: val.document_name,
              ...val
            }
          })

        setRowInputs(dd)
      } else {
        const dd = response.data.documents?.map((val: any, index: any) => {
          return {
            id: val.document_id,
            documents: val.document_name,
            ...val
          }
        })

        setRowInputs(dd)
      }
    }
    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    if (enquiryId) {
      getFormData()
    }
  }, [enquiryId, uploaded, refresh])

  const handleFileUpload = (params: any) => {
    console.log('params.id', params.id)
    setActiveDocummentID(params.id)
    setOpenDropzone(true)
  }

  const handleViewDocument = async (data: any) => {
    const params = {
      url: `marketing/enquiry/${enquiryId}/document/${data.id}?download=false`
    }
    const response = await getRequest(params)
    if (response?.status) {
      window.open(response?.data?.url, '_blank')
    }
  }
  const handleCloseViewDocument = () => {
    setViewDialog(false)
  }

  const handleDownload = async (data: any) => {
    try {
      const params = {
        url: `marketing/enquiry/${enquiryId}/document/${data.id}?download=true`
      }
      const resp = await getRequest(params)
      if (resp?.status) {
        // const response = await fetch(resp?.data?.url)
        // if (!response.ok) {
        //   throw new Error('Network response was not ok')
        // }

        // const blob = await response.blob()
        // const url = window.URL.createObjectURL(blob)
        // const a = document.createElement('a')
        // a.href = resp?.data?.url
        // a.download = data.file
        // document.body.appendChild(a)
        // a.click()
        // console.log('Achor Tag>', a)
        // window.URL.revokeObjectURL(resp?.data?.url)
        // document.body.removeChild(a)

        const fileUrl = resp?.data?.url //resp?.data?.url // Replace with your file URL
        const fileName = data.file // Optional: Specify the file name for download

        // Create a temporary anchor element
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = fileName // This will suggest a file name during download

        // Append the link to the body (required for Firefox)
        document.body.appendChild(link)

        // Programmatically click the link to trigger download
        link.click()

        // Remove the link after download
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('There was an error downloading the file:', error)
    }
  }

  const handleDelete = async () => {
    const params = {
      url: `marketing/enquiry/${enquiryId}/document/${activeDeleteId}?delete=true`
    }

    const response = await patchRequest(params)
    if (response?.status) {
      setDeleteDialog(false)
      setActiveDeleteId(null)
      setRefresh(!refresh)
    }
  }

  const handleVerification = async (documentId: any, e: any) => {
    //setIsLoading(true)
    const params = {
      url: `marketing/enquiry/${enquiryId}/document/${documentId}?verify=${e.target.checked}`
    }
    const response = await patchRequest(params)
    if (response?.status) {
    }
    setRefresh(!refresh)
    // setIsLoading(false)
  }
  const columns: GridColDef[] = [
    {
      flex: 1,
      field: 'documents',
      headerName: 'Documents',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div className='MuiDataGrid-cellContent' title='0'>
            {params?.value}
            {params?.row?.is_mandatory == 1 ? <span style={{ color: 'red', fontSize: '18px' }}> *</span> : null}
          </div>
        )
      }
    },
    {
      flex: 0.275,
      minWidth: 90,
      field: 'verification',
      headerName: 'Verification',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            {params?.row?.file ? (
              <>
                <Switch
                  checked={params?.row?.is_verified}
                  onChange={e => {
                    handleVerification(params?.row?.id, e)
                  }}
                />
              </>
            ) : null}
          </>
        )
      }
    },
    {
      flex: 0.275,
      minWidth: 90,
      field: 'action',
      headerName: 'Action',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <>
            <Tooltip title='Upload'>
              <IconButton
                disableFocusRipple
                disableRipple
                onClick={() => {
                  handleFileUpload(params)
                }}
              >
                {/* <EditIcon /> */}
                <span className='icon-export-1'></span>
              </IconButton>
            </Tooltip>
            {params?.row?.file ? (
              <>
                <Tooltip title='Download'>
                  <IconButton
                    onClick={() => {
                      handleDownload(params?.row)
                    }}
                  >
                    {/* <EditIcon /> */}
                    {params?.row?.file ? <span className='icon-import-1'></span> : null}
                  </IconButton>
                </Tooltip>

                <Tooltip title='View'>
                  <IconButton
                    onClick={() => {
                      handleViewDocument(params?.row)
                    }}
                  >
                    {/* <EditIcon /> */}
                    <span className='icon-eye'></span>
                  </IconButton>
                </Tooltip>
                <Tooltip title='Delete'>
                  <IconButton
                    onClick={() => {
                      setDeleteDialog(true)
                      setActiveDeleteId(params?.row?.id)
                    }}
                  >
                    {/* <EditIcon /> */}
                    {params?.row?.file ? <span className='icon-trash'></span> : null}
                  </IconButton>
                </Tooltip>
              </>
            ) : null}
          </>
        )
      }
    }
  ]

  //Handler for dropxzone
  const handleCloseDropzone = () => {
    setOpenDropzone(false)
  }

  const uploadFile = async (file: any) => {
    setGlobalState({ isLoading: true })

    const params = {
      url: `marketing/enquiry/${enquiryId}/upload-document/${activeDocummentID}`,
      data: { file: file },
      headers: {
        'Content-Type': 'multipart/form-data;'
      }
    }
    const response = await postRequest(params)
    if (response.status) {
      setSuccessDialog(true)
      setOpenDropzoneSuccess(true)
      setUploaded(!uploaded)
      if (activeStageName == ENQUIRY_STAGES?.ADMITTED_PROVISIONAL) {
        setRrefreshStatus((prevState: any) => {
          return !prevState
        })
      }
    } else {
      setOpenErrorDialog(true)
    }
    setGlobalState({ isLoading: false })
  }

  const handleSuccessDialogClose = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1000)
    setSuccessDialog(false)
  }

  const handleSubmitDropzone = (file: any) => {
    console.log('fileeee<', file)
    uploadFile(file[0])
    setOpenDropzone(false)
  }

  const handleDeleteDialog = () => {
    setDeleteDialog(false)
  }

  if (isLoading) {
    return <FallbackSpinner />
  }

  return (
    <>
      <Grid item container spacing={7} style={{ marginTop: '5px' }} xs={12} md={12}>
        <Grid item xs={12} md={12}>
          <DataGrid
            autoHeight
            columns={columns}
            rows={rowInputs}
            className={screenWidth < 1520 ? 'datatabaleWShadow' : 'dataTable'}
            sx={{ boxShadow: 0 }}
            hideFooter
            getRowId={row => row.id}
          />
        </Grid>
      </Grid>
      {openDropzone && (
        <DropZoneDialog
          title='Upload Documents'
          subTitle='Upload your documents here'
          openModal={openDropzone}
          closeModal={handleCloseDropzone}
          handleSubmitClose={handleSubmitDropzone}
          // allowedTypes={}
        />
      )}

      {viewDialog && (
        <ViewDocumentDialog openModal={viewDialog} closeModal={handleCloseViewDocument} header='Document Name Here' />
      )}
      {successDialog && (
        <SuccessDialog
          openDialog={successDialog}
          title={'File Uploaded Successfully'}
          handleClose={handleSuccessDialogClose}
        />
      )}
      <ErrorDialogBox openDialog={openErrorDialog} handleClose={handleErrorClose} title={'Something Went Wrong !'} />
      {deleteDialog && (
        <DeleteDialog
          openModal={deleteDialog}
          handleSubmitClose={handleDelete}
          closeModal={handleDeleteDialog}
          title='Delete Document'
          content='Are You Sure You Want To Delete This Document?'
        />
      )}
    </>
  )
}
