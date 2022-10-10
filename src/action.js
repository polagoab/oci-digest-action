/*
 * Copyright 2022 Polago AB.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const util = require('node:util');
const exec = util.promisify(require('child_process').exec);

async function digestForImage(image, os, arch, variant) {
    let cmd = 'skopeo'
    if (os) {
        cmd += ' --override-os=' + os;
    }
    if (arch) {
        cmd += ' --override-arch=' + arch;
    }

    if (variant) {
        cmd += ' --override-variant=' + variant;
    }

    // TODO add --no-tags when the option is available in the runner
    cmd += " inspect --format '{{.Digest}}' "
    cmd += 'docker://' + image

    core.debug('Using skopeo command: ' + cmd)

    try {
        const { stdout, stderr } = await exec(cmd)
        core.debug(`skopeo result: ${stdout}`)
        return stdout.trim()
    } catch (e) {
        core.debug(`stderr: ${e.message}`)
        return ''
    }
}

async function processSingleImage(image, os, arch, variant) {
    const digest = await digestForImage(image, os, arch, variant)
    if (digest) {
        core.info('Digest for ' + image + ' is: ' + digest)
    } else {
        core.info('No digest exists for image: ' + image)
    }
    core.setOutput('digest', digest)
    core.setOutput('image', image)
}

async function processMultipleImages(images, os, arch, variant) {
    await Promise.all(images.map(async image => {
        return digestForImage(image, os, arch, variant)
    })).then(result => {
        core.setOutput('digest', JSON.stringify(result))
        core.setOutput('image', JSON.stringify(images))
    })
}

async function action() {
    try {
        let image = core.getInput('image')
        const os = core.getInput('os');
        const arch = core.getInput('arch');
        const variant = core.getInput('variant');

        try {
            image = JSON.parse(image)
        } catch (error) {
            core.debug('Unable to parse image as JSON: ' + error.message)
        }

        if (Array.isArray(image)) {
            await processMultipleImages(image, os, arch, variant)
        } else {
            await processSingleImage(image, os, arch, variant)
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}
module.exports = action
