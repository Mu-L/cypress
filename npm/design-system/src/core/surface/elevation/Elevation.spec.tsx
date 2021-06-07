import * as React from 'react'
import { composeStories } from '@storybook/testing-react'

import { mountAndSnapshot } from 'util/testing'

import * as stories from './Elevation.stories'
const { Elevation } = composeStories(stories)

// TODO: Autogenerate from stories
describe('<Elevation />', () => {
  it('Elevation', () => {
    mountAndSnapshot(<Elevation />)
  })
})
