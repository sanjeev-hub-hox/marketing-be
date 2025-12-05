import { Breadcrumbs, Link, Typography } from '@mui/material'
import * as React from 'react'
import { useGlobalContext } from 'src/@core/global/GlobalContext'

type Bread = {
  currentPath?: string
}

function Breadcrumb({ currentPath }: Bread) {
  const { pagePaths } = useGlobalContext()

  let moduleName
  switch (currentPath) {
    case '/permanent-role/':
    case '/temporary-role-listing/':
    case '/additional-duty-role-listing/':
    case '/permanent-role/view-assign-user/':
    case '/permanent-role/create-role/':
    case '/additional-duty-role-listing/create-new-additional-duty-role/':
    case '/temporary-role-listing/create-new-temporary-role/':
      moduleName = 'RBAC'
      break
    case '/stage-listing/':
    case '/create-stage/':
    case '/enquiry-type-listing/':
    case '/enquiry-type-listing/create-enquiry-type/':
      moduleName = 'CRM'
      break
    case '/registered-student-listing/':
      moduleName = 'Admission Management'
      break
    case '/enquiries/':
      moduleName = 'Enquiry Management'
      break
    case '/corporate/list':
      moduleName = 'Tie-Up Management'
      break
    default:
      moduleName = 'Home'
  }

  // const moduleName = currentPath === '/permanent-role/' ? 'RBAC' : ''
  // const CurrentPaths = currentPath?.replaceAll('/', '').replaceAll('-', ' ')
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase())
  }
  const CurrentPath = currentPath?.split('/').filter(item => item !== '')
  const sample = currentPath
    ?.split('/')
    .filter(item => item !== '')
    .map(current => current.replaceAll('/', '').replaceAll('-', ' '))
    .map(curr => capitalizeWords(curr))

  //const title = sample && sample.length > 0 ? sample[sample.length - 1].toString() : ''

  const title = pagePaths && pagePaths.length > 0 ? pagePaths[pagePaths.length - 1] : ''

  // const title = capitalizeWords(CurrentPaths)
  // console.log(currentPath, 'current path')
  // console.log(CurrentPaths, 'Current paths')
  // console.log(title, 'title')
  console.log(sample, 'sample')
  console.log(CurrentPath, 'Current Path')
  console.log(title, 'title')
  console.log(currentPath, 'currentPath')

  return (
    <div role='presentation'>
      <Breadcrumbs maxItems={2} aria-label='breadcrumb' separator='>'>
        <Link underline='hover' color='inherit' href='#'>
          {moduleName}
        </Link>
        {pagePaths?.map((curr: any, index: any) => (
          <>
            <Link underline={'hover'} color='inherit' href={curr.path}>
              {/* {sample && sample.length > 0 && sample[index]} */}
              {curr.title}
            </Link>
          </>
        ))}
      </Breadcrumbs>
      <Typography
        variant='h6'
        sx={{
          flexGrow: 1,
          lineHeight: '30px'
        }}
      >
        {title.title ? title.title : 'Dashboard'}
      </Typography>
    </div>
  )
}

export default Breadcrumb
