# openavatar-assets

The `openavatar-assets` project contains all of the assets and scripts for generating and exporting the avatar assets for the OpenAvatar protocol.

## Usage

To build the assets for the OpenAvatar app, you will need to run the following commands:

```bash
yarn build
```

Once complete, the assets can be found in the `artifacts` directory and will be ready for use.

## Directory Structure

- `artifacts`: Generated assets
- `assets`: Source assets
- `assets/palettes`: Source palettes for each layer
- `assets/pattern`: Source assets for each layer
- `assets/photoshop`: Photoshop files used to generate the spritesheets (out of date)
- `scripts`: Scripts for building and transforming assets
- `src`: Source code for the build process
- `test`: Tests for the build process

## Render Pipeline

```mermaid
graph TD
  A[start] -->|For each layer| B("Read files from /assets/pattern/")
  subgraph s1
    style s1 color:transparent
    B -->|For each pattern| C["Read palettes"]

    subgraph s2
      style s2 color:transparent
      C -->|For each palette| E("Create spritesheet artifacts")

      subgraph s3
        style s3 color:transparent
          E --> F("Write spritesheet artifacts to /artifacts/spritesheets/ ")
          F -->|crop 32x32| G("Write sprite artifacts to /artifacts/sprites/ ")
      end
    end
  end
  G --> Z("end")
```

## Patternize (inverse) Pipeline

```mermaid
graph TD
  A[start] -->|for each layer| B("Read spritesheets from /artifacts/spritesheets/")
  subgraph s1
    style s1 color:transparent
    B -->|for each spritesheet| C("Read PNG and extract pattern")

    subgraph s2
      style s2 color:transparent
      C --> D{"Group by pattern"}
      D --> E("Write unique patterns to /artifacts/spritesheets/patterns/")
    end
  end
  E --> Z("end")
```

## Layers

The avatar is composed of the following layers stacked on top of each other:

- body
- tattoos
- makeup
- facial hair
- left eye
- right eye
- footwear
- bottomwear
- topwear
- outerwear
- handwear
- jewelry
- facewear
- eyewear
- hair

## License

License pending. Stay tuned for more information.

## Attribution

Art assets and scripts were created by Cory Gabrielsen (cory.eth). Every pixel was drawn by hand.

The following creative tools were used extensively:

- Adobe Photoshop
- Aseprite
