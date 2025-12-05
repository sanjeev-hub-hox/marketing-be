import { Box, Chip, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import CreateForm from 'src/components/FormBuilder/CreateForm'
import { getRequest } from 'src/services/apiService'
import { ENQUIRY_STAGES, ENQUIRY_STATUS, googlAlgo } from 'src/utils/constants'
import { getObjectByKeyVal, getObjectKeyValSlug } from 'src/utils/helper'

const StyledChipProps = styled(Chip)(({ theme }) => ({
  '&.MuiChip-colorPrimary': {
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: '#4849DA14 !important',
    color: '#4849DA !important'
  },
  '&.MuiChip-colorDefault': {
    border: `1px solid ${theme.palette.grey[300]} !important`,
    borderRadius: '8px',
    height: '36px',
    padding: '6px 4px',
    background: `${theme.palette.customColors.text6} !important`,
    color: `${theme.palette.customColors.mainText} `
  }
}))

interface EnquiryForm {
  _id: string
  slug: string
  name: string
}

interface RegistrationForm {
  _id: string
  slug: string
  name: string
}

interface SubStage {
  name: string
}

interface Stage {
  _id: string
  name: string
  sub_stages: SubStage[]
}

interface EnquiryTypeData {
  _id: string
  name: string
  slug: string
  enquiry_forms: EnquiryForm[]
  registration_forms: RegistrationForm[]
  admission_forms: any[] | null
  stages: Stage[]
}

interface ModalProps {
  enquiryTypeData?: EnquiryTypeData
  propsEnquiryId?: any
  handleTypeDropDown?: any
  activeStepProp?: number
  view?: boolean
  enquiryDetails?: any
  registration?: any
  openCompetencyTest?: any
  hideCTA?: boolean
  mobileView?: boolean
  authToken?: string
  setRefreshList?: any
  refreshList?: any
  setFormCompletion?: any
}

const EnquiryModal = ({
  enquiryTypeData,
  propsEnquiryId,
  view,
  authToken,
  enquiryDetails,

}: ModalProps) => {

  const [selectedOptions, setSelectedOptions] = useState<string>('')
  const [activeStageData, setActiveStageData] = useState<any>(null)
  const [dynamicFormData, setDynamicFormData] = useState<any>(null)

  const getFormData = async () => {
    const params = {
      url: `marketing/enquiry/${propsEnquiryId}`,
      authToken: authToken
    }

    const response = await getRequest(params)
    if (response.status) {
      setDynamicFormData(response.data)
    }
  }

  useEffect(() => {
    if (propsEnquiryId) {
      getFormData()
    }
  }, [propsEnquiryId])

  const getObjectKeyValSlug: any = (object: any, value: any) => {
    return object?.find((o: any) => o.stage_name === value)
  }

  useEffect(() => {
    const regStatus = getObjectKeyValSlug(enquiryDetails?.enquiry_stages, ENQUIRY_STAGES?.REGISTRATION)

    if (regStatus && regStatus?.status == 'Completed') {
      const stageDateNew = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.REGISTRATION)
      if (stageDateNew) {
        setActiveStageData(stageDateNew)
        setSelectedOptions(stageDateNew?.stage_forms[0]?.name)
      }
    } else {
      const enqStage = getObjectByKeyVal(enquiryTypeData?.stages, 'name', ENQUIRY_STAGES?.ENQUIRY)
      if (enqStage) {
        setActiveStageData(enqStage)
        setSelectedOptions(enqStage?.stage_forms[0]?.name)
      }
    }
  }, [])

  const handleToggle = (option: string) => {
    setSelectedOptions(option)
  }

  return (
    <>
      {activeStageData?.stage_forms && activeStageData?.stage_forms.length
        ? activeStageData.stage_forms.map((label: any, index: number) => (
          <Box key={index} sx={{ display: 'inline-block', pointerEvents: 'auto' }}>
            <StyledChipProps
              key={index}
              label={label.name}
              onClick={() => handleToggle(label.name)}
              //disabled={label?.name != selectedOptions}
              color={selectedOptions?.includes(label.name) ? 'primary' : 'default'}
              variant='filled'
              sx={{ mr: 4 }}
            />
          </Box>
        ))
        : null}
      {activeStageData?.stage_forms && activeStageData?.stage_forms.length
        ? activeStageData.stage_forms.map((val: any, index: number) => {
          return selectedOptions == val.name ? (
            <>
              {activeStageData?.name === "Enquiry" ?
                <CreateForm
                  activeStageName={activeStageData?.name}
                  auto={false}
                  setDynamicFormData={setDynamicFormData}
                  slug={val.slug}
                  dynamicFormData={dynamicFormData}
                  {...(index == 0 && { attachExternalFields: true })}
                  {...(index == 0 && enquiryTypeData?.name.includes('PSA') && { externalPSAFields: true })}
                  {...(index == 0 && enquiryTypeData?.name.includes('Kids club') && { externalKidsClubFields: true })}
                  enquiryTypeData={enquiryTypeData}
                  appendRequest={
                    {}
                  }
                  url=""
                /> : <CreateForm
                  activeStageName={activeStageData?.name}
                  auto={false}
                  appendRequest={
                    {}
                  }
                  url=""
                  slug={val.slug}
                  dynamicFormData={dynamicFormData}
                  enquiryTypeData={enquiryTypeData}
                  queryTesxtBox = "true"
                />}
            </>
          ) : null
        })
        : null}


    </>
  )
}

export default EnquiryModal