import React from 'react'
import style from '../../styles/about/AboutView.module.scss'

import getConfig from 'next/config'
import { useFeatureFlags } from '../FeatureFlags'
import ContractsView from '../contracts/ContractsView'
import About from './About'
import Copyright from './Copyright'
import Disclaimer from './Disclaimer'
import Jurisdiction from './Jurisdiction'
import License from './License'
import LimitedResponsibility from './LimitedResponsibility'
import PriceSupply from './PriceSupply'
const { publicRuntimeConfig } = getConfig()

const containerDynamicStyle = {
  // backgroundImage: `url(${publicRuntimeConfig.baseUrl}/checkerboard.png)`,
  backgroundColor: '#eeeeee',
}

interface AboutViewProps {}

const AboutView: React.FC<AboutViewProps> = () => {
  const featureFlags = useFeatureFlags()
  return (
    <div className={style.container} style={containerDynamicStyle}>
      <div style={{ backgroundColor: '#eeeeee', display: 'flex', flexDirection: 'column' }}>
        <About featureFlags={featureFlags} />
        {!featureFlags.prelaunch && <PriceSupply />}
        {!featureFlags.prelaunch && (
          <ContractsView
            token={true}
            textRecords={true}
            rendererRegistry={true}
            profilePictureRenderer={true}
            renderer={true}
            assets={true}
          />
        )}
      </div>
      <div className={style.divider}>&nbsp;</div>
      <div className={style.divider}>&nbsp;</div>
      <div className={style.divider}>&nbsp;</div>
      <div style={{ backgroundColor: '#dddddd', display: 'flex', flexDirection: 'column' }}>
        <Disclaimer header={true} />
        {!featureFlags.prelaunch && (
          <>
            <Copyright />
            <License />
            <LimitedResponsibility />
            <Jurisdiction />
          </>
        )}
      </div>
    </div>
  )
}

export default AboutView
