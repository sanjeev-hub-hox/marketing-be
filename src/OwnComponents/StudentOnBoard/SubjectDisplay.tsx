'use client'

import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import Image from 'next/image'
import { useTheme } from '@mui/system'
import SubjectBook from '../Enquiry-Listing/Image/subject.jpg'
import ShitBook from '../Enquiry-Listing/Image/shit.jpg'
import { getRequest, postRequest } from 'src/services/apiService'
import { useEffect, useState } from 'react'
import { getObjectByKeyVal } from 'src/utils/helper'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

export default function SubjectDisplay({ school, enquiryDetails, tab }: any) {
  const theme = useTheme()
  const [allSubjects, setAllSubjects] = useState<any>(null)
  const [optionalCompulsoryOptions, setOptionalCompulsoryOptions] = useState<any[]>([])
  const [compSubjects, setCompSubjects] = useState<any>(null)
  const [academicYear, setAcademicYears] = useState<any>([])
  const { setGlobalState } = useGlobalContext()
  const [subjectList, setSubjectList] = useState<any>(null)

  const bookArr = [
    { image: SubjectBook, title: 'Mathematics -4357' },
    { image: ShitBook, title: 'Mathematics -4357' }
  ]

  function groupSubjectsByGroupName(response: any) {
    const subjects = response.data.data

    // Group subjects based on group_name
    const groupedSubjects = subjects.reduce((groups: any, subject: any) => {
      const groupName = subject.group_name

      if (!groups[groupName]) {
        groups[groupName] = []
      }

      groups[groupName].push(subject)

      return groups
    }, {})

    return groupedSubjects
  }

  const getSubjectList = async () => {
    const params = {
      url: `/school-subject/fetch-school-subjects`,
      serviceURL: 'admin',
      data: {
        pageSize: 1000,
        schoolId: enquiryDetails?.school_location?.id,
        academicYearId: getObjectByKeyVal(academicYear, 'id', enquiryDetails?.academic_year?.id)?.attributes
          ?.short_name_two_digit,
        brandId: enquiryDetails?.brand?.id,
        boardId: enquiryDetails?.board?.id,
        streamId: enquiryDetails?.stream?.id,
        termId: 1,
        gradeId: enquiryDetails?.student_details?.grade?.id,
        ...(tab == 'SPA Offered' && { isSpa: 1 })
      }
    }
    const response = await postRequest(params)

    if (response?.data) {
      setAllSubjects(response?.data?.data)
      if (response?.data?.data.length > 0) {
        const data = groupSubjectsByGroupName(response)

        setSubjectList(data)

        // const allsubjects: any = response?.data?.data

        // const optionalCompulsorySubjects = allsubjects.filter((item: any) => item.is_compulsory === 0)

        // setOptionalCompulsoryOptions(optionalCompulsorySubjects)
        // const dd = allsubjects?.filter((item: any) => item.is_compulsory === 1)
        // setCompSubjects(dd)
      }
    } else {
      setOptionalCompulsoryOptions([])
      setCompSubjects([])
    }
  }

  useEffect(() => {
    if (academicYear.length == 0) {
      fetchAllAcademicYears()
    } else {
      getSubjectList()
    }
  }, [school])

  const fetchAllAcademicYears = async () => {
    setGlobalState({
      isLoading: true
    })
    try {
      const url = {
        url: `/api/ac-academic-years?sort=id`,
        serviceURL: 'mdm'
      }
      const response: any = await getRequest(url)
      setAcademicYears(response?.data)
      getSubjectList()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setGlobalState({ isLoading: false }) // Stop loading
    }
  }

  return (
    <>
      <Grid container xs={12} spacing={3}>
        {subjectList &&
          Object.keys(subjectList).map((groupName, index) => {
            return (
              <>
                <Grid item xs={12}>
                  <Typography
                    variant='h6'
                    color={'text.primary'}
                    sx={{ lineHeight: '22px', mt: 4, mb: 5, textTransform: 'capitalize' }}
                  >
                    {groupName}
                  </Typography>
                </Grid>
                {subjectList[groupName] && subjectList[groupName]?.length ? (
                  subjectList[groupName].map((curr: any, index: number) => (
                    <Grid item xs={6} md={3} key={index} sx={{ mb: 3 }}>
                      <Card
                        sx={{
                          maxWidth: 225,
                          backgroundColor: '#fff !important',
                          '&.MuiPaper-elevation': { boxShadow: 0 },
                          border: `1px solid ${theme.palette.customColors.text6} !important`
                        }}
                      >
                        <CardMedia sx={{ height: 150 }}>
                          <Image
                            src={SubjectBook}
                            alt='subject Image'
                            style={{ width: '100%', borderRadius: '0px', height: '150px' }}
                          />
                        </CardMedia>
                        <CardContent style={{ paddingBottom: '10px' }}>
                          <Typography gutterBottom variant='subtitle1' color={'customColors.title'}>
                            {curr.subject_name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography sx={{ mr: 2, fontWeight: 400, color: 'text.secondary' }} align='center'>
                    Data Not Found For Applied Filter
                  </Typography>
                )}
              </>
            )
          })}
      </Grid>
    </>
  )
}
