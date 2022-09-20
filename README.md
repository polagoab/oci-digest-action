# Oci-digest-action
Github Action to retrieve OCI image digests from a container registry

## Inputs

### `image`

**Required** The image to retreive the digest for.

## Outputs

### `digest`

The digest for the given image.

## Example usage

uses: polagoab/oci-digest-action@v1
with:
  image: 'ubuntu:latest'
