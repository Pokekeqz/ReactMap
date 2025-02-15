import { useState } from 'react'
import Locate from 'leaflet.locatecontrol'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'

export default function useLocation(map) {
  const [color, setColor] = useState('inherit')
  const { t } = useTranslation()

  const [lc] = useState(() => {
    const LocateFab = Locate.extend({
      _setClasses(state) {
        if (state === 'requesting') setColor('secondary')
        else if (state === 'active') setColor('success')
        else if (state === 'following') setColor('primary')
      },
      _cleanClasses() {
        setColor('inherit')
      },
      onAdd() {
        const container = L.DomUtil.create(
          'div',
          'react-locate-control leaflet-bar leaflet-control',
        )
        this._container = container
        this._map = map
        this._layer = this.options.layer || new L.LayerGroup()
        this._layer.addTo(map)
        this._event = undefined
        this._compassHeading = null
        this._prevBounds = null

        const linkAndIcon = this.options.createButtonCallback(
          container,
          this.options,
        )
        this._link = linkAndIcon.link
        this._icon = linkAndIcon.icon

        L.DomEvent.on(
          this._link,
          'click',
          function stuff(ev) {
            L.DomEvent.stopPropagation(ev)
            L.DomEvent.preventDefault(ev)
            this._onClick()
          },
          this,
        ).on(this._link, 'dblclick', L.DomEvent.stopPropagation)

        this._resetVariables()

        this._map.on('unload', this._unload, this)

        return container
      },
    })
    const result = new LocateFab({
      keepCurrentZoomLevel: true,
      setView: 'untilPan',
      options: {
        title: t('lc_title'),
        metersUnit: t('lc_metersUnit'),
        feetUnit: t('lc_feetUnit'),
        popup: t('lc_popup'),
        outsideMapBoundsMsg: t('lc_outsideMapBoundsMsg'),
        locateOptions: {
          maximumAge: 5000,
        },
      },
    })
    result.addTo(map)
    return result
  })
  return { lc, color }
}
