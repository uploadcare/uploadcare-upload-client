import * as factory from './_fixtureFactory'
import checkFileIsUploadedFromUrl from '../src/checkFileIsUploadedFromUrl'
import {StatusEnum} from '../src/api/fromUrlStatus'
import {Environment, getEnvironmentSettings} from './_helpers'

const environment = Environment.Staging

describe('checkFileIsUploadedFromUrl', () => {
  const settings = getEnvironmentSettings({
    publicKey: factory.publicKey('token'),
  }, environment)

  it('should be resolved if file is uploaded', async() => {
    checkFileIsUploadedFromUrl({
      token: factory.token('valid'),
      timeout: 50,
      settings,
    })
      .then(info => {
        expect(info.status).toBe(StatusEnum.Success)
      })
  })
  it('should be cancelable', (done) => {
    const polling = checkFileIsUploadedFromUrl({
      token: factory.token('valid'),
      timeout: 50,
      settings,
    })

    setTimeout(() => {
      polling.cancel()
    }, 5)

    polling
      .then(() => done.fail())
      .catch((error) => {
        if (error.name === 'CancelError') {
          done()
        } else {
          done.fail(error)
        }
      })
  })
})