'use strict';

const { RunOptions, RunTarget } = require('github-action-ts-run-api');

const child_process = require('child_process')
jest.mock("child_process")

const runAction = require('../src/action');

describe(`Index single image tests`, () => {
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

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
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

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBeUndefined()
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

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
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

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
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

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
    })

})
