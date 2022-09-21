'use strict';

const { RunOptions, RunTarget } = require('github-action-ts-run-api');

const child_process = require('child_process')
jest.mock("child_process")

const runAction = require('../src/action');

describe(`Index single image tests`, () => {
    const digest = 'sha256:42'

    test("Single image", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: 'ubuntu:latest' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo inspect --format '{{.Digest}}' docker://ubuntu:latest")
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
    })

    test("Single non-existing image", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: 'unknown-image:latest' })

        child_process.exec.mockImplementation((command, callback) => {
            callback({ code: 1 }, { stdout: '' });
        });

        const result = await target.run(options)

        expect(!result.isSuccess)
    })

    test("Single image with os input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: 'ubuntu:latest', os: 'linux' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-os=linux inspect --format '{{.Digest}}' docker://ubuntu:latest")
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
    })

    test("Single image with arch input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: 'ubuntu:latest', arch: 'x86' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-arch=x86 inspect --format '{{.Digest}}' docker://ubuntu:latest")
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
    })

    test("Single image with variant input", async () => {
        const target = RunTarget.asyncFn(runAction);
        const options = RunOptions.create()
            .setInputs({ image: 'ubuntu:latest', variant: 'v6' })

        child_process.exec.mockImplementation((command, callback) => {
            expect(command).toBe("skopeo --override-variant=v6 inspect --format '{{.Digest}}' docker://ubuntu:latest")
            callback(null, { stdout: digest });
        });

        const result = await target.run(options)

        expect(result.isSuccess)
        expect(result.commands.outputs.digest).toBe(digest)
    })

})
