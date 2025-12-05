import {
  Modal,
  IconButton,
  Button,
  Tooltip,
  useTheme,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGlobalContext } from '../../../@core/global/GlobalContext'
import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { SelectChangeEvent } from '@mui/material/Select'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import DownArrow from '../../../@core/CustomComponent/DownArrow/DownArrow'
import { GoogleMap, LoadScript, Autocomplete, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { getRequest, patchRequest, postRequest } from 'src/services/apiService'
import { useForm, Controller } from 'react-hook-form'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { calculateDistance, getObjectByKeyVal } from 'src/utils/helper'

dayjs.extend(isSameOrAfter)

const containerStyle = {
  width: '100%',
  height: '740px'
}

const center = {
  lat: 19.076,
  lng: 72.8777
}

interface StopCreation {
  edit?: any
  view?: any
  stopId?: any
  school?: any
  handleClose?: any
  schoolLocation?: any
  activeStudent?: any
  academicYear?: any
  data?: any
  schoolParentId?: any
}

const CreateStopListing = ({
  edit,
  view,
  stopId,
  school,
  handleClose,
  schoolLocation,
  activeStudent,
  academicYear,
  data,
  schoolParentId
}: StopCreation) => {
  const CalendarIcon = () => <span className='icon-calendar-1'></span>
  const theme = useTheme()
  const router = useRouter()
  const [mapCenter, setMapCenter] = useState({ lat: 17.2777, lng: 74.1844 }) // Default center (India)
  const [mapType, setMapType] = useState('satellite') // Default map type to satellite
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<any>(null) // Reference to the map instance
  const markerRef = useRef<any>(null) // Reference to the marker instance
  const { setPagePaths, setGlobalState, setApiResponseType } = useGlobalContext()
  const [openDrawer, setOpenDrawer] = useState(false) // State to handle the modal
  const [selectedPlace, setSelectedPlace] = useState<any>(null) // State for selected place
  const [calenderDialog, setCalenderDialog] = useState<boolean>(false)
  const [taskDialog, setTaskDialog] = useState<boolean>(false)
  const [notificationDialog, setNotificationDialog] = useState<boolean>(false)
  const [radioValue, setRadioValue] = React.useState('pickup')
  const [year, setYear] = useState('AY 2024-2025')
  const [lob, setLOB] = useState('Lob Name')
  const [success, setSuccess] = useState(false)
  const [save, setSave] = useState(false)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [academicYears, setacademicYears] = useState<any>([])
  const [lobList, setLobList] = useState<any>([])
  const [zoneData, setZoneData] = useState<any>([])
  const [clickedLocation, setClickedLocation] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState<any>(center)
  const [zonesWithDistance, setZonesWithDistance] = useState<any>([])
  const [schoolStops, setSchoolStop] = useState<any>([])
  const [activeMarker, setActiveMarker] = useState(null)
  const [nearbyStops, setNearbyStops] = useState([])
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [calculatedZone, setCalculatedZone] = useState<any>(null)

  const handleMouseOver = (markerId: any) => {
    setActiveMarker(markerId)
  }

  const handleMouseOut = () => {
    setActiveMarker(null)
  }

  useEffect(() => {
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     position => {
    //       setCurrentLocation({
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude
    //       })
    //     },
    //     () => {
    //       console.warn('Geolocation access denied, using default location.')
    //     }
    //   )
    // }
    setCurrentLocation({
      lat: schoolLocation?.school_latitude,
      lng: schoolLocation?.school_longitude
    })
  }, [])
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          setValue('stopNameMap', results[0].formatted_address)
        } else {
          setValue('stopNameMap', 'Unknown Location')
        }
      })
      setClickedLocation({ lat, lng })
      setValue('radioValue', 2)
      setValue('latitude', lat)
      setValue('longitude', lng)
      setOpenDrawer(true)
    }
  }

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<any>()

  const formDataVal = watch()

  console.log('FORM>>', formDataVal, errors)

  const getUpdatedZones = async () => {
    const params = {
      url: `/api/tr-zone-mappings?populate[Zone][fields][0]=Zone&populate[School_Code][fields][0]=school_parent_id&filters[School_Code][school_parent_id]=${schoolParentId}`,
      serviceURL: 'mdm'
    }

    const response = await getRequest(params)
    if (response?.data) {
      setZonesWithDistance(response?.data)
    }
  }

  // Passing Breadcrumbs
  useEffect(() => {
    setPagePaths([
      {
        title: 'Stop Listing',
        path: '/stop-listing'
      },
      {
        title: 'Stop Creation',
        path: '/stop-listing/stop-creation'
      }
    ])
    getUpdatedZones()
  }, [])

  //Handler for screen width
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [])

  // Function to handle modal close

  const handleCloseDrawer = () => {
    setOpenDrawer(false)
    router.push('/stop-listing')
  }

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [place, setPlace] = useState<any>(null)
  const autocompleteRef = useRef<any>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null) // Marker state
  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }

  const onPlaceChanged = () => {
    const place: any = autocompleteRef.current?.getPlace()
    if (place) {
      //setOpenDrawer(true)

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setMarkerPosition({ lat, lng })
      map?.panTo({ lat, lng })
      map?.setZoom(15)
      // Get the zone (administrative area) from the address components
      const addressComponents = place.address_components
      if (addressComponents) {
        const zoneComponent = addressComponents.find(
          (component: any) =>
            component.types.includes('administrative_area_level_2') || // District/Zone level
            component.types.includes('locality') || // City/Town level
            component.types.includes('administrative_area_level_1') // State/Region level
        )

        // if (zoneComponent) {
        //   setValue('zone', zoneComponent.long_name)
        // }
      }
      setValue('radioValue', 2)
      setValue('stopNameMap', place?.name)
      setValue('latitude', place?.geometry?.location?.lat())
      setValue('longitude', place?.geometry?.location?.lng())
      setPlace(place)
      map?.panTo({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      })
    }
  }

  const getMetaData = async () => {
    setGlobalState({ isLoading: true })

    const apiRequest = {
      url: `/api/ac-academic-years?fields[1]=name&fields[2]=short_name&fields[3]=short_name_two_digit&fields[4]=is_visible&filters[is_visible][$eq]=1`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const responseNew: any = await getRequest(apiRequest)
    if (responseNew) {
      setacademicYears(responseNew.data)
      setValue('year', responseNew?.data[0]?.id)
      // setYear(responseNew?.data[1]?.attributes?.short_name_two_digit)
    }

    const params = {
      url: `/api/ac-schools?fields[1]=name&fields[2]=short_name`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }
    const response: any = await getRequest(params)
    if (response?.data) {
      setLobList(response?.data)
    }

    const paramsZone = {
      url: `/api/fc-fees-sub-categories?filters[fees_type_id]=15`,
      serviceURL: 'mdm',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MDM_TOKEN}`
      }
    }

    const responseZone = await getRequest(paramsZone)
    if (responseZone?.data) {
      setZoneData(responseZone?.data)
    }

    setGlobalState({ isLoading: false })
  }

  useEffect(() => {
    getMetaData()
  }, [])

  const handleCloseFunction = () => {
    setApiResponseType({ status: false })
    handleClose()
  }

  function findZoneByDistance(data: any, distance: any) {
    // Ensure distance is a float with three decimal places
    const distanceNumber = parseFloat(distance.replace(' km', ''))
    const roundedDistance = +distanceNumber.toFixed(3)

    const res = data.filter((item: any, index: any) => {
      const startKM = item.attributes.Start_KM ? parseFloat(item.attributes.Start_KM.toFixed(3)) : 0
      const endKM = item.attributes.End_KM ? parseFloat(item.attributes.End_KM.toFixed(3)) : 0
      console.log(startKM, endKM, index, '>>>', distance >= startKM && distance <= endKM)
      if (roundedDistance >= startKM && roundedDistance <= endKM) {
        return item
      }
      // return (

      //     // &&
      //     // school === item?.attributes?.School_Code?.data?.attributes?.school_parent_id
      // );
    })
    console.log('RESPON', res?.length ? res[0] : null)

    return res?.length ? res[0] : null
  }

  const onSubmit = async () => {
    setGlobalState({ isLoading: true })

    if (calculatedZone) {
      const payload = {
        stop_name: formDataVal?.stopName,
        stop_map_name: formDataVal?.stopNameMap,
        lat: formDataVal?.latitude ? parseFloat(formDataVal?.latitude) : 20.0,
        long: formDataVal?.longitude ? parseFloat(formDataVal?.longitude) : 19.0,
        related_stop_id: 0,
        start_date: formDataVal?.startDate ? dayjs(formDataVal?.startDate) : undefined,
        end_date: formDataVal?.endDate ? dayjs(formDataVal?.endDate) : undefined,
        order_by: 0,
        distance_km: 0,
        zone_name: calculatedZone,
        school_id: school,
        school_parent_id: schoolParentId,
        academic_yrs_id: academicYear || 26,
        // zone_id: 0,
        stop_type: formDataVal?.radioValue ? parseInt(formDataVal?.radioValue) : 1,
        user_id: activeStudent
      }

      const params = {
        url: `transport-service/stop-management/create`,
        serviceURL: 'transport',
        data: payload
      }

      const response = await postRequest(params)
      if (response?.status) {
        setOpenDrawer(false)
        setApiResponseType({
          status: true,
          message: `Your Stop Addition Request is Under Review. You'll Be Notified Once It's Approved Or Rejected`,
          handleClose: handleCloseFunction
        })
      } else {
        setApiResponseType({ status: true, message: 'Something went wrong!' })
      }
    } else {
      setOpenDrawer(false)
      setApiResponseType({
        status: true,
        message: `Zone Not Found`
      })
    }

    setGlobalState({ isLoading: false })
  }

  // const mapOptions = {
  //   mapTypeControl: true,
  //   mapTypeControlOptions: {
  //     position: google.maps.ControlPosition.BOTTOM_LEFT // Move the map type control to the bottom-left corner
  //   }
  // }

  const getStopDetails = async () => {
    const params = {
      url: `stop-management/${stopId}`
    }
    const response = await getRequest(params)
    if (response?.status) {
      reset({
        radioValue: response?.data?.stop_type,
        stopName: response?.data?.stop_name,
        stopNameMap: response?.data?.stop_map_name,
        latitude: response?.data?.lat ? parseFloat(response?.data?.lat) : response?.data?.lat,
        longitude: response?.data?.long ? parseFloat(response?.data?.long) : response?.data?.long,
        ...(response?.data?.start_date && { startDate: dayjs(response?.data?.start_date) }),
        ...(response?.data?.end_date && { endDate: dayjs(response?.data?.end_date) }),
        zone: response?.data?.zone_name,
        year: response?.data?.academic_yrs_id,
        school_id: response?.data?.school_id
      })
      const lat = response?.data?.lat ? parseFloat(response?.data?.lat) : response?.data?.lat
      const lng = response?.data?.long ? parseFloat(response?.data?.long) : response?.data?.long

      setMarkerPosition({ lat, lng })
      map?.panTo({ lat, lng })
      map?.setZoom(15)
    }
  }

  useEffect(() => {
    if (edit || view) {
      getStopDetails()
      setOpenDrawer(true)
    }
  }, [edit, view, stopId])

  const getSchoolStops = async () => {
    const params = {
      url: `transport-service/stop-management/list/${school}/${data?.routeType}`,
      serviceURL: 'transport'
    }
    const response = await getRequest(params)
    if (response?.status) {
      const newObj = response?.data?.map((val: any) => {
        return {
          ...val,
          lat: parseFloat(val?.lat),
          lng: parseFloat(val?.long)
        }
      })
      setSchoolStop(newObj)
    }
  }

  useEffect(() => {
    getSchoolStops()
  }, [school])

  const getMarkerIcon = () => {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.SymbolPath) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'blue',
        fillOpacity: 1,
        strokeWeight: 1,
        scale: 10
      }
    } else {
      return undefined
    }
  }

  const radius: any = 350
  const findNearbyStops = () => {
    if (!clickedLocation || !schoolStops) return

    const selectedLat = parseFloat(clickedLocation?.lat)
    const selectedLon = parseFloat(clickedLocation?.lng)

    const nearby: any = findStopsWithinRadius(selectedLat, selectedLon, schoolStops, radius)
    setNearbyStops(nearby)
  }

  const findStopsWithinRadius = (selectedLat: any, selectedLon: any, stops: any, radius: any) => {
    const nearbyStops = []
    const R = 6371

    const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c * 1000 // Distance in meters
    }

    for (const stop of stops) {
      const stopLat = parseFloat(stop.lat)
      const stopLon = parseFloat(stop.long)
      const distance = calculateDistance(selectedLat, selectedLon, stopLat, stopLon)
      if (distance <= radius) {
        nearbyStops.push(stop)
      }
    }

    return nearbyStops
  }

  const fetchZoneData = () => {
    // const distance = calculateDistance(
    //   schoolLocation?.school_latitude,
    //   schoolLocation?.school_longitude,
    //   clickedLocation?.lat,
    //   clickedLocation?.lng
    // )
    const zone = findZoneByDistance(zonesWithDistance, distance)
    if (zone) {
      setCalculatedZone(zone?.attributes?.Zone?.data?.attributes?.Zone)
    }
  }

  useEffect(() => {
    findNearbyStops()
    fetchDirections()
    if (distance) {
      fetchZoneData()
    }
  }, [formDataVal?.routeType, clickedLocation, distance])

  const fetchDirections = () => {
    if (window.google && google.maps && google.maps.DirectionsService) {
      // const schoolData = getObjectByKeyVal(lobList, 'id', school)

      const directionsService = new google.maps.DirectionsService() //

      directionsService.route(
        {
          origin: {
            lat: schoolLocation?.school_latitude,
            lng: schoolLocation?.school_longitude
          },
          destination: clickedLocation,
          travelMode: google.maps.TravelMode.DRIVING // Other options: WALKING, BICYCLING, TRANSIT
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result)
            const route = result.routes[0]
            if (route && route.legs[0]) {
              const dist = route.legs[0].distance?.text // e.g., "150 km"
              setDistance(dist || null)
            }
          } else {
            console.error(`Error fetching directions ${status}`)
          }
        }
      )
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <div style={{ height: 'calc(100vh - 170px)', width: '100%', position: 'relative' }}>
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCDCZ7Mx1QHCL92fYT525bgMnK8qtBc3es'}
            libraries={['places']}
          >
            <div style={{ height: 'calc(100vh - 220px)', width: '100%', position: 'relative' }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={markerPosition || currentLocation}
                zoom={12}
                onLoad={onLoad}
                onClick={handleMapClick}
              >
                {/* You can add markers or other components here */}
                {/* Render the marker if markerPosition is set */}
                {schoolLocation ? (
                  <Marker
                    position={{
                      lat: schoolLocation?.school_latitude,
                      lng: schoolLocation?.school_longitude
                    }}
                    icon={{
                      url: '/images/logo_new.png' // Path to your custom marker image
                    }}
                  />
                ) : null}
                {markerPosition && !clickedLocation && <Marker position={markerPosition} />}
                {clickedLocation && <Marker position={clickedLocation} icon={getMarkerIcon()} />}
                {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                {nearbyStops.map((position: any, index: any) => {
                  // <Marker key={position?.lat} position={position} icon={index === 0 ? busIcon : undefined} /> ..
                  return position?.stop_type != '3' ? (
                    <Marker
                      key={position?.lat}
                      position={position}
                      //onClick={() => handleMarkerClick(position)}
                      onMouseOver={() => handleMouseOver(position?.id)}
                      onMouseOut={handleMouseOut}
                      //icon={getMarkerIcon(position.id)} // Get icon based on id presence
                    >
                      {activeMarker === position?.id && (
                        <InfoWindow position={position}>
                          <Typography variant='h6' sx={{ mb: 1 }}>
                            {position?.stop_name}
                          </Typography>
                        </InfoWindow>
                      )}
                    </Marker>
                  ) : null
                })}
              </GoogleMap>

              <Autocomplete
                onLoad={(autocomplete: any) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type='text'
                  placeholder='Search for a place'
                  style={{
                    boxSizing: `border-box`,
                    border: `1px solid #ccc`,
                    width: `340px`,
                    height: `40px`,
                    padding: `0 12px`,
                    borderRadius: `20px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `16px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                    position: 'absolute',
                    top: '10px',
                    left: '10px', // Position it on the left side
                    zIndex: 9999, // Ensure it stays above the map
                    backgroundColor: 'white'
                  }}
                />
              </Autocomplete>

              {/* Add additional UI to display place details */}
              {/* {place && (
                <div style={{ marginTop: '10px', position: 'absolute', top: '50px', left: '10px', zIndex: 1 }}>
                  <h3>Place Details:</h3>
                  <p>Name: {place.name}</p>
                  <p>Address: {place.formatted_address}</p>
                  <p>
                    Coordinates: {place.geometry.location.lat()}, {place.geometry.location.lng()}
                  </p>
                </div>
              )} */}
            </div>
          </LoadScript>

          {/* Modal for Selected Place */}
          <Modal
            open={openDrawer}
            BackdropProps={{ invisible: true }} // Remove backdrop
            sx={{
              position: 'absolute',
              top: '4%',
              // top: screenWidth > 1200 ? '40px' : '100px', // Align to top-left corner of the map container
              // left: screenWidth > 1200 ? '60px' : '23px',
              zIndex: 1500,
              display: 'flex',
              alignItems: 'flex-start', // Aligns modal content to the top
              justifyContent: 'flex-start',
              border: '0px',
              overflow: 'scroll',
              pointerEvents: 'none'
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box
                className='fixedModal'
                sx={{
                  bgcolor: theme.palette.common.white,
                  borderRadius: '0px 10px 10px 0', // Set border radius
                  boxShadow: '4px -4px 20px 0px #12121266', // Set box shadow
                  padding: '16px',
                  width: '380px',
                  height: 'calc(100% - 150px)',
                  overflowY: 'auto',
                  position: 'relative', // Set position relative to the modal,
                  border: '0px',
                  overflow: 'scroll',
                  pointerEvents: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography
                      variant='body1'
                      color={'text.primary'}
                      sx={{ textTransform: 'capitalize', lineHeight: '17.6px' }}
                    >
                      Select Creation for
                    </Typography>

                    <FormControl component='fieldset'>
                      <Controller
                        name='radioValue'
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel
                              sx={{
                                '&.MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root':
                                  {
                                    color:
                                      field.value === 1 ? theme.palette.text.primary : theme.palette.customColors.text3
                                  }
                              }}
                              value={2}
                              control={
                                <Radio
                                  checked={formDataVal?.radioValue == 2 ? true : false}
                                  sx={{
                                    '&:not(.Mui-checked)': {
                                      color: theme.palette.customColors.text3
                                    }
                                  }}
                                />
                              }
                              label='For Pickup'
                            />
                            <FormControlLabel
                              sx={{
                                '&.MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root':
                                  {
                                    color:
                                      field.value === 2 ? theme.palette.text.primary : theme.palette.customColors.text3
                                  }
                              }}
                              value={1}
                              control={
                                <Radio
                                  checked={formDataVal?.radioValue == 1 ? true : false}
                                  sx={{
                                    '&:not(.Mui-checked)': {
                                      color: theme.palette.customColors.text3
                                    }
                                  }}
                                />
                              }
                              label='For Drop'
                            />
                            <FormControlLabel
                              sx={{
                                '&.MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd .MuiTypography-root':
                                  {
                                    color:
                                      field.value === 2 ? theme.palette.text.primary : theme.palette.customColors.text3
                                  }
                              }}
                              value={3}
                              control={
                                <Radio
                                  checked={formDataVal?.radioValue == 3 ? true : false}
                                  sx={{
                                    '&:not(.Mui-checked)': {
                                      color: theme.palette.customColors.text3
                                    }
                                  }}
                                />
                              }
                              label='Both'
                            />
                          </RadioGroup>
                        )}
                      />
                    </FormControl>
                  </Box>
                  <IconButton
                    disableRipple
                    disableFocusRipple
                    sx={{ background: theme.palette.customColors.primaryLightest }}
                    onClick={() => setOpenDrawer(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>

                {/* {selectedPlace && (
                <div>
                  <p>
                    <strong>Name:</strong> {selectedPlace.name}
                  </p>
                  {selectedPlace.formatted_address && (
                    <p>
                      <strong>Address:</strong> {selectedPlace.formatted_address}
                    </p>
                  )}
                  {selectedPlace.geometry && (
                    <p>
                      <strong>Coordinates:</strong> {selectedPlace.geometry.location.lat()},{' '}
                      {selectedPlace.geometry.location.lng()}
                    </p>
                  )}
                </div>
              )} */}
                <Grid sx={{ mt: 1 }} container xs={12} spacing={4}>
                  <Grid item xs={12}>
                    <Controller
                      name='stopNameMap'
                      control={control}
                      defaultValue={''}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Stop Name ( As Per The Map )'
                          placeholder='Stop Name ( As Per The Map ) Here'
                          disabled
                        />
                      )}
                    />
                  </Grid>

                  {/* Stop Name ( Editable) */}
                  <Grid item xs={12}>
                    <Controller
                      name='stopName'
                      control={control}
                      defaultValue={''}
                      rules={{ required: 'Stop Name is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Stop Name'
                          placeholder='Stop Name Here'
                          error={!!error}
                          helperText={error ? error.message : null}
                          required
                          disabled={view}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {calculatedZone ? (
                      <TextField fullWidth label={'Zone'} value={calculatedZone} disabled={true} />
                    ) : null}
                  </Grid>

                  <Grid item xs={12}>
                    {distance ? <TextField fullWidth label={'Distance'} value={distance} disabled={true} /> : null}
                  </Grid>

                  {/* Longitude */}
                  <Grid item xs={12}>
                    <Controller
                      name='longitude'
                      control={control}
                      defaultValue={''}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label='Longitude' placeholder='Longitude Here' disabled />
                      )}
                    />
                  </Grid>

                  {/* Latitude */}
                  <Grid item xs={12}>
                    <Controller
                      name='latitude'
                      defaultValue={''}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label='Latitude' placeholder='Latitude Here' disabled />
                      )}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 6 }}>
                  <Button
                    sx={{ mr: 2 }}
                    variant={view ? 'contained' : 'outlined'}
                    onClick={() => {
                      setOpenDrawer(false)
                    }}
                    color={view ? 'secondary' : 'inherit'}
                    disableFocusRipple
                    disableRipple
                  >
                    Cancel
                  </Button>
                  {/* <Button
                    variant='contained'
                    onClick={handleSaveDrawer}
                    color='inherit'
                    disableFocusRipple
                    disableRipple
                    sx={{ mr: 2 }}
                  >
                    Save
                  </Button> */}
                  {!view ? (
                    <Button type='submit' variant='contained' color='secondary' disableFocusRipple disableRipple>
                      {edit ? 'Update' : 'Submit'}
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </form>
          </Modal>
        </div>
      </Box>
    </>
  )
}

export default CreateStopListing
