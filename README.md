# Oci-digest-action
Github Action to retrieve OCI image digests from a container registry

## Inputs

### `image`

**Required** The image to retreive the digest for.

### `os`

The OS to use instead of the running OS for choosing images.

### `arch`

The ARCH to use instead of the architecture of the machine for choosing images.

### `variant`

The VARIANT to use instead of the running architecture variant for choosing images.

## Outputs

### `digest`

The digest for the given image.

## Example usage for a single image

```
uses: polagoab/oci-digest-action@v1
with:
  image: 'ubuntu:latest'
```
