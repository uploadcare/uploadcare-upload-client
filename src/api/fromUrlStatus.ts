import request, {prepareOptions} from './request'
import {RequestOptions} from './request'
import {InfoResponse} from './info'
import {Settings} from '../types'

export type FromUrlStatusResponse = InfoResponse

/**
 * Checking upload status and working with file tokens.
 *
 * @param {string} token – Source file URL, which should be a public HTTP or HTTPS link.
 * @param {Settings} settings
 * @return {Promise<FromUrlStatusResponse>}
 */
export default function fromUrlStatus(token: string, settings: Settings = {}): Promise<FromUrlStatusResponse> {
  const options: RequestOptions = prepareOptions({
    path: '/from_url/status/',
    query: {token: token},
  }, settings)

  // TODO: Fix ts-ignore
  // @ts-ignore
  return request(options)
    .then(response => response.data)
}
