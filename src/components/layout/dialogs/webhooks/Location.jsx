import React, { useEffect, useCallback, memo } from 'react'
import LocationOn from '@mui/icons-material/LocationOn'
import MyLocation from '@mui/icons-material/MyLocation'
import {
  Grid,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
} from '@mui/material'

import { useLazyQuery } from '@apollo/client'
import { useMapEvents } from 'react-leaflet'

import Query from '@services/Query'
import Utility from '@services/Utility'
import useLocation from '@hooks/useLocation'

const Location = ({
  setWebhookMode,
  t,
  syncWebhook,
  addressFormat,
  currentHuman,
  webhookLocation,
  selectedWebhook,
  hasNominatim,
}) => {
  const map = useMapEvents({
    locationfound: (location) => {
      if (
        location.latitude !== webhookLocation[0] &&
        location.longitude !== webhookLocation[1]
      ) {
        handleLocationChange([location.latitude, location.longitude])
      }
    },
  })

  const { lc, color } = useLocation(map)
  const [setSearch, { data, previousData, loading }] = useLazyQuery(
    Query.geocoder(),
    {
      variables: { search: '', name: selectedWebhook },
    },
  )

  const handleLocationChange = useCallback((location) => {
    if (location.length) {
      syncWebhook({
        variables: {
          category: 'setLocation',
          data: location,
          name: selectedWebhook,
          status: 'POST',
        },
      })
    }
  }, [])

  useEffect(() => {
    if (
      webhookLocation[0] !== currentHuman.latitude &&
      webhookLocation[1] !== currentHuman.longitude
    ) {
      handleLocationChange(webhookLocation)
    }
  }, [webhookLocation])

  useEffect(() => () => lc.stop(), [])

  const fetchedData = data || previousData || { geocoder: [] }

  return (
    <Grid
      container
      item
      xs={12}
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs={6} sm={3}>
        <Typography variant="h6">{t('location')}</Typography>
      </Grid>
      <Grid item xs={6} sm={3} style={{ textAlign: 'center' }}>
        <Typography variant="body2">
          {webhookLocation.map((x) => x.toFixed(8)).join(', ')}
        </Typography>
      </Grid>
      <Grid item xs={6} sm={3} style={{ textAlign: 'center' }}>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => lc._onClick()}
          startIcon={<MyLocation color={color} />}
        >
          {t('my_location')}
        </Button>
      </Grid>
      <Grid item xs={6} sm={3} style={{ textAlign: 'center' }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => setWebhookMode('location')}
        >
          {t('choose_on_map')}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          style={{ width: '100%' }}
          getOptionLabel={(option) => Utility.formatter(addressFormat, option)}
          filterOptions={(x) => x}
          options={fetchedData.geocoder}
          autoComplete
          includeInputInList
          freeSolo
          disabled={!hasNominatim}
          onChange={(event, newValue) => {
            if (newValue) {
              const { latitude, longitude } = newValue
              map.panTo([latitude, longitude])
              handleLocationChange([latitude, longitude])
            }
          }}
          renderInput={(params) => (
            <TextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              label={t('search_location')}
              variant="outlined"
              onChange={(e) =>
                setSearch({ variables: { search: e.target.value } })
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Grid container alignItems="center" spacing={1} {...props}>
              <Grid item>
                <LocationOn />
              </Grid>
              <Grid item xs>
                <Typography variant="caption">
                  {Utility.formatter(addressFormat, option)}
                </Typography>
              </Grid>
            </Grid>
          )}
        />
      </Grid>
    </Grid>
  )
}

const getEqual = (prev, next) =>
  prev.webhookLocation.join('') === next.webhookLocation.join('')

export default memo(Location, getEqual)
