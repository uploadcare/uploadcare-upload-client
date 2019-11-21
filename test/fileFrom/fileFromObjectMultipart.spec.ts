import * as factory from '../_fixtureFactory'
import fileFrom from '../../src/fileFrom/fileFrom'
import {getSettingsForTesting} from '../_helpers'
import CancelError from '../../src/errors/CancelError'

describe('fileFrom Object (multipart)', () => {
  const fileToUpload = factory.file(12).data
  const settings = getSettingsForTesting({
    publicKey: factory.publicKey('multipart'),
  })

  it('should resolves when file is ready on CDN', async () => {
    const file = await fileFrom(fileToUpload, settings)

    expect(file.cdnUrl).toBeTruthy()
  }, 100000)

  it('should accept doNotStore setting', async () => {
    const settings = getSettingsForTesting({
      publicKey: factory.publicKey('image'),
      doNotStore: true,
    })
    const file = await fileFrom(fileToUpload, settings)

    expect(file.isStored).toBeFalsy()
  }, 100000)

  it('should be able to cancel uploading', async () => {
    const upload = fileFrom(fileToUpload, settings)

    upload.cancel()

    await (expectAsync(upload) as any).toBeRejectedWithError(CancelError)
  })

  it('should accept new file name setting', async () => {
    const settings = getSettingsForTesting({
      publicKey: factory.publicKey('image'),
      doNotStore: true,
      fileName: 'newFileName.jpg',
    })
    const file = await fileFrom(fileToUpload, settings)

    expect(file.name).toEqual('newFileName.jpg')
  }, 100000)

  describe('should be able to handle', () => {
    it('cancel uploading', async () => {
      const upload = fileFrom(fileToUpload, settings)

      const onCancel = jasmine.createSpy('onCancel')

      upload.onCancel = onCancel
      upload.cancel()

      await (expectAsync(upload) as any).toBeRejectedWithError(CancelError)

      expect(onCancel).toHaveBeenCalled()
    })

    it('progress', async () => {
      let progressValue = 0
      const upload = fileFrom(fileToUpload, settings)

      upload.onProgress = (progress) => {
        const {value} = progress

        progressValue = value
      }

      await upload

      expect(progressValue).toBe(1)
    }, 100000)

    it('uploaded', async () => {
      const upload = fileFrom(fileToUpload, settings)
      const onUploaded = jasmine.createSpy('onUploaded')

      upload.onUploaded = onUploaded

      await (expectAsync(upload) as any).toBeResolved()

      expect(onUploaded).toHaveBeenCalled()
    }, 100000)

    it('ready', async () => {
      const upload = fileFrom(fileToUpload, settings)
      const onReady = jasmine.createSpy('onReady')

      upload.onReady = onReady

      await (expectAsync(upload) as any).toBeResolved()

      expect(onReady).toHaveBeenCalled()
    }, 100000)
  })
})
