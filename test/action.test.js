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

const { RunOptions, RunTarget } = require('github-action-ts-run-api');

const child_process = require('child_process')
jest.mock("child_process")

const runAction = require('../src/action');

describe(`Single image tests`, () => {
    const digest = 'sha256:42'
    const image = 'unknown-image:1.0.0'

    test("Single image", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: image })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo inspect --format '{{.Digest}}' docker://" + image)
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        expect(result.commands.outputs.digest).toBe(digest)
        expect(result.commands.outputs.image).toBe(image)
    })

    test("Single non-existing image", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: image })

        child_process.exec.mockImplementation((command, callback) => {
            const e = new Error()
            e.code = 1
            e.message = 'Image not found'
            callback(e, { stdout: '' });
        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        expect(result.commands.outputs.digest).toBeUndefined()
        expect(result.commands.outputs.image).toBe(image)
    })

    test("Single image with os input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: image, os: 'linux' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-os=linux inspect --format '{{.Digest}}' docker://" + image)
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        expect(result.commands.outputs.digest).toBe(digest)
        expect(result.commands.outputs.image).toBe(image)
    })

    test("Single image with arch input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: image, arch: 'x86' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-arch=x86 inspect --format '{{.Digest}}' docker://" + image)
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        expect(result.commands.outputs.digest).toBe(digest)
        expect(result.commands.outputs.image).toBe(image)
    })

    test("Single image with variant input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: image, variant: 'v6' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-variant=v6 inspect --format '{{.Digest}}' docker://" + image)
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        expect(result.commands.outputs.digest).toBe(digest)
        expect(result.commands.outputs.image).toBe(image)
    })

})

describe(`Multiple images tests`, () => {
    const digest1 = 'sha256:42'
    const image1 = 'unknown-image:1.0.0'

    const digest2 = 'sha256:43'
    const image2 = 'another-unknown-image:2.0.0'

    test("Multiple images", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: JSON.stringify([image1, image2]) })

        child_process.exec.mockImplementation((command, callback) => {
            if (command.includes(image1)) {
                callback(null, { stdout: digest1 });
            } else if (command.includes(image2)) {
                callback(null, { stdout: digest2 });
            } else {
                throw new Error('Unrecognized exec call: ' + command)
            }

        });

        const result = await target.run(options)

        expect(result.isSuccess).toBeTruthy()
        const digests = JSON.parse(result.commands.outputs.digest)
        expect(digests.length).toBe(2)
        expect(digests[0]).toBe(digest1)
        expect(digests[1]).toBe(digest2)
        const images = JSON.parse(result.commands.outputs.image)
        expect(images.length).toBe(2)
        expect(images[0]).toBe(image1)
        expect(images[1]).toBe(image2)
    })
})
