# Oci-digest-action
Github Action that retrieve OCI image digests from a container registry. This actions is currently using
[Skopeo](https://github.com/containers/skopeo) for retrieving the digest and assume that the runnning actor
is authenticated against the registry. One way to authenticate is 
[docker/login-action](https://github.com/docker/login-action).

## Inputs

### `image`

**Required** The image to retrieve the digest for. If this input parameter is an array of images, all images will be processed

### `os`

The OS to use instead of the running OS for choosing images.

### `arch`

The ARCH to use instead of the architecture of the machine for choosing images.

### `variant`

The VARIANT to use instead of the running architecture variant for choosing images.

## Outputs

### `digest`

The digest for the given image, if the image exists. When the input image is an array, the digest will also be an array where each element matches the corresponding image entry.

### `image`

The given input image (or array of images). This output is for convenience when using the 
[polagoab/oci-revision-tagger-action](https://github.com/polagoab/oci-revision-tagger-action).

## Example usage for a single image

```
uses: polagoab/oci-digest-action@v1
with:
  image: 'ubuntu:latest'
```

## Example usage for multiple images

```
uses: polagoab/oci-digest-action@v1
with:
  image: >-
    [
      "ubuntu:latest",
      "debian:latest"
    ]
```
