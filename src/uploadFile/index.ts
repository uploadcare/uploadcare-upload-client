import uploadBase from './uploadBase'
import uploadFromUrl from './uploadFromUrl'
import uploadFromUploaded from './uploadFromUploaded'
import CancelController from '../tools/CancelController'
import defaultSettings from '../defaultSettings'

/* Types */
import { Url, Uuid } from '../api/types'
import { NodeFile, BrowserFile } from '../request/types'
import { isFileData, isUrl, isUuid } from './types'
import { UploadcareFile } from '../tools/UploadcareFile'
import { isMultipart, getFileSize } from '../tools/isMultipart'
import uploadMultipart from './uploadMultipart'

export type FileFromOptions = {
  publicKey: string

  fileName?: string
  baseURL?: string
  secureSignature?: string
  secureExpire?: string
  store?: boolean

  cancel?: CancelController
  onProgress?: ({ value: number }) => void

  source?: string
  integration?: string

  retryThrottledRequestMaxTimes?: number

  contentType?: string
  multipartChunkSize?: number
  multipartMaxAttempts?: number
  maxConcurrentRequests?: number

  baseCDN?: string

  checkForUrlDuplicates?: boolean
  saveUrlForRecurrentUploads?: boolean
  pusherKey?: string
}

/**
 * Uploads file from provided data.
 * @param data
 * @param options
 * @param [options.publicKey]
 * @param [options.fileName]
 * @param [options.baseURL]
 * @param [options.secureSignature]
 * @param [options.secureExpire]
 * @param [options.store]
 * @param [options.cancel]
 * @param [options.onProgress]
 * @param [options.source]
 * @param [options.integration]
 * @param [options.retryThrottledRequestMaxTimes]
 * @param [options.contentType]
 * @param [options.multipartChunkSize]
 * @param [options.multipartMaxAttempts]
 * @param [options.maxConcurrentRequests]
 * @param [options.checkForUrlDuplicates]
 * @param [options.saveUrlForRecurrentUploads]
 * @param [options.pusherKey]
 */
export default function uploadFile(
  data: NodeFile | BrowserFile | Url | Uuid,
  {
    publicKey,

    fileName,
    baseURL = defaultSettings.baseURL,
    secureSignature,
    secureExpire,
    store,

    cancel,
    onProgress,

    source,
    integration,

    retryThrottledRequestMaxTimes,

    contentType,
    multipartChunkSize,
    multipartMaxAttempts,
    maxConcurrentRequests,

    baseCDN = defaultSettings.baseCDN,

    checkForUrlDuplicates,
    saveUrlForRecurrentUploads,
    pusherKey
  }: FileFromOptions
): Promise<UploadcareFile> {
  if (isFileData(data)) {
    const fileSize = getFileSize(data)

    if (isMultipart(fileSize)) {
      return uploadMultipart(data, {
        publicKey,
        contentType,
        multipartChunkSize,
        multipartMaxAttempts,

        fileName,
        baseURL,
        secureSignature,
        secureExpire,
        store,

        cancel,
        onProgress,

        source,
        integration,

        maxConcurrentRequests,
        retryThrottledRequestMaxTimes,

        baseCDN
      })
    }

    return uploadBase(data, {
      publicKey,

      fileName,
      baseURL,
      secureSignature,
      secureExpire,
      store,

      cancel,
      onProgress,

      source,
      integration,

      retryThrottledRequestMaxTimes,

      baseCDN
    })
  }

  if (isUrl(data)) {
    return uploadFromUrl(data, {
      publicKey,

      fileName,
      baseURL,
      baseCDN,
      checkForUrlDuplicates,
      saveUrlForRecurrentUploads,
      secureSignature,
      secureExpire,
      store,

      cancel,
      onProgress,

      source,
      integration,

      retryThrottledRequestMaxTimes,
      pusherKey
    })
  }

  if (isUuid(data)) {
    return uploadFromUploaded(data, {
      publicKey,

      fileName,
      baseURL,

      cancel,
      onProgress,

      source,
      integration,

      retryThrottledRequestMaxTimes,

      baseCDN
    })
  }

  throw new TypeError(`File uploading from "${data}" is not supported`)
}
