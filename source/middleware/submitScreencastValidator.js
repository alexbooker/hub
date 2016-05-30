// @flow

import config from 'config'
import youtubeUrl from 'youtube-url'
import db from 'sequelize-connect'
import * as youtubeClient from '../../source/util/youtubeClient'

/**
 * validateUrl
 * Determines whether or not the given url value is valid.
 *
 * @name validateUrl
 * @function
 * @param {String} url The url value to validate.
 * @returns {String} An error message if the urlv value is invalid; otherwise, undefined.
 */
async function validateUrl (url: string) {
  if (!url) {
    return 'url cannot be undefined'
  }

  if (!youtubeUrl.valid(url)) {
    return 'url must be a valid YouTube URL'
  }

  const client = youtubeClient.create(config.youtubeApiKey)
  if (!await client.videoExists(url)) {
    return 'url must link to an existent, public YouTube video'
  }
  const screencast = await db.models.screencast.findOne({
    where: {
      url: url
    }
  })
  if (screencast !== null) {
    return 'url has already been submitted'
  }

  return undefined
}

/**
 * validateTags
 * Determines whether or not the given tags value is valid.
 *
 * @name validateTags
 * @function
 * @param {String} tags The tags value to validate.
 * @returns {String} An error message if the tags value is invalid; otherwise, undefined.
 */
function validateTags (tags) {
  if (!tags) {
    return 'tags cannot be undefined'
  }
  if (typeof tags !== 'string') {
    return 'tags must be a string'
  }
}

/**
 * validateSubmitScreencastReq
 * Determines whether or not the given request is valid.
 *
 * @name validateSubmitScreencastReq
 * @function
 */
export async function validateSubmitScreencastReq (req: any, res:any, next:any): any {
  try {
    const urlError = await validateUrl(req.body.url)
    const tagError = validateTags(req.body.tags)

    const errors = []
    if (urlError) {
      errors.push({
        field: 'url',
        message: urlError
      })
    }
    if (tagError) {
      errors.push({
        field: 'tags',
        message: tagError
      })
    }

    if (errors.length !== 0) {
      res.status(400).json({errors})
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}
