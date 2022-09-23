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

    console.debug('Using skopeo command: ' + cmd)

    try {
        const {stdout, stderr} = await exec(cmd)
        console.debug(`skopeo result: ${stdout}`)
        return stdout.trim()
    } catch (e) {
        console.log(`stderr: ${e.message}`)
        return ''
    }
}

async function action(image, os, arch, variant) {
    const digest = await digestForImage(image, os, arch, variant)
    core.setOutput('digest', digest)
}

async function runAction() {
    try {
        const image = core.getInput('image');
        const os = core.getInput('os');
        const arch = core.getInput('arch');
        const variant = core.getInput('variant');
        await action(image, os, arch, variant)
    } catch (error) {
        core.setFailed(error.message);
    }
}
module.exports = runAction
